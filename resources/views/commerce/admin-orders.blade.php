@extends('layouts.stockify')

@section('title', 'Pesanan customer - Stockify')

@section('content')
<div><p class="text-sm font-medium text-teal-800">Penjualan</p><h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Pesanan & pembayaran</h1><p class="mt-1 text-sm text-slate-500">Periksa transfer, pembayaran tunai di toko, atau konfirmasi uang COD sudah diterima. Pembayaran yang ditolak mengembalikan stok.</p></div>
@if (session('status'))<p class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{{ session('status') }}</p>@endif
@if ($errors->any())<p class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{{ $errors->first() }}</p>@endif
<section class="mt-6 space-y-4">
    @forelse ($orders as $order)
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div><h2 class="font-semibold text-slate-900">{{ $order->order_number }}</h2><p class="mt-1 text-sm text-slate-600">{{ $order->customer->name }} · {{ $order->customer->email }}</p><p class="mt-1 text-xs text-slate-500">{{ $order->created_at->format('d M Y, H:i') }} · {{ $order->payment_method }}</p>@if ($order->payment_method === 'Transfer Bank')<p class="mt-1 text-xs text-slate-500">Referensi transaksi: {{ $order->payment_reference }}</p>@endif @if ($order->payment_method === 'COD')<p class="mt-2 text-xs font-semibold text-slate-700">Alamat COD</p><p class="whitespace-pre-line text-sm text-slate-600">{{ $order->delivery_address }}</p>@endif @if ($order->payment_proof)<a href="{{ route('orders.payment-proof', $order) }}" class="mt-2 inline-block text-xs font-semibold text-teal-800">Unduh bukti pembayaran</a>@endif</div>
                <div class="text-right"><span class="rounded-full px-3 py-1 text-xs font-semibold {{ $order->status === 'Dibayar' ? 'bg-emerald-50 text-emerald-800' : ($order->status === 'Menunggu Verifikasi' ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800') }}">{{ $order->status }}</span><p class="mt-2 font-semibold text-slate-900">Rp{{ number_format((float) $order->total, 0, ',', '.') }}</p>@if ($order->reviewer)<p class="mt-1 text-xs text-slate-500">Diperiksa {{ $order->reviewer->name }}</p>@endif</div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3 pt-4">
                <ul class="space-y-1 text-sm text-slate-600">@foreach ($order->items as $item)<li>{{ $item->product_name }} · {{ $item->quantity }} unit</li>@endforeach</ul>
                @if ($order->status === 'Menunggu Verifikasi')
                    <div class="flex gap-2">
                        <form action="{{ route('sales.review', [$order, 'reject']) }}" method="POST" onsubmit="return confirm('Tolak pembayaran dan kembalikan stok?')">@csrf<button class="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">Tolak & kembalikan stok</button></form>
                        <form action="{{ route('sales.review', [$order, 'approve']) }}" method="POST" onsubmit="return confirm('Konfirmasi pembayaran pesanan ini sudah diterima?')">@csrf<button class="rounded-lg bg-teal-800 px-3 py-2 text-xs font-semibold text-white">{{ $order->payment_method === 'COD' ? 'Konfirmasi COD diterima' : 'Verifikasi pembayaran' }}</button></form>
                    </div>
                @endif
            </div>
        </article>
    @empty
        <p class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Belum ada pesanan.</p>
    @endforelse
</section>
<div class="mt-5">{{ $orders->links() }}</div>
@endsection
