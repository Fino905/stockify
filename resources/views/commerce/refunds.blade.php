@extends('layouts.stockify')

@section('title', 'Riwayat refund - Stockify')

@section('content')
<div><p class="text-sm font-medium text-teal-800">Akun customer</p><h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Riwayat refund</h1><p class="mt-1 text-sm text-slate-500">Setiap pengajuan diperiksa Admin. Stok kembali setelah refund disetujui; pengembalian dana dicatat untuk diproses manual.</p></div>
@if (session('status'))<p class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{{ session('status') }}</p>@endif
<section class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="overflow-x-auto"><table class="min-w-full divide-y divide-slate-100 text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-5 py-3">Tanggal</th><th class="px-5 py-3">Pesanan / produk</th><th class="px-5 py-3">Jumlah</th><th class="px-5 py-3">Nilai refund</th><th class="px-5 py-3">Alasan</th><th class="px-5 py-3">Status</th></tr></thead>
        <tbody class="divide-y divide-slate-100">
        @forelse ($refunds as $refund)
            <tr><td class="whitespace-nowrap px-5 py-4 text-slate-500">{{ $refund->created_at->format('d M Y') }}</td><td class="px-5 py-4"><p class="font-medium text-slate-800">{{ $refund->product->name }}</p><p class="text-xs text-slate-500">{{ $refund->order->order_number }}</p></td><td class="px-5 py-4">{{ $refund->quantity }}</td><td class="px-5 py-4">Rp{{ number_format((float) $refund->amount, 0, ',', '.') }}</td><td class="max-w-xs px-5 py-4 text-slate-600">{{ $refund->reason }}</td><td class="px-5 py-4"><span class="rounded-full px-2.5 py-1 text-xs font-semibold {{ $refund->status === 'Disetujui' ? 'bg-emerald-50 text-emerald-800' : ($refund->status === 'Menunggu' ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800') }}">{{ $refund->status }}</span>@if ($refund->reviewer)<p class="mt-1 text-xs text-slate-500">Diperiksa {{ $refund->reviewer->name }}</p>@endif</td></tr>
        @empty
            <tr><td colspan="6" class="px-5 py-8 text-center text-slate-500">Belum ada permintaan refund.</td></tr>
        @endforelse
        </tbody>
    </table></div>
</section>
<div class="mt-5">{{ $refunds->links() }}</div>
@endsection
