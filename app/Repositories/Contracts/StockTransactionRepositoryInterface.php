<?php

namespace App\Repositories\Contracts;

use App\Models\StockTransaction;
use Illuminate\Database\Eloquent\Collection;

interface StockTransactionRepositoryInterface
{
    /**
     * @return Collection<int, StockTransaction>
     */
    public function getAllWithRelations(): Collection;

    public function findById(int $id): ?StockTransaction;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): StockTransaction;

    public function updateStatus(StockTransaction $transaction, string $status, ?int $userId = null): bool;

    public function getTotalQuantityByType(string $type, string $status = 'completed'): int;

    public function getTodayQuantityByType(string $type, string $status = 'completed'): int;

    /**
     * @return Collection<int, StockTransaction>
     */
    public function getPendingTasksByType(string $type): Collection;
}
