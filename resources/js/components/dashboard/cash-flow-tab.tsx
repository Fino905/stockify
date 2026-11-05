import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    Wallet, 
    ArrowDownLeft, 
    ArrowUpRight, 
    Plus, 
    Search, 
    Filter, 
    Calendar, 
    Receipt, 
    TrendingUp, 
    TrendingDown, 
    Building2, 
    Truck, 
    RotateCcw, 
    Zap, 
    ShoppingBag, 
    DollarSign, 
    Printer, 
    Trash2, 
    X, 
    Camera, 
    UploadCloud, 
    ExternalLink, 
    Image as ImageIcon,
    CheckCircle2,
    Clock,
    FileText,
    AlertCircle
} from 'lucide-react';
import { CameraCaptureModal } from '@/components/common/camera-capture-modal';

export interface CashTransactionItem {
    id: number;
    transaction_number: string;
    type: 'in' | 'out';
    category: string;
    amount: number;
    date: string;
    date_formatted: string;
    description: string;
    proof_image?: string | null;
    notes?: string | null;
    user_name: string;
    order_id?: number | null;
    order_number?: string | null;
    created_at: string;
}

interface CashFlowTabProps {
    cashTransactions?: CashTransactionItem[];
    stats?: {
        total_cash_in?: number;
        total_cash_out?: number;
        net_cash_balance?: number;
        month_cash_in?: number;
        month_cash_out?: number;
        today_cash_in?: number;
        today_cash_out?: number;
    };
    currentUser?: any;
}

export function CashFlowTab({ 
    cashTransactions = [], 
    stats = {}, 
    currentUser 
}: CashFlowTabProps) {
    const isStaffGudang = currentUser?.role === 'staff_gudang';

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out'>('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | '7days' | 'this_month' | 'this_year'>('all');

    // Modal Form State
    const [showModal, setShowModal] = useState(false);
    const [formType, setFormType] = useState<'in' | 'out'>('out');
    const [formCategory, setFormCategory] = useState('operasional');
    const [formAmount, setFormAmount] = useState('');
    const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [formDescription, setFormDescription] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal Bukti Preview State
    const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
    const [selectedProofTitle, setSelectedProofTitle] = useState<string>('');

    // Modal Kamera State
    const [showCameraModal, setShowCameraModal] = useState(false);

    // Preset Kategori
    const outCategories = isStaffGudang ? [
        { id: 'operasional', label: 'Biaya Operasional Gudang (Token Listrik, Galon Air, Wifi)' },
        { id: 'kemasan', label: 'Bahan Kemasan (Bubble Wrap, Lakban, Kardus, Plastik)' },
        { id: 'transportasi', label: 'Transportasi Gudang & Bensin (BBM)' },
        { id: 'perawatan', label: 'Servis / Perkakas / Alat Tulis Gudang' },
        { id: 'lainnya', label: 'Kas Kecil Operasional Lainnya' },
    ] : [
        { id: 'operasional', label: 'Biaya Operasional (Listrik, Air, Wifi)' },
        { id: 'kemasan', label: 'Bahan Kemasan (Bubble Wrap, Lakban, Kardus)' },
        { id: 'supplier', label: 'Pembayaran ke Supplier / Pemasok' },
        { id: 'gaji', label: 'Gaji / Upah Karyawan & Kurir' },
        { id: 'sewa', label: 'Sewa Gudang & Tempat' },
        { id: 'transportasi', label: 'Transportasi & Bahan Bakar (BBM)' },
        { id: 'perawatan', label: 'Perawatan & Servis Alat Gudang' },
        { id: 'refund', label: 'Pengembalian Dana (Refund Customer)' },
        { id: 'lainnya', label: 'Pengeluaran Lainnya' },
    ];

    const inCategories = [
        { id: 'penjualan', label: 'Penjualan Produk (Pesanan Pelanggan)' },
        { id: 'modal', label: 'Suntikan Modal Tambahan' },
        { id: 'klaim_supplier', label: 'Pengembalian / Klaim dari Supplier' },
        { id: 'lainnya', label: 'Pemasukan Lainnya' },
    ];

    const activeCategoryList = formType === 'out' ? outCategories : inCategories;

    const handleOpenModal = (type: 'in' | 'out') => {
        const targetType = isStaffGudang ? 'out' : type;
        setFormType(targetType);
        setFormCategory(targetType === 'in' ? 'penjualan' : 'operasional');
        setFormAmount('');
        setFormDate(new Date().toISOString().split('T')[0]);
        setFormDescription('');
        setFormNotes('');
        setProofFile(null);
        setProofPreview(null);
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(formAmount.replace(/[^0-9.]/g, ''));
        if (!numAmount || numAmount <= 0) {
            alert('Silakan masukkan jumlah nominal uang yang valid.');
            return;
        }

        if (isStaffGudang && numAmount > 500000) {
            alert('Nominal pengeluaran melebihi plafon kas kecil staf gudang (Maksimal Rp 500.000 per transaksi/nota). Pengeluaran bernilai di atas Rp 500.000 wajib dicatat dan disetujui langsung oleh Manajer Gudang.');
            return;
        }

        setIsSubmitting(true);
        router.post('/cash-transactions', {
            type: formType,
            category: formCategory,
            amount: numAmount,
            date: formDate,
            description: formDescription,
            notes: formNotes,
            proof_image: proofFile,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowModal(false);
                setIsSubmitting(false);
                setProofFile(null);
                setProofPreview(null);
            },
            onError: (errs) => {
                setIsSubmitting(false);
                const first = Object.values(errs)[0];
                alert(first || 'Terjadi kesalahan saat menyimpan catatan kas.');
            }
        });
    };

    const handleDelete = (item: CashTransactionItem) => {
        if (!confirm(`Hapus catatan kas #${item.transaction_number} sebesar Rp ${item.amount.toLocaleString('id-ID')}?`)) return;

        router.delete(`/cash-transactions/${item.id}`, {
            preserveScroll: true,
        });
    };

    // Filter Logic
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const thisMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisYearPrefix = `${now.getFullYear()}`;

    const filteredTransactions = cashTransactions.filter((item) => {
        // Filter Jenis
        if (typeFilter !== 'all' && item.type !== typeFilter) return false;

        // Filter Kategori
        if (categoryFilter !== 'all' && !item.category.toLowerCase().includes(categoryFilter.toLowerCase())) return false;

        // Filter Periode
        if (periodFilter === 'today' && item.date !== todayStr) return false;
        if (periodFilter === '7days' && item.date < sevenDaysAgo) return false;
        if (periodFilter === 'this_month' && !item.date.startsWith(thisMonthPrefix)) return false;
        if (periodFilter === 'this_year' && !item.date.startsWith(thisYearPrefix)) return false;

        // Search Query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchNumber = (item.transaction_number || '').toLowerCase().includes(q);
            const matchDesc = (item.description || '').toLowerCase().includes(q);
            const matchCategory = (item.category || '').toLowerCase().includes(q);
            const matchUser = (item.user_name || '').toLowerCase().includes(q);
            const matchOrder = (item.order_number || '').toLowerCase().includes(q);
            return matchNumber || matchDesc || matchCategory || matchUser || matchOrder;
        }

        return true;
    });

    // Kalkulasi totals berdasarkan filtered data
    const filteredIn = filteredTransactions.where ? 0 : filteredTransactions.filter(t => t.type === 'in').reduce((acc, c) => acc + c.amount, 0);
    const filteredOut = filteredTransactions.where ? 0 : filteredTransactions.filter(t => t.type === 'out').reduce((acc, c) => acc + c.amount, 0);
    const filteredNet = filteredIn - filteredOut;

    const totalCashIn = stats.total_cash_in ?? cashTransactions.filter(t => t.type === 'in').reduce((acc, c) => acc + c.amount, 0);
    const totalCashOut = stats.total_cash_out ?? cashTransactions.filter(t => t.type === 'out').reduce((acc, c) => acc + c.amount, 0);
    const netCashBalance = stats.net_cash_balance ?? (totalCashIn - totalCashOut);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Utama & Tombol Aksi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Buku Kas & Laporan Arus Kas Gudang
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Pencatatan uang masuk (penjualan, modal) dan uang keluar (pembelian supplier, operasional, refund) lengkap dengan bukti struk.
                    </p>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="btn-press px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 font-semibold rounded-xl text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Cetak laporan arus kas saat ini"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Laporan</span>
                    </button>
                    {currentUser?.role !== 'staff_gudang' && (
                        <button
                            type="button"
                            onClick={() => handleOpenModal('in')}
                            className="btn-press px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                            <ArrowDownLeft className="w-4 h-4" />
                            <span>+ Catat Kas Masuk</span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => handleOpenModal('out')}
                        className="btn-press px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                        <ArrowUpRight className="w-4 h-4" />
                        <span>{currentUser?.role === 'staff_gudang' ? '+ Catat Kas Kecil (Operasional)' : '+ Catat Pengeluaran'}</span>
                    </button>
                </div>
            </div>

            {/* Ringkasan Finansial KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Saldo Kas Bersih (Net Cash) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-gray-800 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            Saldo Kas Tersedia
                        </span>
                        <div className={`p-2 rounded-xl ${netCashBalance >= 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-600'}`}>
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>
                    <div className={`text-xl font-black mt-2 font-mono ${netCashBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                        Rp {netCashBalance.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                        <span className={`font-bold ${netCashBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {netCashBalance >= 0 ? '● Surplus Kas' : '● Defisit Kas'}
                        </span>
                        <span>(Total In - Total Out)</span>
                    </div>
                </div>

                {/* 2. Total Uang Masuk */}
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            Total Uang Masuk
                        </span>
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-xl font-black mt-2 font-mono text-gray-900 dark:text-white">
                        Rp {totalCashIn.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                        Penjualan produk &amp; modal kas masuk
                    </div>
                </div>

                {/* 3. Total Uang Keluar */}
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            Total Pengeluaran
                        </span>
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                            <TrendingDown className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-xl font-black mt-2 font-mono text-rose-600 dark:text-rose-400">
                        Rp {totalCashOut.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                        Operasional, supplier &amp; refund
                    </div>
                </div>

                {/* 4. Performa Bulan Ini */}
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            Bulan Ini ({now.toLocaleString('id-ID', { month: 'short' })})
                        </span>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                            <Calendar className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between mt-2 font-mono text-xs">
                        <span className="text-emerald-600 font-bold">
                            + Rp {(stats.month_cash_in ?? 0).toLocaleString('id-ID')}
                        </span>
                        <span className="text-rose-500 font-bold">
                            - Rp {(stats.month_cash_out ?? 0).toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1 pt-1 border-t border-gray-100 dark:border-gray-700 flex justify-between font-mono">
                        <span>Net Bulan Ini:</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                            Rp {((stats.month_cash_in ?? 0) - (stats.month_cash_out ?? 0)).toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari no. kas, deskripsi, kategori, petugas..."
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Filter Jenis Kas */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 font-medium"
                    >
                        <option value="all">Semua Jenis (Masuk &amp; Keluar)</option>
                        <option value="in">Kas Masuk Saja (+)</option>
                        <option value="out">Kas Keluar Saja (-)</option>
                    </select>

                    {/* Filter Kategori */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 font-medium"
                    >
                        <option value="all">Semua Kategori</option>
                        <option value="penjualan">Penjualan Customer</option>
                        <option value="operasional">Biaya Operasional</option>
                        <option value="supplier">Pembayaran Supplier</option>
                        <option value="refund">Refund Pelanggan</option>
                        <option value="kemasan">Kemasan &amp; Packing</option>
                        <option value="gaji">Gaji &amp; Upah</option>
                        <option value="modal">Modal Tambahan</option>
                    </select>

                    {/* Filter Periode */}
                    <select
                        value={periodFilter}
                        onChange={(e) => setPeriodFilter(e.target.value as any)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 font-medium"
                    >
                        <option value="all">Semua Periode</option>
                        <option value="today">Hari Ini</option>
                        <option value="7days">7 Hari Terakhir</option>
                        <option value="this_month">Bulan Ini</option>
                        <option value="this_year">Tahun Ini</option>
                    </select>
                </div>

                {/* Indikator Hasil Filter */}
                <div className="text-xs text-gray-500 shrink-0 font-medium">
                    Menampilkan <strong className="text-gray-900 dark:text-white">{filteredTransactions.length}</strong> transaksi 
                    <span className="hidden sm:inline"> (Net: <strong className={filteredNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}>Rp {filteredNet.toLocaleString('id-ID')}</strong>)</span>
                </div>
            </div>

            {/* Tabel Transaksi Kas */}
            {filteredTransactions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                        Belum Ada Catatan Transaksi Kas
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                        Klik tombol <strong>+ Catat Kas Masuk</strong> atau <strong>+ Catat Pengeluaran</strong> untuk mulai membukukan arus keuangan gudang Anda.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase font-semibold text-[11px] border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="p-4">No. Transaksi &amp; Tanggal</th>
                                    <th className="p-4">Jenis &amp; Kategori</th>
                                    <th className="p-4">Keterangan / Keperluan</th>
                                    <th className="p-4">Petugas Pencatat</th>
                                    <th className="p-4 text-right">Nominal (Rp)</th>
                                    <th className="p-4 text-center">Bukti Nota</th>
                                    <th className="p-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredTransactions.map((trx) => {
                                    const isIncome = trx.type === 'in';

                                    return (
                                        <tr key={trx.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-750 transition-colors">
                                            {/* No Transaksi & Tanggal */}
                                            <td className="p-4">
                                                <div className="font-mono font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                    <span>{trx.transaction_number}</span>
                                                    {trx.order_number && (
                                                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-normal">
                                                            #{trx.order_number}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{trx.date_formatted}</span>
                                                </div>
                                            </td>

                                            {/* Jenis & Kategori */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        isIncome 
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                                                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                                    }`}>
                                                        {isIncome ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                                        {isIncome ? 'Kas Masuk' : 'Pengeluaran'}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1 capitalize">
                                                    {trx.category.replace(/_/g, ' ')}
                                                </div>
                                            </td>

                                            {/* Deskripsi */}
                                            <td className="p-4 max-w-xs sm:max-w-md">
                                                <div className="font-medium text-gray-900 dark:text-white leading-relaxed">
                                                    {trx.description}
                                                </div>
                                                {trx.notes && (
                                                    <div className="text-[11px] text-gray-400 italic mt-0.5">
                                                        {trx.notes}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Petugas */}
                                            <td className="p-4 text-gray-600 dark:text-gray-300 font-medium">
                                                {trx.user_name}
                                            </td>

                                            {/* Nominal */}
                                            <td className="p-4 text-right">
                                                <span className={`font-mono text-sm font-bold ${
                                                    isIncome 
                                                        ? 'text-emerald-600 dark:text-emerald-400' 
                                                        : 'text-rose-600 dark:text-rose-400'
                                                }`}>
                                                    {isIncome ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                                                </span>
                                            </td>

                                            {/* Bukti Nota / Resi */}
                                            <td className="p-4 text-center">
                                                {trx.proof_image ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedProofUrl(trx.proof_image || null);
                                                            setSelectedProofTitle(`Bukti Transaksi #${trx.transaction_number} - Rp ${trx.amount.toLocaleString('id-ID')}`);
                                                        }}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                                                        title="Lihat foto bukti kuitansi / struk"
                                                    >
                                                        <Receipt className="w-3.5 h-3.5" />
                                                        <span>Lihat Struk</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-gray-400 italic">
                                                        Tanpa lampiran
                                                    </span>
                                                )}
                                            </td>

                                            {/* Aksi Hapus */}
                                            <td className="p-4 text-center">
                                                {currentUser?.role !== 'staff_gudang' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(trx)}
                                                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                                                        title="Hapus catatan kas ini"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 italic">Terkunci</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL TAMBAH CATATAN ARUS KAS (MODAL FORM) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[92vh] flex flex-col animate-in zoom-in-95">
                        {/* Header Modal */}
                        <div className={`p-4 text-white flex items-center justify-between ${
                            formType === 'in' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-rose-600 to-indigo-600'
                        }`}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shadow-xs">
                                    {formType === 'in' ? <ArrowDownLeft className="w-5 h-5 text-white" /> : <ArrowUpRight className="w-5 h-5 text-white" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">
                                        {formType === 'in' ? 'Catat Uang Kas Masuk (+)' : 'Catat Pengeluaran Kas (-)'}
                                    </h3>
                                    <p className="text-[11px] text-white/80">
                                        Pembukuan keuangan resmi gudang Stockify
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
                            {/* Notice Plafon Kas Kecil Staf Gudang */}
                            {isStaffGudang && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold">Ketentuan Plafon Kas Kecil Staf Gudang:</p>
                                        <p className="text-[11px] mt-0.5">
                                            Batas pengeluaran operasional / kas kecil staf gudang adalah <strong>Maksimal Rp 500.000</strong> per nota/transaksi. Nota struk wajib dilampirkan. Pengeluaran di atas Rp 500.000 wajib diajukan dan dicatat oleh Manajer Gudang.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Switch Jenis Kas */}
                            <div>
                                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Tipe Transaksi *
                                </label>
                                {isStaffGudang ? (
                                    <div className="py-2.5 px-3 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <ArrowUpRight className="w-4 h-4 text-rose-600" />
                                            <span>Pengeluaran Kas Kecil Gudang (-)</span>
                                        </div>
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-rose-200 dark:border-rose-700 text-rose-600 dark:text-rose-400">
                                            Plafon Maks. Rp 500.000
                                        </span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormType('in');
                                                setFormCategory('penjualan');
                                            }}
                                            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                                formType === 'in'
                                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-600 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                                            }`}
                                        >
                                            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                                            <span>Kas Masuk (+)</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormType('out');
                                                setFormCategory('operasional');
                                            }}
                                            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                                formType === 'out'
                                                    ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950 dark:border-rose-600 dark:text-rose-300 shadow-xs ring-1 ring-rose-500'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                                            }`}
                                        >
                                            <ArrowUpRight className="w-4 h-4 text-rose-600" />
                                            <span>Pengeluaran (-)</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Kategori Kas */}
                            <div>
                                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Kategori {formType === 'in' ? 'Pemasukan' : 'Pengeluaran'} *
                                </label>
                                <select
                                    value={formCategory}
                                    onChange={(e) => setFormCategory(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-medium"
                                    required
                                >
                                    {activeCategoryList.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Jumlah Nominal (Rp) & Tanggal */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Nominal Uang (Rp) *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            min="1"
                                            max={isStaffGudang ? 500000 : undefined}
                                            step="any"
                                            required
                                            value={formAmount}
                                            onChange={(e) => setFormAmount(e.target.value)}
                                            placeholder={isStaffGudang ? "Contoh: 150000 (Maks 500.000)" : "500000"}
                                            className={`w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-xl font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                                                isStaffGudang && parseFloat(formAmount) > 500000
                                                    ? 'border-rose-500 focus:ring-rose-500 bg-rose-50/40 text-rose-700'
                                                    : 'border-gray-200 dark:border-gray-600 focus:ring-emerald-500'
                                            }`}
                                        />
                                    </div>
                                    {isStaffGudang && parseFloat(formAmount) > 500000 && (
                                        <div className="text-[11px] text-rose-600 font-semibold mt-1 flex items-start gap-1">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                            <span>Melebihi plafon kas kecil staf (Maksimal Rp 500.000). Minta Manajer Gudang untuk membukukan transaksi ini.</span>
                                        </div>
                                    )}
                                    {formAmount && parseFloat(formAmount) > 0 && (!isStaffGudang || parseFloat(formAmount) <= 500000) && (
                                        <div className="text-[10px] text-gray-400 mt-1 font-mono">
                                            = Rp {parseFloat(formAmount).toLocaleString('id-ID')}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Tanggal Transaksi *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formDate}
                                        onChange={(e) => setFormDate(e.target.value)}
                                        className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-medium text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Deskripsi Transaksi */}
                            <div>
                                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Deskripsi / Rincian Keperluan *
                                </label>
                                <textarea
                                    rows={2}
                                    required
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder={
                                        formType === 'in'
                                            ? "Contoh: Penerimaan pembayaran grosir offline dari Toko Maju Jaya"
                                            : "Contoh: Pembelian 3 roll bubble wrap dan 100 pcs kardus packing di Toko Plastik"
                                    }
                                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Catatan Tambahan (Opsional) */}
                            <div>
                                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Catatan Tambahan (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={formNotes}
                                    onChange={(e) => setFormNotes(e.target.value)}
                                    placeholder="Contoh: No. Resi Bank / Nama Rekening / Kontak Toko"
                                    className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Lampiran Bukti / Struk / Foto Nota (File atau Buka Kamera Live) */}
                            <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                        <Receipt className="w-4 h-4 text-emerald-600" />
                                        Lampiran Bukti Nota / Kuitansi
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowCameraModal(true)}
                                        className="px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold rounded-lg border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
                                        title="Jepret foto nota langsung dari kamera"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                        <span>Buka Kamera</span>
                                    </button>
                                </div>

                                {proofPreview ? (
                                    <div className="relative border-2 border-emerald-400 dark:border-emerald-600 rounded-xl p-2.5 bg-white dark:bg-gray-800 flex items-center gap-3">
                                        <img
                                            src={proofPreview}
                                            alt="Pratinjau Bukti"
                                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                                                {proofFile ? proofFile.name : 'Bukti Foto Terlampir'}
                                            </p>
                                            <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                                                ✓ Foto struk siap disimpan
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProofFile(null);
                                                    setProofPreview(null);
                                                }}
                                                className="text-[11px] text-rose-500 hover:text-rose-700 mt-1 cursor-pointer font-medium"
                                            >
                                                Hapus / Ganti Foto
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all text-center">
                                        <UploadCloud className="w-5 h-5 text-gray-400 mb-1" />
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            Pilih Foto Struk / Nota Fisik
                                        </span>
                                        <span className="text-[10px] text-gray-400 mt-0.5">
                                            JPG, PNG, atau WEBP (Maksimal 5MB)
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) {
                                                    setProofFile(f);
                                                    setProofPreview(URL.createObjectURL(f));
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Tombol Simpan Form */}
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-xl font-semibold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || (isStaffGudang && parseFloat(formAmount) > 500000)}
                                    className={`px-5 py-2 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors ${
                                        formType === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan ke Buku Kas'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL ZOOM PREVIEW FOTO BUKTI / STRUK */}
            {selectedProofUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50/70 dark:bg-gray-850">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate max-w-[260px]">
                                        {selectedProofTitle || 'Bukti Struk Transaksi'}
                                    </h3>
                                    <p className="text-[11px] text-gray-500">
                                        Dokumentasi pembukuan kas gudang
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedProofUrl(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto space-y-3 flex flex-col items-center justify-center">
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-950/5 dark:bg-gray-900/30 p-2 flex items-center justify-center max-h-96 w-full">
                                <img
                                    src={selectedProofUrl}
                                    alt="Foto Bukti Struk"
                                    className="max-h-88 object-contain rounded-lg"
                                />
                            </div>

                            <div className="w-full flex justify-end">
                                <a
                                    href={selectedProofUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" /> Buka Foto Resolusi Penuh
                                </a>
                            </div>
                        </div>

                        <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedProofUrl(null)}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL KAMERA LIVE UNTUK JEPRET NOTA FISIK */}
            <CameraCaptureModal
                isOpen={showCameraModal}
                onClose={() => setShowCameraModal(false)}
                onCapture={(file, previewUrl) => {
                    setProofFile(file);
                    setProofPreview(previewUrl);
                }}
                title="Ambil Foto Nota / Struk Pembayaran"
                fileNamePrefix="nota-kas"
            />
        </div>
    );
}

