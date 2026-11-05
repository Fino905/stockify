@extends('layouts.stockify')

@section('title', 'Supplier - Stockify')

@section('content')
<div><p class="text-sm font-medium text-teal-800">Mitra persediaan</p><h1 class="mt-1 text-2xl font-semibold text-slate-900">Supplier</h1><p class="mt-1 text-sm text-slate-500">Daftar pemasok dan informasi kontak.</p></div>
@if (session('status'))<p class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{{ session('status') }}</p>@endif
@if ($errors->any())<p class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{{ $errors->first() }}</p>@endif
@if ($canManage)
<section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
    <h2 class="font-semibold text-slate-900">Tambah supplier</h2>
    <form action="{{ route('suppliers.store') }}" method="POST" class="mt-4 grid gap-3 sm:grid-cols-2">@csrf
        <input name="name" required placeholder="Nama supplier" class="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
        <input name="email" type="email" placeholder="Email" class="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
        <input name="phone" placeholder="Nomor telepon" class="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
        <input name="address" placeholder="Alamat" class="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
        <button class="w-fit rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white">Tambah supplier</button>
    </form>
</section>
@endif
<section class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="overflow-x-auto"><table class="min-w-full divide-y divide-slate-100 text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-5 py-3">Supplier</th><th class="px-5 py-3">Kontak</th><th class="px-5 py-3">Alamat</th><th class="px-5 py-3">Produk terhubung</th>@if ($canManage)<th class="px-5 py-3">Aksi</th>@endif</tr></thead>
        <tbody class="divide-y divide-slate-100">
        @forelse ($suppliers as $supplier)
            <tr><td class="px-5 py-4 font-medium text-slate-800">{{ $supplier->name }}</td><td class="px-5 py-4 text-slate-600">{{ $supplier->phone ?: '—' }}<div class="text-xs">{{ $supplier->email ?: '' }}</div></td><td class="px-5 py-4 text-slate-600">{{ $supplier->address ?: '—' }}</td><td class="px-5 py-4 text-slate-600">{{ $supplier->products_count }}</td>
                @if ($canManage)<td class="whitespace-nowrap px-5 py-4"><details class="inline-block"><summary class="cursor-pointer font-semibold text-teal-800">Ubah</summary><form action="{{ route('suppliers.update', $supplier) }}" method="POST" class="absolute z-10 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">@csrf @method('PUT')<input name="name" value="{{ $supplier->name }}" required class="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><input name="email" type="email" value="{{ $supplier->email }}" placeholder="Email" class="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><input name="phone" value="{{ $supplier->phone }}" placeholder="Telepon" class="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><textarea name="address" placeholder="Alamat" rows="2" class="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">{{ $supplier->address }}</textarea><button class="rounded-lg bg-teal-800 px-3 py-2 text-xs font-semibold text-white">Simpan</button></form></details>
                    <form action="{{ route('suppliers.destroy', $supplier) }}" method="POST" class="ml-3 inline" onsubmit="return confirm('Hapus supplier ini?')">@csrf @method('DELETE')<button class="font-semibold text-rose-700">Hapus</button></form></td>@endif
            </tr>
        @empty<tr><td colspan="{{ $canManage ? 5 : 4 }}" class="px-5 py-10 text-center text-slate-500">Belum ada data supplier.</td></tr>@endforelse
        </tbody>
    </table></div>
</section>
@endsection
