<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuickSwitchController extends Controller
{
    public function __invoke(Request $request, string $role): RedirectResponse
    {
        $validRoles = ['admin', 'manajer_gudang', 'staff_gudang', 'customer'];
        if (! in_array($role, $validRoles, true)) {
            return back()->withErrors(['role' => 'Role tidak valid.']);
        }

        $user = User::where('role', $role)->first();
        if ($user) {
            Auth::login($user);
            $request->session()->regenerate();

            return redirect()->route('dashboard')->with('success', "Beralih login sebagai: {$user->name} ({$role})");
        }

        return back()->withErrors(['role' => "Akun dengan role {$role} tidak ditemukan."]);
    }
}
