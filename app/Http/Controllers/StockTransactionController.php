<?php

namespace App\Http\Controllers;

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
        ]);

        $user = $request->user();
        // Setiap staff memasukkan barang (masuk/keluar), status otomatis 'pending' (menunggu konfirmasi admin/management)
        if ($user && $user->role === 'staff_gudang') {
            $validated['status'] = 'pending';
            $staffNote = "[Diajukan oleh Staff: {$user->name} - Menunggu Konfirmasi Admin/Management]";
            $validated['notes'] = trim(($validated['notes'] ?? '') . ' ' . $staffNote);
        }

        $this->transactionService->recordTransaction($validated, $user?->id);

        $actionText = $validated['type'] === 'in' ? 'penerimaan barang masuk' : 'pengeluaran barang keluar';
        $message = ($user && $user->role === 'staff_gudang')
            ? "Transaksi {$actionText} berhasil diajukan dan berstatus PENDING (Menunggu konfirmasi Admin/Management)!"
            : "Transaksi {$actionText} berhasil dicatat!";

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

        $typeText = $transaction->type === 'in' ? 'penerimaan barang masuk' : 'pengeluaran barang keluar';
        $msg = "Transaksi {$typeText} #{$transaction->id} berhasil dikonfirmasi dan disahkan oleh {$user->name}! Stok telah resmi diperbarui.";

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
