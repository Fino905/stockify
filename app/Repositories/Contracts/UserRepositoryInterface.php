<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
    /**
     * @return Collection<int, User>
     */
    public function getAll(): Collection;

    public function findById(int $id): ?User;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): User;

    public function updateRole(User $user, string $role): bool;

    public function delete(User $user): bool;

    public function count(): int;
}
