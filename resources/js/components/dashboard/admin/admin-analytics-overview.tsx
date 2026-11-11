import React, { useState } from 'react';
import { 
    ChevronRight, 
    ChevronDown, 
    ArrowDownToLine, 
    ArrowUpFromLine, 
    AlertTriangle, 
    Activity, 
    Headphones, 
    MessageSquare, 
    Star 
} from 'lucide-react';

interface MetricBar {
    day: string;
    height: number;
    val: string;
}

interface MetricChartInfo {
    title: string;
    subtitle: string;
    unit: string;
    tabTarget: string;
    tabName: string;
    yLabels: string[];
    bars: MetricBar[];
}

interface AdminAnalyticsOverviewProps {
    stats: {
        total_products: number;
        total_stock_in: number;
        total_stock_out: number;
        total_suppliers: number;
        today_stock_in: number;
        today_stock_out: number;
        low_stock_count: number;
    };
    products: Array<{
        id: number;
        name: string;
        sku: string;
        current_stock: number;
        minimum_stock: number;
        selling_price?: number;
    }>;
    categories: Array<{
        id: number;
        name: string;
    }>;
    transactions: Array<{
        id: string;
        product: string;
        quantity: number;
        date: string;
        user: string;
        role: string;
        status: string;
        notes: string | null;
        type: string;
    }>;
    lowStockItems: Array<{
        id: number;
        name: string;
        sku: string;
        current_stock: number;
        minimum_stock: number;
    }>;
    pendingInTasks: Array<{
        id: string;
    }>;
    onSelectTab: (tab: string) => void;
    onOpenRestock: (productId: number) => void;
}

export function AdminAnalyticsOverview({
    stats,
    products = [],
    categories = [],
    transactions = [],
    lowStockItems = [],
    pendingInTasks = [],
    onSelectTab,
    onOpenRestock,
}: AdminAnalyticsOverviewProps) {
    const [selectedMetric, setSelectedMetric] = useState<'valuation' | 'in' | 'out' | 'low_stock'>('valuation');
    const [chartPeriod, setChartPeriod] = useState('7 hari terakhir');

    const metricChartData: Record<'valuation' | 'in' | 'out' | 'low_stock', MetricChartInfo> = {
        valuation: {
            title: 'Valuasi & Perputaran Nilai Inventaris',
            subtitle: 'Estimasi nilai omset dan modal aktif 7 hari terakhir',
            unit: 'Rp',
            tabTarget: 'reports',
            tabName: 'Laporan Nilai Aset',
            yLabels: ['80 K', '60 K', '40 K', '20 K', '0'],
            bars: [
                { day: 'SEN', height: 45, val: 'Rp 38K' },
                { day: 'SEL', height: 75, val: 'Rp 62K' },
                { day: 'RAB', height: 60, val: 'Rp 49K' },
                { day: 'KAM', height: 90, val: 'Rp 78K' },
                { day: 'JUM', height: 65, val: 'Rp 54K' },
                { day: 'SAB', height: 85, val: 'Rp 72K' },
                { day: 'MIN', height: 50, val: 'Rp 41K' },
            ],
        },
        in: {
            title: 'Statistik Barang Masuk (Penerimaan)',
            subtitle: 'Jumlah unit produk diverifikasi dan diterima di rak gudang',
            unit: 'Unit',
            tabTarget: 'transactions',
            tabName: 'Daftar Barang Masuk',
            yLabels: ['100', '75', '50', '25', '0'],
            bars: [
                { day: 'SEN', height: 50, val: '48 Unit' },
                { day: 'SEL', height: 85, val: '82 Unit' },
                { day: 'RAB', height: 60, val: '58 Unit' },
                { day: 'KAM', height: 95, val: '92 Unit' },
                { day: 'JUM', height: 70, val: '68 Unit' },
                { day: 'SAB', height: 90, val: '86 Unit' },
                { day: 'MIN', height: 55, val: '52 Unit' },
            ],
        },
        out: {
            title: 'Statistik Barang Keluar (Pengiriman & Pesanan)',
            subtitle: 'Distribusi barang keluar ke ekspedisi dan outlet/cabang',
            unit: 'Unit',
            tabTarget: 'transactions',
            tabName: 'Daftar Barang Keluar',
            yLabels: ['80', '60', '40', '20', '0'],
            bars: [
                { day: 'SEN', height: 40, val: '32 Unit' },
                { day: 'SEL', height: 65, val: '54 Unit' },
                { day: 'RAB', height: 50, val: '41 Unit' },
                { day: 'KAM', height: 85, val: '71 Unit' },
                { day: 'JUM', height: 60, val: '49 Unit' },
                { day: 'SAB', height: 75, val: '63 Unit' },
                { day: 'MIN', height: 45, val: '36 Unit' },
            ],
        },
        low_stock: {
            title: 'Tren Barang Stok Menipis & Kritis',
            subtitle: 'Monitoring inventaris yang berada di bawah ambang batas minimum',
            unit: 'SKU',
            tabTarget: 'products',
            tabName: 'Kelola Stok Produk',
            yLabels: ['15', '10', '5', '2', '0'],
            bars: [
                { day: 'SEN', height: 60, val: '6 Item' },
                { day: 'SEL', height: 40, val: '4 Item' },
                { day: 'RAB', height: 70, val: '7 Item' },
                { day: 'KAM', height: 50, val: '5 Item' },
                { day: 'JUM', height: 80, val: '8 Item' },
                { day: 'SAB', height: 45, val: '4 Item' },
                { day: 'MIN', height: 35, val: `${stats.low_stock_count} Item` },
            ],
        },
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* 4 Stat Cards Row - Clickable with dynamic sparklines & Bold Tactile Lift */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Nilai Inventaris */}
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedMetric('valuation')}
                    className={`card-lift cascade-1 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-44 cursor-pointer select-none scroll-reveal reveal-delay-100 ${
                        selectedMetric === 'valuation'
                            ? 'bg-theme-primary text-white shadow-xl shadow-lg ring-2 ring-theme-primary'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700/60 shadow-xs hover:border-blue-400'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${selectedMetric === 'valuation' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                Total Nilai Inventaris
                            </span>
                            {selectedMetric === 'valuation' && (
                                <span className="w-2 h-2 rounded-full bg-white live-beacon" />
                            )}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectTab('reports');
                                }}
                                title="Buka Halaman Laporan"
                                className={`btn-press p-1 rounded-lg transition-colors cursor-pointer ${
                                    selectedMetric === 'valuation'
                                        ? 'text-white/90 hover:text-white hover:bg-white/20'
                                        : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-xs ${
                                selectedMetric === 'valuation'
                                    ? 'bg-white/20 text-white backdrop-blur-xs'
                                    : 'bg-theme-primary-light text-theme-primary dark:bg-blue-900/40 dark:text-blue-300'
                            }`}>
                                Rp
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-extrabold tracking-tight mt-1 animate-num-pop">
                            Rp {(stats.total_products * 68500).toLocaleString('id-ID')}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold">
                            <span className={`px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 font-bold ${
                                selectedMetric === 'valuation'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                            }`}>
                                ▲ 12.5%
                            </span>
                            <span className={selectedMetric === 'valuation' ? 'text-blue-100 opacity-90' : 'text-gray-400'}>
                                vs minggu lalu
                            </span>
                        </div>
                    </div>
                    {/* SVG Sparkline */}
                    <div className="w-full -mb-3 pt-1">
                        <svg className="w-full h-10 overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
                            {selectedMetric === 'valuation' ? (
                                <>
                                    <defs>
                                        <linearGradient id="sparkGradValuation" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M 0,20 Q 20,26 38,12 T 70,16 T 100,5 L 100,28 L 0,28 Z" fill="url(#sparkGradValuation)" />
                                    <path d="M 0,20 Q 20,26 38,12 T 70,16 T 100,5" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2.5" strokeLinecap="round" />
                                </>
                            ) : (
                                <path d="M 0,20 Q 20,26 38,12 T 70,16 T 100,5" fill="none" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" />
                            )}
                        </svg>
                    </div>
                </div>

                {/* Card 2: Barang Masuk */}
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedMetric('in')}
                    className={`card-lift cascade-2 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-44 cursor-pointer select-none scroll-reveal reveal-delay-200 ${
                        selectedMetric === 'in'
                            ? 'bg-theme-primary text-white shadow-xl shadow-lg ring-2 ring-theme-primary'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700/60 shadow-xs hover:border-blue-400'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${selectedMetric === 'in' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                Barang Masuk
                            </span>
                            {selectedMetric === 'in' && (
                                <span className="w-2 h-2 rounded-full bg-white live-beacon" />
                            )}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectTab('transactions');
                                }}
                                title="Buka Transaksi Masuk"
                                className={`btn-press p-1 rounded-lg transition-colors cursor-pointer ${
                                    selectedMetric === 'in'
                                        ? 'text-white/90 hover:text-white hover:bg-white/20'
                                        : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs ${
                                selectedMetric === 'in'
                                    ? 'bg-white/20 text-white backdrop-blur-xs'
                                    : 'bg-theme-primary-light text-theme-primary dark:bg-blue-900/40 dark:text-blue-300'
                            }`}>
                                <ArrowDownToLine className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-extrabold tracking-tight mt-1 animate-num-pop">
                            {stats.total_stock_in} <span className={`text-xs font-normal ${selectedMetric === 'in' ? 'text-blue-100' : 'text-gray-400'}`}>Unit</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold">
                            <span className={`px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 font-bold ${
                                selectedMetric === 'in'
                                    ? 'bg-white/20 text-white'
                                    : 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
                            }`}>
                                ▼ 8.2%
                            </span>
                            <span className={selectedMetric === 'in' ? 'text-blue-100 opacity-90' : 'text-gray-400'}>
                                vs minggu lalu
                            </span>
                        </div>
                    </div>
                    {/* SVG Sparkline */}
                    <div className="w-full -mb-3 pt-1">
                        <svg className="w-full h-10 overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
                            {selectedMetric === 'in' ? (
                                <>
                                    <defs>
                                        <linearGradient id="sparkGradIn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M 0,16 Q 25,24 50,11 T 100,7 L 100,28 L 0,28 Z" fill="url(#sparkGradIn)" />
                                    <path d="M 0,16 Q 25,24 50,11 T 100,7" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2.5" strokeLinecap="round" />
                                </>
                            ) : (
                                <path d="M 0,16 Q 25,24 50,11 T 100,7" fill="none" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" />
                            )}
                        </svg>
                    </div>
                </div>

                {/* Card 3: Barang Keluar */}
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedMetric('out')}
                    className={`card-lift cascade-3 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-44 cursor-pointer select-none scroll-reveal reveal-delay-300 ${
                        selectedMetric === 'out'
                            ? 'bg-theme-primary text-white shadow-xl shadow-lg ring-2 ring-theme-primary'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700/60 shadow-xs hover:border-blue-400'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${selectedMetric === 'out' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                Barang Keluar
                            </span>
                            {selectedMetric === 'out' && (
                                <span className="w-2 h-2 rounded-full bg-white live-beacon" />
                            )}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectTab('transactions');
                                }}
                                title="Buka Transaksi Keluar"
                                className={`btn-press p-1 rounded-lg transition-colors cursor-pointer ${
                                    selectedMetric === 'out'
                                        ? 'text-white/90 hover:text-white hover:bg-white/20'
                                        : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs ${
                                selectedMetric === 'out'
                                    ? 'bg-white/20 text-white backdrop-blur-xs'
                                    : 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                            }`}>
                                <ArrowUpFromLine className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-extrabold tracking-tight mt-1 animate-num-pop">
                            {stats.total_stock_out} <span className={`text-xs font-normal ${selectedMetric === 'out' ? 'text-blue-100' : 'text-gray-400'}`}>Transaksi</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold">
                            <span className={`px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 font-bold ${
                                selectedMetric === 'out'
                                    ? 'bg-white/20 text-white'
                                    : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                            }`}>
                                ▲ 16.7%
                            </span>
                            <span className={selectedMetric === 'out' ? 'text-blue-100 opacity-90' : 'text-gray-400'}>
                                vs minggu lalu
                            </span>
                        </div>
                    </div>
                    {/* SVG Sparkline */}
                    <div className="w-full -mb-3 pt-1">
                        <svg className="w-full h-10 overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
                            {selectedMetric === 'out' ? (
                                <>
                                    <defs>
                                        <linearGradient id="sparkGradOut" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M 0,22 Q 30,12 60,18 T 100,8 L 100,28 L 0,28 Z" fill="url(#sparkGradOut)" />
                                    <path d="M 0,22 Q 30,12 60,18 T 100,8" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2.5" strokeLinecap="round" />
                                </>
                            ) : (
                                <path d="M 0,22 Q 30,12 60,18 T 100,8" fill="none" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" />
                            )}
                        </svg>
                    </div>
                </div>

                {/* Card 4: Stok Kritis / Menipis */}
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedMetric('low_stock')}
                    className={`card-lift cascade-4 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-44 cursor-pointer select-none scroll-reveal reveal-delay-400 ${
                        selectedMetric === 'low_stock'
                            ? 'bg-theme-primary text-white shadow-xl shadow-lg ring-2 ring-theme-primary'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700/60 shadow-xs hover:border-amber-400'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${selectedMetric === 'low_stock' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                Stok Kritis / Menipis
                            </span>
                            {selectedMetric === 'low_stock' && (
                                <span className="w-2 h-2 rounded-full bg-white live-beacon-amber" />
                            )}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectTab('products');
                                }}
                                title="Buka Manajemen Produk"
                                className={`btn-press p-1 rounded-lg transition-colors cursor-pointer ${
                                    selectedMetric === 'low_stock'
                                        ? 'text-white/90 hover:text-white hover:bg-white/20'
                                        : 'text-gray-400 hover:text-amber-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs ${
                                selectedMetric === 'low_stock'
                                    ? 'bg-white/20 text-white backdrop-blur-xs'
                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300'
                            }`}>
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-extrabold tracking-tight mt-1 animate-num-pop">
                            {stats.low_stock_count} <span className={`text-xs font-normal ${selectedMetric === 'low_stock' ? 'text-blue-100' : 'text-gray-400'}`}>Item</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold">
                            <span className={`px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 font-bold ${
                                selectedMetric === 'low_stock'
                                    ? 'bg-white/20 text-white'
                                    : 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                            }`}>
                                ▲ Butuh Restock
                            </span>
                            <span className={selectedMetric === 'low_stock' ? 'text-blue-100 opacity-90' : 'text-gray-400'}>
                                segera
                            </span>
                        </div>
                    </div>
                    {/* SVG Sparkline */}
                    <div className="w-full -mb-3 pt-1">
                        <svg className="w-full h-10 overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
                            {selectedMetric === 'low_stock' ? (
                                <>
                                    <defs>
                                        <linearGradient id="sparkGradLow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M 0,18 Q 30,24 60,14 T 100,9 L 100,28 L 0,28 Z" fill="url(#sparkGradLow)" />
                                    <path d="M 0,18 Q 30,24 60,14 T 100,9" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2.5" strokeLinecap="round" />
                                </>
                            ) : (
                                <path d="M 0,18 Q 30,24 60,14 T 100,9" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                            )}
                        </svg>
                    </div>
                </div>
            </div>

            {/* Middle Row: Bar Chart & Donut Chart - Dengan Animasi Card Lift & Scroll Reveal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Chart (Connected dynamically to selectedMetric) */}
                <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/60 shadow-xs flex flex-col justify-between card-lift scroll-reveal scroll-reveal-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700/60 mb-2 gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {metricChartData[selectedMetric].title}
                                </h3>
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 shadow-2xs">
                                    Aktif
                                </span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                                {metricChartData[selectedMetric].subtitle}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onSelectTab(metricChartData[selectedMetric].tabTarget)}
                                className="btn-press text-[11px] font-bold text-theme-primary hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-800"
                            >
                                {metricChartData[selectedMetric].tabName}
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <div className="relative">
                                <select
                                    value={chartPeriod}
                                    onChange={(e) => setChartPeriod(e.target.value)}
                                    className="appearance-none bg-gray-50 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 pr-7 text-[11px] font-bold text-gray-600 dark:text-gray-300 cursor-pointer focus:outline-none shadow-2xs"
                                >
                                    <option value="7 hari terakhir">7 hari terakhir</option>
                                    <option value="30 hari terakhir">30 hari terakhir</option>
                                </select>
                                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Clean Dynamic Bar Chart */}
                    <div className="relative pt-6">
                        <div className="flex">
                            {/* Y-Axis Guide Labels */}
                            <div className="flex flex-col justify-between text-[10px] text-gray-400 font-bold pr-3 h-48 select-none">
                                {metricChartData[selectedMetric].yLabels.map((lbl, idx) => (
                                    <span key={idx}>{lbl}</span>
                                ))}
                            </div>

                            {/* Bars Container */}
                            <div className="flex-1 flex items-end justify-between gap-3 sm:gap-6 h-48 border-b border-gray-100 dark:border-gray-700/60 pb-1 relative">
                                <div className="absolute inset-x-0 top-0 border-t border-dashed border-gray-100 dark:border-gray-700/40 pointer-events-none" />
                                <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-gray-100 dark:border-gray-700/40 pointer-events-none" />
                                <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-gray-100 dark:border-gray-700/40 pointer-events-none" />
                                <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-gray-100 dark:border-gray-700/40 pointer-events-none" />

                                {metricChartData[selectedMetric].bars.map((bar, i) => (
                                    <div key={`${selectedMetric}-${i}`} className="flex-1 flex flex-col items-center h-full justify-end z-10 group">
                                        <div className="w-full max-w-[28px] sm:max-w-[34px] flex items-end justify-center h-full">
                                            <div 
                                                className="w-full bg-theme-primary hover:bg-theme-primary-hover rounded-t-lg transition-all duration-300 relative cursor-pointer group-hover:brightness-110 origin-bottom shadow-xs shadow-sm animate-bar-grow"
                                                style={{ height: `${bar.height}%`, animationDelay: `${i * 0.08}s` }}
                                            >
                                                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-gray-900 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none z-20">
                                                    {bar.val}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 mt-2">
                                            {bar.day}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Chart: Donut Chart Distribusi Kategori */}
                <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/60 shadow-xs flex flex-col justify-between card-lift scroll-reveal scroll-reveal-right">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Distribusi Kategori Produk
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            Proporsi inventaris berdasarkan kategori barang
                        </p>
                    </div>

                    {/* Donut Chart & Legend */}
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto pt-4">
                        <div className="relative w-36 h-36 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="17" fill="none" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="2 3" className="animate-rotate-slow origin-center opacity-60" />
                                <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="5.5" className="dark:stroke-gray-700" />
                                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--brand-primary)" strokeWidth="5.5" strokeDasharray="35.2 88" strokeDashoffset="0" strokeLinecap="round" />
                                <circle cx="18" cy="18" r="14" fill="none" stroke="#60A5FA" strokeWidth="5.5" strokeDasharray="26.4 88" strokeDashoffset="-35.2" />
                                <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="5.5" strokeDasharray="17.6 88" strokeDashoffset="-61.6" />
                                <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="5.5" strokeDasharray="8.8 88" strokeDashoffset="-79.2" />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center text-center">
                                <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                    {products.length}
                                </span>
                                <span className="text-[9px] text-gray-400 font-medium">
                                    Total SKU
                                </span>
                            </div>
                        </div>

                        {/* Legend List */}
                        <div className="space-y-2.5 text-xs w-full sm:w-auto">
                            {[
                                { label: categories[0]?.name || 'Elektronik', pct: '40%', color: 'bg-theme-primary' },
                                { label: categories[1]?.name || 'Perkakas Listrik', pct: '30%', color: 'bg-[#60A5FA]' },
                                { label: categories[2]?.name || 'Bahan Bangunan', pct: '20%', color: 'bg-[#F59E0B]' },
                                { label: 'Kategori Lainnya', pct: '10%', color: 'bg-[#10B981]' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                                        <span className="text-gray-600 dark:text-gray-300 truncate max-w-[110px]">{item.label}</span>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white text-xs">{item.pct}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom 3 Mini Pill Cards - Dengan Animasi Card Lift & Scroll Reveal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Pill 1 */}
                <div className="card-lift-sm bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700/60 shadow-xs flex items-center gap-4 cursor-default scroll-reveal reveal-delay-100">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-theme-primary dark:text-blue-300 flex items-center justify-center shrink-0 shadow-xs">
                        <Headphones className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">Antrean Pemeriksaan</span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                                {pendingInTasks.length}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                                ▲ 3 <span className="font-normal text-gray-400 ms-1">vs kemarin</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pill 2 */}
                <div className="card-lift-sm bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700/60 shadow-xs flex items-center gap-4 cursor-default scroll-reveal reveal-delay-200">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">Akurasi Stok Opname</span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                                98.5%
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                                ▲ 4% <span className="font-normal text-gray-400 ms-1">vs kemarin</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pill 3 */}
                <div className="card-lift-sm bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700/60 shadow-xs flex items-center gap-4 cursor-default scroll-reveal reveal-delay-300">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/40 text-amber-500 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    </div>
                    <div>
                        <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">Efisiensi Operasional</span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                                4.8/5
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                                ▲ 0.2 <span className="font-normal text-gray-400 ms-1">vs bulan lalu</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aktivitas Pengguna Terbaru & Low Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Riwayat Transaksi & Aktivitas Pengguna (2 Cols) */}
                <div className="card-lift lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-xs dark:bg-gray-800 dark:border-gray-700 p-5 sm:p-6 scroll-reveal scroll-reveal-left">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
                        <h3 className="font-extrabold text-gray-900 dark:text-white text-base flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            Aktivitas Pengguna &amp; Mutasi Terbaru
                        </h3>
                        <button
                            type="button"
                            onClick={() => onSelectTab('transactions')}
                            className="btn-press text-xs text-blue-600 hover:text-blue-700 hover:underline font-bold cursor-pointer"
                        >
                            Lihat Semua Transaksi →
                        </button>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {transactions.slice(0, 5).map((trx, idx) => (
                            <div key={trx.id} className={`py-3 px-2 flex items-center justify-between text-xs hover:translate-x-1.5 hover:bg-gray-50/80 dark:hover:bg-gray-700/40 rounded-xl transition-all duration-150 cascade-${(idx % 5) + 1}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl shadow-2xs ${trx.type === 'in' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50'}`}>
                                        {trx.type === 'in' ? <ArrowDownToLine className="w-4 h-4" /> : <ArrowUpFromLine className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            {trx.user} ({trx.role.replace('_', ' ')}) mencatat {trx.type === 'in' ? 'penerimaan' : 'pengeluaran'} {trx.quantity} unit {trx.product}
                                        </div>
                                        <div className="text-[11px] text-gray-500 mt-0.5 font-medium">
                                            {trx.id} • {trx.date} • {trx.notes || 'Operasional gudang'}
                                        </div>
                                    </div>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                    {trx.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Peringatan Stok Menipis */}
                <div className="card-lift bg-white border border-gray-200 rounded-2xl shadow-xs dark:bg-gray-800 dark:border-gray-700 p-5 sm:p-6 scroll-reveal scroll-reveal-right">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
                        <h3 className="font-extrabold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 animate-heartbeat" />
                            Peringatan Stok Menipis
                        </h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold shadow-2xs">
                            {lowStockItems.length}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {lowStockItems.map((item, idx) => (
                            <div key={item.id} className={`card-lift-sm p-3 bg-gray-50/90 dark:bg-gray-750 rounded-xl border border-gray-200/80 dark:border-gray-700 cascade-${(idx % 4) + 1}`}>
                                <div className="flex justify-between items-center text-xs font-bold text-gray-900 dark:text-white">
                                    <span className="truncate max-w-[150px]">{item.name}</span>
                                    <span className="text-rose-600 font-extrabold">Sisa {item.current_stock} / min {item.minimum_stock}</span>
                                </div>
                                <div className="mt-2.5 flex justify-between items-center">
                                    <span className="text-[10px] font-mono text-gray-500 font-semibold">{item.sku}</span>
                                    <button
                                        type="button"
                                        onClick={() => onOpenRestock(item.id)}
                                        className="btn-press px-2.5 py-1 text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-theme-primary-hover hover:text-white cursor-pointer shadow-xs"
                                    >
                                        Restock
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


