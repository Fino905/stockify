@extends('layouts.stockify')

@section('title', 'Pengaturan aplikasi - Stockify')

@section('content')
<div class="mx-auto max-w-3xl">
    <p class="text-sm font-medium text-teal-800">Administrasi</p>
    <h1 class="mt-1 text-2xl font-semibold text-slate-900">Pengaturan aplikasi</h1>
    <p class="mt-1 text-sm text-slate-500">Atur identitas yang ditampilkan di halaman Stockify.</p>

    <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        @if (session('status'))
            <p class="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">{{ session('status') }}</p>
        @endif
        @if ($errors->any())
            <p class="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{{ $errors->first() }}</p>
        @endif

        <div class="flex items-center gap-4">
            @if ($logo = $settings->get('logo'))
                <img src="{{ \Illuminate\Support\Facades\Storage::disk('public')->url($logo) }}" alt="Logo {{ $settings->get('app_name', 'Stockify') }}" class="h-16 w-16 rounded-2xl border border-slate-100 object-cover">
            @else
                <span class="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                    <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10"/></svg>
                </span>
            @endif
            <div>
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">Nama aplikasi</p>
                <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">{{ $settings->get('app_name', 'Stockify') }}</h2>
            </div>
        </div>

        <form action="{{ route('settings.update') }}" method="POST" enctype="multipart/form-data" class="mt-7 space-y-5 border-t border-slate-100 pt-6">
            @csrf
            <label class="block text-sm font-medium text-slate-700">
                Nama aplikasi
                <input name="app_name" value="{{ old('app_name', $settings->get('app_name', 'Stockify')) }}" maxlength="80" required class="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
            </label>
            <label class="block text-sm font-medium text-slate-700">
                Informasi singkat aplikasi
                <textarea name="app_info" rows="3" maxlength="1000" class="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm">{{ old('app_info', $settings->get('app_info', 'Kelola produk, pantau stok, dan bantu tim gudang bekerja lebih kompak—semuanya dalam satu tempat yang nyaman dipakai.')) }}</textarea>
            </label>
            <label class="block text-sm font-medium text-slate-700">
                Logo aplikasi
                <input name="logo" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" class="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-teal-800">
                <span class="mt-1 block text-xs font-normal text-slate-500">Format JPG, PNG, atau WebP; maksimal 2 MB.</span>
            </label>
            @if ($settings->get('logo'))
                <label class="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" name="remove_logo" value="1" class="rounded border-slate-300 text-teal-800 focus:ring-teal-700">
                    Hapus logo saat ini dan gunakan logo bawaan
                </label>
            @endif
            <button type="submit" class="rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900">Simpan pengaturan</button>
        </form>

        <div class="mt-8 border-t border-slate-100 pt-6">
            <h3 class="font-semibold text-slate-900">Apa itu Stockify?</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600">Stockify adalah aplikasi manajemen persediaan untuk membantu tim mencatat dan memantau produk, pemasok, pergerakan stok, serta aktivitas gudang dalam satu tempat.</p>
        </div>
        <div class="mt-5">
            <h3 class="font-semibold text-slate-900">Tujuan aplikasi</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600">Stockify membantu menjaga catatan stok tetap akurat dan tersimpan di database, mempermudah tindak lanjut barang masuk maupun keluar, serta menyediakan laporan untuk mendukung keputusan operasional.</p>
        </div>
        <div class="mt-5">
            <h3 class="font-semibold text-slate-900">Ruang kerja berdasarkan peran</h3>
            <ul class="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                <li><span class="font-medium text-slate-800">Admin</span> mengelola data, pengguna, hak akses, dan informasi aplikasi.</li>
                <li><span class="font-medium text-slate-800">Manajer Gudang</span> memantau stok, transaksi, opname, pemasok, dan laporan.</li>
                <li><span class="font-medium text-slate-800">Staff Gudang</span> menangani tugas pemeriksaan dan konfirmasi barang.</li>
            </ul>
        </div>
    </section>
</div>
@endsection
