<?php

namespace App\Http\Controllers;

use App\Models\CashTransaction;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Services\StockTransactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StockTransactionController extends Controller
{
    public function __construct(
        protected StockTransactionService $transactionService
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:in,out',
            'quantity' => 'required|integer|min:1',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:pending,completed,cancelled',
            'record_cash_flow' => 'nullable|boolean',
            'custom_purchase_price' => 'nullable|numeric|min:0',
        ]);

        $user = $request->user();
        // Setiap staff memasukkan barang (masuk/keluar), status otomatis 'pending' (menunggu konfirmasi admin/management)
        if ($user && $user->role === 'staff_gudang') {
            $validated['status'] = 'pending';
            $staffNote = "[Diajukan oleh Staff: {$user->name} - Menunggu Konfirmasi Admin/Management]";
            if ($request->boolean('record_cash_flow')) {
                $staffNote .= " [Opsi Buku Kas Aktif]";
            }
            $validated['notes'] = trim(($validated['notes'] ?? '') . ' ' . $staffNote);
        }

        $createdTrx = $this->transactionService->recordTransaction($validated, $user?->id);

        // Jika barang masuk dan opsi catat buku kas dicentang:
        $cashRecorded = false;
        if ($validated['type'] === 'in' && $request->boolean('record_cash_flow')) {
            $product = Product::with('supplier')->find($validated['product_id']);
            if ($product) {
                $unitPrice = (float) ($request->input('custom_purchase_price') ?: $product->purchase_price ?: 0);
                $totalAmount = $unitPrice * $validated['quantity'];

                if ($totalAmount > 0) {
                    $yearMonth = date('Ym', strtotime($validated['date']));
                    $countThisMonth = CashTransaction::where('transaction_number', 'like', "CSH-{$yearMonth}-%")->count();
                    $trxNumber = sprintf("CSH-%s-SUP%03d", $yearMonth, $countThisMonth + 1);

                    CashTransaction::create([
                        'transaction_number' => $trxNumber,
                        'type' => 'out',
                        'category' => 'supplier',
                        'amount' => $totalAmount,
                        'date' => $validated['date'],
                        'description' => "Pembelian Barang Masuk: {$product->name} ({$validated['quantity']} unit) dari " . ($product->supplier?->name ?? 'Supplier'),
                        'notes' => "Harga Beli Satuan: Rp " . number_format($unitPrice, 0, ',', '.') . " | Terkait Mutasi Stok #{$createdTrx->id}",
                        'user_id' => $user?->id ?? 1,
                    ]);
                    $cashRecorded = true;
                }
            }
        }

        $actionText = $validated['type'] === 'in' ? 'penerimaan barang masuk' : 'pengeluaran barang keluar';
        $message = ($user && $user->role === 'staff_gudang')
            ? "Transaksi {$actionText} berhasil diajukan dan berstatus PENDING (Menunggu konfirmasi Admin/Management)!"
            : "Transaksi {$actionText} berhasil dicatat!";

        if ($cashRecorded) {
            $message .= " Pengeluaran pembelian supplier otomatis dibukukan di Buku Kas.";
        }

        return back()->with('success', $message);
    }

    public function updateStatus(Request $request, StockTransaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,cancelled',
        ]);

        $this->transactionService->updateStatus($transaction, $validated['status']);

        return back()->with('success', "Status transaksi #{$transaction->id} berhasil diubah menjadi {$validated['status']}!");
    }

    public function confirm(Request $request, StockTransaction $transaction): RedirectResponse
    {
        $user = $request->user();
        if ($user && ! in_array($user->role, ['admin', 'manajer_gudang'])) {
            abort(403, 'Hanya pihak Management (Admin / Manajer Gudang) yang berwenang mengonfirmasi mutasi barang.');
        }

        $this->transactionService->confirmTransaction($transaction, $user?->id);

        $cashRecorded = false;
        if ($transaction->type === 'in' && ($request->boolean('record_cash_flow') || str_contains($transaction->notes ?? '', '[Opsi Buku Kas Aktif]'))) {
            $alreadyExists = CashTransaction::where('notes', 'like', "%Mutasi Stok #{$transaction->id}%")->exists();
            if (! $alreadyExists && $transaction->product) {
                $product = $transaction->product;
                $unitPrice = (float) ($product->purchase_price ?: 0);
                $totalAmount = $unitPrice * $transaction->quantity;
                if ($totalAmount > 0) {
                    $yearMonth = date('Ym');
                    $countThisMonth = CashTransaction::where('transaction_number', 'like', "CSH-{$yearMonth}-%")->count();
                    $trxNumber = sprintf("CSH-%s-SUP%03d", $yearMonth, $countThisMonth + 1);

                    CashTransaction::create([
                        'transaction_number' => $trxNumber,
                        'type' => 'out',
                        'category' => 'supplier',
                        'amount' => $totalAmount,
                        'date' => now()->toDateString(),
                        'description' => "Pembelian Barang Masuk: {$product->name} ({$transaction->quantity} unit) dari " . ($product->supplier?->name ?? 'Supplier'),
                        'notes' => "Harga Beli Satuan: Rp " . number_format($unitPrice, 0, ',', '.') . " | Terkait Mutasi Stok #{$transaction->id}",
                        'user_id' => $user?->id ?? 1,
                    ]);
                    $cashRecorded = true;
                }
            }
        }

        $typeText = $transaction->type === 'in' ? 'penerimaan barang masuk' : 'pengeluaran barang keluar';
        $msg = "Transaksi {$typeText} #{$transaction->id} berhasil dikonfirmasi dan disahkan oleh {$user->name}! Stok telah resmi diperbarui.";
        if ($cashRecorded) {
            $msg .= " Pengeluaran pembelian supplier otomatis dibukukan di Buku Kas.";
        }

        return back()->with('success', $msg);
    }

    public function stockOpname(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'physical_stock' => 'required|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $result = $this->transactionService->executeStockOpname(
            (int) $validated['product_id'],
            (int) $validated['physical_stock'],
            $validated['notes'] ?? null,
            $request->user()?->id
        );

        return back()->with('success', $result['message']);
    }

    public function prepare(Request $request, StockTransaction $transaction): RedirectResponse
    {
        $action = $transaction->type === 'in' ? 'diperiksa' : 'disiapkan';
        $currentNotes = $transaction->notes ?? '';
        $transaction->update([
            'notes' => trim($currentNotes ? "{$currentNotes} | Sudah {$action} oleh Staff" : "Sudah {$action} oleh Staff"),
        ]);

        return back()->with('success', "Transaksi #{$transaction->id} berhasil ditandai telah {$action}!");
    }

    public function reject(Request $request, StockTransaction $transaction): RedirectResponse
    {
        $this->transactionService->updateStatus($transaction, 'cancelled');

        return back()->with('success', "Transaksi pending #{$transaction->id} berhasil ditolak.");
    }
}
