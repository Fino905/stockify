@extends('layouts.stockify')

@section('title', 'Pengguna & hak akses - Stockify')

@section('content')
<div><p class="text-sm font-medium text-teal-800">Administrasi</p><h1 class="mt-1 text-2xl font-semibold text-slate-900">Pengguna & hak akses</h1><p class="mt-1 text-sm text-slate-500">Admin mengelola akun internal. Akun Customer dibuat melalui registrasi mandiri.</p></div>
@if (session('status'))<p class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{{ session('status') }}</p>@endif
@if ($errors->any())<p class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{{ $errors->first() }}</p>@endif
<section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
    <h2 class="font-semibold text-slate-900">Buat akun</h2>
    <form action="{{ route('users.store') }}" method="POST" class="mt-4 grid gap-3 sm:grid-cols-2">@csrf
        <input name="name" required placeholder="Nama lengkap" class="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
        <input name="email" type="email" required placeholder="Email" class="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
        <select name="role" required class="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option>Staff Gudang</option><option>Manajer Gudang</option><option>Admin</option></select>
        <input name="password" type="password" minlength="8" required placeholder="Kata sandi (min. 8 karakter)" class="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
        <button class="w-fit rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white">Tambah pengguna</button>
    </form>
</section>
<section class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="overflow-x-auto"><table class="min-w-full divide-y divide-slate-100 text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-5 py-3">Nama</th><th class="px-5 py-3">Email</th><th class="px-5 py-3">Role</th><th class="px-5 py-3">Bergabung</th><th class="px-5 py-3">Aksi</th></tr></thead>
        <tbody class="divide-y divide-slate-100">
        @foreach ($users as $user)
            <tr><td class="px-5 py-4 font-medium text-slate-800">{{ $user->name }}</td><td class="px-5 py-4 text-slate-600">{{ $user->email }}</td><td class="px-5 py-4"><span class="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">{{ $user->role }}</span></td><td class="whitespace-nowrap px-5 py-4 text-slate-500">{{ $user->created_at->format('d M Y') }}</td><td class="whitespace-nowrap px-5 py-4">
                <details class="inline-block"><summary class="cursor-pointer font-semibold text-teal-800">Ubah</summary><form action="{{ route('users.update', $user) }}" method="POST" class="absolute z-10 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">@csrf @method('PUT')<input name="name" value="{{ $user->name }}" required class="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><input name="email" type="email" value="{{ $user->email }}" required class="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">@if ($user->role === 'Customer')<input type="hidden" name="role" value="Customer"><p class="mb-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">Role Customer tidak dapat diubah dari menu Admin.</p>@else<select name="role" class="mb-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option @selected($user->role === 'Staff Gudang')>Staff Gudang</option><option @selected($user->role === 'Manajer Gudang')>Manajer Gudang</option><option @selected($user->role === 'Admin')>Admin</option></select>@endif<input name="password" type="password" minlength="8" placeholder="Kata sandi baru (opsional)" class="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><button class="rounded-lg bg-teal-800 px-3 py-2 text-xs font-semibold text-white">Simpan perubahan</button></form></details>
                @if ($user->id !== auth()->id())<form action="{{ route('users.destroy', $user) }}" method="POST" class="ml-3 inline" onsubmit="return confirm('Hapus akun {{ addslashes($user->name) }}?')">@csrf @method('DELETE')<button class="font-semibold text-rose-700">Hapus</button></form>@endif
            </td></tr>
        @endforeach
        </tbody>
    </table></div>
</section>
@endsection
