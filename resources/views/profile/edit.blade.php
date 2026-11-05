@extends('layouts.stockify')

@section('title', 'Profil akun - Stockify')

@section('content')
<div class="mx-auto max-w-2xl"><p class="text-sm font-medium text-teal-800">Akun saya</p><h1 class="mt-1 text-2xl font-semibold text-slate-900">Profil & kata sandi</h1><p class="mt-1 text-sm text-slate-500">Kata sandi tidak ditampilkan; ganti dengan kata sandi baru jika diperlukan.</p>
    @if (session('status'))<p class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{{ session('status') }}</p>@endif
    @if ($errors->any())<p class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{{ $errors->first() }}</p>@endif
    <form action="{{ route('profile.update') }}" method="POST" class="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">@csrf @method('PUT')
        <label class="block text-sm font-medium text-slate-700">Nama<input name="name" value="{{ old('name', $user->name) }}" required class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"></label>
        <label class="block text-sm font-medium text-slate-700">Email<input name="email" type="email" value="{{ old('email', $user->email) }}" required class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"></label>
        <label class="block text-sm font-medium text-slate-700">Role<input value="{{ $user->role }}" readonly class="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"></label>
        <div class="border-t border-slate-100 pt-4"><label class="block text-sm font-medium text-slate-700">Kata sandi baru (opsional)<input name="password" type="password" minlength="8" autocomplete="new-password" class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"></label><label class="mt-4 block text-sm font-medium text-slate-700">Ulangi kata sandi baru<input name="password_confirmation" type="password" autocomplete="new-password" class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"></label></div>
        <label class="block text-sm font-medium text-slate-700">Kata sandi saat ini untuk menyimpan perubahan<input name="current_password" type="password" autocomplete="current-password" required class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"></label>
        <button class="rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900">Simpan profil</button>
    </form>
</div>
@endsection
