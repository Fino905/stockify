<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class UserRepository implements UserRepositoryInterface
{
    /**
     * @return Collection<int, User>
     */
    public function getAll(): Collection
    {
        return User::select('id', 'name', 'email', 'role', 'created_at')
            ->latest('id')
            ->get();
    }

    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): User
    {
        return User::create($data);
    }

    public function updateRole(User $user, string $role): bool
    {
        return $user->update(['role' => $role]);
    }

    public function delete(User $user): bool
    {
        return (bool) $user->delete();
    }

    public function count(): int
    {
        return User::count();
    }
}
