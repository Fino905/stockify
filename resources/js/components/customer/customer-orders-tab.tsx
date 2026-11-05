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
    MessageSquareHeart,
    MessageSquare,
    UploadCloud,
    ExternalLink,
    FileCheck,
    Image as ImageIcon,
    Camera,
    Truck,
    ArrowDownToLine
} from 'lucide-react';
import { CameraCaptureModal } from '@/components/common/camera-capture-modal';
import { OrderChatModal } from '@/components/customer/order-chat-modal';

interface OrderItem {
    id: number;
    order_number: string;
    product_id: number;
    product_name: string;
    product_sku: string;
    product_image?: string | null;
    category_name: string;
    staff_name: string;
    customer_name?: string;
    customer_email?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    payment_method: string;
    payment_status: string;
    payment_reference: string | null;
    payment_proof?: string | null;
    order_status: string;
    shipping_courier?: string | null;
    tracking_number?: string | null;
    shipped_at?: string | null;
    received_at?: string | null;
    notes: string | null;
    created_at: string;
    created_at_raw?: string | null;
    is_past_three_days?: boolean;
    messages?: any[];
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
        damage_image?: string | null;
        refund_transfer_proof?: string | null;
        status: string;
        return_tracking_number?: string | null;
        goods_received_by?: number | null;
        goods_received_at?: string | null;
        goods_condition_notes?: string | null;
        goods_receiver_name?: string | null;
        admin_notes: string | null;
        processor_name: string;
        created_at: string;
    } | null;
}

interface Props {
    orders: OrderItem[];
    currentUser?: any;
}

export function CustomerOrdersTab({ orders = [], currentUser }: Props) {
    // Chat Modal State
    const [selectedOrderForChat, setSelectedOrderForChat] = useState<OrderItem | null>(null);
    const [isCompletingId, setIsCompletingId] = useState<number | null>(null);

    // Resi Pengembalian Barang Modal State
    const [selectedRefundForReturnTracking, setSelectedRefundForReturnTracking] = useState<OrderItem | null>(null);
    const [customerReturnTracking, setCustomerReturnTracking] = useState('');
    const [isSubmittingReturnTracking, setIsSubmittingReturnTracking] = useState(false);

    // Selalu ambil data pesanan paling mutakhir dari props orders saat ada pesan baru
    const activeChatOrder = selectedOrderForChat
        ? (orders.find((o) => o.id === selectedOrderForChat.id) || selectedOrderForChat)
        : null;

    // Bukti Transfer Uang Kembali Modal State
    const [selectedTransferProofUrl, setSelectedTransferProofUrl] = useState<string | null>(null);

    // Feedback Modal State
    const [selectedOrderForFeedback, setSelectedOrderForFeedback] = useState<OrderItem | null>(null);
    const [rating, setRating] = useState<number>(5);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);

    // Refund Modal State
    const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<OrderItem | null>(null);
    const [refundReason, setRefundReason] = useState('Barang Rusak/Cacat saat Diterima');
    const [refundDescription, setRefundDescription] = useState('');
    const [refundDamageImage, setRefundDamageImage] = useState<File | null>(null);
    const [refundDamagePreview, setRefundDamagePreview] = useState<string | null>(null);
    const [refundError, setRefundError] = useState<string | null>(null);
    const [isRefundSubmitting, setIsRefundSubmitting] = useState(false);

    // Detail Order Modal State
    const [detailOrder, setDetailOrder] = useState<OrderItem | null>(null);

    // Bukti Transaksi Modal State
    const [selectedOrderForProof, setSelectedOrderForProof] = useState<OrderItem | null>(null);
    const [proofUploadFile, setProofUploadFile] = useState<File | null>(null);
    const [proofUploadPreview, setProofUploadPreview] = useState<string | null>(null);
    const [isUploadingProof, setIsUploadingProof] = useState(false);

    // Live Camera Modal State
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [cameraTarget, setCameraTarget] = useState<'refund' | 'payment_proof'>('refund');

    const handleCameraCaptured = (file: File, previewUrl: string) => {
        if (cameraTarget === 'refund') {
            setRefundDamageImage(file);
            setRefundDamagePreview(previewUrl);
            setRefundError(null);
        } else {
            setProofUploadFile(file);
            setProofUploadPreview(previewUrl);
        }
    };

    const handleUploadProofSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrderForProof || !proofUploadFile) return;

        setIsUploadingProof(true);
        const formData = new FormData();
        formData.append('payment_proof', proofUploadFile);

        router.post(`/orders/${selectedOrderForProof.id}/payment-proof`, formData, {
            preserveScroll: true,
            onFinish: () => {
                setIsUploadingProof(false);
                setProofUploadFile(null);
                setProofUploadPreview(null);
                setSelectedOrderForProof(null);
            },
        });
    };

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
        setRefundDamageImage(null);
        setRefundDamagePreview(null);
        setRefundError(null);
    };

    const handleSubmitRefund = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrderForRefund) return;

        if (selectedOrderForRefund.is_past_three_days) {
            setRefundError('Batas waktu pengajuan refund maksimal 3 hari sejak tanggal pembelian telah berakhir. Pesanan ini sudah tidak dapat direfund.');
            return;
        }

        if (!refundDamageImage) {
            setRefundError('Wajib melampirkan foto bukti kerusakan fisik barang!');
            return;
        }

        setIsRefundSubmitting(true);
        setRefundError(null);

        const formData = new FormData();
        formData.append('reason', refundReason);
        if (refundDescription) formData.append('description', refundDescription);
        formData.append('damage_image', refundDamageImage);

        router.post(`/orders/${selectedOrderForRefund.id}/refund`, formData, {
            preserveScroll: true,
            onFinish: () => {
                setIsRefundSubmitting(false);
                setSelectedOrderForRefund(null);
                setRefundDamageImage(null);
                setRefundDamagePreview(null);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_confirmation':
                return {
                    label: 'Menunggu Konfirmasi Staff / Management',
                    color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
                    icon: Clock,
                };
            case 'processing':
                return {
                    label: 'Sedang Dikemas (Gudang)',
                    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200',
                    icon: Package,
                };
            case 'shipped':
                return {
                    label: 'Sedang Dikirim via Kurir',
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
                    icon: Truck,
                };
            case 'completed':
                return {
                    label: 'Pesanan Selesai / Diterima',
                    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
                    icon: CheckCircle2,
                };
            case 'cancelled':
                return {
                    label: 'Pesanan Dibatalkan / Ditolak',
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200',
                    icon: AlertCircle,
                };
            case 'refund_pending':
                return {
                    label: 'Pengajuan Refund Menunggu',
                    color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
                    icon: Clock,
                };
            case 'return_approved':
                return {
                    label: 'Retur Disetujui (Kirim Barang)',
                    color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200',
                    icon: RotateCcw,
                };
            case 'return_shipped':
                return {
                    label: 'Retur Dikirim ke Gudang',
                    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200',
                    icon: Truck,
                };
            case 'goods_received':
                return {
                    label: 'Fisik Tiba di Gudang (Proses Transfer)',
                    color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200',
                    icon: CheckCircle2,
                };
            case 'refund_approved':
                return {
                    label: 'Refund Selesai (Dana Kembali)',
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
                                                <div className="flex items-center gap-3">
                                                    {order.product_image ? (
                                                        <img
                                                            src={order.product_image}
                                                            alt={order.product_name}
                                                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shrink-0 shadow-xs"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <div>
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
                                                    </div>
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

                                            <td className="p-4 space-y-1">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {badge.label}
                                                </span>

                                                {order.order_status === 'shipped' && (
                                                    <div className="text-[11px] bg-blue-50 dark:bg-blue-950/60 p-2 rounded-lg border border-blue-200 dark:border-blue-800 space-y-0.5">
                                                        <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                                                            <Truck className="w-3.5 h-3.5 text-blue-600" />
                                                            {order.shipping_courier || 'Kurir Ekspedisi'}
                                                        </div>
                                                        <div className="font-mono text-[10px] text-gray-600 dark:text-gray-300">
                                                            Resi: <span className="font-bold text-gray-900 dark:text-white select-all">{order.tracking_number}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="p-4">
                                                <div className="flex flex-wrap items-center justify-center gap-2">
                                                    {/* Button Konfirmasi Pesanan Diterima jika sedang dikirim */}
                                                    {order.order_status === 'shipped' && (
                                                        <button
                                                            type="button"
                                                            disabled={isCompletingId === order.id}
                                                            onClick={() => {
                                                                if (confirm(`Konfirmasi bahwa pesanan #${order.order_number} telah sampai dan Anda terima dengan baik?`)) {
                                                                    setIsCompletingId(order.id);
                                                                    router.post(`/orders/${order.id}/complete`, {}, {
                                                                        onFinish: () => setIsCompletingId(null)
                                                                    });
                                                                }
                                                            }}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                                                            title="Konfirmasi barang telah Anda terima dengan baik"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            <span>{isCompletingId === order.id ? 'Memproses...' : 'Pesanan Diterima'}</span>
                                                        </button>
                                                    )}

                                                    {/* Button Input Resi Retur jika refund disetujui retur */}
                                                    {(order.order_status === 'return_approved' || order.refund?.status === 'return_approved') && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedRefundForReturnTracking(order);
                                                                setCustomerReturnTracking(order.refund?.return_tracking_number || '');
                                                            }}
                                                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs inline-flex items-center gap-1 cursor-pointer transition-all animate-pulse"
                                                            title="Klaim retur disetujui, klik untuk memasukkan nomor resi ekspedisi"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                            <span>Input Resi Retur</span>
                                                        </button>
                                                    )}

                                                    {/* Button Chat Staff Gudang */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedOrderForChat(order)}
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 transition-all flex items-center gap-1 cursor-pointer"
                                                        title="Hubungi dan chat langsung dengan staff gudang mengenai pesanan ini"
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        <span>Chat Gudang</span>
                                                        {order.messages && order.messages.length > 0 && (
                                                            <span className="px-1.5 py-0.2 text-[10px] bg-blue-600 text-white font-bold rounded-full">
                                                                {order.messages.length}
                                                            </span>
                                                        )}
                                                    </button>

                                                    {/* Button Bukti Transaksi */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedOrderForProof(order);
                                                            setProofUploadFile(null);
                                                            setProofUploadPreview(null);
                                                        }}
                                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                                            order.payment_proof
                                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200'
                                                                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200'
                                                        }`}
                                                        title="Lihat bukti transaksi atau resi pembayaran"
                                                    >
                                                        <Receipt className="w-3.5 h-3.5" />
                                                        <span>{order.payment_proof ? 'Bukti Bayar' : 'Struk Digital'}</span>
                                                    </button>

                                                    {/* Button Feedback */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenFeedback(order)}
                                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                                            order.feedback
                                                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                                                                : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100'
                                                        }`}
                                                    >
                                                        <Star className={`w-3.5 h-3.5 ${order.feedback ? 'fill-amber-400 text-amber-400' : ''}`} />
                                                        {order.feedback ? `${order.feedback.rating}/5 Ulasan` : 'Beri Ulasan'}
                                                    </button>

                                                    {/* Button Refund dengan Aturan Batas 3 Hari */}
                                                    {order.order_status === 'completed' && !hasRefund && (
                                                        order.is_past_three_days ? (
                                                            <span 
                                                                className="px-2.5 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 font-medium inline-flex items-center gap-1 border border-gray-200 dark:border-gray-700" 
                                                                title="Batas waktu pengajuan refund (maksimal 3 hari setelah pembelian) telah berakhir."
                                                            >
                                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                                <span className="hidden sm:inline">Batas Refund Lewat (&gt; 3 Hari)</span>
                                                                <span className="sm:hidden">&gt; 3 Hari</span>
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenRefund(order)}
                                                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                                                                title="Ajukan retur dan pengembalian uang (Maksimal 3 hari sejak pembelian)"
                                                            >
                                                                <RotateCcw className="w-3.5 h-3.5" />
                                                                <span>Refund (&lt; 3 Hari)</span>
                                                            </button>
                                                        )
                                                    )}

                                                    {/* Bukti Transfer Pengembalian Dana dari Manager jika sudah disetujui */}
                                                    {order.refund?.refund_transfer_proof && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedTransferProofUrl(order.refund?.refund_transfer_proof || null)}
                                                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300 transition-all flex items-center gap-1 cursor-pointer"
                                                            title="Lihat bukti transfer uang kembali yang dikirim oleh Manager"
                                                        >
                                                            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>Bukti TF Refund</span>
                                                        </button>
                                                    )}

                                                    {/* Status refund note if already submitted */}
                                                    {order.refund && (
                                                        <span 
                                                            className="text-[11px] text-gray-500 dark:text-gray-400 font-medium cursor-pointer hover:underline"
                                                            title={`Alasan: ${order.refund.reason}`}
                                                        >
                                                            {order.refund.status === 'pending' && 'Diproses'}
                                                            {order.refund.status === 'return_approved' && 'Menunggu Resi Anda'}
                                                            {order.refund.status === 'return_shipped' && 'Retur Menuju Gudang'}
                                                            {order.refund.status === 'goods_received' && 'Fisik Tiba di Gudang'}
                                                            {order.refund.status === 'approved' && 'Restok & Dana Kembali'}
                                                            {order.refund.status === 'rejected' && 'Ditolak'}
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

                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                                <span>
                                    <strong>Ketentuan Garansi Refund:</strong> Pengajuan refund hanya dapat dilakukan maksimal 3 hari sejak tanggal pembelian ({selectedOrderForRefund.created_at}).
                                </span>
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

                            {/* Unggah Bukti Kerusakan Barang (WAJIB) */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                        <ImageIcon className="w-4 h-4 text-rose-600" />
                                        <span>Foto Bukti Kerusakan Barang *</span>
                                    </label>
                                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                                        Wajib Dilampirkan
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-500 mb-2">
                                    Lampirkan foto fisik barang yang rusak, pecah, cacat pabrik, atau salah varian untuk diverifikasi oleh Manajer Gudang.
                                </p>

                                {refundDamagePreview ? (
                                    <div className="relative rounded-xl overflow-hidden border-2 border-rose-400 dark:border-rose-700 bg-gray-900/10 p-2 flex items-center justify-center">
                                        <img
                                            src={refundDamagePreview}
                                            alt="Bukti Kerusakan"
                                            className="max-h-48 rounded-lg object-contain"
                                        />
                                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCameraTarget('refund');
                                                    setShowCameraModal(true);
                                                }}
                                                className="px-2.5 py-1 bg-gray-900/80 hover:bg-black text-white text-[10px] font-bold rounded-lg shadow-sm flex items-center gap-1 backdrop-blur-xs cursor-pointer transition-colors"
                                            >
                                                <Camera className="w-3 h-3" /> Foto Ulang
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRefundDamageImage(null);
                                                    setRefundDamagePreview(null);
                                                }}
                                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCameraTarget('refund');
                                                setShowCameraModal(true);
                                            }}
                                            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                                        >
                                            <Camera className="w-4 h-4" />
                                            <span>Buka Kamera Langsung (Jepret Foto)</span>
                                        </button>

                                        <div className="flex items-center gap-2 my-1">
                                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                            <span className="text-[10px] uppercase font-semibold text-gray-400">Atau Pilih dari Galeri</span>
                                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                        </div>

                                        <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-rose-300 dark:border-rose-700/60 hover:border-rose-500 rounded-xl cursor-pointer bg-rose-50/30 dark:bg-rose-950/20 transition-colors">
                                            <UploadCloud className="w-6 h-6 text-rose-500 mb-1" />
                                            <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                                                Pilih Foto dari Galeri / Berkas
                                            </span>
                                            <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, atau WEBP (Maksimal 5MB)</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setRefundDamageImage(file);
                                                        setRefundDamagePreview(URL.createObjectURL(file));
                                                        setRefundError(null);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                )}

                                {refundError && (
                                    <div className="mt-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{refundError}</span>
                                    </div>
                                )}
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

            {/* MODAL LIHAT & UNGGAH BUKTI TRANSAKSI CUSTOMER */}
            {selectedOrderForProof && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                                        Bukti Transaksi & Struk Pembelian
                                    </h3>
                                    <p className="text-[11px] text-gray-500 font-mono">
                                        No. Pesanan: #{selectedOrderForProof.order_number}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedOrderForProof(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-4 text-xs">
                            {/* Status Verifikasi Badge */}
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Status Konfirmasi</span>
                                    <span className="font-bold text-xs text-gray-800 dark:text-gray-200">
                                        {selectedOrderForProof.order_status === 'pending_confirmation' 
                                            ? 'Menunggu Konfirmasi Manajer / Staff' 
                                            : selectedOrderForProof.order_status === 'completed'
                                            ? 'Telah Dikonfirmasi (Lunas & Stok Dipotong)'
                                            : selectedOrderForProof.order_status}
                                    </span>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    selectedOrderForProof.order_status === 'completed' 
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}>
                                    {selectedOrderForProof.order_status === 'completed' ? '✓ Disahkan' : 'Menunggu'}
                                </span>
                            </div>

                            {/* Rincian Transaksi */}
                            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-2">
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>Produk:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{selectedOrderForProof.product_name}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>Jumlah Unit:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{selectedOrderForProof.quantity} unit</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>Metode Pembayaran:</span>
                                    <span className="font-semibold uppercase text-gray-900 dark:text-white">{selectedOrderForProof.payment_method.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>No. Ref Transaksi:</span>
                                    <span className="font-mono text-gray-700 dark:text-gray-300">{selectedOrderForProof.payment_reference || '-'}</span>
                                </div>
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between items-center">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">Total Pembayaran:</span>
                                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                                        Rp {selectedOrderForProof.total_price.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            {/* Foto Bukti Transfer / Resi jika ada */}
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                                        Foto Bukti Transaksi
                                    </span>
                                    {selectedOrderForProof.payment_proof && (
                                        <a
                                            href={selectedOrderForProof.payment_proof}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                        >
                                            <ExternalLink className="w-3 h-3" /> Buka Foto Asli
                                        </a>
                                    )}
                                </h4>

                                {selectedOrderForProof.payment_proof ? (
                                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-900/5 p-2 flex items-center justify-center max-h-64">
                                        <img
                                            src={selectedOrderForProof.payment_proof}
                                            alt="Bukti Transaksi"
                                            className="max-h-60 object-contain rounded-lg"
                                        />
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-750 text-center space-y-1">
                                        <Receipt className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                        <div className="font-semibold text-gray-700 dark:text-gray-300">
                                            Struk Digital Otomatis
                                        </div>
                                        <p className="text-[11px] text-gray-500">
                                            Belum ada foto bukti fisik yang diunggah. Pesanan menggunakan simulasi bayar instan.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Form Unggah / Ganti Bukti Transfer (khusus status pending) */}
                            {selectedOrderForProof.order_status === 'pending_confirmation' && (
                                <form onSubmit={handleUploadProofSubmit} className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                                            <span>{selectedOrderForProof.payment_proof ? 'Ganti Bukti Transfer' : 'Unggah Bukti Transfer Baru'}</span>
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCameraTarget('payment_proof');
                                                setShowCameraModal(true);
                                            }}
                                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-750 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                                            title="Buka kamera langsung untuk foto bukti transfer"
                                        >
                                            <Camera className="w-3.5 h-3.5 text-blue-600" />
                                            <span>Buka Kamera</span>
                                        </button>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) {
                                                    setProofUploadFile(f);
                                                    setProofUploadPreview(URL.createObjectURL(f));
                                                }
                                            }}
                                            className="text-xs text-gray-600 dark:text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 flex-1"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!proofUploadFile || isUploadingProof}
                                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
                                        >
                                            {isUploadingProof ? 'Mengunggah...' : 'Simpan Bukti'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedOrderForProof(null)}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* MODAL INPUT NOMOR RESI PENGEMBALIAN BARANG RETUR */}
            {selectedRefundForReturnTracking && selectedRefundForReturnTracking.refund && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                <Truck className="w-4 h-4 text-purple-600" />
                                Masukkan Resi Pengembalian Barang
                            </h3>
                            <button
                                onClick={() => setSelectedRefundForReturnTracking(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!customerReturnTracking.trim()) {
                                    alert('Silakan masukkan nomor resi ekspedisi pengembalian barang.');
                                    return;
                                }
                                const refundId = selectedRefundForReturnTracking.refund!.id;
                                setIsSubmittingReturnTracking(true);
                                router.post(`/refunds/${refundId}/return-tracking`, {
                                    return_tracking_number: customerReturnTracking.trim(),
                                }, {
                                    preserveScroll: true,
                                    onFinish: () => {
                                        setIsSubmittingReturnTracking(false);
                                        setSelectedRefundForReturnTracking(null);
                                    }
                                });
                            }}
                            className="space-y-4 pt-4 text-xs"
                        >
                            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 space-y-1">
                                <div className="font-bold text-purple-900 dark:text-purple-200">
                                    Pesanan #{selectedRefundForReturnTracking.order_number}
                                </div>
                                <div className="text-gray-600 dark:text-gray-300">
                                    Instruksi Gudang: <em>"{selectedRefundForReturnTracking.refund.admin_notes || 'Silakan kirimkan paket fisik kembali ke gudang.'}"</em>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Nomor Resi Ekspedisi Pengembalian (J&T, JNE, SiCepat, dll) *
                                </label>
                                <input
                                    type="text"
                                    value={customerReturnTracking}
                                    onChange={(e) => setCustomerReturnTracking(e.target.value)}
                                    placeholder="Contoh: JNE8291028120 / JT991203"
                                    className="w-full text-xs p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white font-mono"
                                    required
                                />
                            </div>

                            <p className="text-[11px] text-gray-500">
                                Setelah resi disimpan, staf gudang akan memeriksa kondisi fisik paket saat tiba di gudang. Dana akan segera ditransfer setelah fisik barang diverifikasi.
                            </p>

                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRefundForReturnTracking(null)}
                                    className="px-3.5 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingReturnTracking || !customerReturnTracking.trim()}
                                    className="px-4 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>{isSubmittingReturnTracking ? 'Menyimpan...' : 'Kirim Nomor Resi'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL KAMERA LANGSUNG (LIVE VIEW FINDER) */}
            <CameraCaptureModal
                isOpen={showCameraModal}
                onClose={() => setShowCameraModal(false)}
                onCapture={handleCameraCaptured}
                title={cameraTarget === 'refund' ? 'Ambil Foto Bukti Kerusakan Barang' : 'Ambil Foto Bukti Pembayaran / Transfer'}
                fileNamePrefix={cameraTarget === 'refund' ? 'bukti-kerusakan' : 'bukti-transfer'}
            />

            {/* MODAL CHAT DENGAN STAFF GUDANG */}
            <OrderChatModal
                isOpen={!!activeChatOrder}
                onClose={() => setSelectedOrderForChat(null)}
                order={activeChatOrder}
                currentUser={currentUser}
            />

            {/* MODAL BUKTI TRANSFER PENGEMBALIAN DANA DARI MANAGER */}
            {selectedTransferProofUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50/70 dark:bg-gray-850">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                                        Bukti Transfer Pengembalian Dana (Refund)
                                    </h3>
                                    <p className="text-[11px] text-gray-500">
                                        Dikirimkan resmi oleh Tim Manajemen Gudang
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTransferProofUrl(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-3 text-xs">
                            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                                <strong>Uang Anda Telah Dikembalikan!</strong> Tim manajer telah menyelesaikan transfer ke rekening Anda. Silakan cek mutasi rekening Anda berdasarkan struk di bawah ini.
                            </div>

                            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 overflow-hidden bg-gray-950/5 dark:bg-gray-900/30 p-2 flex items-center justify-center max-h-80">
                                <img
                                    src={selectedTransferProofUrl}
                                    alt="Bukti Transfer Refund"
                                    className="max-h-76 object-contain rounded-lg"
                                />
                            </div>

                            <div className="flex justify-end">
                                <a
                                    href={selectedTransferProofUrl}
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
                                onClick={() => setSelectedTransferProofUrl(null)}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
