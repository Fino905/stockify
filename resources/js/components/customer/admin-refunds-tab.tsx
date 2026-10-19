import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    RotateCcw, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    AlertCircle, 
    Search, 
    Package, 
    X, 
    Check, 
    ShieldAlert,
    ArrowUpFromLine
} from 'lucide-react';

interface RefundItem {
    id: number;
    order_id: number;
    order_number: string;
    product_name: string;
    quantity: number;
    total_price: number;
    customer_name: string;
    customer_email: string;
    reason: string;
    description: string | null;
    status: string;
    admin_notes: string | null;
    processor_name: string;
    created_at: string;
}

interface Props {
    refundRequests: RefundItem[];
}

export function AdminRefundsTab({ refundRequests = [] }: Props) {
    const [selectedRefundForAction, setSelectedRefundForAction] = useState<RefundItem | null>(null);
    const [actionType, setActionType] = useState<'approved' | 'rejected'>('approved');
    const [adminNotes, setAdminNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleOpenAction = (refund: RefundItem, type: 'approved' | 'rejected') => {
        setSelectedRefundForAction(refund);
        setActionType(type);
        setAdminNotes(
            type === 'approved' 
                ? 'Barang telah diterima kembali di gudang dalam kondisi sesuai. Stok otomatis direstok.' 
                : 'Mohon maaf, pengajuan refund tidak memenuhi kriteria retur gudang.'
        );
    };

    const handleConfirmProcess = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRefundForAction) return;

        setIsSubmitting(true);
        router.patch(`/refunds/${selectedRefundForAction.id}/process`, {
            status: actionType,
            admin_notes: adminNotes,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsSubmitting(false);
                setSelectedRefundForAction(null);
            },
        });
    };

    const filtered = refundRequests.filter((r) => 
        r.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reason.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingCount = refundRequests.filter(r => r.status === 'pending').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <RotateCcw className="w-5 h-5 text-rose-600" />
                        Pusat Persetujuan Refund & Retur Barang
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Tinjau permohonan retur dari customer. Menyetujui refund akan <strong>mengembalikan stok produk secara otomatis</strong> ke gudang.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {pendingCount} Menunggu Konfirmasi
                    </span>
                </div>
            </div>

            {/* Filter Search */}
            <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari no. order, pembeli, atau barang..."
                    className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white"
                />
            </div>

            {/* List Table */}
            {filtered.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                    <CheckCircle2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Tidak ada pengajuan refund</h3>
                    <p className="text-xs text-gray-500 mt-1">Seluruh pesanan pelanggan berjalan dengan lancar tanpa ada keluhan retur.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase font-semibold text-[11px] border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="p-4">No. Order & Tanggal</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Produk yang Diretur</th>
                                    <th className="p-4">Alasan & Keluhan</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center">Tindakan Staff Gudang</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.map((refund) => (
                                    <tr key={refund.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/40 transition-colors">
                                        <td className="p-4">
                                            <div className="font-mono font-bold text-rose-600 dark:text-rose-400">
                                                #{refund.order_number}
                                            </div>
                                            <div className="text-[11px] text-gray-400 mt-0.5">
                                                {refund.created_at}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {refund.customer_name}
                                            </div>
                                            <div className="text-[11px] text-gray-400">
                                                {refund.customer_email}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {refund.product_name}
                                            </div>
                                            <div className="text-[11px] text-blue-600 font-semibold">
                                                Jumlah: {refund.quantity} Unit (Rp {refund.total_price.toLocaleString('id-ID')})
                                            </div>
                                        </td>

                                        <td className="p-4 max-w-xs">
                                            <div className="font-semibold text-rose-600 dark:text-rose-400">
                                                {refund.reason}
                                            </div>
                                            {refund.description && (
                                                <div className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 italic">
                                                    "{refund.description}"
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            {refund.status === 'pending' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
                                                    <Clock className="w-3 h-3" />
                                                    Menunggu
                                                </span>
                                            )}
                                            {refund.status === 'approved' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Disetujui (Restok)
                                                </span>
                                            )}
                                            {refund.status === 'rejected' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">
                                                    <XCircle className="w-3 h-3" />
                                                    Ditolak
                                                </span>
                                            )}
                                            {refund.processor_name !== '-' && (
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    Oleh: {refund.processor_name}
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-4 text-center">
                                            {refund.status === 'pending' ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenAction(refund, 'approved')}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                                                        title="Setujui refund dan otomatis kembalikan stok ke gudang"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                        Setujui & Restok
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenAction(refund, 'rejected')}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-1 cursor-pointer transition-all"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                        Tolak
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-gray-400">
                                                    Selesai Diproses
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Persetujuan / Penolakan */}
            {selectedRefundForAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                {actionType === 'approved' ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        Konfirmasi Persetujuan Refund
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4 text-rose-600" />
                                        Konfirmasi Penolakan Refund
                                    </>
                                )}
                            </h3>
                            <button
                                onClick={() => setSelectedRefundForAction(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmProcess} className="space-y-4 pt-4">
                            <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                                actionType === 'approved' 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-900 dark:text-emerald-200' 
                                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-900 dark:text-rose-200'
                            }`}>
                                <div className="font-bold">
                                    Pesanan #{selectedRefundForAction.order_number} ({selectedRefundForAction.customer_name})
                                </div>
                                <div>
                                    Produk: <strong>{selectedRefundForAction.product_name}</strong>
                                </div>
                                <div>
                                    Jumlah: <strong>{selectedRefundForAction.quantity} unit</strong> (Rp {selectedRefundForAction.total_price.toLocaleString('id-ID')})
                                </div>
                                {actionType === 'approved' && (
                                    <div className="pt-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                                        <ArrowUpFromLine className="w-4 h-4" />
                                        Sistem akan otomatis mencatat Stok Masuk (+{selectedRefundForAction.quantity} unit) ke inventaris gudang!
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Catatan untuk Pelanggan:
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={3}
                                    required
                                    className="w-full text-xs p-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRefundForAction(null)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                                        actionType === 'approved' 
                                            ? 'bg-emerald-600 hover:bg-emerald-700' 
                                            : 'bg-rose-600 hover:bg-rose-700'
                                    }`}
                                >
                                    {isSubmitting ? 'Memproses...' : (actionType === 'approved' ? 'Setujui & Restok Sekarang' : 'Tolak Refund')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
