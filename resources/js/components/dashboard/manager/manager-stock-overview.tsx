import React from 'react';
import {
    AlertTriangle,
    ArrowDownToLine,
    ArrowUpFromLine,
    Boxes,
    ClipboardCheck,
    Plus,
    FileText,
    ChevronRight,
    TrendingUp,
    Shield,
    Clock,
    CheckCircle2,
    ShoppingBag,
    Receipt,
    Wallet
} from 'lucide-react';

export interface ManagerLowStockItem {
    id: number;
    name: string;
    sku: string;
    current_stock: number;
    minimum_stock: number;
    category_name?: string;
    supplier_name?: string;
}

export interface ManagerTransactionItem {
    id: string;
    product: string;
    quantity: number;
    date: string;
    type: string;
    user: string;
    role: string;
    status: string;
    notes: string | null;
}

interface ManagerStockOverviewProps {
    stats: {
        total_products: number;
        low_stock_count: number;
        today_stock_in: number;
        today_stock_out: number;
        total_stock_in: number;
        total_stock_out: number;
    };
    lowStockItems: ManagerLowStockItem[];
    transactions: ManagerTransactionItem[];
    pendingOrdersCount?: number;
    onSelectTab: (tab: string) => void;
    onOpenRestock: (productId?: number) => void;
    onOpenStockOut: () => void;
    onOpenOpname: (productId?: number) => void;
}

export function ManagerStockOverview({
    stats,
    lowStockItems = [],
    transactions = [],
    pendingOrdersCount = 0,
    onSelectTab,
    onOpenRestock,
    onOpenStockOut,
    onOpenOpname,
}: ManagerStockOverviewProps) {
    // Transaksi hari ini atau mutasi terbaru
    const recentMovements = transactions.slice(0, 6);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Card Manajer Gudang */}
            <div className="card-lift p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md border border-blue-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Manajer Gudang
                        </span>
                        <span className="text-xs text-blue-200">Panel Monitoring & Logistik Stok</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                        Ringkasan Stok & Arus Barang Gudang
                    </h2>
                    <p className="text-xs text-blue-200/80 max-w-xl">
                        Pantau inventaris kritis di bawah ambang batas minimum, catat penerimaan barang dari pemasok, dan atur pengeluaran barang secara akurat.
                    </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => onOpenRestock()}
                        className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                        Catat Barang Masuk
                    </button>
                    <button
                        type="button"
                        onClick={onOpenStockOut}
                        className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                        <ArrowUpFromLine className="w-3.5 h-3.5" />
                        Catat Barang Keluar
                    </button>
                    <button
                        type="button"
                        onClick={() => onOpenOpname()}
                        className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                        <ClipboardCheck className="w-3.5 h-3.5 text-amber-300" />
                        Stock Opname
                    </button>
                    <button
                        type="button"
                        onClick={() => onSelectTab('cash_flow')}
                        className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 rounded-xl shadow-xs transition-colors cursor-pointer"
                        title="Buka Buku Kas & Laporan Arus Kas Gudang"
                    >
                        <Wallet className="w-3.5 h-3.5 text-emerald-800" />
                        Buku Kas
                    </button>
                </div>
            </div>

            {/* NOTIFIKASI PESANAN CUSTOMER MENUNGGU VERIFIKASI BUKTI TRANSFER (KHUSUS MANAJER GUDANG) */}
            {pendingOrdersCount > 0 && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                <span>{pendingOrdersCount} Pesanan Baru Menunggu Verifikasi Bukti Transaksi</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 animate-pulse">
                                    Perlu Tindakan
                                </span>
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                Pelanggan telah mengirimkan pesanan dan melampirkan bukti transfer. Periksa bukti dan sahkan pesanan untuk memotong stok fisik.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onSelectTab('orders_management')}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                    >
                        <Receipt className="w-4 h-4" />
                        <span>Periksa Bukti & Konfirmasi →</span>
                    </button>
                </div>
            )}

            {/* 3 KARTU UTAMA SESUAI KETENTUAN: STOK MENIPIS, BARANG MASUK HARI INI, BARANG KELUAR HARI INI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. STOK MENIPIS */}
                <div
                    onClick={() => onSelectTab('products')}
                    className="card-lift bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 border-amber-200 dark:border-amber-900/60 shadow-xs hover:border-amber-400 transition-all cursor-pointer relative overflow-hidden group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" />
                            Stok Menipis & Kritis
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                            <Boxes className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                        <div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white">
                                {stats.low_stock_count}
                                <span className="text-xs font-medium text-gray-400 ms-1.5">SKU Produk</span>
                            </div>
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
                                {stats.low_stock_count > 0 ? 'Segera lakukan restock ke supplier' : 'Seluruh stok dalam batas aman'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-semibold group-hover:translate-x-1 transition-transform">
                        <span>Lihat daftar produk menipis</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>

                {/* 2. BARANG MASUK HARI INI */}
                <div
                    onClick={() => onSelectTab('transactions')}
                    className="card-lift bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 border-emerald-200 dark:border-emerald-900/60 shadow-xs hover:border-emerald-400 transition-all cursor-pointer relative overflow-hidden group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <ArrowDownToLine className="w-4 h-4" />
                            Barang Masuk Hari Ini
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                        <div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white">
                                {stats.today_stock_in}
                                <span className="text-xs font-medium text-gray-400 ms-1.5">Unit Diterima</span>
                            </div>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                                Total mutasi masuk: {stats.total_stock_in} unit
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-semibold group-hover:translate-x-1 transition-transform">
                        <span>Lihat riwayat penerimaan barang</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>

                {/* 3. BARANG KELUAR HARI INI */}
                <div
                    onClick={() => onSelectTab('transactions')}
                    className="card-lift bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 border-blue-200 dark:border-blue-900/60 shadow-xs hover:border-blue-400 transition-all cursor-pointer relative overflow-hidden group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                            <ArrowUpFromLine className="w-4 h-4" />
                            Barang Keluar Hari Ini
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                            <Boxes className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                        <div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white">
                                {stats.today_stock_out}
                                <span className="text-xs font-medium text-gray-400 ms-1.5">Unit Keluar</span>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                                Total mutasi keluar: {stats.total_stock_out} unit
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-semibold group-hover:translate-x-1 transition-transform">
                        <span>Lihat riwayat pengeluaran barang</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* SPLIT SECTION: DAFTAR STOK MENIPIS & MUTASI TERBARU */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Tabel / Card List Stok Menipis (7 Kolom) */}
                <div className="lg:col-span-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/40 text-amber-600 rounded-xl">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">
                                    Daftar Barang Stok Menipis
                                </h3>
                                <p className="text-xs text-gray-400">
                                    Produk dengan sisa unit sama atau di bawah stok minimum
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onSelectTab('products')}
                            className="text-xs font-bold text-theme-primary hover:underline cursor-pointer"
                        >
                            Katalog Produk →
                        </button>
                    </div>

                    {lowStockItems.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Seluruh Stok Aman!
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Tidak ada produk yang berada di bawah ambang batas minimum saat ini.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                            {lowStockItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-3 bg-gray-50/80 dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 dark:text-white text-xs">
                                                {item.name}
                                            </span>
                                            <span className="text-[10px] font-mono px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                                                {item.sku}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                                            <span>Kategori: {item.category_name || '-'}</span>
                                            <span>•</span>
                                            <span>Supplier: {item.supplier_name || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                                Sisa: {item.current_stock} Unit
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                Batas Min: {item.minimum_stock} Unit
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => onOpenRestock(item.id)}
                                                className="btn-press px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-600 hover:text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
                                                title="Catat Barang Masuk untuk produk ini"
                                            >
                                                + Masuk
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onOpenOpname(item.id)}
                                                className="btn-press px-2.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-600 hover:text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
                                                title="Lakukan Pemeriksaan Fisik (Opname)"
                                            >
                                                Opname
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mutasi & Riwayat Transaksi Terbaru (5 Kolom) */}
                <div className="lg:col-span-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-xl">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">
                                    Aktivitas Transaksi Terbaru
                                </h3>
                                <p className="text-xs text-gray-400">
                                    Catatan masuk & keluar gudang
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onSelectTab('transactions')}
                            className="text-xs font-bold text-theme-primary hover:underline cursor-pointer"
                        >
                            Semua Transaksi →
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                        {recentMovements.length === 0 ? (
                            <p className="text-center text-xs text-gray-400 py-10">Belum ada transaksi tercatat hari ini.</p>
                        ) : (
                            recentMovements.map((trx) => (
                                <div
                                    key={trx.id}
                                    className="p-3 bg-gray-50/70 dark:bg-gray-750/70 rounded-xl border border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-3 text-xs"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={`p-2 rounded-xl shrink-0 ${trx.type === 'in'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50'
                                            }`}>
                                            {trx.type === 'in' ? (
                                                <ArrowDownToLine className="w-3.5 h-3.5" />
                                            ) : (
                                                <ArrowUpFromLine className="w-3.5 h-3.5" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white truncate max-w-[170px]">
                                                {trx.product}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                {trx.type === 'in' ? 'Masuk' : 'Keluar'} • {trx.quantity} Unit • {trx.date}
                                            </div>
                                        </div>
                                    </div>

                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${trx.status === 'completed'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                                        }`}>
                                        {trx.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

