@extends('layouts.stockify')

@section('title', 'Riwayat pembelian - Stockify')

@section('content')
<div>
    <p class="text-sm font-medium text-teal-800">Akun customer</p>
    <h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Riwayat pembelian</h1>
    <p class="mt-1 text-sm text-slate-500">Lihat status pembayaran, berikan feedback, dan ajukan refund.</p>
</div>
@if (session('status'))<p class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{{ session('status') }}</p>@endif
@if ($errors->any())<p class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{{ $errors->first() }}</p>@endif
<section class="mt-6 space-y-4">
    @forelse ($orders as $order)
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div><p class="font-semibold text-slate-900">{{ $order->order_number }}</p><p class="mt-1 text-xs text-slate-500">{{ $order->created_at->format('d M Y, H:i') }} · {{ $order->payment_method === 'COD' ? 'COD (Bayar di Tempat)' : $order->payment_method }}</p>@if ($order->payment_method === 'Transfer Bank')<p class="mt-1 text-xs text-slate-500">Referensi transaksi: {{ $order->payment_reference }}</p>@endif @if ($order->payment_method === 'COD')<p class="mt-2 text-xs font-semibold text-slate-700">Alamat pengantaran</p><p class="whitespace-pre-line text-sm text-slate-600">{{ $order->delivery_address }}</p>@endif</div>
                <div class="text-right"><span class="rounded-full px-3 py-1 text-xs font-semibold {{ $order->status === 'Dibayar' ? 'bg-emerald-50 text-emerald-800' : ($order->status === 'Menunggu Verifikasi' ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800') }}">{{ $order->status }}</span><p class="mt-2 font-semibold text-slate-900">Rp{{ number_format((float) $order->total, 0, ',', '.') }}</p>@if ($order->payment_proof)<a href="{{ route('orders.payment-proof', $order) }}" class="text-xs font-medium text-teal-800">Unduh bukti pembayaran</a>@endif</div>
            </div>
            <div class="divide-y divide-slate-100">
                @foreach ($order->items as $item)
                    <div class="grid gap-4 py-4 md:grid-cols-[1fr_auto]">
                        <div><p class="font-medium text-slate-800">{{ $item->product_name }}</p><p class="mt-1 text-sm text-slate-500">{{ $item->sku }} · {{ $item->quantity }} unit × Rp{{ number_format((float) $item->unit_price, 0, ',', '.') }}</p>
                            @if ($order->status === 'Dibayar')
                                <div class="mt-3 flex flex-wrap gap-3 text-xs font-semibold"><a href="{{ route('feedback.index') }}" class="text-teal-800 hover:underline">Berikan feedback</a></div>
                                <form action="{{ route('refunds.store', $item) }}" method="POST" class="mt-3 grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[100px_1fr_auto]">@csrf
                                    <label class="text-xs text-slate-600">Jumlah refund<input type="number" name="quantity" min="1" max="{{ $item->quantity }}" value="1" required class="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"></label>
                                    <label class="text-xs text-slate-600">Alasan refund<input name="reason" minlength="5" maxlength="2000" required placeholder="Jelaskan alasan pengajuan refund" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"></label>
                                    <button class="self-end rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900">Ajukan refund</button>
                                </form>
                            @endif
                            @foreach ($item->refunds as $refund)
                                <p class="mt-2 text-xs text-slate-500">Refund {{ $refund->quantity }} unit: <span class="font-semibold">{{ $refund->status }}</span></p>
                            @endforeach
                        </div>
                        <p class="font-semibold text-slate-800">Rp{{ number_format((float) $item->line_total, 0, ',', '.') }}</p>
                    </div>
                @endforeach
            </div>
        </article>
    @empty
        <p class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Belum ada pembelian. <a href="{{ route('shop.index') }}" class="font-semibold text-teal-800">Jelajahi produk</a>.</p>
    @endforelse
</section>
<div class="mt-5">{{ $orders->links() }}</div>
@endsection
