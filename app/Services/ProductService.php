<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\StockTransactionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

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
        return $this->productRepository->update($product, $data);
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
