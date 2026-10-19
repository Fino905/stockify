<?php

namespace App\Services;

use App\Models\Supplier;
use App\Repositories\Contracts\SupplierRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class SupplierService
{
    public function __construct(
        protected SupplierRepositoryInterface $supplierRepository
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function createSupplier(array $data): Supplier
    {
        return $this->supplierRepository->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateSupplier(Supplier $supplier, array $data): bool
    {
        return $this->supplierRepository->update($supplier, $data);
    }

    public function deleteSupplier(Supplier $supplier): bool
    {
        return $this->supplierRepository->delete($supplier);
    }

    /**
     * @return Collection<int, Supplier>
     */
    public function getAllSuppliers(): Collection
    {
        return $this->supplierRepository->getAllWithProductsCount();
    }
}
