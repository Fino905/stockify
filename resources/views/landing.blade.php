@extends('layouts.guest')

@section('title', \App\Models\Setting::valueFor('app_name', 'Stockify') . ' — Sistem Manajemen Gudang & Inventaris')

@section('content')
@php
    $appSettings = \App\Models\Setting::getAppSettings();
    $applicationName = $appSettings['appName'];
    $applicationLogo = $appSettings['logo'];
@endphp
<div class="relative isolate min-h-screen overflow-hidden bg-gray-50 text-gray-900 font-sans selection:bg-blue-500 selection:text-white">
    {{-- Decorative Background Subtle Gradients --}}
    <div class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] overflow-hidden bg-[linear-gradient(120deg,#eff6ff_0%,#f9fafb_50%,#eef2ff_100%)]">
        <div class="absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-200/40 blur-[90px]"></div>
        <div class="absolute -right-24 top-8 h-[400px] w-[400px] rounded-full bg-indigo-200/40 blur-[100px]"></div>
    </div>

    {{-- Top Navbar matching Dashboard Flowbite --}}
    <header class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="{{ route('home') }}" class="flex items-center gap-2.5 group">
            @if ($applicationLogo)
                @if (str_starts_with($applicationLogo, 'emoji:'))
                    <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-2xl shadow-sm transition-transform duration-200 group-hover:scale-105 select-none shrink-0">
                        {{ str_replace('emoji:', '', $applicationLogo) }}
                    </span>
                @else
                    <img src="{{ $applicationLogo }}" alt="{{ $applicationName }}" class="h-10 w-10 rounded-xl object-contain bg-white p-1 shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0" onerror="this.style.display='none'">
                @endif
            @else
                <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10"/></svg>
                </span>
            @endif
            <div class="flex items-center gap-1.5">
                <span class="self-center text-xl font-bold tracking-tight text-gray-900">
                    {{ $applicationName }}<span class="text-blue-600">.</span>
                </span>
                <span class="bg-blue-100 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded-full hidden sm:inline-block">
                    Gudang
                </span>
            </div>
        </a>

        <nav class="hidden items-center gap-7 text-sm font-medium text-gray-600 md:flex" aria-label="Navigasi landing page">
            <a href="#peran" class="hover:text-blue-600 transition-colors">Ruang Kerja</a>
            <a href="#cara-kerja" class="hover:text-blue-600 transition-colors">Cara Kerja</a>
        </nav>

        <div class="flex items-center gap-3">
            <a href="{{ route('login') }}" class="text-xs sm:text-sm font-semibold text-gray-700 transition hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                Masuk
            </a>
            <a href="{{ route('register') }}" class="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                Daftar Akun
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></svg>
            </a>
        </div>
    </header>

    <main>
        {{-- Hero Section - Split 2-Column: Tidak Full Layar Text --}}
        <section class="mx-auto grid max-w-7xl items-center gap-8 lg:gap-12 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pb-24 lg:pt-12">
            <div class="lg:col-span-6 space-y-5 text-left animate-slide-up-bold">
                <div class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-2xs">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    <span>Sistem Manajemen Pergudangan & Stok</span>
                    <span class="text-blue-300">|</span>
                    <span class="font-bold">Siap Pakai</span>
                </div>

                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.16]">
                    Kendali Presisi Stok, Mutasi & <br class="hidden sm:inline">
                    <span class="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
                        Logistik Gudang.
                    </span>
                </h1>

                <p class="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl">
                    Kelola produk, pantau keluar-masuk barang, stock opname fisik otomatis, dan kolaborasi terpadu antara <strong>Admin</strong>, <strong>Manajer Gudang</strong>, serta <strong>Staff</strong>.
                </p>

                <div class="flex flex-wrap items-center gap-3 pt-1">
                    <a href="{{ route('login') }}" class="btn-press inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition hover:bg-blue-700">
                        Akses Akun Demo
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></svg>
                    </a>
                    <a href="{{ route('register') }}" class="btn-press inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50">
                        Daftar Customer
                    </a>
                </div>

                <div class="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-xs font-medium text-gray-600">
                    <span class="inline-flex items-center gap-1.5"><span class="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span> Stok minimum terpantau</span>
                    <span class="inline-flex items-center gap-1.5"><span class="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-blue-700"><svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span> Akses sesuai 4 peran</span>
                    <span class="inline-flex items-center gap-1.5"><span class="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-indigo-700"><svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span> Laporan & ekspor data</span>
                </div>
            </div>

            {{-- Kolom Kanan: Preview Mockup Dashboard Langsung Terlihat di Layar Awal --}}
            <div class="lg:col-span-6 relative mt-6 lg:mt-0 animate-pop-in-bold">
                {{-- Floating Status Badge Atas (Solid Shadow, Animasi Mengambang Tegas) --}}
                <div class="absolute -top-4 -left-3 sm:-left-5 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 shadow-xl text-xs font-semibold text-gray-800 animate-float">
                    <div class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                    </div>
                    <div>
                        <span class="block text-[11px] text-gray-900 font-bold">Barang Masuk +50 Unit</span>
                        <span class="block text-[9px] text-gray-500 font-normal">Diverifikasi Staff Gudang</span>
                    </div>
                </div>

                {{-- Floating Status Badge Bawah (Solid Shadow) --}}
                <div class="absolute -bottom-4 -right-3 sm:-right-5 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 shadow-xl text-xs font-semibold text-gray-800 animate-float-delayed">
                    <div class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <div>
                        <span class="block text-[11px] text-gray-900 font-bold">Stock Opname Selesai</span>
                        <span class="block text-[9px] text-gray-500 font-normal">100% Selaras dengan Fisik</span>
                    </div>
                </div>

                <div class="card-lift overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                    <div class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                        <div class="flex items-center gap-2.5">
                            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7"/></svg>
                            </span>
                            <span class="text-xs font-bold text-gray-900">{{ $applicationName }} Gudang</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-solid"></span>
                            <span class="text-[11px] font-bold text-gray-600">Sistem Aktif</span>
                        </div>
                    </div>

                    <div class="bg-gradient-to-b from-gray-50/60 to-white p-4 sm:p-5 space-y-4">
                        <div class="grid grid-cols-3 gap-2.5">
                            <div class="card-lift-sm rounded-xl border border-gray-200 bg-white p-3 shadow-2xs">
                                <p class="text-[10px] uppercase font-bold text-gray-500">Katalog</p>
                                <p class="mt-0.5 text-base font-bold text-gray-900">Produk</p>
                                <span class="text-[9px] text-emerald-600 font-bold">Stok Terpantau</span>
                            </div>
                            <div class="card-lift-sm rounded-xl border border-gray-200 bg-white p-3 shadow-2xs">
                                <p class="text-[10px] uppercase font-bold text-gray-500">Penerimaan</p>
                                <p class="mt-0.5 text-base font-bold text-blue-600">Masuk</p>
                                <span class="text-[9px] text-gray-500">Tercatat</span>
                            </div>
                            <div class="card-lift-sm rounded-xl border border-gray-200 bg-white p-3 shadow-2xs">
                                <p class="text-[10px] uppercase font-bold text-gray-500">Pengiriman</p>
                                <p class="mt-0.5 text-base font-bold text-indigo-600">Keluar</p>
                                <span class="text-[9px] text-gray-500">Terkonfirmasi</span>
                            </div>
                        </div>

                        <div class="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs space-y-2">
                            <div class="flex items-center justify-between text-xs">
                                <span class="font-bold text-gray-700">Kapasitas Penyimpanan Gudang</span>
                                <span class="font-bold text-blue-600">82%</span>
                            </div>
                            <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                <div class="bg-blue-600 h-2.5 rounded-full w-[82%] transition-all duration-500"></div>
                            </div>
                        </div>

                        <div class="rounded-xl border border-gray-200 bg-gray-50/80 p-3 flex items-center justify-between text-xs">
                            <div class="flex items-center gap-2">
                                <span class="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">TRX</span>
                                <div>
                                    <span class="font-bold text-gray-800 block text-xs">Transaksi Barang Masuk</span>
                                    <span class="text-[10px] text-gray-500 block">Status: Completed · Diverifikasi Staff</span>
                                </div>
                            </div>
                            <span class="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Selesai</span>
                        </div>
                    </div>

                    <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-2.5 text-[11px] text-gray-500 font-medium">
                        <span>Pratinjau Dashboard Stockify</span>
                        <span class="inline-flex items-center gap-1.5 font-semibold text-emerald-600"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Tersambung ke database</span>
                    </div>
                </div>
            </div>
        </section>

        {{-- Roles Section --}}
        <section id="peran" class="px-4 py-16 sm:px-6 lg:py-20 bg-gray-50">
            <div class="mx-auto max-w-7xl">
                <div class="mx-auto max-w-2xl text-center">
                    <span class="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700">KOLABORASI 4 PERAN</span>
                    <h2 class="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Hak Akses Sesuai Wewenang</h2>
                </div>
                <div class="mt-10 grid gap-4 lg:grid-cols-4">
                    <article class="card-lift rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs cursor-default">
                        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-xs font-extrabold text-blue-800">A</span>
                        <h3 class="mt-3 text-base font-bold text-gray-900">Admin</h3>
                        <p class="mt-1 text-xs text-gray-600 leading-relaxed font-medium">Akses penuh mengelola produk, supplier, pengguna, dan pengaturan aplikasi.</p>
                    </article>
                    <article class="card-lift rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs cursor-default">
                        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-xs font-extrabold text-emerald-800">M</span>
                        <h3 class="mt-3 text-base font-bold text-gray-900">Manajer Gudang</h3>
                        <p class="mt-1 text-xs text-gray-600 leading-relaxed font-medium">Memantau ketersediaan stok, transaksi, peringatan stok menipis, dan stock opname.</p>
                    </article>
                    <article class="card-lift rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs cursor-default">
                        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-xs font-extrabold text-amber-800">S</span>
                        <h3 class="mt-3 text-base font-bold text-gray-900">Staff Gudang</h3>
                        <p class="mt-1 text-xs text-gray-600 leading-relaxed font-medium">Operasional harian pemeriksaan barang masuk dan penyiapan barang keluar.</p>
                    </article>
                    <article class="card-lift rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs cursor-default">
                        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-xs font-extrabold text-indigo-800">C</span>
                        <h3 class="mt-3 text-base font-bold text-gray-900">Customer</h3>
                        <p class="mt-1 text-xs text-gray-600 leading-relaxed font-medium">Katalog belanja produk, pembayaran simulasi, rating/feedback, dan refund.</p>
                    </article>
                </div>
            </div>
        </section>

        {{-- Final CTA Section --}}
        <section id="cara-kerja" class="px-4 pb-16 sm:px-6 lg:pb-20">
            <div class="mx-auto max-w-5xl rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 text-center text-white shadow-xl sm:p-12">
                <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Siap Memulai dengan Stockify?</h2>
                <p class="mx-auto mt-2.5 max-w-xl text-xs sm:text-sm text-blue-100 font-medium">Coba langsung akun demo untuk menguji wewenang Admin, Manajer Gudang, maupun Staff Gudang.</p>
                <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <a href="{{ route('login') }}" class="btn-press inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-blue-700 shadow-md transition hover:bg-gray-100">
                        Masuk ke Ruang Kerja →
                    </a>
                    <a href="{{ route('register') }}" class="btn-press inline-flex items-center gap-2 rounded-lg border border-blue-400 bg-blue-700/60 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-blue-700">
                        Daftar Akun Baru
                    </a>
                </div>
            </div>
        </section>
    </main>

    {{-- Comprehensive Multi-Column Enterprise Footer --}}
    <footer class="bg-gray-900 text-gray-400 pt-16 pb-12 border-t border-gray-800 text-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-2 md:grid-cols-12 gap-8 pb-12 border-b border-gray-800">
                {{-- Column 1: Brand Info & Mission Statement --}}
                <div class="col-span-2 md:col-span-4 space-y-4">
                    <a href="{{ route('home') }}" class="flex items-center gap-2.5 group">
                        @if ($applicationLogo)
                            <img src="{{ \Illuminate\Support\Facades\Storage::disk('public')->url($applicationLogo) }}" alt="" class="h-9 w-9 rounded-lg object-cover shadow-sm">
                        @else
                            <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md transition-transform duration-200 group-hover:scale-105">
                                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10"/></svg>
                            </span>
                        @endif
                        <span class="text-xl font-bold tracking-tight text-white">
                            {{ $applicationName }}<span class="text-blue-500">.</span>
                        </span>
                        <span class="bg-blue-900/60 text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-700/50">
                            Warehouse OS
                        </span>
                    </a>
                    <p class="text-gray-400 text-xs leading-relaxed max-w-sm">
                        Platform manajemen pergudangan terpadu dengan kontrol inventaris presisi, pelacakan atribut fleksibel, audit stock opname fisik otomatis, serta otorisasi multi-role untuk Admin, Manajer Gudang, Staff Lapangan, dan Customer.
                    </p>
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/90 border border-gray-700 text-gray-300 text-[11px] font-medium shadow-xs">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Status Sistem: <strong class="text-emerald-400">Operasional Normal (99.98%)</strong></span>
                    </div>
                    <div class="space-y-1.5 pt-1 text-gray-400 text-xs font-normal">
                        <p class="flex items-center gap-2">
                            <svg class="w-3.5 h-3.5 text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                            <span>Kawasan Industri GIIC Blok AA No. 1, Cikarang Pusat, Jawa Barat</span>
                        </p>
                        <p class="flex items-center gap-2">
                            <svg class="w-3.5 h-3.5 text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                            <span>Email: support@stockify.test · Layanan Hotline: 021-8976500</span>
                        </p>
                    </div>
                </div>

                {{-- Column 2: Navigasi --}}
                <div class="col-span-1 md:col-span-2 space-y-3">
                    <p class="text-xs font-bold uppercase tracking-wider text-white">Navigasi</p>
                    <ul class="space-y-2.5 text-xs font-medium">
                        <li><a href="#peran" class="hover:text-blue-400 transition-colors">Ruang Kerja Multi-Role</a></li>
                        <li><a href="#cara-kerja" class="hover:text-blue-400 transition-colors">Cara Kerja Sistem</a></li>
                        <li><a href="{{ route('kontak.kami') }}" class="hover:text-blue-400 transition-colors">Kontak Gudang</a></li>
                    </ul>
                </div>

                {{-- Column 3: Ruang Kerja Multi-Role --}}
                <div class="col-span-1 md:col-span-2 space-y-3">
                    <p class="text-xs font-bold uppercase tracking-wider text-white">Ruang Kerja</p>
                    <ul class="space-y-2.5 text-xs font-medium">
                        <li><a href="{{ route('login') }}" class="hover:text-blue-400 transition-colors">Portal Administrator</a></li>
                        <li><a href="{{ route('login') }}" class="hover:text-blue-400 transition-colors">Portal Manajer Gudang</a></li>
                        <li><a href="{{ route('login') }}" class="hover:text-blue-400 transition-colors">Portal Staff Lapangan</a></li>
                        <li><a href="{{ route('login') }}" class="hover:text-blue-400 transition-colors">Katalog Toko Customer</a></li>
                    </ul>
                </div>

                {{-- Column 4: Bantuan & Legalitas --}}
                <div class="col-span-1 md:col-span-4 space-y-3">
                    <p class="text-xs font-bold uppercase tracking-wider text-white">Bantuan & Regulasi</p>
                    <ul class="space-y-2.5 text-xs font-medium">
                        <li><a href="{{ route('kontak.kami') }}" class="hover:text-blue-400 transition-colors">Pusat Dukungan Teknis</a></li>
                        <li><span class="hover:text-blue-400 transition-colors cursor-pointer">Kebijakan Privasi Data</span></li>
                        <li><span class="hover:text-blue-400 transition-colors cursor-pointer">Syarat & Ketentuan Layanan</span></li>
                    </ul>
                </div>
                </div>
            </div>

            {{-- Bottom Bar: Hak Cipta & Quick Links --}}
            <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span class="text-gray-400">&copy; 2026 {{ $applicationName }} Inc. Hak Cipta Dilindungi Undang-Undang.</span>
                    <span class="hidden sm:inline text-gray-700">|</span>
                    <span class="text-gray-500">Dibangun dengan Laravel 12</span>
                </div>
                <div class="flex items-center gap-4 text-gray-400 font-medium">
                    <span class="hover:text-white transition-colors cursor-pointer">Privasi</span>
                    <span class="text-gray-700">·</span>
                    <span class="hover:text-white transition-colors cursor-pointer">Ketentuan</span>
                    <span class="text-gray-700">·</span>
                    <span class="hover:text-white transition-colors cursor-pointer">Keamanan</span>
                    <span class="text-gray-700">·</span>
                    <span class="hover:text-white transition-colors cursor-pointer">Status Server</span>
                </div>
            </div>
        </div>
    </footer>
</div>
@endsection
