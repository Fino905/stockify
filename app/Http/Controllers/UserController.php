<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,manajer_gudang,staff_gudang,customer',
        ]);

        $user = $this->userService->createUser($validated);

        return back()->with('success', "Pengguna {$user->name} berhasil ditambahkan!");
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => 'required|in:admin,manajer_gudang,staff_gudang,customer',
        ]);

        $this->userService->updateRole($user, $validated['role']);

        return back()->with('success', "Role pengguna {$user->name} berhasil diperbarui menjadi {$validated['role']}!");
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->userService->deleteUser($user, $request->user()?->id);

        return back()->with('success', "Pengguna {$user->name} berhasil dihapus.");
    }
}
