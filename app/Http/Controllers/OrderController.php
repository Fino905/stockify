<?php

namespace App\Http\Controllers;

use App\Models\CashTransaction;
use App\Models\Order;
use App\Models\OrderFeedback;
use App\Models\OrderMessage;
use App\Models\OrderRefund;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\User;
use App\Services\StockTransactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function __construct(
        protected StockTransactionService $transactionService
    ) {}

    /**
     * Customer membeli produk dengan pembayaran simulasi/mainan
     * Transaksi berstatus pending_confirmation, butuh konfirmasi dari Management atau Staff Gudang
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string|max:50',
            'staff_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string|max:500',
            'payment_proof' => 'nullable',
        ]);

        $quantity = (int) $validated['quantity'];
        $user = $request->user();
        $productId = (int) $validated['product_id'];

        $paymentProofPath = null;
        if ($request->hasFile('payment_proof')) {
            $path = $request->file('payment_proof')->store('payment_proofs', 'public');
            $paymentProofPath = '/storage/'.$path;
        } elseif (! empty($request->input('payment_proof'))) {
            $paymentProofPath = $request->input('payment_proof');
        }

        // Cari staff gudang yang melayani pesanan
        $staffId = $validated['staff_id'] ?? null;
        if (! $staffId) {
            $defaultStaff = User::where('role', 'staff_gudang')->first();
            $staffId = $defaultStaff?->id ?? $user->id;
        }

        $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(5));
        $paymentRef = 'SIM-PAY-' . rand(100000, 999999);

        try {
            $order = DB::transaction(function () use ($user, $productId, $quantity, $orderNumber, $paymentRef, $validated, $staffId, $paymentProofPath) {
                // Lock baris produk untuk mengecek stok awal
                $product = Product::where('id', $productId)->lockForUpdate()->firstOrFail();

                if ($product->current_stock < $quantity) {
                    throw new \RuntimeException("Stok produk {$product->name} tidak mencukupi! Tersisa hanya {$product->current_stock} unit di gudang.");
                }

                $unitPrice = (float) $product->selling_price;
                $totalPrice = $unitPrice * $quantity;

                // 1. Simpan data pesanan dengan status 'pending_confirmation' dan bukti bayar
                $createdOrder = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                    'staff_id' => $staffId,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'payment_method' => $validated['payment_method'],
                    'payment_status' => 'waiting_confirmation',
                    'payment_reference' => $paymentRef,
                    'payment_proof' => $paymentProofPath,
                    'order_status' => 'pending_confirmation',
                    'notes' => $validated['notes'] ?? null,
                ]);

                // 2. Catat transaksi stok keluar berstatus 'pending' (Stok fisik belum berkurang sebelum dikonfirmasi staff/manajemen)
                $staffName = User::find($staffId)?->name ?? 'Staff Gudang';
                StockTransaction::create([
                    'product_id' => $product->id,
                    'user_id' => $staffId,
                    'type' => 'out',
                    'quantity' => $quantity,
                    'date' => now()->toDateString(),
                    'status' => 'pending',
                    'notes' => "Pesanan Customer: {$user->name} | No. Pesanan #{$createdOrder->order_number} (Menunggu Konfirmasi Staff/Manajemen)",
                ]);

                return $createdOrder;
            });
        } catch (\RuntimeException $e) {
            return back()->withErrors([
                'quantity' => $e->getMessage(),
            ]);
        }

        $formattedTotal = 'Rp ' . number_format($order->total_price, 0, ',', '.');
        return back()->with('success', "Simulasi pembayaran {$formattedTotal} berhasil! Pesanan #{$order->order_number} dibuat dan menunggu konfirmasi dari Management atau Staff Gudang.");
    }

    /**
     * Konfirmasi pesanan oleh Management (Admin/Manajer) atau Staff Gudang
     * Memotong stok resmi dari inventaris
     */
    public function confirmOrder(Request $request, Order $order): RedirectResponse
    {
        if ($order->order_status !== 'pending_confirmation') {
            return back()->withErrors(['order' => 'Pesanan ini sudah diproses atau statusnya bukan menunggu konfirmasi.']);
        }

        $user = $request->user();

        try {
            DB::transaction(function () use ($order, $user) {
                // Cari transaksi stok yang berelasi dengan pesanan ini
                $trx = StockTransaction::where('product_id', $order->product_id)
                    ->where('type', 'out')
                    ->where('status', 'pending')
                    ->where('notes', 'like', "%#{$order->order_number}%")
                    ->first();

                if ($trx) {
                    $this->transactionService->confirmTransaction($trx, $user->id);
                } else {
                    // Fallback: catat transaksi keluar jika belum tercatat
                    $this->transactionService->recordTransaction([
                        'product_id' => $order->product_id,
                        'type' => 'out',
                        'quantity' => $order->quantity,
                        'date' => now()->toDateString(),
                        'status' => 'completed',
                        'notes' => "Penjualan Pelanggan #{$order->order_number} (Dikonfirmasi oleh {$user->name})",
                    ], $user->id);
                }

                $order->update([
                    'order_status' => 'processing',
                    'payment_status' => 'paid',
                    'staff_id' => $user->id,
                ]);

                // Otomatis catat arus kas masuk (Buku Kas) dari penjualan customer
                CashTransaction::updateOrCreate(
                    ['order_id' => $order->id, 'type' => 'in'],
                    [
                        'transaction_number' => 'CSH-' . date('Ym') . '-ORD' . str_pad($order->id, 4, '0', STR_PAD_LEFT),
                        'category' => 'penjualan',
                        'amount' => $order->total_price,
                        'date' => now()->toDateString(),
                        'description' => "Penjualan Produk: Pesanan #{$order->order_number} ({$order->product?->name}) - {$order->quantity} unit",
                        'proof_image' => $order->payment_proof,
                        'user_id' => $user->id,
                        'notes' => "Metode: " . strtoupper(str_replace('_', ' ', $order->payment_method)) . " | Pembeli: " . ($order->user?->name ?? 'Pelanggan'),
                    ]
                );
            });
        } catch (\Throwable $e) {
            return back()->withErrors(['order' => 'Gagal konfirmasi pesanan: ' . $e->getMessage()]);
        }

        return back()->with('success', "Pembayaran pesanan #{$order->order_number} berhasil dikonfirmasi oleh {$user->name}! Stok otomatis dipotong dan status pesanan kini SEDANG DIKEMAS oleh Staf Gudang.");
    }

    /**
     * Staf Gudang / Management menyerahkan pesanan ke kurir pengiriman (Sedang Dikemas -> Dikirim)
     */
    public function shipOrder(Request $request, Order $order): RedirectResponse
    {
        if ($order->order_status !== 'processing') {
            return back()->withErrors(['order' => 'Hanya pesanan berstatus sedang dikemas yang dapat diserahkan ke ekspedisi/kurir.']);
        }

        $validated = $request->validate([
            'shipping_courier' => 'required|string|max:50',
            'tracking_number' => 'required|string|max:100',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        $user = $request->user();

        // Otomatis generate ID pengiriman / no resi jika kosong
        $courier = $validated['shipping_courier'];
        $courierPrefix = match (true) {
            str_contains($courier, 'J&T') => 'JT',
            str_contains($courier, 'JNE') => 'JNE',
            str_contains($courier, 'SiCepat') => '004',
            str_contains($courier, 'Anteraja') => 'ANT',
            str_contains($courier, 'ID Express') => 'IDX',
            str_contains($courier, 'Ninja') => 'NINJA',
            str_contains($courier, 'GoSend') || str_contains($courier, 'Grab') => 'INSTANT',
            default => 'STK-SHP',
        };

        $trackingNumber = ! empty(trim((string) ($validated['tracking_number'] ?? '')))
            ? trim($validated['tracking_number'])
            : $courierPrefix . date('Ymd') . strtoupper(Str::random(5));

        $order->update([
            'order_status' => 'shipped',
            'shipping_courier' => $validated['shipping_courier'],
            'tracking_number' => $validated['tracking_number'],
            'tracking_number' => $trackingNumber,
            'staff_id' => $user->id, // Auto-assign ID staf pengirim
            'shipped_at' => now(),
        ]);

        return back()->with('success', "Pesanan #{$order->order_number} berhasil diserahkan ke {$validated['shipping_courier']} dengan No. Resi: {$validated['tracking_number']}!");
        return back()->with('success', "Pesanan #{$order->order_number} berhasil diserahkan ke {$validated['shipping_courier']}! ID Pengiriman/Resi: {$trackingNumber} (Diproses oleh staf: {$user->name}).");
    }

    /**
     * Manajemen memproses disposisi barang retur yang ada di karantina:
     * 1. supplier_claim (Klaim garansi ke supplier/pemasok)
     * 2. written_off (Pemusnahan / Write-off barang rusak)
     * 3. repaired (Reparasi internal gudang -> layak jual kembali)
     */
    public function processQuarantineDisposition(Request $request, OrderRefund $refund): RedirectResponse
    {
        $user = $request->user();
        if (! in_array($user->role, ['admin', 'manajer_gudang'])) {
            abort(403, 'Hanya Manajemen (Admin & Manajer Gudang) yang berhak menentukan disposisi barang karantina.');
        }

        if ($refund->goods_condition_status !== 'damaged_quarantine') {
            return back()->withErrors(['refund' => 'Hanya barang retur yang berstatus karantina yang dapat diproses disposisinya.']);
        }

        $validated = $request->validate([
            'disposition' => 'required|in:supplier_claim,written_off,repaired',
            'reference' => 'nullable|string|max:100',
            'notes' => 'required|string|max:1000',
        ]);

        $order = $refund->order;
        $disposition = $validated['disposition'];

        // Auto-generate reference number jika tidak diisi manual
        $reference = ! empty(trim((string) ($validated['reference'] ?? '')))
            ? trim($validated['reference'])
            : match ($disposition) {
                'supplier_claim' => 'CLM-SUP-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
                'written_off' => 'BAP-SCRAP-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
                'repaired' => 'RPR-INT-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
            };

        DB::transaction(function () use ($refund, $order, $user, $disposition, $reference, $validated) {
            // Jika berhasil diperbaiki internal, masukkan kembali ke stok layak jual
            if ($disposition === 'repaired' && $order) {
                StockTransaction::create([
                    'product_id' => $order->product_id,
                    'user_id' => $user->id,
                    'type' => 'in',
                    'quantity' => $order->quantity,
                    'date' => now()->toDateString(),
                    'status' => 'completed',
                    'notes' => "Hasil Reparasi Karantina (Siap Jual Kembali) | Pesanan #{$order->order_number} | Ref #{$reference} | Dicatat oleh {$user->name}: " . $validated['notes'],
                ]);

                $refund->update(['is_restocked' => true]);
            }

            $refund->update([
                'quarantine_disposition' => $disposition,
                'quarantine_reference' => $reference,
                'quarantine_notes' => $validated['notes'],
                'quarantine_processed_by' => $user->id,
                'quarantine_processed_at' => now(),
            ]);
        });

        $dispositionLabel = match ($disposition) {
            'supplier_claim' => "Klaim Garansi ke Supplier (#{$reference})",
            'written_off' => "Pemusnahan / Write-off Resmi (#{$reference})",
            'repaired' => "Reparasi Berhasil & Direstok ke Penjualan (#{$reference})",
        };

        return back()->with('success', "Disposisi barang karantina untuk pesanan #{$refund->order?->order_number} berhasil disimpan sebagai: {$dispositionLabel}!");
    }

    /**
     * Pelanggan atau Staf mengonfirmasi pesanan telah sampai dan diterima dengan baik (Dikirim -> Selesai)
     */
    public function completeOrder(Request $request, Order $order): RedirectResponse
    {
        $user = $request->user();
        if ($user->role === 'customer' && $order->user_id !== $user->id) {
            abort(403, 'Akses ditolak.');
        }

        if (! in_array($order->order_status, ['shipped', 'processing'])) {
            return back()->withErrors(['order' => 'Status pesanan tidak valid untuk diselesaikan.']);
        }

        $order->update([
            'order_status' => 'completed',
            'received_at' => now(),
        ]);

        return back()->with('success', "Pesanan #{$order->order_number} telah terkonfirmasi diterima dan pesanan selesai. Terima kasih!");
    }

    /**
     * Tolak atau batalkan pesanan oleh Management atau Staff
     */
    public function rejectOrder(Request $request, Order $order): RedirectResponse
    {
        if ($order->order_status !== 'pending_confirmation') {
            return back()->withErrors(['order' => 'Hanya pesanan yang berstatus menunggu konfirmasi yang dapat ditolak.']);
        }

        $user = $request->user();

        DB::transaction(function () use ($order, $user) {
            $trx = StockTransaction::where('product_id', $order->product_id)
                ->where('type', 'out')
                ->where('status', 'pending')
                ->where('notes', 'like', "%#{$order->order_number}%")
                ->first();

            if ($trx) {
                $this->transactionService->updateStatus($trx, 'cancelled');
            }

            $order->update([
                'order_status' => 'cancelled',
            ]);
        });

        return back()->with('success', "Pesanan #{$order->order_number} telah ditolak/dibatalkan oleh {$user->name}.");
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
            'damage_image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ], [
            'damage_image.required' => 'Wajib melampirkan foto bukti kerusakan fisik barang untuk mengajukan refund.',
            'damage_image.image' => 'Bukti kerusakan harus berupa file foto gambar (JPG, PNG, atau WEBP).',
            'damage_image.max' => 'Ukuran file foto bukti kerusakan maksimal adalah 5MB.',
        ]);

        $user = $request->user();

        if ($order->user_id !== $user->id) {
            abort(403, 'Hanya pemilik pesanan yang dapat mengajukan refund.');
        }

        if ($order->order_status !== 'completed') {
            return back()->withErrors(['refund' => 'Pesanan ini tidak dapat diajukan refund karena statusnya bukan pesanan selesai.']);
        }

        // Aturan: Jika barang sudah dibeli lewat dari 3 hari, tidak ada pengajuan refund
        if ($order->created_at && now()->diffInDays($order->created_at) > 3) {
            return back()->withErrors([
                'refund' => 'Batas waktu pengajuan refund maksimal 3 hari sejak pembelian telah berakhir. Pesanan #'.$order->order_number.' sudah tidak memenuhi syarat refund.',
            ]);
        }

        $damageImagePath = null;
        if ($request->hasFile('damage_image')) {
            $path = $request->file('damage_image')->store('refund_proofs', 'public');
            $damageImagePath = '/storage/'.$path;
        }

        DB::transaction(function () use ($order, $user, $validated, $damageImagePath) {
            $order->update(['order_status' => 'refund_pending']);

            OrderRefund::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'user_id' => $user->id,
                    'reason' => $validated['reason'],
                    'description' => $validated['description'] ?? null,
                    'damage_image' => $damageImagePath,
                    'status' => 'pending',
                ]
            );
        });

        return back()->with('success', "Permohonan refund untuk pesanan #{$order->order_number} berhasil diajukan dengan bukti foto kerusakan dan sedang menunggu tinjauan Manajer Gudang / Admin.");
    }

    /**
     * Tahap 1 Refund Fisik: Manajer Gudang / Admin menyetujui klaim retur barang fisik
     * Status refund berubah menjadi 'return_approved' dan pelanggan diminta mengirimkan fisik barang
     */
    public function approveReturn(Request $request, OrderRefund $refund): RedirectResponse
    {
        $user = $request->user();
        if (! in_array($user->role, ['admin', 'manajer_gudang'])) {
            abort(403, 'Hanya Manajemen (Admin & Manajer Gudang) yang berwenang menyetujui klaim retur barang.');
        }

        if ($refund->status !== 'pending') {
            return back()->withErrors(['refund' => 'Hanya permohonan refund dengan status pending yang dapat disetujui untuk retur fisik.']);
        }

        $validated = $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $refund->update([
            'status' => 'return_approved',
            'admin_notes' => $validated['admin_notes'] ?? 'Klaim retur disetujui. Silakan kirimkan barang fisik ke alamat gudang dan masukkan nomor resi ekspedisi.',
            'processed_by' => $user->id,
            'processed_at' => now(),
        ]);

        $refund->order?->update([
            'order_status' => 'return_approved',
        ]);

        return back()->with('success', "Permohonan retur fisik pesanan #{$refund->order?->order_number} disetujui. Pelanggan kini diminta mengirimkan barang kembali beserta nomor resi.");
    }

    /**
     * Tahap 2 Refund Fisik: Pelanggan mengirimkan barang fisik kembali dan memasukkan nomor resi ekspedisi
     */
    public function submitReturnTracking(Request $request, OrderRefund $refund): RedirectResponse
    {
        $user = $request->user();
        if ($user->role === 'customer' && $refund->user_id !== $user->id) {
            abort(403, 'Akses ditolak.');
        }

        if (! in_array($refund->status, ['return_approved', 'return_shipped'])) {
            return back()->withErrors(['refund' => 'Nomor resi retur hanya dapat dimasukkan setelah klaim retur disetujui oleh Manajemen.']);
        }

        $validated = $request->validate([
            'return_tracking_number' => 'required|string|max:100',
        ]);

        $refund->update([
            'return_tracking_number' => $validated['return_tracking_number'],
            'status' => 'return_shipped',
        ]);

        $refund->order?->update([
            'order_status' => 'return_shipped',
        ]);

        return back()->with('success', "Nomor resi pengembalian barang ({$validated['return_tracking_number']}) berhasil disimpan! Staf gudang akan memeriksa fisik barang saat tiba di gudang.");
    }

    /**
     * Tahap 3 Refund Fisik: Staf Gudang memeriksa fisik barang yang tiba di gudang & otomatis restok inventaris
     */
    public function confirmGoodsReceived(Request $request, OrderRefund $refund): RedirectResponse
    {
        $user = $request->user();
        if (! in_array($user->role, ['admin', 'manajer_gudang', 'staff_gudang'])) {
            abort(403, 'Hanya Staf Gudang atau Manajemen yang dapat memverifikasi fisik barang retur.');
        }

        if (! in_array($refund->status, ['return_shipped', 'return_approved'])) {
            return back()->withErrors(['refund' => 'Hanya barang retur yang telah dikirim pelanggan yang dapat diverifikasi fisik kedatangannya.']);
        }

        $validated = $request->validate([
            'goods_condition_status' => 'required|in:good_restock,damaged_quarantine',
            'goods_condition_notes' => 'required|string|max:1000',
        ]);

        $order = $refund->order;
        if (! $order) {
            return back()->withErrors(['refund' => 'Pesanan tidak ditemukan.']);
        }

        DB::transaction(function () use ($refund, $order, $user, $validated) {
            $isGood = $validated['goods_condition_status'] === 'good_restock';

            // Jika barang layak jual kembali, catat transaksi stok masuk (restok) fisik
            if ($isGood) {
                StockTransaction::create([
                    'product_id' => $order->product_id,
                    'user_id' => $user->id,
                    'type' => 'in',
                    'quantity' => $order->quantity,
                    'date' => now()->toDateString(),
                    'status' => 'completed',
                    'notes' => "Restok Fisik Retur Barang (Layak Jual Kembali) | Pesanan #{$order->order_number} | Diperiksa oleh {$user->name}: " . $validated['goods_condition_notes'],
                ]);
            }

            $refund->update([
                'status' => 'goods_received',
                'goods_received_by' => $user->id,
                'goods_received_at' => now(),
                'goods_condition_notes' => $validated['goods_condition_notes'],
                'goods_condition_status' => $validated['goods_condition_status'],
                'is_restocked' => $isGood,
            ]);

            $order->update([
                'order_status' => 'goods_received',
            ]);
        });

        $conditionLabel = $validated['goods_condition_status'] === 'good_restock'
            ? "Kondisi LAYAK JUAL KEMBALI (Stok {$order->quantity} unit otomatis direstok ke inventaris)"
            : "Kondisi RUSAK/CACAT (Disimpan di Karantina - TIDAK menambah stok jual)";

        return back()->with('success', "Fisik barang retur untuk pesanan #{$order->order_number} telah diverifikasi oleh {$user->name}. {$conditionLabel}. Menunggu Manajer melakukan transfer dana refund.");
    }

    /**
     * Staff Gudang / Admin memproses permohonan refund (Setujui / Tolak)
     * Saat menyetujui refund, Manager/Admin dapat mengunggah bukti transfer pengembalian dana ke pelanggan
     */
    public function processRefund(Request $request, OrderRefund $refund): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_notes' => 'nullable|string|max:500',
            'refund_transfer_proof' => 'nullable',
        ]);

        if (! in_array($refund->status, ['pending', 'goods_received', 'return_shipped', 'return_approved'])) {
            return back()->withErrors(['refund' => 'Permohonan refund ini sudah diproses sebelumnya dan tidak dapat diubah lagi.']);
        }

        $user = $request->user();
        $order = $refund->order;

        if (! $order) {
            return back()->withErrors(['refund' => 'Pesanan terkait refund ini tidak ditemukan.']);
        }

        $transferProofPath = null;
        if ($request->hasFile('refund_transfer_proof')) {
            $path = $request->file('refund_transfer_proof')->store('refund_transfers', 'public');
            $transferProofPath = '/storage/'.$path;
        } elseif (! empty($request->input('refund_transfer_proof')) && is_string($request->input('refund_transfer_proof'))) {
            $imageData = $request->input('refund_transfer_proof');
            if (str_starts_with($imageData, 'data:image')) {
                @list($type, $imageData) = explode(';', $imageData);
                @list(, $imageData) = explode(',', $imageData);
                $decoded = base64_decode($imageData);
                if ($decoded !== false) {
                    $fileName = 'refund_transfers/cam_' . time() . '_' . \Illuminate\Support\Str::random(8) . '.jpg';
                    \Illuminate\Support\Facades\Storage::disk('public')->put($fileName, $decoded);
                    $transferProofPath = '/storage/' . $fileName;
                }
            } else {
                $transferProofPath = $request->input('refund_transfer_proof');
            }
        }

        try {
            DB::transaction(function () use ($refund, $order, $user, $validated, $transferProofPath) {
                // Kunci baris refund untuk mencegah double approval / race condition
                $lockedRefund = OrderRefund::where('id', $refund->id)->lockForUpdate()->firstOrFail();
                if (! in_array($lockedRefund->status, ['pending', 'goods_received', 'return_shipped', 'return_approved'])) {
                    throw new \RuntimeException('Permohonan refund ini sudah diproses sebelumnya.');
                }

                $newStatus = $validated['status'];

                $updateData = [
                    'status' => $newStatus,
                    'admin_notes' => $validated['admin_notes'] ?? null,
                    'processed_by' => $user->id,
                    'processed_at' => now(),
                ];

                if ($transferProofPath) {
                    $updateData['refund_transfer_proof'] = $transferProofPath;
                }

                $lockedRefund->update($updateData);

                if ($newStatus === 'approved') {
                    $order->update(['order_status' => 'refund_approved']);

                    // Kembalikan stok produk jika belum pernah direstok di tahap pemeriksaan fisik
                    // dan kondisi fisik bukan barang rusak/karantina
                    if (empty($lockedRefund->goods_received_at) && $lockedRefund->goods_condition_status !== 'damaged_quarantine') {
                        StockTransaction::create([
                            'product_id' => $order->product_id,
                            'user_id' => $user->id,
                            'type' => 'in',
                            'quantity' => $order->quantity,
                            'date' => now()->toDateString(),
                            'status' => 'completed',
                            'notes' => "Restok Pengembalian Barang (Refund Langsung Disetujui) | Pesanan #{$order->order_number} dari Pelanggan {$order->user?->name}",
                        ]);
                        $lockedRefund->update(['is_restocked' => true]);
                    }

                    // Otomatis catat arus kas keluar (Buku Kas) untuk pengembalian dana refund
                    CashTransaction::updateOrCreate(
                        ['order_id' => $order->id, 'type' => 'out'],
                        [
                            'transaction_number' => 'CSH-' . date('Ym') . '-REF' . str_pad($order->id, 4, '0', STR_PAD_LEFT),
                            'category' => 'refund',
                            'amount' => $order->total_price,
                            'date' => now()->toDateString(),
                            'description' => "Pengembalian Dana (Refund): Pesanan #{$order->order_number} ({$order->product?->name}) - Alasan: {$refund->reason}",
                            'proof_image' => $transferProofPath,
                            'user_id' => $user->id,
                            'notes' => "Persetujuan Refund oleh {$user->name} | Pelanggan: " . ($order->user?->name ?? 'Pelanggan'),
                        ]
                    );
                } else {
                    $order->update(['order_status' => 'refund_rejected']);
                }
            });
        } catch (\RuntimeException $e) {
            return back()->withErrors(['refund' => $e->getMessage()]);
        }

        $msg = $validated['status'] === 'approved' 
            ? "Refund berhasil disetujui! Bukti transfer pengembalian dana telah dikirimkan ke pelanggan dan kas keluar telah dibukukan." 
            : "Permohonan refund berhasil ditolak.";

        return back()->with('success', $msg);
    }

    /**
     * Customer mengunggah atau memperbarui bukti transaksi / pembayaran
     */
    public function uploadPaymentProof(Request $request, Order $order): RedirectResponse
    {
        $user = $request->user();
        if ($user->role === 'customer' && $order->user_id !== $user->id) {
            abort(403, 'Akses tidak diizinkan.');
        }

        $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($request->hasFile('payment_proof')) {
            $path = $request->file('payment_proof')->store('payment_proofs', 'public');
            $order->update([
                'payment_proof' => '/storage/'.$path,
            ]);
        }

        return back()->with('success', "Bukti transaksi untuk pesanan #{$order->order_number} berhasil diperbarui!");
    }

    /**
     * Kirim pesan obrolan antara Pelanggan dan Staff Gudang untuk pesanan tertentu
     */
    public function sendMessage(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|min:1|max:2000',
        ]);

        $user = $request->user();

        // Customer hanya boleh chat di pesanannya sendiri
        if ($user->role === 'customer' && $order->user_id !== $user->id) {
            abort(403, 'Anda tidak memiliki hak untuk mengirim pesan pada pesanan ini.');
        }

        OrderMessage::create([
            'order_id' => $order->id,
            'sender_id' => $user->id,
            'message' => trim($validated['message']),
        ]);

        return back()->with('success', 'Pesan berhasil terkirim!');
    }

    /**
     * Hapus satu pesan obrolan tertentu
     */
    public function destroyMessage(Request $request, Order $order, OrderMessage $message): RedirectResponse
    {
        if ($message->order_id !== $order->id) {
            abort(404, 'Pesan tidak ditemukan pada pesanan ini.');
        }

        $user = $request->user();

        // Customer hanya dapat menghapus pesannya sendiri pada pesanannya
        if ($user->role === 'customer') {
            if ($order->user_id !== $user->id) {
                abort(403, 'Akses ditolak.');
            }
            if ($message->sender_id !== $user->id) {
                abort(403, 'Anda hanya dapat menghapus pesan yang Anda kirimkan sendiri.');
            }
        }

        $message->delete();

        return back()->with('success', 'Pesan berhasil dihapus.');
    }

    /**
     * Bersihkan / hapus seluruh riwayat obrolan dalam suatu pesanan
     */
    public function clearMessages(Request $request, Order $order): RedirectResponse
    {
        $user = $request->user();

        // Customer hanya dapat menghapus riwayat obrolan di order miliknya
        if ($user->role === 'customer' && $order->user_id !== $user->id) {
            abort(403, 'Akses ditolak.');
        }

        $order->messages()->delete();

        return back()->with('success', "Seluruh obrolan untuk pesanan #{$order->order_number} berhasil dibersihkan.");
    }
}
