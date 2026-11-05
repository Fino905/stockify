@extends('layouts.stockify')

@section('title', 'Belanja produk - Stockify')

@section('content')
<div>
    <p class="text-sm font-medium text-teal-800">Katalog customer</p>
    <h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Belanja produk</h1>
    <p class="mt-1 text-sm text-slate-500">Pilih produk untuk melihat detail dan metode pembayarannya.</p>
</div>
@if (session('status'))<p class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{{ session('status') }}</p>@endif

<section class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    @forelse ($products as $product)
        @php($available = (int) ($stockBalances[$product->id] ?? 0))
        <a href="{{ route('shop.product', $product) }}" class="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2">
            @if ($product->image)
                <img src="{{ \Illuminate\Support\Facades\Storage::disk('public')->url($product->image) }}" alt="" class="h-44 w-full bg-slate-50 object-contain p-4">
            @else
                <div class="flex h-44 items-center justify-center bg-slate-50 text-slate-300"><svg class="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10"/></svg></div>
            @endif
            <div class="p-5">
                <p class="text-xs font-medium text-teal-800">{{ $product->category->name ?? 'Produk' }} · {{ $product->sku }}</p>
                <h2 class="mt-1 font-semibold text-slate-900">{{ $product->name }}</h2>
                @if ($product->description)<p class="mt-2 line-clamp-2 text-sm text-slate-500">{{ $product->description }}</p>@endif
                <div class="mt-4 flex items-end justify-between gap-2">
                    <p class="text-lg font-bold text-slate-900">Rp{{ number_format((float) $product->selling_price, 0, ',', '.') }}</p>
                    <p class="text-xs {{ $available > 0 ? 'text-emerald-700' : 'text-rose-700' }}">{{ number_format($available) }} tersedia</p>
                </div>
                <span class="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-teal-900">Lihat detail produk</span>
            </div>
        </a>
    @empty
        <p class="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Belum ada produk yang tersedia.</p>
    @endforelse
</section>
<div class="mt-5">{{ $products->links() }}</div>
@endsection
