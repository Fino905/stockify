<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\StockTransactionRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductService
{
    public function __construct(
        protected ProductRepositoryInterface $productRepository,
        protected StockTransactionRepositoryInterface $transactionRepository
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function createProduct(array $data, ?int $userId = null): Product
    {
        return DB::transaction(function () use ($data, $userId) {
            $initialStock = isset($data['initial_stock']) ? (int) $data['initial_stock'] : 0;
            unset($data['initial_stock']);

            if ($initialStock <= 0) {
                $data['zero_stock_since'] = now();
            } else {
                $data['zero_stock_since'] = null;
            }

            $product = $this->productRepository->create($data);

            if ($initialStock > 0) {
                $this->transactionRepository->create([
                    'product_id' => $product->id,
                    'user_id' => $userId ?? 1,
                    'type' => 'in',
                    'quantity' => $initialStock,
                    'date' => now()->toDateString(),
                    'status' => 'completed',
                    'notes' => 'Pencatatan stok awal saat pembuatan produk baru',
                ]);
            }

            return $product;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateProduct(Product $product, array $data): bool
    {
        $updated = $this->productRepository->update($product, $data);
        $this->syncProductZeroStockStatus($product);

        return $updated;
    }

    /**
     * @param  array<int, array<string, mixed>>  $records
     */
    public function importProductsFromCsv(array $records, ?int $userId = null): int
    {
        return DB::transaction(function () use ($records, $userId) {
            $importedCount = 0;
            foreach ($records as $item) {
                if (empty($item['name']) || empty($item['sku'])) {
                    continue;
                }

                $existing = $this->productRepository->findBySku($item['sku']);
                if ($existing) {
                    continue;
                }

                $this->createProduct($item, $userId);
                $importedCount++;
            }

            return $importedCount;
        });
    }

    public function deleteProduct(Product $product): bool
    {
        return DB::transaction(function () use ($product) {
            $product->transactions()->delete();
            $product->attributes()->delete();

            return $this->productRepository->delete($product);
        });
    }

    /**
     * Memperbarui stempel waktu 'zero_stock_since' pada produk berdasarkan stok saat ini.
     */
    public function syncProductZeroStockStatus(Product $product): void
    {
        $stock = $product->current_stock;
        if ($stock <= 0) {
            if (! $product->zero_stock_since) {
                $product->update(['zero_stock_since' => now()]);
            }
        } else {
            if ($product->zero_stock_since !== null) {
                $product->update(['zero_stock_since' => null]);
            }
        }
    }

    /**
     * Otomatis menghapus produk yang stoknya 0 selama lebih dari $days hari.
     *
     * @return array{deleted_count: int, deleted_products: array<int, string>}
     */
    public function autoDeleteZeroStockProducts(int $days = 3): array
    {
        $cutoff = now()->subDays($days);
        $products = Product::with('transactions')->get();
        $deleted = [];

        foreach ($products as $product) {
            $stock = $product->current_stock;

            if ($stock > 0) {
                if ($product->zero_stock_since !== null) {
                    $product->update(['zero_stock_since' => null]);
                }

                continue;
            }

            // Stok saat ini adalah 0
            $zeroSince = $product->zero_stock_since;

            if (! $zeroSince) {
                $lastTrx = $product->transactions
                    ->where('status', 'completed')
                    ->sortByDesc('date')
                    ->first();

                if ($lastTrx && $lastTrx->date) {
                    $zeroSince = Carbon::parse($lastTrx->date);
                } elseif ($product->created_at) {
                    $zeroSince = $product->created_at;
                } else {
                    $zeroSince = now();
                }

                $product->update(['zero_stock_since' => $zeroSince]);
            }

            // Jika stok 0 sudah melebihi batas $days hari, lakukan auto-delete
            if ($zeroSince->lte($cutoff)) {
                $productName = $product->name;
                $this->deleteProduct($product);
                $deleted[] = $productName;
                Log::info("Produk '{$productName}' (ID: {$product->id}) otomatis dihapus karena stok 0 lebih dari {$days} hari (sejak {$zeroSince->toDateTimeString()}).");
            }
        }

        return [
            'deleted_count' => count($deleted),
            'deleted_products' => $deleted,
        ];
    }

    /**
     * @return Collection<int, Product>
     */
    public function getAllProducts(): Collection
    {
        return $this->productRepository->getAllWithRelations();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getFormattedProducts(): array
    {
        return $this->productRepository->getAllWithRelations()->map(function (Product $product) {
            $isZeroStock = $product->current_stock <= 0;
            $zeroDays = ($isZeroStock && $product->zero_stock_since)
                ? (int) $product->zero_stock_since->diffInDays(now())
                : 0;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'description' => $product->description,
                'image' => $product->image,
                'purchase_price' => (float) $product->purchase_price,
                'selling_price' => (float) $product->selling_price,
                'minimum_stock' => (int) $product->minimum_stock,
                'current_stock' => (int) $product->current_stock,
                'zero_stock_since' => $product->zero_stock_since?->format('Y-m-d H:i:s'),
                'zero_stock_days' => $zeroDays,
                'days_until_deletion' => $isZeroStock ? max(0, 3 - $zeroDays) : null,
                'category_id' => $product->category_id,
                'category_name' => $product->category?->name ?? 'Tanpa Kategori',
                'supplier_id' => $product->supplier_id,
                'supplier_name' => $product->supplier?->name ?? 'Tanpa Supplier',
                'attributes' => $product->attributes->map(fn ($attr) => [
                    'id' => $attr->id,
                    'name' => $attr->name,
                    'value' => $attr->value,
                ])->values()->all(),
            ];
        })->values()->all();
    }
}
