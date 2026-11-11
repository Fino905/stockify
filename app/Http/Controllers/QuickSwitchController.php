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
        abort_unless(app()->environment('local', 'testing'), 404, 'Fitur demo switch role hanya tersedia di environment development.');

        $roleMap = [
            'admin' => 'admin',
            'administrator' => 'admin',
            'manajer' => 'manajer_gudang',
            'manajer_gudang' => 'manajer_gudang',
            'manager' => 'manajer_gudang',
            'staff' => 'staff_gudang',
            'staff_gudang' => 'staff_gudang',
        ];

        $key = strtolower(str_replace([' ', '-'], '_', $role));
        if (! isset($roleMap[$key])) {
            return back()->withErrors(['role' => 'Role demo tidak valid.']);
        }

        $targetRole = $roleMap[$key];
        $user = User::where('role', $targetRole)->first();
        if ($user) {
            Auth::login($user);
            $request->session()->regenerate();
            $request->session()->forget('url.intended');

            return redirect()->to('/dashboard')->with('success', "Berhasil masuk sebagai demo: {$user->name} ({$targetRole})");
        }

        return back()->withErrors(['role' => "Akun demo dengan role {$targetRole} tidak ditemukan."]);
    }
}
