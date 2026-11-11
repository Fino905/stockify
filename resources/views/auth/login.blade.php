@extends('layouts.guest')

@php
    $appSettings = $appSettings ?? \App\Models\Setting::getAppSettings();
    $appName = $appSettings['appName'] ?? 'Stockify';
    $appLogo = $appSettings['logo'] ?? null;
    $warehouseName = $appSettings['warehouseName'] ?? 'Gudang Pusat Logistik';
@endphp

@section('title', 'Masuk ke Sistem - ' . $appName)

@section('content')
<div class="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">

    {{-- ================= DESKTOP LEFT PANEL (>= lg): Showcase Hero & Command Center ================= --}}
    <div class="hidden lg:flex lg:w-1/2 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden select-none border-r border-slate-800/80">
        
        {{-- Ambient Glow Lighting --}}
        <div class="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl z-0"></div>
        <div class="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl z-0"></div>
        <div class="pointer-events-none absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl z-0"></div>

        {{-- Subtle Grid Pattern Overlay --}}
        <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] z-0"></div>

        {{-- Top Brand Header --}}
        <div class="relative z-10">
            <a href="{{ route('home') }}" class="inline-flex items-center gap-3 group">
                <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/25 transition-transform duration-200 group-hover:scale-105 overflow-hidden shrink-0">
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
                        <span class="text-[10px] font-bold text-blue-300 bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 rounded-full">Warehouse OS</span>
                    </div>
                    <span class="text-[11px] text-slate-400 font-medium truncate max-w-[260px]">{{ $warehouseName }}</span>
                </div>
            </a>
        </div>

        {{-- Center Content: Tagline, Value Proposition & Metric Cards --}}
        <div class="relative z-10 max-w-lg my-auto py-8">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-5 backdrop-blur-md">
                <span class="flex h-2 w-2 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                </span>
                <span>Didukung Machine Learning Vision v2.0</span>
                <span class="text-blue-400/60">•</span>
                <span id="roleBadgeDesktop" class="text-white font-bold">Admin Full Akses</span>
            </div>

            <h1 class="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight">
                Kendali Presisi Gudang &amp; Mutasi Logistik
                <span class="block bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
                    Berbasis Cerdas Terpadu.
                </span>
            </h1>

            <p class="mt-4 text-slate-300 text-sm leading-relaxed">
                Kelola master produk, pantau barang masuk &amp; keluar secara real-time, laksanakan audit Stock Opname tanpa selisih, dan otorisasi terisolasi 3-Role (Admin, Manajer, Staff).
            </p>

        </div>

        {{-- Desktop Left Footer --}}
        <div class="relative z-10 text-xs text-slate-400 font-medium flex items-center justify-between pt-5 border-t border-slate-800/80">
            <span>&copy; {{ date('Y') }} {{ $appName }} Warehouse OS</span>
            <span class="inline-flex items-center gap-2 text-emerald-400 font-semibold">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Server Terhubung Real-Time
            </span>
        </div>
    </div>

    {{-- ================= FORM PANEL (KANAN): Full-Screen Centered & Responsive ================= --}}
    <div class="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-5 sm:p-8 lg:p-12 xl:p-14 relative bg-slate-50">
        
        {{-- Background Ambient Glow & Grid (Identik dengan welcome.tsx) --}}
        <div class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.14),rgba(255,255,255,0))] pointer-events-none"></div>
        <div class="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none"></div>

        {{-- Top Navigation: Link Beranda & Brand Mobile --}}
        <div class="flex items-center justify-between w-full mb-4">
            {{-- Mobile Brand Logo (< lg) --}}
            <a href="{{ route('home') }}" class="flex lg:hidden items-center gap-2 group">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 overflow-hidden shrink-0">
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
                    <span class="text-[10px] text-slate-500 font-medium">Warehouse OS</span>
                </div>
            </a>

            {{-- Back to Landing Page Link --}}
            <a
                href="{{ route('home') }}"
                class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-100 text-slate-600 hover:text-blue-600 text-xs font-semibold shadow-2xs transition-all ml-auto group"
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

            {{-- Status Notification --}}
            @if (session('status'))
            <div class="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 shadow-2xs">
                <svg class="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>{{ session('status') }}</span>
            </div>
            @endif

            {{-- Error Notification --}}
            @if (isset($errors) && $errors->any())
            <div class="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2 shadow-2xs">
                <svg class="w-4 h-4 text-rose-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <span>{{ $errors->first() }}</span>
            </div>
            @endif

            {{-- Main Form Card (Glassmorphism & Card Border Sesuai Landing Page) --}}
            <div class="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-xl shadow-blue-500/5 p-6 sm:p-8">
                
                {{-- Card Header --}}
                <div class="mb-5">
                    <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2.5 border border-blue-200/80">
                        <svg class="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>Portal Autentikasi Pengguna</span>
                    </div>
                    <h2 class="text-2xl font-black text-slate-900 tracking-tight">
                        Masuk ke <span class="dynamic-app-name">{{ $appName }}</span>
                    </h2>
                    <p class="text-xs text-slate-500 mt-1">
                        Pilih peran demo di bawah untuk auto-fill, atau isi email dan kata sandi Anda.
                    </p>
                </div>

                {{-- Pilihan Akun Demo (3 Role Switcher - Admin, Manajer, Staff) --}}
                <div class="mb-5">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Pilih Akun Demo (Auto-Fill)
                        </span>
                        <span class="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            3 Role Siap Pakai
                        </span>
                    </div>

                    <div class="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
                        <button
                            type="button"
                            id="role-tab-admin"
                            onclick="switchDemoRole('admin', 'admin@stockify.test', 'password', 'Admin Full Akses')"
                            class="role-tab py-2 px-1 rounded-lg text-center transition-all bg-blue-600 text-white font-bold shadow-xs cursor-pointer">
                            Admin
                        </button>
                        <button
                            type="button"
                            id="role-tab-manajer"
                            onclick="switchDemoRole('manajer', 'manajer@stockify.test', 'password', 'Manajer Gudang')"
                            class="role-tab py-2 px-1 rounded-lg text-center transition-all text-slate-600 hover:text-slate-900 hover:bg-white/80 cursor-pointer">
                            Manajer
                        </button>
                        <button
                            type="button"
                            id="role-tab-staff"
                            onclick="switchDemoRole('staff', 'staff@stockify.test', 'password', 'Staff Lapangan')"
                            class="role-tab py-2 px-1 rounded-lg text-center transition-all text-slate-600 hover:text-slate-900 hover:bg-white/80 cursor-pointer">
                            Staff
                        </button>
                    </div>
                </div>

                {{-- Formulir Login Utama --}}
                <form id="mainLoginForm" action="/login" method="POST" class="space-y-4">
                    @csrf

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
                                value="{{ old('email', 'admin@stockify.test') }}"
                                placeholder="email@stockify.test"
                                class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all" />
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
                                value="password"
                                placeholder="••••••••"
                                class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all" />
                            <button
                                type="button"
                                onclick="togglePasswordVisibility('password', this)"
                                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                                aria-label="Lihat kata sandi">
                                <svg class="w-4 h-4 eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {{-- Baris Remember Me & Lupa Password --}}
                    <div class="flex items-center justify-between pt-0.5 text-xs">
                        <label class="flex items-center gap-2 cursor-pointer font-medium text-slate-600 select-none">
                            <input
                                id="remember"
                                name="remember"
                                type="checkbox"
                                value="1"
                                checked
                                class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                            <span>Ingat Saya</span>
                        </label>
                        <a href="{{ route('password.request') ?? '#' }}" class="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                            Lupa Kata Sandi?
                        </a>
                    </div>

                    {{-- Baris Tombol Aksi: 1-Klik Masuk & Tombol Submit Gradient --}}
                    <div class="pt-2 flex items-center gap-2.5">
                        {{-- Tombol Kiri: Masuk Cepat Demo 1-Klik --}}
                        <button
                            type="button"
                            id="quickLoginBtn"
                            onclick="executeInstantLogin()"
                            class="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-slate-200 shadow-xs hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer hover:border-slate-300">
                            <svg class="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                            <span id="quickLoginLabel">1-Klik (Admin)</span>
                        </button>

                        {{-- Tombol Kanan: Login Gradient Royal Blue / Indigo --}}
                        <button
                            type="submit"
                            class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5">
                            <span>Masuk</span>
                            <svg class="w-4 h-4 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14m-7-7 7 7-7 7"/>
                            </svg>
                        </button>
                    </div>
                </form>

                {{-- Link Sign Up Staff --}}
                <div class="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
                    Belum memiliki akun?
                    <a
                        href="{{ route('register') }}"
                        class="text-blue-600 hover:text-blue-700 font-bold ml-1 hover:underline">
                        Daftar Akun Staff Gudang &rarr;
                    </a>
                </div>

                {{-- Form Tersembunyi untuk Instant Role Switch 1-Klik --}}
                <form id="instantRoleForm" method="POST" action="/switch-role/admin" class="hidden">
                    @csrf
                </form>

            </div>
        </div>

        {{-- Mobile & Bottom Footer --}}
        <div class="text-center text-xs text-slate-400 pt-4">
            &copy; {{ date('Y') }} {{ $appName }} Warehouse OS. Sistem Manajemen Inventaris Terpadu.
        </div>
    </div>
</div>

<script>
    let currentSelectedRole = 'admin';

    function switchDemoRole(role, email, password, badgeTitle) {
        currentSelectedRole = role;

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const roleBadgeDesk = document.getElementById('roleBadgeDesktop');
        const quickLabel = document.getElementById('quickLoginLabel');

        if (emailInput) {
            emailInput.value = email;
            emailInput.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50/50');
            setTimeout(() => emailInput.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50/50'), 450);
        }

        if (passwordInput) {
            passwordInput.value = password;
            passwordInput.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50/50');
            setTimeout(() => passwordInput.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50/50'), 450);
        }

        if (roleBadgeDesk) {
            roleBadgeDesk.textContent = badgeTitle;
        }

        if (quickLabel) {
            const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
            quickLabel.textContent = `1-Klik (${capitalizedRole})`;
        }

        // Update styling tombol tab aktif (Tema Royal Blue & Indigo)
        document.querySelectorAll('.role-tab').forEach(tab => {
            tab.className = 'role-tab py-2 px-1 rounded-lg text-center transition-all text-slate-600 hover:text-slate-900 hover:bg-white/80 cursor-pointer';
        });

        const activeTab = document.getElementById('role-tab-' + role);
        if (activeTab) {
            activeTab.className = 'role-tab py-2 px-1 rounded-lg text-center transition-all bg-blue-600 text-white font-bold shadow-xs cursor-pointer';
        }

        // Update target switch role form
        const instantForm = document.getElementById('instantRoleForm');
        if (instantForm) {
            instantForm.action = '/switch-role/' + role;
        }
    }

    function executeInstantLogin() {
        const instantForm = document.getElementById('instantRoleForm');
        if (instantForm) {
            instantForm.submit();
        }
    }

    function togglePasswordVisibility(id, btn) {
        const input = document.getElementById(id);
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.innerHTML = isPassword ?
            `<svg class="w-4 h-4 eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>` :
            `<svg class="w-4 h-4 eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
    }

    // Otomatis aktifkan sesuai isi awal formulir
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

        const initialEmail = document.getElementById('email')?.value || '';
        if (initialEmail.includes('manajer')) {
            switchDemoRole('manajer', initialEmail, 'password', 'Manajer Gudang');
        } else if (initialEmail.includes('staff')) {
            switchDemoRole('staff', initialEmail, 'password', 'Staff Lapangan');
        } else {
            switchDemoRole('admin', 'admin@stockify.test', 'password', 'Admin Full Akses');
        }
    });
</script>
@endsection