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
    ArrowUpFromLine,
    ExternalLink,
    Image as ImageIcon,
    Receipt,
    Camera,
    UploadCloud,
    Truck,
    ArrowDownToLine,
    Building2,
    Trash2,
    Wrench,
    Sparkles,
    Send
} from 'lucide-react';
import { CameraCaptureModal } from '@/components/common/camera-capture-modal';

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
    damage_image?: string | null;
    refund_transfer_proof?: string | null;
    status: string;
    return_tracking_number?: string | null;
    goods_received_by?: number | null;
    goods_received_at?: string | null;
    goods_condition_notes?: string | null;
    goods_condition_status?: string | null;
    is_restocked?: boolean;
    goods_receiver_name?: string | null;
    supplier_name?: string;
    supplier_contact?: string;
    quarantine_disposition?: string | null;
    quarantine_reference?: string | null;
    quarantine_notes?: string | null;
    quarantine_processor_name?: string | null;
    quarantine_processed_at?: string | null;
    admin_notes: string | null;
    processor_name: string;
    created_at: string;
}

interface Props {
    refundRequests: RefundItem[];
}

export function AdminRefundsTab({ refundRequests = [] }: Props) {
    const [selectedRefundForAction, setSelectedRefundForAction] = useState<RefundItem | null>(null);
    const [selectedProofRefund, setSelectedProofRefund] = useState<RefundItem | null>(null);
    const [selectedRefundForApproveReturn, setSelectedRefundForApproveReturn] = useState<RefundItem | null>(null);
    const [selectedRefundForGoodsReceived, setSelectedRefundForGoodsReceived] = useState<RefundItem | null>(null);
    const [selectedRefundForQuarantine, setSelectedRefundForQuarantine] = useState<RefundItem | null>(null);
    const [quarantineDisposition, setQuarantineDisposition] = useState<'supplier_claim' | 'written_off' | 'repaired'>('supplier_claim');
    const [quarantineReference, setQuarantineReference] = useState('');
    const [quarantineNotes, setQuarantineNotes] = useState('');
    const [goodsConditionStatus, setGoodsConditionStatus] = useState<'good_restock' | 'damaged_quarantine'>('good_restock');
    const [goodsConditionNotes, setGoodsConditionNotes] = useState('');
    const [returnInstructionNotes, setReturnInstructionNotes] = useState('Klaim retur disetujui. Silakan kemas barang dengan aman dan kirimkan ke gudang, lalu masukkan nomor resi ekspedisi.');
    const [actionType, setActionType] = useState<'approved' | 'rejected'>('approved');
    const [adminNotes, setAdminNotes] = useState('');
    const [transferProofFile, setTransferProofFile] = useState<File | null>(null);
    const [transferProofPreview, setTransferProofPreview] = useState<string | null>(null);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const generateQuarantineRef = (disposition: 'supplier_claim' | 'written_off' | 'repaired', orderNum: string) => {
        const prefix =
            disposition === 'supplier_claim' ? 'CLM-SUP' :
                disposition === 'written_off' ? 'BAP-SCRAP' : 'RPR-INT';
        const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const cleanOrder = (orderNum || '').replace(/[^a-zA-Z0-9]/g, '').slice(-4);
        const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${datePart}-${cleanOrder || randPart}`;
    };

    const handleOpenQuarantineModal = (refund: RefundItem, defaultDisposition: 'supplier_claim' | 'written_off' | 'repaired' = 'supplier_claim') => {
        setSelectedRefundForQuarantine(refund);
        setQuarantineDisposition(defaultDisposition);
        setQuarantineReference(generateQuarantineRef(defaultDisposition, refund.order_number));
        setQuarantineNotes(
            defaultDisposition === 'supplier_claim'
                ? `Klaim penggantian barang retur/cacat fisik kepada supplier ${refund.supplier_name || 'pabrik'}. Menunggu kompensasi pengiriman unit baru atau pengembalian dana.`
                : defaultDisposition === 'written_off'
                    ? `Barang rusak parah/cacat permanen dan tidak dapat diperbaiki/diklaim. Berita acara pemusnahan resmi dicatat dan barang dibuang dari area gudang.`
                    : `Barang diperbaiki secara internal oleh tim teknisi gudang dan telah lolos uji kelayakan (QC) untuk direstok kembali ke penjualan.`
        );
    };

    const handleQuarantineSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRefundForQuarantine) return;

        setIsSubmitting(true);
        router.patch(`/refunds/${selectedRefundForQuarantine.id}/quarantine-disposition`, {
            disposition: quarantineDisposition,
            reference: quarantineReference.trim(),
            notes: quarantineNotes.trim(),
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsSubmitting(false);
                setSelectedRefundForQuarantine(null);
            }
        });
    };

    const handleOpenAction = (refund: RefundItem, type: 'approved' | 'rejected') => {
        setSelectedRefundForAction(refund);
        setActionType(type);
        setTransferProofFile(null);
        setTransferProofPreview(null);
        setAdminNotes(
            type === 'approved'
                ? 'Barang telah diterima kembali di gudang dalam kondisi sesuai. Pengembalian dana telah ditransfer dan stok otomatis direstok.'
                : 'Mohon maaf, pengajuan refund tidak memenuhi kriteria retur gudang.'
        );
    };

    const handleApproveReturnSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRefundForApproveReturn) return;

        setIsSubmitting(true);
        router.patch(`/refunds/${selectedRefundForApproveReturn.id}/approve-return`, {
            admin_notes: returnInstructionNotes,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsSubmitting(false);
                setSelectedRefundForApproveReturn(null);
            },
        });
    };

    const handleGoodsReceivedSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRefundForGoodsReceived || !goodsConditionNotes.trim()) {
            alert('Silakan tuliskan catatan kondisi fisik barang retur.');
            return;
        }

        setIsSubmitting(true);
        router.patch(`/refunds/${selectedRefundForGoodsReceived.id}/goods-received`, {
            goods_condition_status: goodsConditionStatus,
            goods_condition_notes: goodsConditionNotes.trim(),
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsSubmitting(false);
                setSelectedRefundForGoodsReceived(null);
                setGoodsConditionNotes('');
                setGoodsConditionStatus('good_restock');
            },
        });
    };

    const handleConfirmProcess = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRefundForAction) return;

        setIsSubmitting(true);
        router.post(`/refunds/${selectedRefundForAction.id}/process`, {
            _method: 'patch',
            status: actionType,
            admin_notes: adminNotes,
            refund_transfer_proof: transferProofFile,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                setIsSubmitting(false);
                setSelectedRefundForAction(null);
                setTransferProofFile(null);
                setTransferProofPreview(null);
            },
        });
    };

    const q = searchQuery.toLowerCase();
    const filtered = refundRequests.filter((r) => {
        const matchesSearch =
            (r.order_number || '').toLowerCase().includes(q) ||
            (r.customer_name || '').toLowerCase().includes(q) ||
            (r.product_name || '').toLowerCase().includes(q) ||
            (r.reason || '').toLowerCase().includes(q);

        const matchesStatus =
            statusFilter === 'all' ? true :
                statusFilter === 'pending' ? r.status === 'pending' :
                    statusFilter === 'return_flow' ? ['return_approved', 'return_shipped'].includes(r.status) :
                        statusFilter === 'goods_received' ? r.status === 'goods_received' :
                            statusFilter === 'approved' ? r.status === 'approved' :
                                statusFilter === 'rejected' ? r.status === 'rejected' : true;

        return matchesSearch && matchesStatus;
    });

    const pendingCount = refundRequests.filter(r => r.status === 'pending').length;
    const goodsReceivedCount = refundRequests.filter(r => r.status === 'goods_received').length;

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
                        {pendingCount} Tinjauan Awal
                    </span>
                    {goodsReceivedCount > 0 && (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 animate-pulse">
                            {goodsReceivedCount} Siap Transfer Dana
                        </span>
                    )}
                </div>
            </div>

            {/* Filter Search & Status */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
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

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white w-full sm:w-auto"
                >
                    <option value="all">Semua Status Refund</option>
                    <option value="pending">Tahap 1: Menunggu Tinjauan Awal ({pendingCount})</option>
                    <option value="return_flow">Tahap 2: Pengiriman Retur Barang</option>
                    <option value="goods_received">Tahap 3: Fisik Tiba di Gudang ({goodsReceivedCount})</option>
                    <option value="approved">Selesai: Dana Dikembalikan</option>
                    <option value="rejected">Ditolak</option>
                </select>
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
                                    <th className="p-4">Bukti Kerusakan</th>
                                    <th className="p-4">Status & Alur Retur</th>
                                    <th className="p-4 text-center">Tindakan Staff / Manajer</th>
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
                                            {refund.damage_image ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedProofRefund(refund)}
                                                    className="flex items-center gap-2 group cursor-pointer text-left"
                                                    title="Lihat foto bukti fisik kerusakan barang"
                                                >
                                                    <div className="relative w-11 h-11 rounded-lg overflow-hidden border-2 border-rose-300 dark:border-rose-700 bg-gray-100 shrink-0">
                                                        <img src={refund.damage_image} alt="Bukti Rusak" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 group-hover:underline flex items-center gap-1">
                                                            <ImageIcon className="w-3 h-3" /> Foto Bukti
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 block">Klik periksa</span>
                                                    </div>
                                                </button>
                                            ) : (
                                                <span className="text-[11px] text-gray-400 italic">
                                                    Tidak ada foto
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            {refund.status === 'pending' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
                                                    <Clock className="w-3 h-3" />
                                                    Tinjauan Awal
                                                </span>
                                            )}
                                            {refund.status === 'return_approved' && (
                                                <div className="space-y-0.5">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">
                                                        <RotateCcw className="w-3 h-3" />
                                                        Retur Disetujui
                                                    </span>
                                                    <div className="text-[10px] text-gray-400">Menunggu Resi Pelanggan</div>
                                                </div>
                                            )}
                                            {refund.status === 'return_shipped' && (
                                                <div className="space-y-0.5">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200">
                                                        <Truck className="w-3 h-3" />
                                                        Retur Menuju Gudang
                                                    </span>
                                                    <div className="text-[10px] font-mono text-gray-600 dark:text-gray-300">
                                                        Resi: <span className="font-bold">{refund.return_tracking_number}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {refund.status === 'goods_received' && (
                                                <div className="space-y-0.5">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${refund.goods_condition_status === 'damaged_quarantine'
                                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200'
                                                            : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200'
                                                        }`}>
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        {refund.goods_condition_status === 'damaged_quarantine' ? 'Fisik Tiba (Karantina)' : 'Fisik Tiba & Restok'}
                                                    </span>
                                                    <div className="text-[10px] text-gray-500">
                                                        Oleh: {refund.goods_receiver_name || 'Staf'}
                                                    </div>
                                                    {refund.goods_condition_status === 'damaged_quarantine' ? (
                                                        <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                                            Barang Cacat (Tidak Direstok)
                                                        </div>
                                                    ) : (
                                                        <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
                                                            Direstok (+{refund.quantity} Qty)
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {refund.status === 'approved' && (
                                                <div className="space-y-0.5">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Selesai (Dana Kembali)
                                                    </span>
                                                    {refund.goods_condition_status === 'damaged_quarantine' ? (
                                                        <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                                                            Karantina (Barang Rusak)
                                                        </div>
                                                    ) : refund.is_restocked ? (
                                                        <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                            Direstok (+{refund.quantity} Qty)
                                                        </div>
                                                    ) : null}
                                                    {refund.goods_condition_status === 'damaged_quarantine' && (
                                                        <div className="pt-0.5">
                                                            {refund.quarantine_disposition === 'supplier_claim' ? (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[9px] font-bold">
                                                                    <Building2 className="w-2.5 h-2.5" />
                                                                    Klaim: {refund.quarantine_reference}
                                                                </span>
                                                            ) : refund.quarantine_disposition === 'written_off' ? (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[9px] font-bold">
                                                                    <Trash2 className="w-2.5 h-2.5" />
                                                                    Musnah: {refund.quarantine_reference}
                                                                </span>
                                                            ) : refund.quarantine_disposition === 'repaired' ? (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold">
                                                                    <Wrench className="w-2.5 h-2.5" />
                                                                    Reparasi: {refund.quarantine_reference}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[9px] font-semibold">
                                                                    Menunggu Disposisi
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {refund.processor_name !== '-' && (
                                                        <div className="text-[10px] text-gray-400">
                                                            Oleh: {refund.processor_name}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {refund.status === 'rejected' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">
                                                    <XCircle className="w-3 h-3" />
                                                    Ditolak
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4 text-center">
                                            {refund.status === 'pending' ? (
                                                <div className="flex flex-col gap-1.5 items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedRefundForApproveReturn(refund)}
                                                        className="w-full px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                                                        title="Setujui retur fisik barang (pelanggan akan diminta kirim barang & resi)"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        Setujui Retur Fisik
                                                    </button>
                                                    <div className="flex items-center gap-1 w-full">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenAction(refund, 'approved')}
                                                            className="flex-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 cursor-pointer"
                                                            title="Pencairan langsung tanpa retur barang fisik"
                                                        >
                                                            Pencairan Cepat
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenAction(refund, 'rejected')}
                                                            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 cursor-pointer"
                                                            title="Tolak permohonan refund"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (refund.status === 'return_approved' || refund.status === 'return_shipped') ? (
                                                <div className="flex flex-col gap-1 items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedRefundForGoodsReceived(refund);
                                                            setGoodsConditionNotes('Barang retur telah sampai di gudang dalam kondisi tersegel/sesuai.');
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                                                        title="Pemeriksaan fisik barang tiba di gudang dan otomatis restok"
                                                    >
                                                        <Package className="w-3.5 h-3.5" />
                                                        Verifikasi Fisik & Restok
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenAction(refund, 'rejected')}
                                                        className="text-[10px] text-rose-600 hover:underline"
                                                    >
                                                        Batalkan / Tolak
                                                    </button>
                                                </div>
                                            ) : refund.status === 'goods_received' ? (
                                                <div className="flex flex-col gap-1 items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenAction(refund, 'approved')}
                                                        className="w-full px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                                                        title="Transfer dana pengembalian ke pelanggan dan catat Buku Kas"
                                                    >
                                                        <Receipt className="w-3.5 h-3.5" />
                                                        Transfer Dana & Selesaikan
                                                    </button>
                                                    {refund.goods_condition_status === 'damaged_quarantine' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenQuarantineModal(refund, (refund.quarantine_disposition as any) || 'supplier_claim')}
                                                            className="w-full px-2 py-1 rounded-lg text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 flex items-center justify-center gap-1 cursor-pointer"
                                                        >
                                                            <Building2 className="w-3 h-3 text-purple-600" />
                                                            {refund.quarantine_disposition ? 'Ubah Disposisi' : 'Disposisi Karantina'}
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <span className="text-[11px] text-gray-400">
                                                        ✓ Selesai
                                                    </span>
                                                    {refund.goods_condition_status === 'damaged_quarantine' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenQuarantineModal(refund, (refund.quarantine_disposition as any) || 'supplier_claim')}
                                                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Building2 className="w-3 h-3 text-purple-600" />
                                                            {refund.quarantine_disposition ? 'Lihat Disposisi' : 'Disposisi Karantina'}
                                                        </button>
                                                    )}
                                                </div>
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
                            <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${actionType === 'approved'
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
                                <div className="text-[11px] text-gray-600 dark:text-gray-300">
                                    Alasan: <span className="font-semibold text-rose-600 dark:text-rose-400">{selectedRefundForAction.reason}</span>
                                </div>
                                {selectedRefundForAction.description && (
                                    <div className="text-[11px] italic bg-white/70 dark:bg-gray-800/60 p-2 rounded-lg">
                                        "{selectedRefundForAction.description}"
                                    </div>
                                )}
                                {actionType === 'approved' && (
                                    <div className="pt-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                                        <ArrowUpFromLine className="w-4 h-4" />
                                        Sistem akan otomatis mencatat Stok Masuk (+{selectedRefundForAction.quantity} unit) ke inventaris gudang!
                                    </div>
                                )}
                            </div>

                            {/* Foto Bukti Kerusakan Fisik */}
                            {selectedRefundForAction.damage_image && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                                            <ImageIcon className="w-3.5 h-3.5" /> Foto Bukti Kerusakan Barang:
                                        </span>
                                        <a
                                            href={selectedRefundForAction.damage_image}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 text-[10px]"
                                        >
                                            <ExternalLink className="w-3 h-3" /> Resolusi Asli
                                        </a>
                                    </div>
                                    <div className="max-h-48 overflow-hidden rounded-lg border border-rose-200 dark:border-rose-800 flex items-center justify-center bg-gray-900/10 p-1.5">
                                        <img
                                            src={selectedRefundForAction.damage_image}
                                            alt="Bukti Kerusakan"
                                            className="max-h-44 object-contain rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Upload Bukti Transfer Pengembalian Dana ke Pelanggan (Khusus Persetujuan Refund) */}
                            {actionType === 'approved' && (
                                <div className="space-y-2 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                                            <Receipt className="w-4 h-4 text-emerald-600" />
                                            Bukti Transfer Pengembalian Dana ke Pelanggan *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowCameraModal(true)}
                                            className="px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold rounded-lg border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
                                            title="Ambil foto resi transfer langsung dari kamera"
                                        >
                                            <Camera className="w-3.5 h-3.5" />
                                            <span>Buka Kamera</span>
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        Kirimkan foto resi transfer pengembalian uang sebesar <strong>Rp {selectedRefundForAction.total_price.toLocaleString('id-ID')}</strong> kepada pelanggan agar mereka dapat melihat bukti pengembalian dananya.
                                    </p>

                                    {transferProofPreview ? (
                                        <div className="relative border-2 border-emerald-400 dark:border-emerald-600 rounded-xl p-2.5 bg-white dark:bg-gray-800 flex items-center gap-3">
                                            <img
                                                src={transferProofPreview}
                                                alt="Pratinjau Bukti Transfer"
                                                className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                                                    {transferProofFile ? transferProofFile.name : 'Bukti Transfer Terlampir'}
                                                </p>
                                                <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                                                    ✓ Siap dikirim ke pelanggan
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTransferProofFile(null);
                                                        setTransferProofPreview(null);
                                                    }}
                                                    className="text-[11px] text-red-500 hover:text-red-700 mt-1 cursor-pointer font-medium"
                                                >
                                                    Hapus / Ganti
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl cursor-pointer hover:bg-emerald-100/40 dark:hover:bg-emerald-900/20 transition-all text-center">
                                            <UploadCloud className="w-6 h-6 text-emerald-600 mb-1" />
                                            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                                                Pilih Foto Bukti Transfer / Resi Bank
                                            </span>
                                            <span className="text-[10px] text-gray-400 mt-0.5">
                                                PNG, JPG, atau WEBP (Maksimal 5MB)
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) {
                                                        setTransferProofFile(f);
                                                        setTransferProofPreview(URL.createObjectURL(f));
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            )}

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
                                    className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${actionType === 'approved'
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

            {/* Modal Detail Bukti Kerusakan Barang (Untuk Manajer / Admin) */}
            {selectedProofRefund && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-rose-50/70 dark:bg-gray-800">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                                    <ImageIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                                        Foto Bukti Kerusakan Fisik Barang
                                    </h3>
                                    <p className="text-[11px] text-gray-500 font-mono">
                                        Pesanan #{selectedProofRefund.order_number} • {selectedProofRefund.customer_name}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedProofRefund(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-4 text-xs">
                            <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Produk Barang:</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">{selectedProofRefund.product_name} ({selectedProofRefund.quantity} unit)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Nilai Refund:</span>
                                    <span className="font-bold text-rose-600 dark:text-rose-400">Rp {selectedProofRefund.total_price.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Alasan Retur:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{selectedProofRefund.reason}</span>
                                </div>
                                {selectedProofRefund.description && (
                                    <div className="pt-1 text-gray-600 dark:text-gray-300 italic bg-white dark:bg-gray-700/50 p-2 rounded-lg">
                                        "{selectedProofRefund.description}"
                                    </div>
                                )}
                            </div>

                            {selectedProofRefund.damage_image ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                            <ImageIcon className="w-4 h-4 text-rose-600" />
                                            Foto Yang Diunggah Customer:
                                        </span>
                                        <a
                                            href={selectedProofRefund.damage_image}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px] font-semibold"
                                        >
                                            <ExternalLink className="w-3 h-3" /> Buka Resolusi Asli
                                        </a>
                                    </div>
                                    <div className="rounded-xl border-2 border-rose-400/50 dark:border-rose-700/50 overflow-hidden bg-gray-900/5 p-2 flex items-center justify-center max-h-72">
                                        <img
                                            src={selectedProofRefund.damage_image}
                                            alt="Bukti Kerusakan"
                                            className="max-h-68 object-contain rounded-lg"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400">
                                    Tidak ada foto kerusakan yang dilampirkan.
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setSelectedProofRefund(null)}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl"
                            >
                                Tutup
                            </button>
                            {selectedProofRefund.status === 'pending' && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const item = selectedProofRefund;
                                            setSelectedProofRefund(null);
                                            handleOpenAction(item, 'rejected');
                                        }}
                                        className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                    >
                                        Tolak
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const item = selectedProofRefund;
                                            setSelectedProofRefund(null);
                                            handleOpenAction(item, 'approved');
                                        }}
                                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors cursor-pointer"
                                    >
                                        Setujui & Restok
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Persetujuan Retur Fisik Barang (Tahap 1) */}
            {selectedRefundForApproveReturn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                <RotateCcw className="w-4 h-4 text-purple-600" />
                                Setujui Klaim Retur Fisik Barang
                            </h3>
                            <button
                                onClick={() => setSelectedRefundForApproveReturn(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleApproveReturnSubmit} className="space-y-4 pt-4 text-xs">
                            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 space-y-1">
                                <div className="font-bold text-purple-900 dark:text-purple-200">
                                    Pesanan #{selectedRefundForApproveReturn.order_number} ({selectedRefundForApproveReturn.customer_name})
                                </div>
                                <div>Produk: <strong>{selectedRefundForApproveReturn.product_name} ({selectedRefundForApproveReturn.quantity} unit)</strong></div>
                                <div>Alasan: <span className="font-semibold text-rose-600">{selectedRefundForApproveReturn.reason}</span></div>
                            </div>

                            <p className="text-gray-500">
                                Dengan menyetujui tahap ini, pelanggan akan diminta mengemas dan mengirimkan barang kembali ke gudang serta menginput nomor resi ekspedisi.
                            </p>

                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Instruksi / Catatan Pengembalian ke Pelanggan
                                </label>
                                <textarea
                                    value={returnInstructionNotes}
                                    onChange={(e) => setReturnInstructionNotes(e.target.value)}
                                    rows={3}
                                    className="w-full text-xs p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white"
                                    placeholder="Tuliskan alamat pengiriman balik gudang atau instruksi khusus..."
                                    required
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRefundForApproveReturn(null)}
                                    className="px-3.5 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>{isSubmitting ? 'Memproses...' : 'Setujui & Minta Resi'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Verifikasi Fisik Barang Tiba di Gudang & Restok (Tahap 2) */}
            {selectedRefundForGoodsReceived && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                <Package className="w-4 h-4 text-teal-600" />
                                Verifikasi Fisik Barang Tiba di Gudang
                            </h3>
                            <button
                                onClick={() => setSelectedRefundForGoodsReceived(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleGoodsReceivedSubmit} className="space-y-4 pt-4 text-xs">
                            <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 space-y-1">
                                <div className="font-bold text-teal-900 dark:text-teal-200">
                                    Pesanan #{selectedRefundForGoodsReceived.order_number}
                                </div>
                                <div>Produk: <strong>{selectedRefundForGoodsReceived.product_name} ({selectedRefundForGoodsReceived.quantity} unit)</strong></div>
                                {selectedRefundForGoodsReceived.return_tracking_number && (
                                    <div className="font-mono text-[11px]">
                                        Resi Ekspedisi Pelanggan: <span className="font-bold">{selectedRefundForGoodsReceived.return_tracking_number}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Pilih Kelayakan & Kebijakan Stok Barang:
                                </label>
                                <div className="grid grid-cols-1 gap-2.5">
                                    <label
                                        onClick={() => setGoodsConditionStatus('good_restock')}
                                        className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${goodsConditionStatus === 'good_restock'
                                                ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200'
                                                : 'border-gray-200 dark:border-gray-750 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="goods_condition"
                                            checked={goodsConditionStatus === 'good_restock'}
                                            onChange={() => setGoodsConditionStatus('good_restock')}
                                            className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div>
                                            <div className="font-bold text-xs flex items-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                Layak Jual Kembali (Restok Otomatis)
                                            </div>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                Fisik barang utuh/berfungsi. Stok gudang bertambah otomatis (+{selectedRefundForGoodsReceived.quantity} unit) dan siap dijual kembali.
                                            </p>
                                        </div>
                                    </label>

                                    <label
                                        onClick={() => setGoodsConditionStatus('damaged_quarantine')}
                                        className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${goodsConditionStatus === 'damaged_quarantine'
                                                ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200'
                                                : 'border-gray-200 dark:border-gray-750 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="goods_condition"
                                            checked={goodsConditionStatus === 'damaged_quarantine'}
                                            onChange={() => setGoodsConditionStatus('damaged_quarantine')}
                                            className="mt-0.5 text-amber-600 focus:ring-amber-500"
                                        />
                                        <div>
                                            <div className="font-bold text-xs flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                                Rusak Parah / Cacat (Simpan di Karantina)
                                            </div>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                Barang pecah/rusak permanen. Disimpan di karantina (stok penjualan TIDAK ditambah agar tidak terhitung lagi). Pelanggan tetap menerima pengembalian dana.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Catatan Kondisi Fisik Paket & Barang Saat Tiba *
                                </label>
                                <textarea
                                    value={goodsConditionNotes}
                                    onChange={(e) => setGoodsConditionNotes(e.target.value)}
                                    rows={3}
                                    className="w-full text-xs p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white"
                                    placeholder={goodsConditionStatus === 'good_restock' ? 'Contoh: Paket diterima utuh, barang tersegel/aksesoris lengkap...' : 'Contoh: Layar retak/hancur, tidak bisa dinyalakan, disimpan di rak karantina gudang...'}
                                    required
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRefundForGoodsReceived(null)}
                                    className="px-3.5 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !goodsConditionNotes.trim()}
                                    className={`px-4 py-2 font-bold text-white rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors ${goodsConditionStatus === 'good_restock'
                                            ? 'bg-teal-600 hover:bg-teal-700'
                                            : 'bg-amber-600 hover:bg-amber-700'
                                        }`}
                                >
                                    <Check className="w-4 h-4" />
                                    <span>
                                        {isSubmitting
                                            ? 'Memproses...'
                                            : goodsConditionStatus === 'good_restock'
                                                ? 'Konfirmasi Tiba & Restok'
                                                : 'Konfirmasi Tiba di Karantina'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Disposisi Barang Karantina (Klaim Supplier / Pemusnahan / Reparasi) */}
            {selectedRefundForQuarantine && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-purple-600" />
                                Tindak Lanjut Disposisi Barang Karantina
                            </h3>
                            <button
                                onClick={() => setSelectedRefundForQuarantine(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleQuarantineSubmit} className="space-y-4 pt-4 text-xs">
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1">
                                <div className="font-bold text-amber-900 dark:text-amber-200">
                                    Pesanan #{selectedRefundForQuarantine.order_number} • {selectedRefundForQuarantine.product_name} ({selectedRefundForQuarantine.quantity} unit)
                                </div>
                                <div className="text-[11px] text-gray-600 dark:text-gray-300">
                                    Supplier Produk: <strong className="text-gray-900 dark:text-white">{selectedRefundForQuarantine.supplier_name || 'Supplier Rekanan'}</strong> ({selectedRefundForQuarantine.supplier_contact || '-'})
                                </div>
                                {selectedRefundForQuarantine.goods_condition_notes && (
                                    <div className="text-[11px] text-rose-700 dark:text-rose-400 italic">
                                        Catatan Fisik: "{selectedRefundForQuarantine.goods_condition_notes}"
                                    </div>
                                )}
                            </div>

                            {/* Pilihan 3 Opsi Disposisi */}
                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Pilih Tindakan Disposisi Akhir:
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuarantineDisposition('supplier_claim');
                                            setQuarantineReference(generateQuarantineRef('supplier_claim', selectedRefundForQuarantine.order_number));
                                            setQuarantineNotes(`Klaim penggantian barang retur kepada supplier ${selectedRefundForQuarantine.supplier_name || 'pabrik'}. Menunggu kompensasi pengiriman unit baru atau pengembalian dana.`);
                                        }}
                                        className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${quarantineDisposition === 'supplier_claim'
                                                ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-1 ring-purple-500'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <Building2 className="w-4 h-4 text-purple-600 mb-1" />
                                        <div className="font-bold text-xs">Klaim Supplier</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">Retur garansi ke pabrik / vendor</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuarantineDisposition('written_off');
                                            setQuarantineReference(generateQuarantineRef('written_off', selectedRefundForQuarantine.order_number));
                                            setQuarantineNotes('Barang rusak parah/cacat permanen dan tidak dapat diperbaiki/diklaim. Berita acara pemusnahan resmi dicatat dan barang dibuang dari inventaris.');
                                        }}
                                        className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${quarantineDisposition === 'written_off'
                                                ? 'border-rose-600 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <Trash2 className="w-4 h-4 text-rose-600 mb-1" />
                                        <div className="font-bold text-xs">Pemusnahan</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">Write-off & buang barang rusak</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuarantineDisposition('repaired');
                                            setQuarantineReference(generateQuarantineRef('repaired', selectedRefundForQuarantine.order_number));
                                            setQuarantineNotes('Barang berhasil diperbaiki internal oleh staf/teknisi gudang dan telah lolos QC untuk direstok kembali ke penjualan.');
                                        }}
                                        className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${quarantineDisposition === 'repaired'
                                                ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <Wrench className="w-4 h-4 text-emerald-600 mb-1" />
                                        <div className="font-bold text-xs">Reparasi Internal</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">Servis & restok ke penjualan</div>
                                    </button>
                                </div>
                            </div>

                            {/* Nomor Referensi (Auto Generated) */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block font-bold text-gray-700 dark:text-gray-300">
                                        Nomor Referensi (ID Klaim / No. BAP)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setQuarantineReference(generateQuarantineRef(quarantineDisposition, selectedRefundForQuarantine.order_number))}
                                        className="text-[11px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 cursor-pointer"
                                        title="Generate ulang ID referensi otomatis"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        <span>Auto Generate ID</span>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={quarantineReference}
                                    onChange={(e) => setQuarantineReference(e.target.value)}
                                    placeholder="CLM-SUP-... / BAP-SCRAP-..."
                                    className="w-full text-xs p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white font-mono font-bold"
                                    required
                                />
                            </div>

                            {/* Catatan Disposisi */}
                            <div>
                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Catatan & Keterangan Disposisi *
                                </label>
                                <textarea
                                    value={quarantineNotes}
                                    onChange={(e) => setQuarantineNotes(e.target.value)}
                                    rows={3}
                                    className="w-full text-xs p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white"
                                    placeholder="Tuliskan detail kronologi, respon supplier, atau instruksi pembuangan..."
                                    required
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRefundForQuarantine(null)}
                                    className="px-3.5 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !quarantineNotes.trim()}
                                    className="px-4 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Disposisi Karantina'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Kamera Pengambilan Foto Bukti Transfer Refund */}
            <CameraCaptureModal
                isOpen={showCameraModal}
                onClose={() => setShowCameraModal(false)}
                onCapture={(file, previewUrl) => {
                    setTransferProofFile(file);
                    setTransferProofPreview(previewUrl);
                }}
                title="Ambil Foto Resi Bukti Transfer Pengembalian Dana"
                fileNamePrefix="resi-transfer-refund"
            />
        </div>
    );
}
