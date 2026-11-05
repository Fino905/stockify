@extends('layouts.guest')

@php
    $appSettings = $appSettings ?? \App\Models\Setting::getAppSettings();
    $appName = $appSettings['appName'] ?? 'Stockify';
    $appLogo = $appSettings['logo'] ?? null;
    $warehouseName = $appSettings['warehouseName'] ?? 'Gudang Pusat Logistik';
@endphp

@section('title', 'Daftar Akun Customer - ' . $appName)

@section('content')
<div class="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">

    {{-- ================= DESKTOP LEFT PANEL (>= lg): Showcase Hero & Customer Features ================= --}}
    <div class="hidden lg:flex lg:w-1/2 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden select-none border-r border-slate-800/80">
        
        {{-- Soft Ambient Lighting (Tenang & Tidak Menyala Terlalu Neon) --}}
        <div class="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl z-0"></div>
        <div class="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl z-0"></div>
        <div class="pointer-events-none absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-sky-500/5 blur-3xl z-0"></div>

        {{-- Subtle Grid Pattern Overlay --}}
        <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] z-0"></div>

        {{-- Top Brand Header --}}
        <div class="relative z-10">
            <a href="{{ route('home') }}" class="inline-flex items-center gap-3 group">
                <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 transition-transform duration-200 group-hover:scale-105 overflow-hidden shrink-0">
                    @if ($appLogo)
                        @if (str_starts_with($appLogo, 'emoji:'))
                            <span class="text-xl leading-none select-none">{{ str_replace('emoji:', '', $appLogo) }}</span>
                        @else
                            <img src="{{ $appLogo }}" alt="{{ $appName }}" class="w-full h-full object-contain p-1" onerror="this.style.display='none'">
                        @endif
                    @else
                        <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m7.5 4.27 9 5.15" />
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                            <path d="m3.3 7 8.7 5 8.7-5" />
                            <path d="M12 22V12" />
                        </svg>
                    @endif
                </div>
                <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                        <span class="font-black text-xl text-white tracking-tight dynamic-app-name">{{ $appName }}<span class="text-blue-400">.</span></span>
                        <span class="text-[10px] font-bold text-blue-300 bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 rounded-full">Customer Portal</span>
                    </div>
                    <span class="text-[11px] text-slate-400 font-medium truncate max-w-[260px]">{{ $warehouseName }}</span>
                </div>
            </a>
        </div>

        {{-- Center Content: Tagline, Value Proposition & Customer Features --}}
        <div class="relative z-10 max-w-lg my-auto py-8">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-5 backdrop-blur-md">
                <span class="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Akses Eksklusif Pelanggan &amp; Mitra Toko</span>
            </div>

            <h1 class="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight">
                Katalog Inventaris &amp; Pemesanan Belanja
                <span class="block bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
                    Langsung dari Gudang.
                </span>
            </h1>

            <p class="mt-4 text-slate-300 text-sm leading-relaxed">
                Daftarkan akun pelanggan Anda untuk memantau ketersediaan stok fisik barang secara akurat, memesan produk gudang secara mandiri, dan melacak riwayat transaksi dengan transparan.
            </p>

        </div>

        {{-- Desktop Left Footer --}}
        <div class="relative z-10 text-xs text-slate-400 font-medium flex items-center justify-between pt-5 border-t border-slate-800/80">
            <span>&copy; {{ date('Y') }} {{ $appName }} Warehouse OS</span>
            <span class="inline-flex items-center gap-2 text-emerald-400 font-semibold">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                Layanan Pelanggan Aktif
            </span>
        </div>
    </div>

    {{-- ================= FORM PANEL (KANAN): Full-Screen Centered & Responsive ================= --}}
    <div class="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-5 sm:p-8 lg:p-12 xl:p-14 relative bg-slate-50">
        
        {{-- Subtle Soft Background Tint (Bukan Neon Keras) --}}
        <div class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.06),rgba(255,255,255,0))] pointer-events-none"></div>
        <div class="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

        {{-- Top Navigation: Link Beranda & Brand Mobile --}}
        <div class="flex items-center justify-between w-full mb-4">
            {{-- Mobile Brand Logo (< lg) --}}
            <a href="{{ route('home') }}" class="flex lg:hidden items-center gap-2 group">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs overflow-hidden shrink-0">
                    @if ($appLogo)
                        @if (str_starts_with($appLogo, 'emoji:'))
                            <span class="text-lg leading-none select-none">{{ str_replace('emoji:', '', $appLogo) }}</span>
                        @else
                            <img src="{{ $appLogo }}" alt="{{ $appName }}" class="w-full h-full object-contain p-0.5" onerror="this.style.display='none'">
                        @endif
                    @else
                        <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m7.5 4.27 9 5.15" />
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                            <path d="m3.3 7 8.7 5 8.7-5" />
                            <path d="M12 22V12" />
                        </svg>
                    @endif
                </div>
                <div class="flex flex-col">
                    <span class="font-extrabold text-base text-slate-900 tracking-tight dynamic-app-name">{{ $appName }}</span>
                    <span class="text-[10px] text-slate-500 font-medium">Customer Portal</span>
                </div>
            </a>

            {{-- Back to Landing Page Link --}}
            <a
                href="{{ route('home') }}"
                class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-100 text-slate-600 hover:text-blue-600 text-xs font-semibold shadow-xs transition-all ml-auto group"
                title="Kembali ke Beranda">
                <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>Beranda</span>
            </a>
        </div>

        {{-- Form Container Tengah --}}
        <div class="max-w-md w-full mx-auto my-auto py-2">

            {{-- Error Alerts --}}
            @if (isset($errors) && $errors->any())
                <div class="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2 shadow-xs">
                    <svg class="w-4 h-4 text-rose-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" x2="12" y1="8" y2="12"/>
                        <line x1="12" x2="12.01" y1="16" y2="16"/>
                    </svg>
                    <span>{{ $errors->first() }}</span>
                </div>
            @endif

            {{-- Main Form Card (Sama Persis Formatnya dengan Login Page) --}}
            <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
                
                {{-- Card Header --}}
                <div class="mb-5">
                    <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2.5 border border-blue-200/80">
                        <svg class="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>Registrasi Akun Baru</span>
                    </div>
                    <h2 class="text-2xl font-black text-slate-900 tracking-tight">
                        Daftar Akun Customer
                    </h2>
                    <p class="text-xs text-slate-500 mt-1">
                        Buat akun belanja untuk mengecek stok gudang dan memesan langsung.
                    </p>
                </div>

                {{-- Customer Role Highlight (Clean Slate Box, No Neon) --}}
                <div class="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                <path d="M3 6h18" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                        </div>
                        <span class="font-medium text-slate-700">Peran Akun:</span>
                    </div>
                    <span class="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        Customer (Pembeli)
                    </span>
                </div>

                {{-- Formulir Registrasi --}}
                <form action="/register" method="POST" class="space-y-4">
                    @csrf

                    {{-- Input Nama Lengkap --}}
                    <div>
                        <label for="name" class="block text-xs font-bold text-slate-700 mb-1.5">
                            Nama Lengkap
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                required
                                value="{{ old('name') }}"
                                autofocus
                                tabindex="1"
                                autocomplete="name"
                                placeholder="Contoh: Ahmad Pratama"
                                class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                            />
                        </div>
                    </div>

                    {{-- Input Email --}}
                    <div>
                        <label for="email" class="block text-xs font-bold text-slate-700 mb-1.5">
                            Alamat Email
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </div>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                value="{{ old('email') }}"
                                tabindex="2"
                                autocomplete="email"
                                placeholder="customer@stockify.test"
                                class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                            />
                        </div>
                    </div>

                    {{-- Input Password --}}
                    <div>
                        <label for="password" class="block text-xs font-bold text-slate-700 mb-1.5">
                            Kata Sandi
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                required
                                tabindex="3"
                                autocomplete="new-password"
                                placeholder="Minimal 8 karakter"
                                class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                            />
                            <button
                                type="button"
                                onclick="togglePasswordVisibility('password', this)"
                                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                                tabindex="-1"
                                aria-label="Lihat kata sandi"
                            >
                                <svg class="w-4 h-4 eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {{-- Input Konfirmasi Password --}}
                    <div>
                        <label for="password_confirmation" class="block text-xs font-bold text-slate-700 mb-1.5">
                            Konfirmasi Kata Sandi
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="m9 12 2 2 4-4" />
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                </svg>
                            </div>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                required
                                tabindex="4"
                                autocomplete="new-password"
                                placeholder="Ulangi kata sandi"
                                class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                            />
                            <button
                                type="button"
                                onclick="togglePasswordVisibility('password_confirmation', this)"
                                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                                tabindex="-1"
                                aria-label="Lihat konfirmasi kata sandi"
                            >
                                <svg class="w-4 h-4 eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {{-- Tombol Submit --}}
                    <div class="pt-2">
                        <button
                            type="submit"
                            tabindex="5"
                            class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                        >
                            <span>Daftar Akun Customer</span>
                            <svg class="w-4 h-4 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14m-7-7 7 7-7 7"/>
                            </svg>
                        </button>
                    </div>
                </form>

                {{-- Link Kembali ke Login --}}
                <div class="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
                    Sudah memiliki akun?
                    <a
                        href="{{ route('login') }}"
                        class="text-blue-600 hover:text-blue-700 font-bold ml-1 hover:underline"
                    >
                        Masuk ke Sistem &rarr;
                    </a>
                </div>

            </div>
        </div>

        {{-- Mobile & Bottom Footer --}}
        <div class="text-center text-xs text-slate-400 pt-4">
            &copy; {{ date('Y') }} {{ $appName }} Warehouse OS. Sistem Manajemen Inventaris Terpadu.
        </div>
    </div>
</div>

<script>
    function togglePasswordVisibility(id, btn) {
        const input = document.getElementById(id);
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.innerHTML = isPassword
            ? `<svg class="w-4 h-4 eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`
            : `<svg class="w-4 h-4 eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
    }

    document.addEventListener('DOMContentLoaded', function() {
        try {
            const savedSettings = localStorage.getItem('stockify_app_settings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                if (parsed.appName) {
                    document.querySelectorAll('.dynamic-app-name').forEach(el => {
                        el.textContent = parsed.appName;
                    });
                }
            }
        } catch (e) {}
    });
</script>
@endsection