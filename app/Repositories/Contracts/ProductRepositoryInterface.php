<?php

namespace App\Repositories\Contracts;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

interface ProductRepositoryInterface
{
    /**
     * @return Collection<int, Product>
     */
    public function getAllWithRelations(): Collection;

    public function findById(int $id): ?Product;

    public function findBySku(string $sku): ?Product;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Product;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Product $product, array $data): bool;

    public function delete(Product $product): bool;

    public function count(): int;

    /**
     * @return Collection<int, Product>
     */
    public function getLowStock(): Collection;
}
