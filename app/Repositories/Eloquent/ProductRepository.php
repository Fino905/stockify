<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ProductRepository implements ProductRepositoryInterface
{
    /**
     * @return Collection<int, Product>
     */
    public function getAllWithRelations(): Collection
    {
        return Product::with(['category', 'supplier', 'attributes'])
            ->latest('id')
            ->get();
    }

    public function findById(int $id): ?Product
    {
        return Product::with(['category', 'supplier', 'attributes'])->find($id);
    }

    public function findBySku(string $sku): ?Product
    {
        return Product::where('sku', $sku)->first();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Product
    {
        return Product::create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Product $product, array $data): bool
    {
        return $product->update($data);
    }

    public function delete(Product $product): bool
    {
        return (bool) $product->delete();
    }

    public function count(): int
    {
        return Product::count();
    }

    /**
     * @return Collection<int, Product>
     */
    public function getLowStock(): Collection
    {
        return $this->getAllWithRelations()
            ->filter(fn (Product $item) => $item->current_stock <= $item->minimum_stock)
            ->values();
    }
}
