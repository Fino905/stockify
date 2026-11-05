@extends('layouts.stockify')

@section('title', 'Katalog produk - Stockify')

@section('content')
<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
        <p class="text-sm font-medium text-teal-800">Inventaris elektronik</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Katalog produk</h1>
        <p class="mt-1 text-sm text-slate-500">Pantau barang, pemasok, dan ketersediaan stok dari satu tempat.</p>
    </div>
    <div class="flex items-center gap-2">
        <span class="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"><span class="h-2 w-2 rounded-full bg-emerald-500"></span>{{ number_format($products->count()) }} produk</span>
        @if ($canManage)
            <a href="{{ route('products.import-template') }}" class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Template CSV</a>
            <a href="{{ route('products.export') }}" class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Ekspor CSV</a>
        @endif
        @if ($canCreate)
            <a href="{{ route('products.create') }}" class="rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900">Tambah produk</a>
        @endif
    </div>
</div>
@if (session('status'))<p class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{{ session('status') }}</p>@endif
@if ($errors->any())<p class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{{ $errors->first() }}</p>@endif
@if (session('import_result'))
    <section class="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <p class="font-semibold text-slate-800">Hasil import: {{ session('import_result')['imported'] }} berhasil, {{ session('import_result')['failed'] }} gagal.</p>
        @if (session('import_result')['failed'] > count(session('import_result')['errors']))
            <p class="mt-1 text-slate-500">Hanya 25 kesalahan pertama ditampilkan.</p>
        @endif
        @if (session('import_result')['errors'])
            <ul class="mt-2 list-inside list-disc space-y-1 text-rose-700">
                @foreach (session('import_result')['errors'] as $error)
                    <li>Baris {{ $error['line'] }}: {{ implode(' ', $error['messages']) }}</li>
                @endforeach
            </ul>
        @endif
    </section>
@endif

<section class="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100/70 sm:p-5">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h2 class="font-semibold text-slate-900">Semua produk</h2>
            <p class="mt-1 text-sm text-slate-500">Stok dihitung dari transaksi masuk dan keluar yang sudah dikonfirmasi.</p>
        </div>
        <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        @if ($canManage)
            <form action="{{ route('products.import') }}" method="POST" enctype="multipart/form-data" class="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                @csrf
                <label class="text-xs text-slate-600">Import produk CSV
                    <input type="file" name="file" accept=".csv,text/csv" required class="mt-1 block w-52 text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-white file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700">
                </label>
                <button class="rounded-lg bg-teal-800 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-900">Import</button>
            </form>
        @endif
        <label class="relative block w-full sm:max-w-xs">
            <span class="sr-only">Cari produk</span>
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <circle cx="11" cy="11" r="7"></circle><path stroke-linecap="round" d="m20 20-4-4"></path>
            </svg>
            <input type="search" data-product-search class="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100" placeholder="Cari nama, SKU, kategori...">
        </label>
        </div>
    </div>

    <div class="mt-5 overflow-x-hidden">
        <table class="w-full table-fixed divide-y divide-slate-100 text-left text-xs">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-450">
                <tr>
                    <th scope="col" style="width: 7%" class="px-1.5 py-2.5 font-medium sm:px-2">Gambar</th>
                    <th scope="col" style="width: 17%" class="px-1.5 py-2.5 font-medium sm:px-2">Produk</th>
                    <th scope="col" style="width: 11%" class="px-1.5 py-2.5 font-medium sm:px-2">Kategori</th>
                    <th scope="col" style="width: 12%" class="px-1.5 py-2.5 font-medium sm:px-2">Pemasok</th>
                    <th scope="col" style="width: 13%" class="px-1.5 py-2.5 text-right font-medium sm:px-2">Stok tersedia</th>
                    <th scope="col" style="width: 11%" class="px-1.5 py-2.5 text-right font-medium sm:px-2">Batas minimum</th>
                    <th scope="col" style="width: 14%" class="px-1.5 py-2.5 text-right font-medium sm:px-2">Harga jual</th>
                    <th scope="col" style="width: 15%" class="px-1.5 py-2.5 text-center font-medium sm:px-2">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($products as $product)
                    @php
                        $availableStock = (int) ($stockBalances[$product->id] ?? 0);
                        $isLowStock = $availableStock <= $product->minimum_stock;
                    @endphp
                    <tr data-product-row class="transition hover:bg-slate-50/70">
                        <td class="break-words px-1.5 py-3 sm:px-2">
                            @if ($product->image)
                                <img src="{{ \Illuminate\Support\Facades\Storage::disk('public')->url($product->image) }}" alt="" class="mx-auto h-8 w-8 rounded-lg object-cover sm:h-10 sm:w-10">
                            @else
                                <span class="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400 sm:h-10 sm:w-10" aria-label="Tidak ada gambar">—</span>
                            @endif
                        </td>
                        <td class="break-words px-1.5 py-3 sm:px-2">
                            <a href="{{ route('products.show', $product) }}" class="font-medium leading-tight text-slate-900 hover:text-teal-800">{{ $product->name }}</a>
                            <p class="mt-0.5 break-all text-[10px] text-slate-500">{{ $product->sku }}</p>
                        </td>
                        <td class="break-words px-1.5 py-3 text-slate-600 sm:px-2">{{ $product->category->name ?? 'Tanpa kategori' }}</td>
                        <td class="break-words px-1.5 py-3 text-slate-600 sm:px-2">{{ $product->supplier->name ?? '—' }}</td>
                        <td class="break-words px-1.5 py-3 text-right sm:px-2">
                            <span class="inline-flex max-w-full items-center justify-end gap-1 rounded-full px-1.5 py-1 text-[10px] font-semibold sm:gap-1.5 sm:px-2.5 sm:text-xs {{ $isLowStock ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800' }}">
                                <span class="h-1.5 w-1.5 rounded-full {{ $isLowStock ? 'bg-amber-500' : 'bg-emerald-500' }}"></span>
                                {{ number_format($availableStock) }} unit
                            </span>
                        </td>
                        <td class="break-words px-1.5 py-3 text-right text-slate-600 sm:px-2">{{ number_format($product->minimum_stock) }} unit</td>
                        <td class="break-words px-1.5 py-3 text-right font-medium text-slate-800 sm:px-2">Rp {{ number_format((float) $product->selling_price, 0, ',', '.') }}</td>
                        <td class="border-l border-slate-100 px-1 py-2 align-middle sm:px-2">
                            <div class="flex flex-row gap-1">
                                <a href="{{ route('products.show', $product) }}" class="rounded-md px-1 py-1 text-center text-[10px] font-semibold text-teal-600 transition hover:bg-teal-50 hover:text-teal-950 sm:text-xs">Detail</a>
                            @if ($canManage)
                                <a href="{{ route('products.edit', $product) }}" class="rounded-md px-1 py-1 text-center text-[10px] font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 sm:text-xs">Ubah</a>
                                <form action="{{ route('products.destroy', $product) }}" method="POST" onsubmit="return confirm('Hapus produk ini?')">
                                    @csrf @method('DELETE')
                                    <button class="w-full rounded-md px-1 py-1 text-[10px] font-semibold text-rose-700 transition hover:bg-rose-50 hover:text-rose-700 sm:text-xs">Hapus</button>
                                </form>
                            @endif
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="px-4 py-12 text-center">
                            <p class="font-medium text-slate-700">Belum ada produk</p>
                            <p class="mt-1 text-sm text-slate-500">Produk elektronik yang terdaftar akan tampil di sini.</p>
                        </td>
                    </tr>
                @endforelse
                <tr id="products-no-search-results" class="hidden">
                    <td colspan="8" class="px-4 py-10 text-center text-sm text-slate-500">Produk yang cocok dengan pencarian tidak ditemukan.</td>
                </tr>
            </tbody>
        </table>
    </div>
</section>
@endsection
