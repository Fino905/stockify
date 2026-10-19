import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    Receipt, 
    Star, 
    RotateCcw, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    Package, 
    ShoppingBag, 
    CreditCard, 
    X, 
    Send,
    UserCheck,
    MessageSquareHeart
} from 'lucide-react';

interface OrderItem {
    id: number;
    order_number: string;
    product_id: number;
    product_name: string;
    product_sku: string;
    category_name: string;
    staff_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    payment_method: string;
    payment_status: string;
    payment_reference: string | null;
    order_status: string;
    notes: string | null;
    created_at: string;
    feedback?: {
        id: number;
        rating: number;
        comment: string;
        created_at: string;
    } | null;
    refund?: {
        id: number;
        reason: string;
        description: string | null;
        status: string;
        admin_notes: string | null;
        processor_name: string;
        created_at: string;
    } | null;
}

interface Props {
    orders: OrderItem[];
}

export function CustomerOrdersTab({ orders = [] }: Props) {
    // Feedback Modal State
    const [selectedOrderForFeedback, setSelectedOrderForFeedback] = useState<OrderItem | null>(null);
    const [rating, setRating] = useState<number>(5);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);

    // Refund Modal State
    const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<OrderItem | null>(null);
    const [refundReason, setRefundReason] = useState('Barang Rusak/Cacat saat Diterima');
    const [refundDescription, setRefundDescription] = useState('');
    const [isRefundSubmitting, setIsRefundSubmitting] = useState(false);

    // Detail Order Modal State
    const [detailOrder, setDetailOrder] = useState<OrderItem | null>(null);

    const handleOpenFeedback = (order: OrderItem) => {
        setSelectedOrderForFeedback(order);
        setRating(order.feedback?.rating || 5);
        setFeedbackComment(order.feedback?.comment || '');
    };

    const handleSubmitFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrderForFeedback) return;

        setIsFeedbackSubmitting(true);
        router.post(`/orders/${selectedOrderForFeedback.id}/feedback`, {
            rating,
            comment: feedbackComment,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsFeedbackSubmitting(false);
                setSelectedOrderForFeedback(null);
            },
        });
    };

    const handleOpenRefund = (order: OrderItem) => {
        setSelectedOrderForRefund(order);
        setRefundReason('Barang Rusak/Cacat saat Diterima');
        setRefundDescription('');
    };

    const handleSubmitRefund = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrderForRefund) return;

        setIsRefundSubmitting(true);
        router.post(`/orders/${selectedOrderForRefund.id}/refund`, {
            reason: refundReason,
            description: refundDescription,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsRefundSubmitting(false);
                setSelectedOrderForRefund(null);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return {
                    label: 'Lunas & Selesai',
                    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
                    icon: CheckCircle2,
                };
            case 'refund_pending':
                return {
                    label: 'Pengajuan Refund Menunggu',
                    color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
                    icon: Clock,
                };
            case 'refund_approved':
                return {
                    label: 'Refund Disetujui (Restok)',
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
                    icon: CheckCircle2,
                };
            case 'refund_rejected':
                return {
                    label: 'Refund Ditolak',
                    color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200',
                    icon: AlertCircle,
                };
            default:
                return {
                    label: status,
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                    icon: CheckCircle2,
                };
        }
    };

    return (
        <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-blue-600" />
                        Pesanan & Riwayat Pembayaran Saya
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Daftar barang yang Anda beli dari gudang. Berikan ulasan atau ajukan refund jika barang tidak sesuai.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Total {orders.length} Transaksi
                    </span>
                </div>
            </div>

            {/* Orders Table or Empty State */}
            {orders.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                    <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Belum ada riwayat pesanan</h3>
                    <p className="text-xs text-gray-500 mt-1">Anda belum melakukan pembelian. Silakan pilih produk dari menu Katalog Produk.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase font-semibold text-[11px] border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="p-4">No. Pesanan & Tanggal</th>
                                    <th className="p-4">Barang / Produk</th>
                                    <th className="p-4">Staff Gudang</th>
                                    <th className="p-4">Pembayaran Mainan</th>
                                    <th className="p-4">Total Tagihan</th>
                                    <th className="p-4">Status Pesanan</th>
                                    <th className="p-4 text-center">Tindakan Pelanggan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {orders.map((order) => {
                                    const badge = getStatusBadge(order.order_status);
                                    const StatusIcon = badge.icon;
                                    const hasRefund = !!order.refund || order.order_status.startsWith('refund_');

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/40 transition-colors">
                                            <td className="p-4">
                                                <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                                    {order.order_number}
                                                </div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">
                                                    {order.created_at}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {order.product_name}
                                                </div>
                                                <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                                                    <span>SKU: {order.product_sku}</span>
                                                    <span>•</span>
                                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                        {order.quantity} Unit
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                                    <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="font-medium">{order.staff_name}</span>
                                                </div>
                                                <span className="text-[10px] text-gray-400">Pengambil Barang</span>
                                            </td>

                                            <td className="p-4">
                                                <div className="capitalize font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                                    <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                                                    {order.payment_method.replace('_', ' ').toUpperCase()}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-mono">
                                                    {order.payment_reference || 'LUNAS (SIMULASI)'}
                                                </div>
                                            </td>

                                            <td className="p-4 font-bold text-gray-900 dark:text-white">
                                                Rp {order.total_price.toLocaleString('id-ID')}
                                            </td>

                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {badge.label}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* Button Feedback */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenFeedback(order)}
                                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                                            order.feedback
                                                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                                                                : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100'
                                                        }`}
                                                    >
                                                        <Star className={`w-3.5 h-3.5 ${order.feedback ? 'fill-amber-400 text-amber-400' : ''}`} />
                                                        {order.feedback ? `${order.feedback.rating}★ Ulasan` : 'Beri Ulasan'}
                                                    </button>

                                                    {/* Button Refund */}
                                                    {order.order_status === 'completed' && !hasRefund && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenRefund(order)}
                                                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                            Refund
                                                        </button>
                                                    )}

                                                    {/* Status refund note if already submitted */}
                                                    {order.refund && (
                                                        <span 
                                                            className="text-[11px] text-gray-500 dark:text-gray-400 italic cursor-pointer hover:underline"
                                                            title={`Alasan: ${order.refund.reason}`}
                                                        >
                                                            {order.refund.status === 'pending' && '⏳ Diproses'}
                                                            {order.refund.status === 'approved' && '✅ Restok Selesai'}
                                                            {order.refund.status === 'rejected' && '❌ Ditolak'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Beri Ulasan / Feedback */}
            {selectedOrderForFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                <MessageSquareHeart className="w-4 h-4 text-blue-600" />
                                {selectedOrderForFeedback.feedback ? 'Edit Ulasan Produk' : 'Beri Feedback & Ulasan'}
                            </h3>
                            <button
                                onClick={() => setSelectedOrderForFeedback(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitFeedback} className="space-y-4 pt-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                                <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                    {selectedOrderForFeedback.product_name}
                                </div>
                                <div className="text-[11px] text-gray-500">
                                    No. Pesanan: {selectedOrderForFeedback.order_number}
                                </div>
                            </div>

                            {/* Rating Stars Selection */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Beri Penilaian Bintang (1 - 5)
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="p-1 cursor-pointer transition-transform hover:scale-110"
                                        >
                                            <Star 
                                                className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} 
                                            />
                                        </button>
                                    ))}
                                    <span className="text-xs font-bold text-amber-500 ml-2">
                                        {rating} dari 5 Bintang
                                    </span>
                                </div>
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Komentar / Pengalaman Pembelian
                                </label>
                                <textarea
                                    value={feedbackComment}
                                    onChange={(e) => setFeedbackComment(e.target.value)}
                                    placeholder="Bagikan ulasan Anda mengenai kualitas barang atau pelayanan staff gudang..."
                                    rows={4}
                                    required
                                    className="w-full text-xs p-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedOrderForFeedback(null)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isFeedbackSubmitting}
                                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    {isFeedbackSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Pengajuan Refund */}
            {selectedOrderForRefund && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                <RotateCcw className="w-4 h-4 text-rose-600" />
                                Formulir Pengajuan Refund / Retur
                            </h3>
                            <button
                                onClick={() => setSelectedOrderForRefund(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitRefund} className="space-y-4 pt-4">
                            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900/50">
                                <div className="text-xs font-bold text-rose-900 dark:text-rose-200">
                                    {selectedOrderForRefund.product_name} ({selectedOrderForRefund.quantity} unit)
                                </div>
                                <div className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                                    Nilai Refund: Rp {selectedOrderForRefund.total_price.toLocaleString('id-ID')}
                                </div>
                            </div>

                            {/* Alasan Refund */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Alasan Pengajuan Refund
                                </label>
                                <select
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    className="w-full text-xs p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="Barang Rusak/Cacat saat Diterima">Barang Rusak / Cacat saat Diterima</option>
                                    <option value="Salah Kirim Varian atau Produk">Salah Kirim Varian atau Produk dari Gudang</option>
                                    <option value="Spesifikasi Tidak Sesuai">Spesifikasi Tidak Sesuai Deskripsi</option>
                                    <option value="Jumlah Barang Tidak Lengkap">Jumlah Barang Tidak Lengkap</option>
                                    <option value="Alasan Lainnya">Alasan Lainnya</option>
                                </select>
                            </div>

                            {/* Keterangan Detail */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Penjelasan Rinci / Keluhan
                                </label>
                                <textarea
                                    value={refundDescription}
                                    onChange={(e) => setRefundDescription(e.target.value)}
                                    placeholder="Jelaskan kondisi barang dan kendala yang Anda alami secara detail..."
                                    rows={3}
                                    className="w-full text-xs p-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <p className="text-[11px] text-gray-500">
                                Jika disetujui oleh Staff Gudang / Admin, stok barang akan otomatis dikembalikan ke inventaris.
                            </p>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedOrderForRefund(null)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isRefundSubmitting}
                                    className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    {isRefundSubmitting ? 'Mengajukan...' : 'Ajukan Refund Sekarang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
