@extends('layouts.stockify')

@section('title', 'Laporan - Stockify')

@section('content')
<div><p class="text-sm font-medium text-teal-800">Analisis persediaan</p><h1 class="mt-1 text-2xl font-semibold text-slate-900">Laporan</h1><p class="mt-1 text-sm text-slate-500">Pantau posisi stok, transaksi, stock opname, dan aktivitas pengguna.</p></div>
<form method="GET" action="{{ route('reports.index') }}" class="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-4 sm:items-end">
    <label class="text-xs font-medium text-slate-600">Dari tanggal<input type="date" name="from" value="{{ $filters['from'] }}" class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"></label>
    <label class="text-xs font-medium text-slate-600">Sampai tanggal<input type="date" name="to" value="{{ $filters['to'] }}" class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"></label>
    <label class="text-xs font-medium text-slate-600">Kategori<select name="category_id" class="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"><option value="">Semua kategori</option>@foreach ($categories as $category)<option value="{{ $category->id }}" @selected($filters['category_id'] == $category->id)>{{ $category->name }}</option>@endforeach</select></label>
    <button class="rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white">Tampilkan laporan</button>
</form>
<section class="mt-5 grid gap-4 sm:grid-cols-3">
    @foreach ([['Produk', $products->count()], ['Transaksi masuk', $transactions->where('type', 'Masuk')->count()], ['Transaksi keluar', $transactions->where('type', 'Keluar')->count()]] as [$label, $value])
        <article class="rounded-2xl border border-slate-200 bg-white p-5"><p class="text-sm text-slate-500">{{ $label }}</p><p class="mt-2 text-2xl font-semibold text-slate-900">{{ number_format($value) }}</p></article>
    @endforeach
</section>
<section class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="border-b border-slate-100 px-5 py-4"><h2 class="font-semibold text-slate-900">Laporan posisi stok</h2><p class="mt-1 text-sm text-slate-500">Saldo setelah transaksi terkonfirmasi dan penyesuaian stock opname.</p></div>
    <div class="overflow-x-auto"><table class="min-w-full divide-y divide-slate-100 text-left text-sm"><thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-5 py-3">Produk</th><th class="px-5 py-3">Kategori</th><th class="px-5 py-3">Stok saat ini</th><th class="px-5 py-3">Minimum</th><th class="px-5 py-3">Status</th></tr></thead><tbody class="divide-y divide-slate-100">
    @forelse ($products as $product) @php($balance = (int) ($balances[$product->id] ?? 0))
        <tr><td class="px-5 py-3 font-medium text-slate-800">{{ $product->name }} <span class="text-xs font-normal text-slate-400">{{ $product->sku }}</span></td><td class="px-5 py-3 text-slate-600">{{ $product->category->name }}</td><td class="px-5 py-3 font-semibold">{{ number_format($balance) }}</td><td class="px-5 py-3">{{ number_format($product->minimum_stock) }}</td><td class="px-5 py-3"><span class="rounded-full px-2.5 py-1 text-xs font-semibold {{ $balance <= $product->minimum_stock ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800' }}">{{ $balance <= $product->minimum_stock ? 'Stok menipis' : 'Aman' }}</span></td></tr>
    @empty<tr><td colspan="5" class="px-5 py-8 text-center text-slate-500">Tidak ada produk pada filter ini.</td></tr>@endforelse
    </tbody></table></div>
</section>
<section class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="border-b border-slate-100 px-5 py-4"><h2 class="font-semibold text-slate-900">Laporan barang masuk & keluar</h2><p class="mt-1 text-sm text-slate-500">{{ \Carbon\Carbon::parse($filters['from'])->locale('id')->translatedFormat('d M Y') }} – {{ \Carbon\Carbon::parse($filters['to'])->locale('id')->translatedFormat('d M Y') }}</p></div>
    <div class="overflow-x-auto"><table class="min-w-full divide-y divide-slate-100 text-left text-sm"><thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-5 py-3">Tanggal</th><th class="px-5 py-3">Produk</th><th class="px-5 py-3">Kategori</th><th class="px-5 py-3">Supplier</th><th class="px-5 py-3">Jenis</th><th class="px-5 py-3">Jumlah</th><th class="px-5 py-3">Status</th><th class="px-5 py-3">Petugas</th></tr></thead><tbody class="divide-y divide-slate-100">
    @forelse ($transactions as $transaction)<tr><td class="whitespace-nowrap px-5 py-3">{{ $transaction->date->locale('id')->translatedFormat('d M Y') }}</td><td class="px-5 py-3 font-medium">{{ $transaction->product->name }}</td><td class="px-5 py-3">{{ $transaction->product->category->name }}</td><td class="px-5 py-3">{{ $transaction->supplier->name ?? $transaction->product->supplier->name ?? '—' }}</td><td class="px-5 py-3">{{ $transaction->type }}</td><td class="px-5 py-3">{{ number_format($transaction->quantity) }}</td><td class="px-5 py-3">{{ $transaction->status }}</td><td class="px-5 py-3">{{ $transaction->user->name }}</td></tr>
    @empty<tr><td colspan="8" class="px-5 py-8 text-center text-slate-500">Tidak ada transaksi pada periode ini.</td></tr>@endforelse
    </tbody></table></div>
</section>
<section class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="border-b border-slate-100 px-5 py-4"><h2 class="font-semibold text-slate-900">Laporan stock opname</h2><p class="mt-1 text-sm text-slate-500">Penyesuaian stok yang dicatat pada periode terpilih.</p></div>
    <div class="overflow-x-auto"><table class="min-w-full divide-y divide-slate-100 text-left text-sm"><thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-5 py-3">Tanggal</th><th class="px-5 py-3">Produk</th><th class="px-5 py-3">Stok sistem</th><th class="px-5 py-3">Stok fisik</th><th class="px-5 py-3">Selisih</th><th class="px-5 py-3">Petugas</th></tr></thead><tbody class="divide-y divide-slate-100">
    @forelse ($opnames as $opname)<tr><td class="px-5 py-3">{{ $opname->date->locale('id')->translatedFormat('d M Y') }}</td><td class="px-5 py-3 font-medium">{{ $opname->product->name }}</td><td class="px-5 py-3">{{ number_format($opname->system_quantity) }}</td><td class="px-5 py-3">{{ number_format($opname->counted_quantity) }}</td><td class="px-5 py-3 font-semibold {{ $opname->difference < 0 ? 'text-rose-700' : 'text-emerald-700' }}">{{ $opname->difference > 0 ? '+' : '' }}{{ number_format($opname->difference) }}</td><td class="px-5 py-3">{{ $opname->user->name }}</td></tr>
    @empty<tr><td colspan="6" class="px-5 py-8 text-center text-slate-500">Tidak ada stock opname pada periode ini.</td></tr>@endforelse
    </tbody></table></div>
</section>
@if (in_array(auth()->user()->role, ['Admin', 'Manajer Gudang'], true))
    <section class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div class="border-b border-slate-100 px-5 py-4"><h2 class="font-semibold text-slate-900">Aktivitas pengguna</h2></div>
        <div class="divide-y divide-slate-100">
            @forelse ($activities as $activity)<div class="flex flex-wrap justify-between gap-2 px-5 py-3 text-sm"><span class="text-slate-700">{{ $activity->description }} <span class="text-slate-400">· {{ $activity->user->name ?? 'Akun dihapus' }}</span></span><time class="text-xs text-slate-500">{{ $activity->created_at->timezone('Asia/Jakarta')->locale('id')->translatedFormat('d M Y H:i') }}</time></div>
            @empty<p class="px-5 py-8 text-center text-sm text-slate-500">Belum ada aktivitas pada rentang waktu ini.</p>@endforelse
        </div>
    </section>
@endif
@endsection
