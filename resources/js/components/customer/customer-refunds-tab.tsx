import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { RotateCcw, Clock, CheckCircle2, AlertCircle, ShoppingBag, ShieldCheck, ExternalLink, Image as ImageIcon, Receipt, X, Truck, Send } from 'lucide-react';

interface OrderItem {
    id: number;
    order_number: string;
    product_name: string;
    quantity: number;
    total_price: number;
    order_status: string;
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
}

export function CustomerRefundsTab({ orders = [] }: Props) {
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const [selectedRefundForReturnTracking, setSelectedRefundForReturnTracking] = useState<OrderItem | null>(null);
    const [customerReturnTracking, setCustomerReturnTracking] = useState('');
    const [isSubmittingReturnTracking, setIsSubmittingReturnTracking] = useState(false);

    // Filter orders that have refund data
    const refundOrders = orders.filter((o) => !!o.refund || o.order_status.startsWith('refund_'));

    return (
        <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <RotateCcw className="w-5 h-5 text-rose-600" />
                        Status Pengajuan Refund & Retur Barang
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Pantau status persetujuan refund serta bukti pengembalian uang dari manajemen Stockify.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Aturan Refund: Maksimal 3 Hari Sejak Beli
                    </span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        {refundOrders.length} Pengajuan Refund
                    </span>
                </div>
            </div>

            {refundOrders.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                    <ShieldCheck className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Tidak ada pengajuan refund aktif</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Jika ada barang pesanan yang rusak atau salah kirim, Anda dapat mengajukan refund di tab <strong>Pesanan & Pembayaran</strong>.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {refundOrders.map((ord) => {
                        const refund = ord.refund;
                        const status = refund?.status || (ord.order_status === 'refund_approved' ? 'approved' : ord.order_status === 'refund_rejected' ? 'rejected' : 'pending');

                        return (
                            <div 
                                key={ord.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm space-y-3"
                            >
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
                                    <div>
                                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                                            #{ord.order_number}
                                        </span>
                                        <div className="text-[11px] text-gray-400">
                                            Diajukan: {refund?.created_at || 'Baru Saja'}
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                                        status === 'approved' 
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200' 
                                            : status === 'return_approved'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200'
                                                : status === 'return_shipped'
                                                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200'
                                                    : status === 'goods_received'
                                                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200'
                                                        : status === 'rejected'
                                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                                    }`}>
                                        {status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        {status === 'return_approved' && <RotateCcw className="w-3.5 h-3.5" />}
                                        {status === 'return_shipped' && <Truck className="w-3.5 h-3.5" />}
                                        {status === 'goods_received' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        {status === 'rejected' && <AlertCircle className="w-3.5 h-3.5" />}
                                        {status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                                        {status === 'approved' && 'Refund Selesai (Restok & Dana Kembali)'}
                                        {status === 'return_approved' && 'Retur Disetujui (Kirim Barang)'}
                                        {status === 'return_shipped' && 'Retur Sedang Menuju Gudang'}
                                        {status === 'goods_received' && 'Fisik Tiba di Gudang (Proses Transfer)'}
                                        {status === 'rejected' && 'Refund Ditolak'}
                                        {status === 'pending' && 'Menunggu Tinjauan Gudang'}
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Produk Barang:</span>
                                        <span className="font-bold text-gray-800 dark:text-gray-200">
                                            {ord.product_name} ({ord.quantity} unit)
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Nilai Refund:</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            Rp {ord.total_price.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Alasan:</span>
                                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                                            {refund?.reason || 'Barang Rusak'}
                                        </span>
                                    </div>
                                    {refund?.description && (
                                        <div className="pt-2 text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-700/40 p-2.5 rounded-xl">
                                            "{refund.description}"
                                        </div>
                                    )}

                                    {refund?.damage_image && (
                                        <div className="pt-2">
                                            <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                                                    <ImageIcon className="w-3.5 h-3.5" /> Bukti Foto Kerusakan Fisik:
                                                </span>
                                                <a 
                                                    href={refund.damage_image} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 text-[10px]"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> Buka Foto Asli
                                                </a>
                                            </div>
                                            <div className="rounded-xl overflow-hidden border border-rose-200 dark:border-rose-800 bg-gray-50 dark:bg-gray-700/40 p-1.5 flex items-center justify-center max-h-48">
                                                <img 
                                                    src={refund.damage_image} 
                                                    alt="Bukti Kerusakan" 
                                                    className="max-h-44 rounded-lg object-contain cursor-pointer hover:opacity-95 transition-opacity" 
                                                    onClick={() => setViewingImage(refund.damage_image || null)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {status === 'return_approved' && (
                                        <div className="pt-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
                                            <div className="text-purple-900 dark:text-purple-200 font-semibold flex items-center justify-between">
                                                <span className="flex items-center gap-1">
                                                    <Truck className="w-4 h-4 text-purple-600" />
                                                    Langkah Selanjutnya: Kirim Barang & Resi
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedRefundForReturnTracking(ord);
                                                        setCustomerReturnTracking(refund?.return_tracking_number || '');
                                                    }}
                                                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 cursor-pointer shadow-xs"
                                                >
                                                    Input Resi
                                                </button>
                                            </div>
                                            <p className="text-[11px] text-purple-800 dark:text-purple-300">
                                                Silakan kirimkan barang fisik ke gudang dan masukkan nomor resi ekspedisi agar staf dapat memverifikasi kedatangan paket.
                                            </p>
                                        </div>
                                    )}

                                    {status === 'return_shipped' && refund?.return_tracking_number && (
                                        <div className="pt-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs">
                                            <span className="font-semibold flex items-center gap-1">
                                                <Truck className="w-4 h-4 text-indigo-600" />
                                                Nomor Resi Pengembalian:
                                            </span>
                                            <span className="font-mono font-bold text-sm block mt-0.5">{refund.return_tracking_number}</span>
                                            <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-1">
                                                Paket Anda sedang menuju gudang. Staf gudang akan memverifikasi kondisi barang saat tiba.
                                            </p>
                                        </div>
                                    )}

                                    {status === 'goods_received' && (
                                        <div className="pt-2 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs">
                                            <span className="font-semibold flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                                Paket Retur Telah Diterima di Gudang
                                            </span>
                                            <p className="text-[11px] text-teal-800 dark:text-teal-300 mt-1">
                                                Barang telah diverifikasi oleh tim gudang. Manajer sedang memproses transfer dana refund ke rekening Anda.
                                            </p>
                                        </div>
                                    )}

                                    {/* Bukti Transfer Pengembalian Dana dari Manager */}
                                    {refund?.refund_transfer_proof && (
                                        <div className="pt-2">
                                            <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                    <Receipt className="w-3.5 h-3.5" /> Bukti Transfer Uang Kembali (Manager):
                                                </span>
                                                <a 
                                                    href={refund.refund_transfer_proof} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5 text-[10px]"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> Buka Resolusi Asli
                                                </a>
                                            </div>
                                            <div className="rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 p-2 flex flex-col items-center justify-center space-y-1.5">
                                                <p className="text-[11px] text-emerald-800 dark:text-emerald-200 text-center">
                                                    Uang sebesar <strong>Rp {ord.total_price.toLocaleString('id-ID')}</strong> telah ditransfer kembali ke rekening Anda.
                                                </p>
                                                <img 
                                                    src={refund.refund_transfer_proof} 
                                                    alt="Bukti Transfer Refund" 
                                                    className="max-h-48 rounded-lg object-contain cursor-pointer hover:scale-[1.02] transition-transform" 
                                                    onClick={() => setViewingImage(refund.refund_transfer_proof || null)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {refund?.admin_notes && (
                                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-xs">
                                        <div className="font-bold text-blue-900 dark:text-blue-300 mb-0.5">
                                            Tanggapan Staff / Admin ({refund.processor_name}):
                                        </div>
                                        <p className="text-blue-800 dark:text-blue-200">
                                            {refund.admin_notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Zoom Foto / Bukti */}
            {viewingImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                Pratinjau Foto Bukti
                            </h4>
                            <button
                                type="button"
                                onClick={() => setViewingImage(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 flex items-center justify-center overflow-auto max-h-[70vh] bg-gray-950/5 dark:bg-gray-900/40">
                            <img
                                src={viewingImage}
                                alt="Foto"
                                className="max-h-[65vh] object-contain rounded-xl"
                            />
                        </div>
                        <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setViewingImage(null)}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 rounded-xl cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Input Nomor Resi Retur oleh Pelanggan */}
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
                                    Catatan Gudang: <em>"{selectedRefundForReturnTracking.refund.admin_notes || 'Silakan kirimkan paket fisik kembali ke gudang.'}"</em>
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
                                Setelah resi disimpan, staf gudang akan memeriksa kondisi fisik paket saat tiba di gudang.
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
        </div>
    );
}
