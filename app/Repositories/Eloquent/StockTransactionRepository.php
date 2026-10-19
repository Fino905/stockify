<?php

namespace App\Repositories\Eloquent;

use App\Models\StockTransaction;
use App\Repositories\Contracts\StockTransactionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class StockTransactionRepository implements StockTransactionRepositoryInterface
{
    /**
     * @return Collection<int, StockTransaction>
     */
    public function getAllWithRelations(): Collection
    {
        return StockTransaction::with(['product', 'user'])
            ->latest('id')
            ->get();
    }

    public function findById(int $id): ?StockTransaction
    {
        return StockTransaction::with(['product', 'user'])->find($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): StockTransaction
    {
        return StockTransaction::create($data);
    }

    public function updateStatus(StockTransaction $transaction, string $status, ?int $userId = null): bool
    {
        $payload = ['status' => $status];
        if ($userId !== null) {
            $payload['user_id'] = $userId;
        }

        return $transaction->update($payload);
    }

    public function getTotalQuantityByType(string $type, string $status = 'completed'): int
    {
        return (int) StockTransaction::where('status', $status)
            ->where('type', $type)
            ->sum('quantity');
    }

    public function getTodayQuantityByType(string $type, string $status = 'completed'): int
    {
        return (int) StockTransaction::where('status', $status)
            ->where('type', $type)
            ->whereDate('date', now()->toDateString())
            ->sum('quantity');
    }

    /**
     * @return Collection<int, StockTransaction>
     */
    public function getPendingTasksByType(string $type): Collection
    {
        return StockTransaction::with(['product', 'user'])
            ->where('type', $type)
            ->where('status', 'pending')
            ->latest('id')
            ->get();
    }
}
