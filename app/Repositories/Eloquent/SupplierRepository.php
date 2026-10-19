<?php

namespace App\Repositories\Eloquent;

use App\Models\Supplier;
use App\Repositories\Contracts\SupplierRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class SupplierRepository implements SupplierRepositoryInterface
{
    /**
     * @return Collection<int, Supplier>
     */
    public function getAllWithProductsCount(): Collection
    {
        return Supplier::withCount('products')
            ->orderBy('name')
            ->get();
    }

    public function findById(int $id): ?Supplier
    {
        return Supplier::find($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Supplier
    {
        return Supplier::create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Supplier $supplier, array $data): bool
    {
        return $supplier->update($data);
    }

    public function delete(Supplier $supplier): bool
    {
        return (bool) $supplier->delete();
    }

    public function count(): int
    {
        return Supplier::count();
    }
}
