@extends('layouts.stockify')

@section('title', 'Dashboard - Stockify')

@section('content')
<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
        <p class="text-sm font-medium text-theme-primary">{{ now('Asia/Jakarta')->locale('id')->translatedFormat('l, d F Y') }}</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
        <p class="mt-1 text-sm text-slate-500">Ringkasan aktivitas persediaan untuk {{ auth()->user()->role }}.</p>
    </div>
    <span class="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
        <span class="h-2 w-2 rounded-full bg-emerald-500 live-beacon"></span>
        Data tersambung ke database
    </span>
</div>
@if (session('status'))<p class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{{ session('status') }}</p>@endif
@if ($errors->any())<p class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{{ $errors->first() }}</p>@endif

<section class="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan stok">
    @php
        $cards = match ($role) {
            'Admin' => [
                ['label' => 'Jumlah produk', 'value' => number_format($productsCount), 'note' => 'Produk terdaftar', 'tone' => 'teal'],
                ['label' => 'Barang masuk hari ini', 'value' => number_format($incomingToday), 'note' => 'Transaksi yang sudah diterima', 'tone' => 'blue'],
                ['label' => 'Barang keluar hari ini', 'value' => number_format($outgoingToday), 'note' => 'Transaksi yang sudah dikeluarkan', 'tone' => 'slate'],
            ],
            'Manajer Gudang' => [
                ['label' => 'Stok menipis', 'value' => number_format($lowStockCount), 'note' => 'Sama dengan atau di bawah minimum', 'tone' => 'amber'],
                ['label' => 'Barang masuk hari ini', 'value' => number_format($incomingToday), 'note' => 'Transaksi yang sudah diterima', 'tone' => 'blue'],
                ['label' => 'Barang keluar hari ini', 'value' => number_format($outgoingToday), 'note' => 'Transaksi yang sudah dikeluarkan', 'tone' => 'slate'],
            ],
            default => [],
        };
    @endphp
    @if ($cards !== [])
        <div class="col-span-full grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            @foreach ($cards as $card)
                <article class="card-lift cascade-{{ $loop->iteration }} rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/70 cursor-default">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-sm font-medium text-slate-500">{{ $card['label'] }}</p>
                            <p class="mt-3 text-3xl font-bold tracking-tight text-slate-900 animate-num-pop">{{ $card['value'] }}</p>
                            <p class="mt-1 text-xs text-slate-500 font-medium">{{ $card['note'] }}</p>
                        </div>
                        <span class="flex h-10 w-10 items-center justify-center rounded-xl {{ $card['tone'] === 'amber' ? 'bg-amber-50 text-amber-700' : ($card['tone'] === 'blue' ? 'bg-sky-50 text-sky-700' : ($card['tone'] === 'teal' ? 'bg-teal-50 text-theme-primary' : 'bg-slate-100 text-slate-700')) }}">
                            @if ($card['label'] === 'Jumlah produk')
                                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10"/></svg>
                            @elseif ($card['label'] === 'Stok menipis')
                                <svg class="h-5 w-5 animate-heartbeat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v5m0 4h.01M10.3 3.9 1.8 18.6A1.6 1.6 0 0 0 3.2 21h17.6a1.6 1.6 0 0 0 1.4-2.4L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z"/></svg>
                            @else
                                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h13m0 0-3-3m3 3-3 3M17 17H4m0 0 3-3m-3 3 3 3"/></svg>
                            @endif
                        </span>
                    </div>
                </article>
            @endforeach
        </div>
    @endif
</section>

@if ($role === 'Staff Gudang')
<section class="card-lift mt-5 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
    <div class="flex items-center justify-between gap-3 border-b border-amber-100 bg-amber-50/70 px-5 py-4">
        <div><h2 class="font-bold text-slate-900">Tugas gudang yang perlu diselesaikan</h2><p class="mt-1 text-sm text-slate-600">Periksa barang masuk atau siapkan barang keluar sebelum konfirmasi.</p></div>
        <a href="{{ route('transactions.index') }}" class="btn-press shrink-0 text-sm font-semibold text-theme-primary hover:opacity-90">Semua tugas</a>
    </div>
    <div class="divide-y divide-slate-100">
        @forelse ($pendingTransactions as $transaction)
            <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                <div><p class="font-bold text-slate-800">{{ $transaction->type === 'Masuk' ? 'Periksa penerimaan' : 'Siapkan pengeluaran' }} · {{ $transaction->product->name }}</p><p class="mt-1 text-xs text-slate-500">{{ number_format($transaction->quantity) }} unit · {{ $transaction->date->format('d M Y') }} · {{ $transaction->notes ?: 'Tanpa catatan' }}</p></div>
                @if (! $transaction->staff_action)
                    <form action="{{ route('transactions.prepare', $transaction) }}" method="POST">@csrf<button class="btn-press rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 shadow-2xs">{{ $transaction->type === 'Masuk' ? 'Tandai diperiksa' : 'Tandai disiapkan' }}</button></form>
                @else
                    <form action="{{ route('transactions.confirm', $transaction) }}" method="POST" onsubmit="return confirm('Konfirmasi tugas stok ini?')">@csrf<button class="btn-press rounded-lg bg-theme-primary px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-theme-primary-hover">Konfirmasi {{ $transaction->type === 'Masuk' ? 'barang masuk' : 'barang keluar' }}</button></form>
                @endif
            </div>
        @empty
            <p class="px-5 py-8 text-center text-sm text-slate-500">Tidak ada tugas stok yang menunggu konfirmasi.</p>
        @endforelse
    </div>
</section>
@endif

@if ($role !== 'Staff Gudang')
<section class="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
    @if ($role === 'Admin')
    <article class="card-lift rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/70 sm:p-6">
        <div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
            <div>
                <h2 class="font-bold text-slate-900">Grafik stok barang</h2>
                <p class="mt-1 text-sm text-slate-500">Jumlah barang masuk dan keluar · {{ $chartPeriod }}</p>
            </div>
            <div class="flex gap-4 text-xs text-slate-600 font-medium">
                <span class="inline-flex items-center gap-1.5"><i class="h-2 w-2 rounded-full bg-theme-primary"></i>Masuk</span>
                <span class="inline-flex items-center gap-1.5"><i class="h-2 w-2 rounded-full bg-slate-400"></i>Keluar</span>
            </div>
        </div>
        <div id="stock-chart" class="mt-4 min-h-[280px]" data-labels="{{ json_encode($chartLabels) }}" data-incoming="{{ json_encode($incomingData) }}" data-outgoing="{{ json_encode($outgoingData) }}" aria-label="Grafik barang masuk dan keluar"></div>
    </article>
    @endif

    <article class="card-lift rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/70 sm:p-6">
        <div class="flex items-start justify-between">
            <div><h2 class="font-bold text-slate-900">Perlu diperhatikan</h2><p class="mt-1 text-sm text-slate-500">Stok berada di batas minimum.</p></div>
            <span class="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 shadow-2xs">{{ $lowStockCount }}</span>
        </div>
        <div class="mt-4 divide-y divide-slate-100">
            @forelse ($lowStockProducts as $product)
                <div class="flex items-center justify-between gap-3 py-3 hover:translate-x-1 transition-transform">
                    <div class="min-w-0"><p class="truncate text-sm font-bold text-slate-800">{{ $product->name }}</p><p class="mt-0.5 text-xs text-slate-500">{{ $product->category->name ?? 'Tanpa kategori' }}</p></div>
                    <span class="shrink-0 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">{{ (int) ($stockBalances[$product->id] ?? 0) }} unit</span>
                </div>
            @empty
                <p class="py-7 text-center text-sm text-slate-500">Belum ada produk yang perlu diperhatikan.</p>
            @endforelse
        </div>
        @if ($role !== 'Staff Gudang')
            <a href="{{ route('products.index') }}" class="btn-press mt-3 inline-flex text-sm font-bold text-theme-primary hover:opacity-90">Lihat semua produk <span class="ml-1" aria-hidden="true">→</span></a>
        @endif
    </article>
</section>
@endif

@if ($role === 'Admin')
<section class="card-lift mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 class="font-bold text-slate-900">Pengguna terbaru</h2><p class="mt-1 text-sm text-slate-500">Akun yang baru dibuat atau didaftarkan.</p></div><a href="{{ route('users.index') }}" class="btn-press text-sm font-semibold text-theme-primary">Kelola pengguna</a></div>
    <div class="divide-y divide-slate-100 sm:grid sm:grid-cols-2 sm:divide-y-0">
        @foreach ($recentUsers as $user)
            <div class="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors"><div class="min-w-0"><p class="truncate text-sm font-medium text-slate-800">{{ $user->name }}</p><p class="truncate text-xs text-slate-500">{{ $user->email }}</p></div><div class="text-right"><p class="text-xs font-bold text-theme-primary">{{ $user->role }}</p><p class="mt-1 text-xs text-slate-400">{{ $user->created_at->format('d M Y') }}</p></div></div>
        @endforeach
    </div>
</section>

<section class="card-lift mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div><h2 class="font-bold text-slate-900">Aktivitas pengguna terbaru</h2><p class="mt-1 text-sm text-slate-500">Perubahan penting yang tercatat di database.</p></div>
        <a href="{{ route('reports.index') }}" class="btn-press shrink-0 text-sm font-semibold text-theme-primary hover:opacity-90">Lihat laporan</a>
    </div>
    <div class="divide-y divide-slate-100">
        @forelse ($recentActivities as $activity)
            <div class="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5">
                <div><p class="text-sm font-medium text-slate-800">{{ $activity->description }}</p><p class="mt-1 text-xs text-slate-500">{{ $activity->user->name ?? 'Akun dihapus' }} · {{ str_replace('.', ' · ', $activity->action) }}</p></div>
                <time class="whitespace-nowrap text-xs text-slate-500">{{ $activity->created_at->timezone('Asia/Jakarta')->locale('id')->translatedFormat('d M Y, H:i') }}</time>
            </div>
        @empty
            <p class="px-5 py-8 text-center text-sm text-slate-500">Belum ada aktivitas pengguna yang tercatat.</p>
        @endforelse
    </div>
</section>
@endif

@if ($role !== 'Staff Gudang')
<section class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100/70">
    <div class="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div><h2 class="font-semibold text-slate-900">Aktivitas transaksi terbaru</h2><p class="mt-1 text-sm text-slate-500">Perubahan persediaan terakhir yang tercatat.</p></div>
        <a href="{{ route('transactions.index') }}" class="shrink-0 text-sm font-semibold text-theme-primary hover:opacity-90">Semua transaksi</a>
    </div>
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th class="px-5 py-3 font-medium sm:px-6">Produk</th><th class="px-5 py-3 font-medium">Jenis</th><th class="px-5 py-3 font-medium">Jumlah</th><th class="px-5 py-3 font-medium">Status</th><th class="px-5 py-3 font-medium">Tanggal</th></tr></thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($recentTransactions as $transaction)
                    <tr class="hover:bg-slate-50/70">
                        <td class="whitespace-nowrap px-5 py-3.5 font-medium text-slate-800 sm:px-6">{{ $transaction->product->name ?? 'Produk dihapus' }}<span class="ml-2 text-xs font-normal text-slate-400">{{ $transaction->user->name ?? '—' }}</span></td>
                        <td class="px-5 py-3.5 text-slate-600">{{ $transaction->type }}</td>
                        <td class="px-5 py-3.5 font-medium text-slate-800">{{ number_format($transaction->quantity) }} unit</td>
                        <td class="px-5 py-3.5"><span class="rounded-full px-2.5 py-1 text-xs font-medium {{ $transaction->status === 'Diterima' || $transaction->status === 'Dikeluarkan' ? 'bg-emerald-50 text-emerald-800' : ($transaction->status === 'Pending' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600') }}">{{ $transaction->status }}</span></td>
                        <td class="whitespace-nowrap px-5 py-3.5 text-slate-500">{{ $transaction->date->locale('id')->translatedFormat('d M Y') }}</td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="px-5 py-10 text-center text-slate-500">Belum ada transaksi stok. Data pergerakan akan tampil setelah transaksi dicatat.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</section>
@endif
@endsection
