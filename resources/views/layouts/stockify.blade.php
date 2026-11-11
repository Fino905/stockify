<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f8fafc">
    @php
        $applicationName = \App\Models\Setting::valueFor('app_name', 'Stockify');
        $applicationLogo = \App\Models\Setting::valueFor('logo');
    @endphp
    <title>@yield('title', $applicationName . ' - Manajemen Stok')</title>
    @vite(['resources/css/app.css', 'resources/js/stockify.js'])
</head>
<body class="stockify-app min-h-screen bg-slate-50 text-slate-800 antialiased">
    <div id="page-loader" class="fixed inset-0 z-[100] hidden flex items-center justify-center bg-[#faf9ff]/95 backdrop-blur-sm transition-opacity duration-300" aria-live="polite" aria-label="Keluar dari akun">
        <div class="flex flex-col items-center gap-4">
            <span class="loader-mark" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="m5 13 19-9 19 9-19 10-19-10Z" fill="currentColor" opacity=".28"/><path d="m5 13 19 10v21L5 34V13Z" fill="currentColor"/><path d="m24 23 19-10v21L24 44V23Z" fill="currentColor" opacity=".65"/><path d="M15 18v12m8-7v12m9-14v12" stroke="white" stroke-width="2" stroke-linecap="round" opacity=".8"/></svg></span>
            <div class="text-center"><p class="text-sm font-bold tracking-wide text-[#48435f]">{{ $applicationName }}</p><p class="mt-1 text-xs text-[#89849b]">Menutup sesi dengan aman...</p></div>
            <span class="loader-progress" aria-hidden="true"><span></span></span>
        </div>
    </div>

    <button type="button" data-sidebar-toggle class="fixed left-3 top-3 z-50 rounded-lg bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-theme-primary lg:hidden" aria-label="Buka atau tutup menu" aria-controls="sidebar" aria-expanded="false">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
    <header class="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 pl-16 pr-4 backdrop-blur sm:pr-6 lg:pl-6">
        <div class="flex items-center gap-3">
            <a href="{{ route('dashboard') }}" class="flex items-center gap-2.5 font-semibold tracking-tight text-slate-900">
                @if ($applicationLogo)
                    <img src="{{ \Illuminate\Support\Facades\Storage::disk('public')->url($applicationLogo) }}" alt="" class="h-9 w-9 rounded-xl object-cover">
                @else
                    <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-theme-primary text-white">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10"/></svg>
                    </span>
                @endif
                <span>{{ $applicationName }}</span>
            </a>
        </div>
        <div class="flex items-center gap-3">
            <div class="hidden text-right sm:block">
                <p class="text-sm font-medium text-slate-800">{{ auth()->user()->name }}</p>
                <p class="text-xs text-slate-500">{{ auth()->user()->role }}</p>
            </div>
            <details class="relative">
                <summary class="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full bg-theme-primary-light text-sm font-semibold text-theme-primary ring-offset-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-theme-primary" aria-label="Buka menu akun">
                    {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                </summary>
                <div class="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    <div class="border-b border-slate-100 px-3 py-2.5">
                        <p class="truncate text-sm font-semibold text-slate-900">{{ auth()->user()->name }}</p>
                        <p class="truncate text-xs text-slate-500">{{ auth()->user()->email }}</p>
                        <p class="mt-1 text-xs font-medium text-theme-primary">{{ auth()->user()->role }}</p>
                    </div>
                    <a href="{{ route('profile.edit') }}" class="mt-1 flex w-full rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Profil & kata sandi</a>
                    <form action="{{ route('logout') }}" method="POST" data-loading-form>
                        @csrf
                        <button type="submit" class="flex w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-700 hover:bg-rose-50">Keluar dari akun</button>
                    </form>
                </div>
            </details>
        </div>
    </header>

    <button type="button" data-sidebar-toggle data-sidebar-reopen class="sidebar-reopen-control hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-theme-primary lg:inline-flex" aria-label="Buka kembali menu samping" aria-controls="sidebar" aria-expanded="false" title="Buka kembali menu samping">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h10M4 18h16M17 9l3 3-3 3"/></svg>
    </button>
    <div id="sidebar-backdrop" class="fixed inset-0 z-30 hidden bg-slate-950/30 lg:hidden"></div>
    <aside id="sidebar" class="fixed bottom-0 left-0 top-16 z-40 flex w-64 flex-col border-r border-slate-200 bg-white -translate-x-full lg:translate-x-0" aria-label="Navigasi utama">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Ruang kerja</p>
                <p class="mt-1 text-sm font-medium text-slate-700">{{ auth()->user()->role }}</p>
            </div>
            <button type="button" data-sidebar-toggle class="hidden rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-theme-primary lg:inline-flex" aria-label="Ciutkan menu samping" aria-controls="sidebar" aria-expanded="true">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h10M4 18h16M17 9l3 3-3 3"/></svg>
            </button>
        </div>
        <nav class="flex-1 space-y-1 px-3 py-4">
            <a href="{{ route('dashboard') }}" class="{{ request()->routeIs('dashboard') ? 'bg-theme-primary-light text-theme-primary-text' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition">
                <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
                Dashboard
            </a>
            @if (in_array(auth()->user()->role, ['Admin', 'Manajer Gudang'], true))
                <a href="{{ route('products.index') }}" class="{{ request()->routeIs('products.*') ? 'bg-theme-primary-light text-theme-primary-text' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition">
                    <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10"/></svg>
                    Produk
                </a>
            @endif
            <a href="{{ route('transactions.index') }}" class="{{ request()->routeIs('transactions.*') ? 'bg-theme-primary-light text-theme-primary-text' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition">
                <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h13m0 0-3-3m3 3-3 3M17 17H4m0 0 3-3m-3 3 3 3"/></svg>
                Stok & transaksi
            </a>
            @if (in_array(auth()->user()->role, ['Admin', 'Manajer Gudang'], true))
                <a href="{{ route('suppliers.index') }}" class="{{ request()->routeIs('suppliers.*') ? 'bg-theme-primary-light text-theme-primary-text' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition">
                    <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7h12v11H3zM15 11h4l3 3v4h-7zM7 18a2 2 0 1 0 4 0m6 0a2 2 0 1 0 4 0"/></svg>
                    Supplier
                </a>
                <a href="{{ route('reports.index') }}" class="{{ request()->routeIs('reports.*') ? 'bg-theme-primary-light text-theme-primary-text' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition">
                    <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 20V10m5 10V4m5 16v-7m5 7V7M2 20h20"/></svg>
                    Laporan
                </a>
            @endif
            @if (auth()->user()->role === 'Admin')
                <a href="{{ route('categories.index') }}" class="{{ request()->routeIs('categories.*') ? 'bg-theme-primary-light text-theme-primary-text' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition">
                    <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>
                    Kategori produk
                </a>
                <a href="{{ route('attribute-definitions.index') }}" class="{{ request()->routeIs('attribute-definitions.*') ? 'bg-theme-primary-light text-theme-primary-text' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition">
                    <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5h16M4 12h10M4 19h16M17 9l3 3-3 3"/></svg>
                    Atribut produk
                </a>
                <a href="{{ route('users.index') }}" class="{{ request()->routeIs('users.*') ? 'bg-theme-primary-light text-theme-primary-text' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition">
                    <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.5 20a6.5 6.5 0 0 1 13 0m1-11a3.5 3.5 0 1 1 0 7m2 1a5 5 0 0 1 3 4"/></svg>
                    Pengguna & hak akses
                </a>
                <a href="{{ route('settings.index') }}" class="{{ request()->routeIs('settings.*') ? 'bg-theme-primary-light text-theme-primary-text' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition">
                    <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path stroke-linecap="round" stroke-linejoin="round" d="m19.4 15 .1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .8v.2a1.8 1.8 0 1 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.8l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.8-3h-.2a1.8 1.8 0 1 1 0-3.6h.2a1.8 1.8 0 0 0 .8-3l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.8v-.2a1.8 1.8 0 1 1 3.6 0v.2a1.8 1.8 0 0 0 3 .8l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .8 3h.2a1.8 1.8 0 1 1 0 3.6h-.2a1.8 1.8 0 0 0-.8 3Z"/></svg>
                    Pengaturan
                </a>
            @endif
        </nav>
        <div class="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">{{ $applicationName }}</div>
    </aside>

    <main id="main-content" class="min-h-screen pt-16 transition-[margin] duration-200 lg:ml-64">
        <div class="workspace-content mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
            @if (session('success'))
                <div class="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500 bg-emerald-600 p-4 text-xs font-semibold text-white shadow-lg animate-in fade-in">
                    <div class="flex items-center gap-2.5">
                        <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        <span>{{ session('success') }}</span>
                    </div>
                </div>
            @elseif (session('error'))
                <div class="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-rose-500 bg-rose-600 p-4 text-xs font-semibold text-white shadow-lg animate-in fade-in">
                    <div class="flex items-center gap-2.5">
                        <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span>{{ session('error') }}</span>
                    </div>
                </div>
            @endif
            @yield('content')
        </div>
        <footer class="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500 sm:px-6">
            {{ $applicationName }} <span aria-hidden="true">&middot;</span> Persediaan lebih tertata, operasional lebih mudah
        </footer>
    </main>
</body>
</html>
