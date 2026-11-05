@extends('layouts.stockify')

@section('title', 'Atribut produk - Stockify')

@section('content')
<div><p class="text-sm font-medium text-teal-800">Katalog produk</p><h1 class="mt-1 text-2xl font-semibold text-slate-900">Definisi atribut produk</h1><p class="mt-1 text-sm text-slate-500">Tetapkan atribut standar seperti warna, ukuran, berat, atau bahan untuk digunakan pada produk.</p></div>
@if (session('status'))<p class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{{ session('status') }}</p>@endif
@if ($errors->any())<p class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{{ $errors->first() }}</p>@endif
<section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
    <h2 class="font-semibold text-slate-900">Tambah definisi</h2>
    <form action="{{ route('attribute-definitions.store') }}" method="POST" class="mt-4 flex flex-col gap-3 sm:flex-row">@csrf
        <input name="name" required maxlength="100" placeholder="Contoh: Warna" class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
        <button class="rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white">Tambah atribut</button>
    </form>
</section>
<section class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="overflow-x-auto"><table class="min-w-full divide-y divide-slate-100 text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-5 py-3">Atribut</th><th class="px-5 py-3">Produk yang menggunakan</th><th class="px-5 py-3">Tindakan</th></tr></thead>
        <tbody class="divide-y divide-slate-100">
        @forelse ($definitions as $definition)
            <tr><td class="px-5 py-4 font-medium text-slate-800">{{ $definition->name }}</td><td class="px-5 py-4 text-slate-600">{{ $definition->attributes_count }}</td><td class="whitespace-nowrap px-5 py-4">
                <details class="inline-block"><summary class="cursor-pointer font-semibold text-teal-800">Ubah nama</summary><form action="{{ route('attribute-definitions.update', $definition) }}" method="POST" class="absolute z-10 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">@csrf @method('PUT')<input name="name" value="{{ $definition->name }}" required maxlength="100" class="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><button class="rounded-lg bg-teal-800 px-3 py-2 text-xs font-semibold text-white">Simpan</button></form></details>
                <form action="{{ route('attribute-definitions.destroy', $definition) }}" method="POST" class="ml-3 inline" onsubmit="return confirm('Hapus definisi atribut ini?')">@csrf @method('DELETE')<button @disabled($definition->attributes_count > 0) class="font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-40">Hapus</button></form>
            </td></tr>
        @empty<tr><td colspan="3" class="px-5 py-10 text-center text-slate-500">Belum ada definisi atribut.</td></tr>@endforelse
        </tbody>
    </table></div>
</section>
@endsection
