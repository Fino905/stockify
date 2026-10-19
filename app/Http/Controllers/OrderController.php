<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderFeedback;
use App\Models\OrderRefund;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Customer membeli produk dengan pembayaran simulasi/mainan
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string|max:50',
            'staff_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $quantity = (int) $validated['quantity'];

        if ($product->current_stock < $quantity) {
            return back()->withErrors([
                'quantity' => "Stok produk tidak mencukupi! Tersisa hanya {$product->current_stock} unit di gudang.",
            ]);
        }

        $user = $request->user();

        // Cari staff gudang yang melayani pesanan
        $staffId = $validated['staff_id'] ?? null;
        if (! $staffId) {
            $defaultStaff = User::where('role', 'staff_gudang')->first();
            $staffId = $defaultStaff?->id ?? $user->id;
        }

        $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(5));
        $unitPrice = (float) $product->selling_price;
        $totalPrice = $unitPrice * $quantity;
        $paymentRef = 'SIM-PAY-' . rand(100000, 999999);

        DB::transaction(function () use ($user, $product, $quantity, $unitPrice, $totalPrice, $orderNumber, $paymentRef, $validated, $staffId) {
            // 1. Simpan data pesanan
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user->id,
                'product_id' => $product->id,
                'staff_id' => $staffId,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'total_price' => $totalPrice,
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'paid',
                'payment_reference' => $paymentRef,
                'order_status' => 'completed',
                'notes' => $validated['notes'] ?? null,
            ]);

            // 2. Catat transaksi stok keluar (Stok otomatis berkurang)
            $staffName = User::find($staffId)?->name ?? 'Staff Gudang';
            StockTransaction::create([
                'product_id' => $product->id,
                'user_id' => $staffId,
                'type' => 'out',
                'quantity' => $quantity,
                'date' => now()->toDateString(),
                'status' => 'completed',
                'notes' => "Penjualan Pelanggan: {$user->name} | No. Pesanan #{$order->order_number} (Dilayani {$staffName})",
            ]);
        });

        $formattedTotal = 'Rp ' . number_format($totalPrice, 0, ',', '.');
        return back()->with('success', "Simulasi pembayaran {$formattedTotal} berhasil! Stok {$product->name} otomatis berkurang sebanyak {$quantity} unit.");
    }

    /**
     * Pelanggan mengirimkan feedback/ulasan
     */
    public function submitFeedback(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:3|max:1000',
        ]);

        $user = $request->user();

        if ($order->user_id !== $user->id && $user->role !== 'admin') {
            abort(403, 'Anda tidak memiliki hak untuk mengulas pesanan ini.');
        }

        OrderFeedback::updateOrCreate(
            ['order_id' => $order->id],
            [
                'product_id' => $order->product_id,
                'user_id' => $user->id,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
            ]
        );

        return back()->with('success', 'Ulasan dan penilaian bintang berhasil dikirim!');
    }

    /**
     * Pelanggan mengajukan refund pesanan
     */
    public function requestRefund(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:150',
            'description' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        if ($order->user_id !== $user->id) {
            abort(403, 'Hanya pemilik pesanan yang dapat mengajukan refund.');
        }

        if ($order->order_status !== 'completed') {
            return back()->withErrors(['refund' => 'Pesanan ini tidak dapat diajukan refund karena statusnya bukan pesanan selesai.']);
        }

        DB::transaction(function () use ($order, $user, $validated) {
            $order->update(['order_status' => 'refund_pending']);

            OrderRefund::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'user_id' => $user->id,
                    'reason' => $validated['reason'],
                    'description' => $validated['description'] ?? null,
                    'status' => 'pending',
                ]
            );
        });

        return back()->with('success', "Permohonan refund untuk pesanan #{$order->order_number} berhasil diajukan dan sedang menunggu tinjauan Staff Gudang / Admin.");
    }

    /**
     * Staff Gudang / Admin memproses permohonan refund (Setujui / Tolak)
     */
    public function processRefund(Request $request, OrderRefund $refund): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $order = $refund->order;

        DB::transaction(function () use ($refund, $order, $user, $validated) {
            $newStatus = $validated['status'];

            $refund->update([
                'status' => $newStatus,
                'admin_notes' => $validated['admin_notes'] ?? null,
                'processed_by' => $user->id,
                'processed_at' => now(),
            ]);

            if ($newStatus === 'approved') {
                $order->update(['order_status' => 'refund_approved']);

                // Kembalikan stok produk (Stok bertambah kembali)
                StockTransaction::create([
                    'product_id' => $order->product_id,
                    'user_id' => $user->id,
                    'type' => 'in',
                    'quantity' => $order->quantity,
                    'date' => now()->toDateString(),
                    'status' => 'completed',
                    'notes' => "Restok Pengembalian Barang (Refund Disetujui) | Pesanan #{$order->order_number} dari Pelanggan {$order->user?->name}",
                ]);
            } else {
                $order->update(['order_status' => 'refund_rejected']);
            }
        });

        $msg = $validated['status'] === 'approved' 
            ? "Refund berhasil disetujui! Stok produk ({$order->quantity} unit) telah otomatis dikembalikan ke inventaris gudang." 
            : "Permohonan refund berhasil ditolak.";

        return back()->with('success', $msg);
    }
}
