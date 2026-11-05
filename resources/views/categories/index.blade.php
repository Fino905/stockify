@extends('layouts.stockify')

@section('title', 'Kategori produk - Stockify')

@section('content')
<div><p class="text-sm font-medium text-teal-800">Katalog produk</p><h1 class="mt-1 text-2xl font-semibold text-slate-900">Kategori produk</h1><p class="mt-1 text-sm text-slate-500">Kelola pengelompokan produk.</p></div>
@if (session('status'))<p class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{{ session('status') }}</p>@endif
@if ($errors->any())<p class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{{ $errors->first() }}</p>@endif
<section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
    <h2 class="font-semibold text-slate-900">Tambah kategori</h2>
    <form action="{{ route('categories.store') }}" method="POST" class="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto]">@csrf
        <input name="name" required placeholder="Nama kategori" class="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
        <input name="description" placeholder="Deskripsi (opsional)" class="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
        <button class="rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white">Tambah</button>
    </form>
</section>
<section class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="overflow-x-auto"><table class="min-w-full divide-y divide-slate-100 text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-5 py-3">Nama kategori</th><th class="px-5 py-3">Deskripsi</th><th class="px-5 py-3">Produk</th><th class="px-5 py-3">Aksi</th></tr></thead>
        <tbody class="divide-y divide-slate-100">
        @forelse ($categories as $category)
            <tr><td class="px-5 py-4 font-medium text-slate-800">{{ $category->name }}</td><td class="px-5 py-4 text-slate-600">{{ $category->description ?: '—' }}</td><td class="px-5 py-4 text-slate-600">{{ $category->products_count }}</td><td class="whitespace-nowrap px-5 py-4">
                <details class="inline-block"><summary class="cursor-pointer font-semibold text-teal-800">Ubah</summary><form action="{{ route('categories.update', $category) }}" method="POST" class="absolute z-10 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">@csrf @method('PUT')<input name="name" value="{{ $category->name }}" required class="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><textarea name="description" rows="2" class="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">{{ $category->description }}</textarea><button class="rounded-lg bg-teal-800 px-3 py-2 text-xs font-semibold text-white">Simpan</button></form></details>
                <form action="{{ route('categories.destroy', $category) }}" method="POST" class="ml-3 inline" onsubmit="return confirm('Hapus kategori ini?')">@csrf @method('DELETE')<button class="font-semibold text-rose-700">Hapus</button></form>
            </td></tr>
        @empty<tr><td colspan="4" class="px-5 py-10 text-center text-slate-500">Belum ada kategori.</td></tr>@endforelse
        </tbody>
    </table></div>
</section>
@endsection
