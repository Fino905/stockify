<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserService
{
    public function __construct(
        protected UserRepositoryInterface $userRepository
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function createUser(array $data): User
    {
        $data['password'] = Hash::make($data['password']);
        $data['email_verified_at'] = now();

        return $this->userRepository->create($data);
    }

    public function updateRole(User $user, string $role): bool
    {
        return $this->userRepository->updateRole($user, $role);
    }

    public function deleteUser(User $user, ?int $currentUserId = null): bool
    {
        if ($currentUserId !== null && $user->id === $currentUserId) {
            throw ValidationException::withMessages([
                'user' => 'Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif login.',
            ]);
        }

        return $this->userRepository->delete($user);
    }

    /**
     * @return Collection<int, User>
     */
    public function getAllUsers(): Collection
    {
        return $this->userRepository->getAll();
    }
}
