import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Boxes, 
    ArrowRight, 
    ShieldCheck, 
    Truck, 
    BarChart3, 
    CheckCircle2, 
    ClipboardCheck, 
    Layers, 
    Sparkles, 
    FileSpreadsheet, 
    Lock, 
    ArrowDownToLine, 
    ArrowUpFromLine,
    ChevronRight,
    Users,
    Zap,
    Building2,
    Check,
    TrendingUp,
    PackageCheck,
    Activity,
    CheckCircle
} from 'lucide-react';

interface Props {
    totalProducts?: number;
    totalSuppliers?: number;
    totalStockIn?: number;
    totalStockOut?: number;
    canLogin?: boolean;
}

export default function Welcome({
    totalProducts = 5,
    totalSuppliers = 3,
    totalStockIn = 145,
    totalStockOut = 65,
    canLogin = true,
}: Props) {
    const { auth } = usePage().props as unknown as { auth?: { user?: { name: string; role: string } } };
    const [activeRoleTab, setActiveRoleTab] = useState<'admin' | 'manajer' | 'staff'>('admin');

    const rolesData = {
        admin: {
            title: 'Administrator',
            badge: 'Akses Penuh',
            tagline: 'Manajemen holistik sistem inventaris, otorisasi, dan analitik laporan bisnis',
            features: [
                'Manajemen Produk (CRUD) & Definisi Atribut Khusus (Ukuran, Warna, Berat)',
                'Manajemen Kategori Produk & Mitra Supplier Gudang',
                'Manajemen Pengguna (CRUD) & Pengaturan Hak Akses (Role-Based Access)',
                'Laporan Stok Komprehensif, Mutasi Barang, dan Valuasi Aset Inventaris',
                'Ekspor Data Produk & Stok ke format CSV serta Fitur Cetak Laporan'
            ]
        },
        manajer: {
            title: 'Manajer Gudang',
            badge: 'Pengawasan Stok',
            tagline: 'Pemantauan ketersediaan barang, kontrol keluar-masuk, dan audit fisik berkala',
            features: [
                'Dashboard Peringatan Stok Menipis (Low Stock Alert) secara Real-Time',
                'Monitoring Barang Masuk dan Keluar Hari Ini',
                'Pencatatan Transaksi Penerimaan dari Supplier & Pengeluaran ke Pemesan',
                'Pelaksanaan Stock Opname & Penyesuaian Selisih Fisik Otomatis',
                'Tinjauan Direktori Mitra Supplier dan Katalog Produk Lengkap'
            ]
        },
        staff: {
            title: 'Staff Gudang',
            badge: 'Operasional Lapangan',
            tagline: 'Penyelesaian tugas harian pemeriksaan barang masuk dan penyiapan pengeluaran fisik',
            features: [
                'Dashboard Antrean Tugas Operasional (Operational Task Queue)',
                'Daftar Barang Masuk yang Perlu Diperiksa Fisik & Validasi',
                'Daftar Barang Keluar yang Perlu Disiapkan untuk Pengiriman',
                'Konfirmasi 1-Klik Penyelesaian Transaksi Penerimaan & Pengeluaran',
                'Pencatatan Mutasi Barang Cepat dengan Validasi Kuantitas Stok'
            ]
        }
    };

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (!element) return;

        const navHeight = 76;
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - navHeight;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 800; // 800ms ultra-smooth fluid glide
        let start: number | null = null;

        // Custom cubic-bezier approximation: smooth ease-in-out
        const easeInOutQuart = (t: number) => {
            return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
        };

        const animation = (currentTime: number) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutQuart(progress);

            window.scrollTo(0, startPosition + distance * ease);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                window.history.pushState(null, '', `#${targetId}`);
            }
        };

        requestAnimationFrame(animation);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-gray-800 font-sans antialiased selection:bg-[#43637E]/20 selection:text-[#321E48] scroll-smooth overflow-x-hidden relative">
            <Head title="Stockify - Sistem Manajemen Gudang & Inventaris" />

            {/* Subtle Ambient Background Gradients (Organic & Soft, Not Neon) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none -z-10 overflow-hidden">
                <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-purple-200/35 rounded-full blur-3xl animate-pulse-subtle" />
                <div className="absolute top-10 right-1/4 w-[450px] h-[450px] bg-blue-100/40 rounded-full blur-3xl animate-float-delayed" />
                <div className="absolute top-48 left-1/3 w-[400px] h-[400px] bg-teal-100/30 rounded-full blur-3xl" />
            </div>

            {/* Top Navigation (Always Fixed / Stay on Top) */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100/80 transition-all duration-300 shadow-2xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-3 group transition-transform duration-300 hover:scale-[1.02]">
                        <div className="w-10 h-10 rounded-xl bg-[#321E48] text-white flex items-center justify-center font-bold shadow-xs group-hover:shadow-md group-hover:bg-[#251536] transition-all duration-300">
                            <Boxes className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-6" />
                        </div>
                        <div>
                            <span className="text-xl font-bold tracking-tight text-[#321E48]">Stockify</span>
                            <span className="block text-[10px] uppercase font-semibold tracking-wider text-gray-400 -mt-1">
                                Warehouse System
                            </span>
                        </div>
                    </Link>

                    {/* Nav Links with Buttery Smooth Easing Scroll */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <a 
                            href="#fitur" 
                            onClick={(e) => scrollToSection(e, 'fitur')} 
                            className="hover:text-gray-900 transition-colors duration-200 relative py-1 cursor-pointer after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#3B5BFD] hover:after:w-full after:transition-all after:duration-300"
                        >
                            Fitur
                        </a>
                        <a 
                            href="#role" 
                            onClick={(e) => scrollToSection(e, 'role')} 
                            className="hover:text-gray-900 transition-colors duration-200 relative py-1 cursor-pointer after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#3B5BFD] hover:after:w-full after:transition-all after:duration-300"
                        >
                            Alur Role
                        </a>
                        <a 
                            href="#arsitektur" 
                            onClick={(e) => scrollToSection(e, 'arsitektur')} 
                            className="hover:text-gray-900 transition-colors duration-200 relative py-1 cursor-pointer after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#3B5BFD] hover:after:w-full after:transition-all after:duration-300"
                        >
                            Arsitektur
                        </a>
                        <a 
                            href="#metrik" 
                            onClick={(e) => scrollToSection(e, 'metrik')} 
                            className="hover:text-gray-900 transition-colors duration-200 relative py-1 cursor-pointer after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#3B5BFD] hover:after:w-full after:transition-all after:duration-300"
                        >
                            Statistik
                        </a>
                    </nav>

                    {/* Action Button */}
                    <div className="flex items-center gap-3">
                        {auth?.user ? (
                            <Link
                                href="/dashboard"
                                className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#321E48] hover:bg-[#251536] text-white font-medium text-sm shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out"
                            >
                                <span>Buka Dashboard</span>
                                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-200" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/register"
                                    className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold text-sm transition-all"
                                >
                                    Daftar Customer
                                </Link>
                                <Link
                                    href="/login"
                                    className="group inline-flex items-center gap-2 px-4.5 py-2 rounded-xl bg-[#321E48] hover:bg-[#251536] text-white font-medium text-sm shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out"
                                >
                                    <span>Masuk ke Sistem</span>
                                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-200" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        {/* Chip Pill with Live Indicator */}
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-gray-200/90 shadow-2xs text-gray-700 text-xs font-medium mb-6 hover:border-blue-300 transition-all duration-300 hover:shadow-xs animate-in fade-in slide-in-from-bottom-3 duration-500">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span className="text-gray-600 font-medium">Sistem Inventaris Multi-Role Siap Pakai</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-[#3B5BFD] font-semibold flex items-center gap-1 group">
                                Live Demo
                                <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#321E48] leading-[1.16] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                            Kendali Presisi Stok, Mutasi & Logistik Gudang
                        </h1>

                        {/* Subtitle */}
                        <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 ease-out fill-mode-both">
                            Stockify menyelaraskan kolaborasi <strong>Admin</strong>, <strong>Manajer Gudang</strong>, dan <strong>Staff Gudang</strong> dalam satu sistem terpadu. Pencatatan otomatis barang masuk-keluar, stock opname akurat, hingga valuasi aset.
                        </p>

                        {/* CTA Buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 ease-out fill-mode-both">
                            <Link
                                href="/login"
                                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#321E48] text-white font-semibold text-sm hover:bg-[#251536] shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out"
                            >
                                <Zap className="w-4 h-4 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
                                <span>Akses Akun Demo</span>
                                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="/register"
                                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out"
                            >
                                <span>Daftar Akun Customer</span>
                                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                            <a
                                href="#role"
                                onClick={(e) => scrollToSection(e, 'role')}
                                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white text-gray-700 font-medium text-sm border border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out cursor-pointer"
                            >
                                <Layers className="w-4 h-4 text-[#43637E] transition-transform duration-200 group-hover:scale-110" />
                                <span>Pelajari Alur Kerja</span>
                            </a>
                        </div>

                        <p className="mt-4 text-xs text-gray-500 animate-in fade-in duration-700 delay-500 fill-mode-both">
                            Akun demo: <strong>Admin</strong>, <strong>Manajer</strong>, dan <strong>Staff</strong> (Password: <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-mono font-medium">password</code>)
                        </p>
                    </div>

                    {/* Interactive Animated Hero Preview Showcase */}
                    <div className="mt-14 max-w-4xl mx-auto relative animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 ease-out fill-mode-both">
                        {/* Floating Organic Status Badge Top-Left */}
                        <div className="absolute -top-5 -left-2 sm:-left-6 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-lg text-xs font-semibold text-gray-800 animate-float">
                            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <ArrowDownToLine className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <span className="block text-[11px] text-gray-900 font-bold">Barang Masuk +50 Unit</span>
                                <span className="block text-[9px] text-gray-400 font-normal">Baut Baja 10mm diverifikasi</span>
                            </div>
                        </div>

                        {/* Floating Organic Status Badge Bottom-Right */}
                        <div className="absolute -bottom-5 -right-2 sm:-right-6 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-lg text-xs font-semibold text-gray-800 animate-float-delayed">
                            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <CheckCircle className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <span className="block text-[11px] text-gray-900 font-bold">Stock Opname Selesai</span>
                                <span className="block text-[9px] text-gray-400 font-normal">100% Selaras dengan Fisik</span>
                            </div>
                        </div>

                        {/* Main Mockup Card */}
                        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 ease-out">
                            {/* Window Topbar */}
                            <div className="bg-gray-50/90 px-4 py-3 border-b border-gray-200/80 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-rose-400/80" />
                                    <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                                    <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                                </div>
                                <div className="px-4 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-mono text-gray-500 flex items-center gap-1.5 shadow-2xs">
                                    <Lock className="w-3 h-3 text-emerald-600" />
                                    <span>stockify.internal/dashboard</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="hidden sm:inline">Live Mode</span>
                                </div>
                            </div>

                            {/* Window Content Preview */}
                            <div className="p-5 sm:p-6 bg-gradient-to-b from-gray-50/40 to-white">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
                                    <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs hover:border-blue-100 transition-colors">
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                            <span>Kapasitas Gudang</span>
                                            <span className="text-blue-600 font-semibold font-mono">82%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-[#3B5BFD] h-2 rounded-full w-[82%] transition-all duration-1000 ease-out" />
                                        </div>
                                    </div>
                                    <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs hover:border-emerald-100 transition-colors">
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                            <span>Penerimaan Hari Ini</span>
                                            <span className="text-emerald-600 font-semibold font-mono">+14 Transaksi</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 h-2 rounded-full w-[65%] transition-all duration-1000 ease-out" />
                                        </div>
                                    </div>
                                    <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs hover:border-purple-100 transition-colors">
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                            <span>Akurasi Fisik Rak</span>
                                            <span className="text-purple-600 font-semibold font-mono">99.8%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-purple-600 h-2 rounded-full w-[99%] transition-all duration-1000 ease-out" />
                                        </div>
                                    </div>
                                </div>

                                {/* Mock Mini Table / Chart Row */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3B5BFD] flex items-center justify-center shrink-0">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-900">Aktivitas Real-Time Operasional</h4>
                                            <p className="text-[11px] text-gray-500">Pencatatan mutasi otomatis dari staff lapangan</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                        <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                                            Sinkron
                                        </span>
                                        <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                                            Multi-User Ready
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metric Cards Strip with Smooth Hover Physics */}
                    <div id="metrik" className="scroll-mt-24 mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-blue-100 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-default">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Produk</span>
                                <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-purple-50 group-hover:text-[#321E48] flex items-center justify-center text-gray-700 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                                    <Boxes className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 group-hover:text-[#321E48] transition-colors">{totalProducts}</div>
                            <p className="text-xs text-gray-500 mt-0.5">Item aktif di sistem</p>
                        </div>

                        <div className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-blue-100 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-default">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Mitra Supplier</span>
                                <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center text-gray-700 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                                    <Truck className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{totalSuppliers}</div>
                            <p className="text-xs text-gray-500 mt-0.5">Pemasok terhubung</p>
                        </div>

                        <div className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-emerald-100 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-default">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Barang Masuk</span>
                                <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 flex items-center justify-center text-gray-700 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                                    <ArrowDownToLine className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{totalStockIn} <span className="text-xs font-normal text-gray-500">unit</span></div>
                            <p className="text-xs text-gray-500 mt-0.5">Penerimaan selesai</p>
                        </div>

                        <div className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-indigo-100 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-default">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Barang Keluar</span>
                                <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center text-gray-700 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                                    <ArrowUpFromLine className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{totalStockOut} <span className="text-xs font-normal text-gray-500">unit</span></div>
                            <p className="text-xs text-gray-500 mt-0.5">Pengeluaran selesai</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Role Breakdown with Fluid Organic Tab Animation */}
            <section id="role" className="scroll-mt-20 py-20 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Hak Akses & Otorisasi</span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                            Alur Khusus Berdasarkan 3 Peran Pengguna
                        </h2>
                    </div>

                    {/* Role Tab Buttons with Springy Active Transition */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex p-1.5 rounded-2xl bg-gray-100/90 border border-gray-200/80 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => setActiveRoleTab('admin')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ease-out cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                                    activeRoleTab === 'admin'
                                        ? 'bg-[#321E48] text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                                }`}
                            >
                                <ShieldCheck className="w-4 h-4" />
                                1. Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveRoleTab('manajer')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ease-out cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                                    activeRoleTab === 'manajer'
                                        ? 'bg-[#43637E] text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                                }`}
                            >
                                <BarChart3 className="w-4 h-4" />
                                2. Manajer Gudang
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveRoleTab('staff')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ease-out cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                                    activeRoleTab === 'staff'
                                        ? 'bg-[#321E48] text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                                }`}
                            >
                                <ClipboardCheck className="w-4 h-4" />
                                3. Staff Gudang
                            </button>
                        </div>
                    </div>

                    {/* Active Tab Card with Smooth Crossfade Entrance */}
                    <div 
                        key={activeRoleTab}
                        className="max-w-3xl mx-auto bg-gray-50/80 rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm animate-in fade-in-50 slide-in-from-bottom-3 duration-300 ease-out"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200">
                            <div>
                                <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white border border-gray-200 text-gray-700 mb-2 shadow-2xs">
                                    {rolesData[activeRoleTab].badge}
                                </span>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {rolesData[activeRoleTab].title}
                                </h3>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    {rolesData[activeRoleTab].tagline}
                                </p>
                            </div>
                            <Link
                                href="/login"
                                className="group self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#321E48] text-white font-medium text-xs hover:bg-[#251536] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out"
                            >
                                <span>Coba Role Ini</span>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform duration-200" />
                            </Link>
                        </div>

                        <div className="mt-6">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                                Wewenang & Fitur:
                            </h4>
                            <div className="space-y-2.5">
                                {rolesData[activeRoleTab].features.map((feat, index) => (
                                    <div 
                                        key={index} 
                                        className="group flex items-start gap-3 p-3.5 rounded-xl bg-white border border-gray-200/90 hover:border-gray-300 hover:shadow-xs hover:translate-x-1 text-xs sm:text-sm text-gray-700 transition-all duration-200 ease-out"
                                    >
                                        <Check className="w-4 h-4 text-[#43637E] shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200" />
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Architecture: Controller - Service - Repository */}
            <section id="arsitektur" className="scroll-mt-20 py-20 bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Standar Kode</span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                            Pola Controller - Service - Repository
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="group bg-white p-6 rounded-3xl border border-gray-200 hover:border-blue-200 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 ease-out">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#321E48] group-hover:text-white text-gray-800 flex items-center justify-center mb-4 font-bold transition-all duration-300 group-hover:scale-110">
                                1
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Lapisan 1</span>
                            <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 group-hover:text-[#321E48] transition-colors">HTTP Controller</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Menangani request HTTP dari client, memvalidasi form request, dan mendelegasikan instruksi ke Service terkait.
                            </p>
                        </div>

                        <div className="group bg-white p-6 rounded-3xl border border-gray-200 hover:border-blue-200 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 ease-out">
                            <div className="w-10 h-10 rounded-xl bg-[#43637E] text-white flex items-center justify-center mb-4 font-bold transition-all duration-300 group-hover:scale-110">
                                2
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Lapisan 2</span>
                            <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 group-hover:text-[#43637E] transition-colors">Business Service</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Menjalankan seluruh logika bisnis: kalkulasi stok, stock opname, verifikasi kuantitas, dan database transaction.
                            </p>
                        </div>

                        <div className="group bg-white p-6 rounded-3xl border border-gray-200 hover:border-blue-200 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 ease-out">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#321E48] group-hover:text-white text-gray-800 flex items-center justify-center mb-4 font-bold transition-all duration-300 group-hover:scale-110">
                                3
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Lapisan 3</span>
                            <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 group-hover:text-[#321E48] transition-colors">Data Repository</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Mengelola interaksi langsung dengan database MySQL menggunakan Eloquent ORM secara rapi dan terisolasi.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Features Grid */}
            <section id="fitur" className="scroll-mt-20 py-20 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Fitur Sistem</span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                            Manajemen Gudang Terpadu
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="group p-5 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out">
                            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700 flex items-center justify-center mb-3 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-[#3B5BFD] transition-all duration-300 group-hover:scale-110">
                                <Boxes className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-[#321E48] transition-colors">Multi-Atribut Produk</h3>
                            <p className="text-xs text-gray-600">
                                Definisi atribut fleksibel seperti ukuran, warna, berat, dan spesifikasi pada tiap produk.
                            </p>
                        </div>

                        <div className="group p-5 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out">
                            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700 flex items-center justify-center mb-3 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-[#3B5BFD] transition-all duration-300 group-hover:scale-110">
                                <ClipboardCheck className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-[#321E48] transition-colors">Stock Opname Otomatis</h3>
                            <p className="text-xs text-gray-600">
                                Pencocokan stok fisik vs sistem dengan kalkulasi selisih otomatis dan audit catatan.
                            </p>
                        </div>

                        <div className="group p-5 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out">
                            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700 flex items-center justify-center mb-3 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-[#3B5BFD] transition-all duration-300 group-hover:scale-110">
                                <FileSpreadsheet className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-[#321E48] transition-colors">Export CSV & Cetak</h3>
                            <p className="text-xs text-gray-600">
                                Ekspor katalog ke format CSV atau cetak ringkasan laporan valuasi aset inventaris.
                            </p>
                        </div>

                        <div className="group p-5 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out">
                            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700 flex items-center justify-center mb-3 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-[#3B5BFD] transition-all duration-300 group-hover:scale-110">
                                <Truck className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-[#321E48] transition-colors">Direktori Supplier</h3>
                            <p className="text-xs text-gray-600">
                                Kelola direktori mitra pemasok lengkap dengan alamat, telepon, dan email kontak.
                            </p>
                        </div>

                        <div className="group p-5 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out">
                            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700 flex items-center justify-center mb-3 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-[#3B5BFD] transition-all duration-300 group-hover:scale-110">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-[#321E48] transition-colors">Role-Based Access</h3>
                            <p className="text-xs text-gray-600">
                                Pembatasan akses berbasis peran memastikan wewenang tiap modul terlindungi.
                            </p>
                        </div>

                        <div className="group p-5 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out">
                            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700 flex items-center justify-center mb-3 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-[#3B5BFD] transition-all duration-300 group-hover:scale-110">
                                <Users className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-[#321E48] transition-colors">Tugas Operasional Staff</h3>
                            <p className="text-xs text-gray-600">
                                Antrean verifikasi barang masuk dan penyiapan barang keluar untuk tim lapangan.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Call to Action */}
            <section className="py-20 bg-[#321E48] text-white relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400 blur-3xl animate-float-delayed" />
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-400 blur-3xl animate-float" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Siap Menggunakan Stockify?
                    </h2>
                    <p className="mt-3 text-gray-300 text-sm sm:text-base max-w-xl mx-auto">
                        Gunakan tombol demo 1-klik untuk langsung menguji wewenang Admin, Manajer Gudang, maupun Staff Gudang.
                    </p>

                    <div className="mt-8 flex justify-center">
                        <Link
                            href="/login"
                            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#321E48] font-bold text-sm hover:bg-gray-50 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
                        >
                            <Zap className="w-4 h-4 text-[#43637E] transition-transform duration-300 group-hover:scale-110" />
                            <span>Buka Halaman Login</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#241535] text-gray-400 py-8 border-t border-white/5 text-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-white/10 text-white flex items-center justify-center font-bold text-[10px]">
                            S
                        </div>
                        <span className="font-semibold text-white">Stockify</span>
                        <span>— Sistem Manajemen Pergudangan</span>
                    </div>

                    <div>
                        &copy; 2026 Stockify. Minimalist & Clean Warehouse Architecture.
                    </div>
                </div>
            </footer>
        </div>
    );
}

Welcome.layout = (page: React.ReactNode) => page;
