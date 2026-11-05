@extends('layouts.stockify')

@section('title', $product->name . ' - Stockify')

@section('content')
<div class="mx-auto max-w-4xl">
    <a href="{{ route('products.index') }}" class="text-sm font-semibold text-teal-800 hover:text-teal-950">&larr; Kembali ke produk</a>
    <div class="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div class="flex items-start gap-4">
            @if ($product->image)<img src="{{ \Illuminate\Support\Facades\Storage::disk('public')->url($product->image) }}" alt="Gambar {{ $product->name }}" class="h-24 w-24 rounded-2xl border border-slate-200 object-cover">@endif
            <div><p class="text-sm font-medium text-teal-800">{{ $product->sku }}</p><h1 class="mt-1 text-2xl font-semibold text-slate-900">{{ $product->name }}</h1><p class="mt-2 text-sm text-slate-500">{{ $product->description ?: 'Tidak ada deskripsi produk.' }}</p></div>
        </div>
        <span class="rounded-full px-3 py-1.5 text-sm font-semibold {{ $stock <= $product->minimum_stock ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800' }}">{{ number_format($stock) }} unit tersedia</span>
    </div>
    <section class="mt-6 grid gap-4 sm:grid-cols-2">
        <article class="rounded-2xl border border-slate-200 bg-white p-5"><h2 class="text-sm font-semibold text-slate-500">Informasi katalog</h2><dl class="mt-4 space-y-3 text-sm"><div class="flex justify-between gap-3"><dt class="text-slate-500">Kategori</dt><dd class="font-medium text-slate-800">{{ $product->category->name }}</dd></div><div class="flex justify-between gap-3"><dt class="text-slate-500">Supplier</dt><dd class="font-medium text-slate-800">{{ $product->supplier->name }}</dd></div><div class="flex justify-between gap-3"><dt class="text-slate-500">Stok minimum</dt><dd class="font-medium text-slate-800">{{ number_format($product->minimum_stock) }} unit</dd></div><div class="flex justify-between gap-3"><dt class="text-slate-500">Harga jual</dt><dd class="font-medium text-slate-800">Rp {{ number_format((float) $product->selling_price, 0, ',', '.') }}</dd></div></dl></article>
        <article class="rounded-2xl border border-slate-200 bg-white p-5"><h2 class="text-sm font-semibold text-slate-500">Atribut produk</h2><dl class="mt-4 space-y-3 text-sm">@forelse ($product->attributes as $attribute)<div class="flex justify-between gap-3 border-b border-slate-100 pb-2"><dt class="text-slate-500">{{ $attribute->name }}</dt><dd class="font-medium text-slate-800">{{ $attribute->value }}</dd></div>@empty<p class="text-slate-500">Belum ada atribut produk.</p>@endforelse</dl></article>
    </section>
    @if (auth()->user()->role === 'Admin')
        <a href="{{ route('products.edit', $product) }}" class="mt-5 inline-flex rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900">Ubah produk</a>
    @endif
</div>
@endsection
