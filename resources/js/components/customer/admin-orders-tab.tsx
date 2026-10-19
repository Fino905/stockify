import React, { useState } from 'react';
import { 
    ShoppingBag, 
    Search, 
    CreditCard, 
    UserCheck, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    Star,
    RotateCcw
} from 'lucide-react';

interface OrderItem {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
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
        rating: number;
        comment: string;
    } | null;
    refund?: {
        reason: string;
        status: string;
    } | null;
}

interface Props {
    orders: OrderItem[];
}

export function AdminOrdersTab({ orders = [] }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = orders.filter((o) => {
        const matchesSearch = 
            o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.staff_name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-blue-600" />
                        Daftar Pesanan & Pembelian Customer
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Rekapitulasi seluruh produk gudang yang dibeli oleh customer secara langsung.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Total {orders.length} Pesanan Masuk
                    </span>
                </div>
            </div>

            {/* Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari no. order, customer, barang, staff..."
                        className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white w-full sm:w-auto"
                >
                    <option value="all">Semua Status Pesanan</option>
                    <option value="completed">Lunas / Selesai</option>
                    <option value="refund_pending">Pengajuan Refund</option>
                    <option value="refund_approved">Refund Disetujui</option>
                    <option value="refund_rejected">Refund Ditolak</option>
                </select>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                    <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Belum ada transaksi customer</h3>
                    <p className="text-xs text-gray-500 mt-1">Gunakan akun Customer (atau role switcher) untuk melakukan pembelian demo.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase font-semibold text-[11px] border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="p-4">No. Order & Tanggal</th>
                                    <th className="p-4">Customer (Pembeli)</th>
                                    <th className="p-4">Barang & Kuantitas</th>
                                    <th className="p-4">Staff Gudang</th>
                                    <th className="p-4">Total Bayar</th>
                                    <th className="p-4">Metode Bayar</th>
                                    <th className="p-4">Status & Ulasan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.map((order) => (
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
                                                {order.customer_name}
                                            </div>
                                            <div className="text-[11px] text-gray-400">
                                                {order.customer_email}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {order.product_name}
                                            </div>
                                            <div className="text-[11px] text-gray-500">
                                                {order.quantity} unit @ Rp {order.unit_price.toLocaleString('id-ID')}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-200">
                                                <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                                                <span>{order.staff_name}</span>
                                            </div>
                                        </td>

                                        <td className="p-4 font-bold text-gray-900 dark:text-white">
                                            Rp {order.total_price.toLocaleString('id-ID')}
                                        </td>

                                        <td className="p-4">
                                            <span className="capitalize font-mono font-semibold text-gray-700 dark:text-gray-300">
                                                {order.payment_method.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <div className="text-[10px] text-emerald-600 font-bold">LUNAS</div>
                                        </td>

                                        <td className="p-4 space-y-1">
                                            <div>
                                                {order.order_status === 'completed' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                        Selesai
                                                    </span>
                                                )}
                                                {order.order_status === 'refund_pending' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                        Ajuan Refund
                                                    </span>
                                                )}
                                                {order.order_status === 'refund_approved' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                                        Refund Disetujui
                                                    </span>
                                                )}
                                                {order.order_status === 'refund_rejected' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                                        Refund Ditolak
                                                    </span>
                                                )}
                                            </div>

                                            {order.feedback && (
                                                <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold" title={order.feedback.comment}>
                                                    <Star className="w-3 h-3 fill-amber-400" />
                                                    <span>{order.feedback.rating}★</span>
                                                    <span className="text-gray-400 font-normal truncate max-w-[120px]">
                                                        "{order.feedback.comment}"
                                                    </span>
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
        </div>
    );
}
