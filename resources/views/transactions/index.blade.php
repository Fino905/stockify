@extends('layouts.stockify')

@section('title', 'Stok & Transaksi - Stockify')

@section('content')
<div class="space-y-6">
    {{-- Header Halaman --}}
    <div>
        <p class="text-sm font-medium text-theme-primary">Operasional Gudang</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Stok & Transaksi
        </h1>
        <p class="mt-1 text-sm text-slate-500">
            Catat pergerakan barang, konfirmasi pekerjaan masuk/keluar, dan sesuaikan stok opname.
        </p>
    </div>

    {{-- Notifikasi Status --}}
    @if (session('status') || session('success'))
        <div class="rounded-xl bg-theme-success-light p-4 text-sm font-medium text-theme-success-text border border-theme-success">
            {{ session('status') ?? session('success') }}
        </div>
    @endif

    @if ($errors->any())
        <div class="rounded-xl bg-theme-danger-light p-4 text-sm font-medium text-theme-danger-text border border-theme-danger">
            {{ $errors->first() }}
        </div>
    @endif

    {{-- Form Transaksi Masuk / Keluar & Stock Opname --}}
    <section class="grid gap-6 xl:grid-cols-2">
        {{-- Card Catat Transaksi --}}
        <div class="card-lift-sm cascade-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <h2 class="font-semibold text-slate-900">Catat Barang Masuk / Keluar</h2>
                    <p class="mt-1 text-xs text-slate-500">
                        Transaksi baru dicatat ke database dan menunggu konfirmasi.
                    </p>
                </div>
            </div>

            <form action="{{ route('transactions.store') }}" method="POST" class="mt-5 space-y-4">
                @csrf
                <div>
                    <label class="block text-xs font-semibold text-slate-700">Pilih Produk</label>
                    <select name="product_id" required class="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
                        <option value="">-- Pilih Produk --</option>
                        @if (isset($products))
                            @foreach ($products as $p)
                                <option value="{{ $p->id }}">
                                    {{ $p->name }} (SKU: {{ $p->sku ?? '-' }})
                                </option>
                            @endforeach
                        @endif
                    </select>
                </div>

                <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-700">Jenis Transaksi</label>
                        <select name="type" required class="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
                            <option value="in">Barang Masuk</option>
                            <option value="out">Barang Keluar</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700">Jumlah Unit</label>
                        <input type="number" name="quantity" min="1" required class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Contoh: 10">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700">Tanggal</label>
                        <input type="date" name="date" value="{{ date('Y-m-d') }}" required class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700">Catatan / Keterangan</label>
                    <input type="text" name="notes" class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Contoh: Penerimaan dari supplier utama">
                </div>

                <button type="submit" class="btn-press rounded-xl bg-theme-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-theme-primary-hover">
                    Simpan Transaksi
                </button>
            </form>
        </div>

        {{-- Card Penyesuaian Stock Opname --}}
        <div class="card-lift-sm cascade-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
                <h2 class="font-semibold text-slate-900">Stock Opname Fisik</h2>
                <p class="mt-1 text-xs text-slate-500">
                    Masukkan hasil hitungan fisik gudang untuk penyesuaian otomatis.
                </p>
            </div>

            <form action="{{ route('opnames.store') }}" method="POST" class="mt-5 space-y-4">
                @csrf
                <div>
                    <label class="block text-xs font-semibold text-slate-700">Pilih Produk</label>
                    <select name="product_id" required class="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
                        <option value="">-- Pilih Produk --</option>
                        @if (isset($products))
                            @foreach ($products as $p)
                                <option value="{{ $p->id }}">
                                    {{ $p->name }}
                                </option>
                            @endforeach
                        @endif
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700">Stok Fisik Dihitung</label>
                    <input type="number" name="physical_stock" min="0" required class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Contoh: 150">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700">Catatan Opname</label>
                    <textarea name="notes" rows="2" class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Keterangan kondisi fisik barang"></textarea>
                </div>

                <button type="submit" class="btn-press rounded-xl border border-theme-primary px-5 py-2.5 text-sm font-semibold text-theme-primary-text transition hover:bg-theme-primary-light">
                    Simpan Stock Opname
                </button>
            </form>
        </div>
    </section>

    {{-- Tabel Riwayat Transaksi --}}
    <section class="card-lift-sm cascade-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-6 py-4">
            <h2 class="font-semibold text-slate-900">Riwayat Mutasi & Transaksi Stok</h2>
            <p class="mt-0.5 text-xs text-slate-500">Daftar pergerakan barang yang tercatat di sistem Stockify.</p>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
                <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                        <th class="px-6 py-3 font-medium">Tanggal</th>
                        <th class="px-6 py-3 font-medium">Produk</th>
                        <th class="px-6 py-3 font-medium">Jenis</th>
                        <th class="px-6 py-3 font-medium">Jumlah</th>
                        <th class="px-6 py-3 font-medium">Status</th>
                        <th class="px-6 py-3 font-medium">Petugas</th>
                        <th class="px-6 py-3 font-medium text-right">Tindakan</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @if (isset($transactions) && count($transactions) > 0)
                        @foreach ($transactions as $t)
                            <tr class="hover:bg-slate-50/50">
                                <td class="whitespace-nowrap px-6 py-4">
                                    {{ is_string($t->date) ? date('d M Y', strtotime($t->date)) : ($t->date?->format('d M Y') ?? '-') }}
                                </td>
                                <td class="px-6 py-4">
                                    <div class="font-semibold text-slate-800">{{ $t->product?->name ?? 'Produk' }}</div>
                                    @if ($t->notes)
                                        <div class="text-xs text-slate-400">{{ $t->notes }}</div>
                                    @endif
                                </td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold {{ in_array(strtolower($t->type), ['in', 'masuk']) ? 'bg-theme-primary-light text-theme-primary' : 'bg-slate-100 text-slate-700' }}">
                                        {{ in_array(strtolower($t->type), ['in', 'masuk']) ? 'Masuk' : 'Keluar' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 font-bold text-slate-900">
                                    {{ number_format((int) $t->quantity) }} unit
                                </td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {{ in_array(strtolower($t->status), ['completed', 'diterima', 'dikeluarkan']) ? 'bg-theme-success-light text-theme-success-text' : (strtolower($t->status) === 'pending' ? 'bg-theme-warning-light text-theme-warning-text' : 'bg-theme-danger-light text-theme-danger-text') }}">
                                        @if (strtolower($t->status) === 'pending')
                                            <span class="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 live-beacon-amber"></span>
                                        @endif
                                        {{ ucfirst($t->status) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-xs">
                                    {{ $t->user?->name ?? 'Staff Gudang' }}
                                </td>
                                <td class="whitespace-nowrap px-6 py-4 text-right">
                                    @if (strtolower($t->status) === 'pending')
                                        <div class="flex items-center justify-end gap-2">
                                            <form action="{{ route('transactions.confirm', $t->id) }}" method="POST">
                                                @csrf
                                                @method('PATCH')
                                                <button type="submit" class="btn-press rounded-lg bg-theme-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-theme-primary-hover">
                                                    Konfirmasi
                                                </button>
                                            </form>
                                            <form action="{{ route('transactions.reject', $t->id) }}" method="POST">
                                                @csrf
                                                @method('PATCH')
                                                <button type="submit" class="btn-press rounded-lg border border border-theme-danger px-3 py-1.5 text-xs font-semibold text-theme-danger hover:bg-theme-danger-light">
                                                    Tolak
                                                </button>
                                            </form>
                                        </div>
                                    @else
                                        <span class="text-xs text-slate-400">Selesai</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    @else
                        <tr>
                            <td colspan="7" class="px-6 py-12 text-center text-sm text-slate-500">
                                Belum ada riwayat transaksi stok.
                            </td>
                        </tr>
                    @endif
                </tbody>
            </table>
        </div>
    </section>
</div>
@endsection
