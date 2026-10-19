<?php

namespace App\Http\Controllers;

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

        $this->transactionService->recordTransaction($validated, $request->user()?->id);

        $actionText = $validated['type'] === 'in' ? 'penerimaan barang masuk' : 'pengeluaran barang keluar';

        return back()->with('success', "Transaksi {$actionText} berhasil dicatat!");
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
        $this->transactionService->confirmTransaction($transaction, $request->user()?->id);

        $typeText = $transaction->type === 'in' ? 'penerimaan barang masuk' : 'penyiapan barang keluar';

        return back()->with('success', "Tugas {$typeText} berhasil dikonfirmasi selesai!");
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
}
