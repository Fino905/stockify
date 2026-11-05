@extends('layouts.stockify')

@section('title', 'Kelola refund - Stockify')

@section('content')
<div><p class="text-sm font-medium text-teal-800">Penjualan</p><h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Permintaan refund</h1><p class="mt-1 text-sm text-slate-500">Persetujuan menambah kembali stok. Pengembalian uang dilakukan manual di luar aplikasi dan tercatat di sini.</p></div>
@if (session('status'))<p class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{{ session('status') }}</p>@endif
@if ($errors->any())<p class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{{ $errors->first() }}</p>@endif
<section class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="overflow-x-auto"><table class="min-w-full divide-y divide-slate-100 text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-5 py-3">Customer / pesanan</th><th class="px-5 py-3">Produk</th><th class="px-5 py-3">Jumlah / nilai</th><th class="px-5 py-3">Alasan</th><th class="px-5 py-3">Status</th><th class="px-5 py-3">Tindakan</th></tr></thead>
        <tbody class="divide-y divide-slate-100">
        @forelse ($refunds as $refund)
            <tr><td class="px-5 py-4"><p class="font-medium text-slate-800">{{ $refund->customer->name }}</p><p class="text-xs text-slate-500">{{ $refund->order->order_number }}</p><p class="text-xs text-slate-500">{{ $refund->created_at->format('d M Y') }}</p></td><td class="px-5 py-4">{{ $refund->product->name }}</td><td class="whitespace-nowrap px-5 py-4">{{ $refund->quantity }} unit · Rp{{ number_format((float) $refund->amount, 0, ',', '.') }}</td><td class="max-w-xs px-5 py-4 text-slate-600">{{ $refund->reason }}</td><td class="px-5 py-4"><span class="rounded-full px-2.5 py-1 text-xs font-semibold {{ $refund->status === 'Disetujui' ? 'bg-emerald-50 text-emerald-800' : ($refund->status === 'Menunggu' ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800') }}">{{ $refund->status }}</span>@if ($refund->reviewer)<p class="mt-1 text-xs text-slate-500">{{ $refund->reviewer->name }}</p>@endif</td><td class="whitespace-nowrap px-5 py-4">@if ($refund->status === 'Menunggu')<form action="{{ route('refunds.review', [$refund, 'approve']) }}" method="POST" class="inline" onsubmit="return confirm('Setujui refund dan kembalikan stok?')">@csrf<button class="font-semibold text-teal-800">Setujui</button></form><form action="{{ route('refunds.review', [$refund, 'reject']) }}" method="POST" class="ml-3 inline">@csrf<button class="font-semibold text-rose-700">Tolak</button></form>@else—@endif</td></tr>
        @empty
            <tr><td colspan="6" class="px-5 py-8 text-center text-slate-500">Belum ada permintaan refund.</td></tr>
        @endforelse
        </tbody>
    </table></div>
</section>
<div class="mt-5">{{ $refunds->links() }}</div>
@endsection
