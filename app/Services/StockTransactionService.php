<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockTransaction;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\StockTransactionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockTransactionService
{
    public function __construct(
        protected StockTransactionRepositoryInterface $transactionRepository,
        protected ProductRepositoryInterface $productRepository
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function recordTransaction(array $data, ?int $userId = null): StockTransaction
    {
        $product = $this->productRepository->findById((int) $data['product_id']);
        if (! $product) {
            throw ValidationException::withMessages([
                'product_id' => 'Produk yang dipilih tidak ditemukan dalam database.',
            ]);
        }

        $type = $data['type'];
        $status = $data['status'] ?? 'completed';
        $quantity = (int) $data['quantity'];

        // Cek ketersediaan stok jika barang keluar langsung selesai
        if ($type === 'out' && $status === 'completed') {
            if ($product->current_stock < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => "Stok produk {$product->name} tidak mencukupi (sisa: {$product->current_stock} unit).",
                ]);
            }
        }

        $data['user_id'] = $userId ?? 1;
        $data['status'] = $status;

        $created = $this->transactionRepository->create($data);

        if ($status === 'completed') {
            $this->syncProductZeroStock($product);
        }

        return $created;
    }

    public function updateStatus(StockTransaction $transaction, string $status): bool
    {
        $updated = $this->transactionRepository->updateStatus($transaction, $status);
        if ($transaction->product) {
            $this->syncProductZeroStock($transaction->product);
        }

        return $updated;
    }

    public function confirmTransaction(StockTransaction $transaction, ?int $userId = null): bool
    {
        // Validasi jika keluar apakah stok masih cukup
        if ($transaction->type === 'out') {
            $product = $transaction->product;
            if ($product && $product->current_stock < $transaction->quantity) {
                throw ValidationException::withMessages([
                    'quantity' => "Gagal konfirmasi: Stok produk {$product->name} tidak mencukupi saat ini.",
                ]);
            }
        }

        $confirmed = $this->transactionRepository->updateStatus($transaction, 'completed', $userId);
        if ($transaction->product) {
            $this->syncProductZeroStock($transaction->product);
        }

        return $confirmed;
    }

    /**
     * @return array{success: bool, diff: int, message: string}
     */
    public function executeStockOpname(int $productId, int $physicalStock, ?string $notes = null, ?int $userId = null): array
    {
        $product = $this->productRepository->findById($productId);
        if (! $product) {
            throw ValidationException::withMessages([
                'product_id' => 'Produk tidak ditemukan.',
            ]);
        }

        $current = $product->current_stock;
        $diff = $physicalStock - $current;

        if ($diff === 0) {
            $this->syncProductZeroStock($product);

            return [
                'success' => true,
                'diff' => 0,
                'message' => "Stok fisik ({$physicalStock}) sama persis dengan sistem. Tidak ada selisih penyesuaian.",
            ];
        }

        $type = $diff > 0 ? 'in' : 'out';
        $qty = abs($diff);

        DB::transaction(function () use ($product, $type, $qty, $current, $physicalStock, $notes, $userId) {
            $this->transactionRepository->create([
                'product_id' => $product->id,
                'user_id' => $userId ?? 1,
                'type' => $type,
                'quantity' => $qty,
                'date' => now()->toDateString(),
                'status' => 'completed',
                'notes' => "Hasil Stock Opname: Penyesuaian stok sistem ({$current} unit) ke fisik ({$physicalStock} unit). ".($notes ?? ''),
            ]);
        });

        $this->syncProductZeroStock($product);

        return [
            'success' => true,
            'diff' => $diff,
            'message' => "Stock opname berhasil! Stok {$product->name} disesuaikan menjadi {$physicalStock} unit.",
        ];
    }

    /**
     * Sinkronisasi penanda waktu stok nol produk
     */
    protected function syncProductZeroStock(Product $product): void
    {
        $freshProduct = $product->fresh();
        if (! $freshProduct) {
            return;
        }

        $stock = $freshProduct->current_stock;
        if ($stock <= 0) {
            if (! $freshProduct->zero_stock_since) {
                $freshProduct->update(['zero_stock_since' => now()]);
            }
        } else {
            if ($freshProduct->zero_stock_since !== null) {
                $freshProduct->update(['zero_stock_since' => null]);
            }
        }
    }

    /**
     * @return Collection<int, StockTransaction>
     */
    public function getAllTransactions(): Collection
    {
        return $this->transactionRepository->getAllWithRelations();
    }
}
