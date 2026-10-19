import React from 'react';
import { RotateCcw, Clock, CheckCircle2, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

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
        status: string;
        admin_notes: string | null;
        processor_name: string;
        created_at: string;
    } | null;
}

interface Props {
    orders: OrderItem[];
}

export function CustomerRefundsTab({ orders = [] }: Props) {
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
                        Pantau status persetujuan refund dari tim Staff Gudang & Admin Stockify.
                    </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 self-start md:self-auto">
                    {refundOrders.length} Pengajuan Refund
                </span>
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
                                            : status === 'rejected'
                                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'
                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                                    }`}>
                                        {status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        {status === 'rejected' && <AlertCircle className="w-3.5 h-3.5" />}
                                        {status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                                        {status === 'approved' && 'Refund Disetujui (Restok)'}
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
        </div>
    );
}
