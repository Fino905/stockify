<?php

namespace App\Repositories\Contracts;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Collection;

interface SupplierRepositoryInterface
{
    /**
     * @return Collection<int, Supplier>
     */
    public function getAllWithProductsCount(): Collection;

    public function findById(int $id): ?Supplier;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Supplier;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Supplier $supplier, array $data): bool;

    public function delete(Supplier $supplier): bool;

    public function count(): int;
}
