import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    ShoppingBag, 
    Search, 
    CreditCard, 
    UserCheck, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    Star, 
    RotateCcw, 
    XCircle, 
    Package, 
    Receipt, 
    ExternalLink, 
    Image as ImageIcon, 
    X,
    MessageSquare,
    Truck,
    Sparkles
} from 'lucide-react';
import { OrderChatModal } from '@/components/customer/order-chat-modal';

interface OrderItem {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    product_name: string;
    product_sku: string;
    product_image?: string | null;
    category_name: string;
    staff_name: string;
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
    messages?: any[];
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
    currentUser?: any;
}

export function AdminOrdersTab({ orders = [], currentUser }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [selectedProofOrder, setSelectedProofOrder] = useState<OrderItem | null>(null);
    const [selectedOrderForChat, setSelectedOrderForChat] = useState<OrderItem | null>(null);
    const [selectedOrderForShip, setSelectedOrderForShip] = useState<OrderItem | null>(null);
    const [shipCourier, setShipCourier] = useState('J&T Express');
    const [shipTrackingNumber, setShipTrackingNumber] = useState('');

    const generateTrackingId = (courierName: string, orderNumber: string) => {
        const prefix = 
            courierName.includes('J&T') ? 'JT' :
            courierName.includes('JNE') ? 'JNE' :
            courierName.includes('SiCepat') ? '004' :
            courierName.includes('Anteraja') ? 'ANT' :
            courierName.includes('ID Express') ? 'IDX' :
            courierName.includes('Ninja') ? 'NINJA' :
            courierName.includes('GoSend') || courierName.includes('Grab') ? 'INST' : 'STK';
        
        const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const cleanOrderNum = (orderNumber || '').replace(/[^a-zA-Z0-9]/g, '').slice(-4);
        const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}${datePart}${cleanOrderNum || randPart}`;
    };

    // Selalu ambil data pesanan paling mutakhir dari props orders saat ada pesan baru
    const activeChatOrder = selectedOrderForChat
        ? (orders.find((o) => o.id === selectedOrderForChat.id) || selectedOrderForChat)
        : null;

    const filtered = orders.filter((o) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
            (o.order_number || '').toLowerCase().includes(q) ||
            (o.customer_name || '').toLowerCase().includes(q) ||
            (o.product_name || '').toLowerCase().includes(q) ||
            (o.staff_name || '').toLowerCase().includes(q);

        const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const pendingCount = orders.filter(o => o.order_status === 'pending_confirmation').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-blue-600" />
                        Daftar Pesanan & Pembelian Customer
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Rekapitulasi pesanan pembeli. Setiap transaksi yang dibayar membutuhkan konfirmasi Staff atau Management untuk memotong stok gudang.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    {pendingCount > 0 && (
                        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            {pendingCount} Butuh Konfirmasi
                        </span>
                    )}
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Total {orders.length} Pesanan
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
                    <option value="pending_confirmation">Menunggu Konfirmasi Staff / Management</option>
                    <option value="processing">Sedang Dikemas (Gudang)</option>
                    <option value="shipped">Sedang Dikirim (Ekspedisi)</option>
                    <option value="completed">Lunas / Selesai</option>
                    <option value="cancelled">Dibatalkan / Ditolak</option>
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
                                    <th className="p-4">Bukti Transaksi</th>
                                    <th className="p-4">Status & Ulasan</th>
                                    <th className="p-4 text-center">Konfirmasi / Aksi</th>
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
                                            <div className="flex items-center gap-3">
                                                {order.product_image ? (
                                                    <img
                                                        src={order.product_image}
                                                        alt={order.product_name}
                                                        className="w-9 h-9 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shrink-0 shadow-xs"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                        <Package className="w-4 h-4" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white">
                                                        {order.product_name}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500">
                                                        {order.quantity} unit @ Rp {order.unit_price.toLocaleString('id-ID')}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-200">
                                                <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                                                <span>{order.staff_name}</span>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                Rp {order.total_price.toLocaleString('id-ID')}
                                            </div>
                                            <div className="text-[10px] uppercase font-mono text-gray-500">
                                                {order.payment_method.replace('_', ' ')}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            {order.payment_proof ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedProofOrder(order)}
                                                    className="flex items-center gap-2 group cursor-pointer text-left"
                                                    title="Periksa foto bukti transfer dari customer"
                                                >
                                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-emerald-300 dark:border-emerald-700 bg-gray-100 shrink-0">
                                                        <img src={order.payment_proof} alt="Bukti" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
                                                            <Receipt className="w-3 h-3" /> Bukti Foto
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 block">Klik untuk verifikasi</span>
                                                    </div>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedProofOrder(order)}
                                                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-750 dark:text-gray-300 border border-gray-200 dark:border-gray-700 inline-flex items-center gap-1 cursor-pointer transition-colors"
                                                    title="Lihat rincian struk transaksi digital"
                                                >
                                                    <Receipt className="w-3.5 h-3.5 text-blue-500" />
                                                    <span>Struk Digital</span>
                                                </button>
                                            )}
                                        </td>

                                        <td className="p-4 space-y-1">
                                            <div>
                                                {order.order_status === 'pending_confirmation' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                        Menunggu Konfirmasi
                                                    </span>
                                                )}
                                                {order.order_status === 'processing' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                                        Sedang Dikemas (Gudang)
                                                    </span>
                                                )}
                                                {order.order_status === 'shipped' && (
                                                    <div className="space-y-0.5">
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1 w-fit">
                                                            <Truck className="w-3 h-3" /> Dikirim: {order.shipping_courier || 'Ekspedisi'}
                                                        </span>
                                                        {order.tracking_number && (
                                                            <div className="text-[10px] font-mono text-gray-500">
                                                                Resi: <span className="font-semibold text-gray-700 dark:text-gray-300">{order.tracking_number}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {order.order_status === 'completed' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                        Selesai / Diterima
                                                    </span>
                                                )}
                                                {order.order_status === 'cancelled' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                        Dibatalkan
                                                    </span>
                                                )}
                                                {order.order_status === 'refund_pending' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                        Ajuan Refund
                                                    </span>
                                                )}
                                                {order.order_status === 'return_approved' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                                        Retur Disetujui
                                                    </span>
                                                )}
                                                {order.order_status === 'return_shipped' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                                        Retur Dikirim Customer
                                                    </span>
                                                )}
                                                {order.order_status === 'goods_received' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                                                        Fisik Tiba di Gudang
                                                    </span>
                                                )}
                                                {order.order_status === 'refund_approved' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                                        Refund Selesai
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
                                                    <span>{order.feedback.rating}/5</span>
                                                    <span className="text-gray-400 font-normal truncate max-w-[120px]">
                                                        "{order.feedback.comment}"
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {/* Button Chat Customer */}
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedOrderForChat(order)}
                                                    className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold rounded-lg text-[11px] cursor-pointer transition-colors inline-flex items-center gap-1"
                                                    title="Chat langsung dengan customer"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    <span>Chat</span>
                                                    {order.messages && order.messages.length > 0 && (
                                                        <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[9px] font-bold">
                                                            {order.messages.length}
                                                        </span>
                                                    )}
                                                </button>

                                                {order.order_status === 'pending_confirmation' ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            disabled={processingId === order.id}
                                                            onClick={() => {
                                                                if (confirm(`Konfirmasi pembayaran dan sahkan pesanan #${order.order_number}? Stok produk ${order.product_name} (${order.quantity} unit) akan otomatis dipotong dari gudang.`)) {
                                                                    setProcessingId(order.id);
                                                                    router.post(`/orders/${order.id}/confirm`, {}, {
                                                                        onFinish: () => setProcessingId(null)
                                                                    });
                                                                }
                                                            }}
                                                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-[11px] inline-flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                                                            title="Sahkan pesanan dan potong stok inventaris"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            <span>{processingId === order.id ? 'Memproses...' : 'Konfirmasi'}</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={processingId === order.id}
                                                            onClick={() => {
                                                                if (confirm(`Tolak atau batalkan pesanan #${order.order_number}?`)) {
                                                                    setProcessingId(order.id);
                                                                    router.post(`/orders/${order.id}/reject`, {}, {
                                                                        onFinish: () => setProcessingId(null)
                                                                    });
                                                                }
                                                            }}
                                                            className="px-2 py-1.5 bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-rose-950 font-bold rounded-lg text-[11px] cursor-pointer transition-colors"
                                                            title="Batalkan pesanan"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </>
                                                ) : order.order_status === 'processing' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedOrderForShip(order);
                                                            setShipTrackingNumber('');
                                                            const defaultCourier = 'J&T Express';
                                                            setShipCourier(defaultCourier);
                                                            setShipTrackingNumber(generateTrackingId(defaultCourier, order.order_number));
                                                        }}
                                                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] inline-flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                                                        title="Input kurir ekspedisi dan nomor resi untuk pengiriman"
                                                    >
                                                        <Truck className="w-3.5 h-3.5" />
                                                        <span>Kirim Kurir</span>
                                                    </button>
                                                ) : order.order_status === 'shipped' ? (
                                                    <button
                                                        type="button"
                                                        disabled={processingId === order.id}
                                                        onClick={() => {
                                                            if (confirm(`Tandai pesanan #${order.order_number} telah sampai dan selesai diterima oleh pelanggan?`)) {
                                                                setProcessingId(order.id);
                                                                router.post(`/orders/${order.id}/complete`, {}, {
                                                                    onFinish: () => setProcessingId(null)
                                                                });
                                                            }
                                                        }}
                                                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                                                        title="Tandai pesanan telah sampai di tangan customer"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        <span>Selesai</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-gray-400 font-medium">
                                                        ✓ Terverifikasi
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL VERIFIKASI BUKTI TRANSAKSI CUSTOMER (UNTUK MANAJER / STAFF) */}
            {selectedProofOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                                        Verifikasi Bukti Transaksi Customer
                                    </h3>
                                    <p className="text-[11px] text-gray-500 font-mono">
                                        No. Pesanan: #{selectedProofOrder.order_number}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedProofOrder(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-4 text-xs">
                            {/* Ringkasan Customer & Transaksi */}
                            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-750/70 space-y-2">
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>Nama Customer:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{selectedProofOrder.customer_name} ({selectedProofOrder.customer_email})</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>Produk Dibeli:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{selectedProofOrder.product_name} ({selectedProofOrder.quantity} unit)</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>Metode Pembayaran:</span>
                                    <span className="font-semibold uppercase text-gray-900 dark:text-white">{selectedProofOrder.payment_method.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>No. Ref Pembayaran:</span>
                                    <span className="font-mono text-gray-700 dark:text-gray-300">{selectedProofOrder.payment_reference || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>Staff Pelayan Gudang:</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedProofOrder.staff_name}</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between items-center">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">Total Tagihan:</span>
                                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                                        Rp {selectedProofOrder.total_price.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            {/* Foto Bukti Transfer / Resi */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                                        <span>Bukti Pembayaran dari Customer</span>
                                    </h4>
                                    {selectedProofOrder.payment_proof && (
                                        <a
                                            href={selectedProofOrder.payment_proof}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                                        >
                                            <ExternalLink className="w-3 h-3" /> Buka Resolusi Asli
                                        </a>
                                    )}
                                </div>

                                {selectedProofOrder.payment_proof ? (
                                    <div className="rounded-xl border-2 border-emerald-500/40 dark:border-emerald-500/30 overflow-hidden bg-gray-900/5 p-2 flex items-center justify-center max-h-72">
                                        <img
                                            src={selectedProofOrder.payment_proof}
                                            alt="Bukti Transfer Customer"
                                            className="max-h-68 object-contain rounded-lg"
                                        />
                                    </div>
                                ) : (
                                    <div className="p-5 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-750 text-center space-y-1.5">
                                        <Receipt className="w-9 h-9 text-blue-500 mx-auto mb-1" />
                                        <div className="font-bold text-gray-800 dark:text-gray-200">
                                            Struk Digital Otomatis
                                        </div>
                                        <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                                            Customer melakukan simulasi pembayaran instan dan tidak melampirkan berkas foto transfer fisik. Referensi simulasi: <code className="font-mono font-bold text-gray-700 dark:text-gray-300">{selectedProofOrder.payment_reference}</code>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer / Tindakan Langsung Manajer */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setSelectedProofOrder(null)}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl"
                            >
                                Tutup
                            </button>

                            {selectedProofOrder.order_status === 'pending_confirmation' && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={processingId === selectedProofOrder.id}
                                        onClick={() => {
                                            if (confirm(`Tolak pesanan #${selectedProofOrder.order_number}?`)) {
                                                const id = selectedProofOrder.id;
                                                setProcessingId(id);
                                                router.post(`/orders/${id}/reject`, {}, {
                                                    onFinish: () => {
                                                        setProcessingId(null);
                                                        setSelectedProofOrder(null);
                                                    }
                                                });
                                            }
                                        }}
                                        className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        Tolak Pesanan
                                    </button>
                                    <button
                                        type="button"
                                        disabled={processingId === selectedProofOrder.id}
                                        onClick={() => {
                                            if (confirm(`Sahkan pesanan #${selectedProofOrder.order_number} dan potong stok ${selectedProofOrder.product_name} (${selectedProofOrder.quantity} unit) dari gudang?`)) {
                                                const id = selectedProofOrder.id;
                                                setProcessingId(id);
                                                router.post(`/orders/${id}/confirm`, {}, {
                                                    onFinish: () => {
                                                        setProcessingId(null);
                                                        setSelectedProofOrder(null);
                                                    }
                                                });
                                            }
                                        }}
                                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{processingId === selectedProofOrder.id ? 'Memproses...' : 'Konfirmasi & Potong Stok'}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL INPUT KURIR & NOMOR RESI PENGIRIMAN */}
            {selectedOrderForShip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-theme-primary text-white rounded-lg">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                        Kirim Pesanan #{selectedOrderForShip.order_number}
                                    </h3>
                                    <p className="text-[11px] text-gray-500">
                                        Serahkan paket ke ekspedisi & catat nomor resi
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedOrderForShip(null)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!shipTrackingNumber.trim()) {
                                    alert('Silakan masukkan nomor resi pengiriman ekspedisi.');
                                    return;
                                }
                                const orderId = selectedOrderForShip.id;
                                setProcessingId(orderId);
                                router.post(`/orders/${orderId}/ship`, {
                                    shipping_courier: shipCourier,
                                    tracking_number: shipTrackingNumber.trim(),
                                }, {
                                    onFinish: () => {
                                        setProcessingId(null);
                                        setSelectedOrderForShip(null);
                                    }
                                });
                            }}
                            className="p-5 space-y-4"
                        >
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 text-xs space-y-1">
                                <div className="text-gray-500">Penerima: <span className="font-bold text-gray-800 dark:text-gray-200">{selectedOrderForShip.customer_name}</span></div>
                                <div className="text-gray-500">Barang: <span className="font-bold text-gray-800 dark:text-gray-200">{selectedOrderForShip.product_name} ({selectedOrderForShip.quantity} unit)</span></div>
                            </div>

                            {/* Info Petugas Pengirim (Auto Generate ID Pengirim) */}
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs">
                                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
                                    <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                                    <div>
                                        <div className="font-bold">Petugas Pengirim Gudang:</div>
                                        <div className="text-[11px] text-blue-700 dark:text-blue-300">
                                            {currentUser?.name || 'Staf Gudang'} <span className="font-mono text-gray-500 font-normal">(ID Staf: #STF-{currentUser?.id || '1'})</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                                    Auto Assigned
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Pilih Ekspedisi / Kurir Pengiriman
                                </label>
                                <select
                                    value={shipCourier}
                                    onChange={(e) => setShipCourier(e.target.value)}
                                    className="w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white"
                                    onChange={(e) => {
                                        const newCourier = e.target.value;
                                        setShipCourier(newCourier);
                                        setShipTrackingNumber(generateTrackingId(newCourier, selectedOrderForShip.order_number));
                                    }}
                                    className="w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white font-medium"
                                    required
                                >
                                    <option value="J&T Express">J&T Express</option>
                                    <option value="JNE Express">JNE Express</option>
                                    <option value="SiCepat Express">SiCepat Express</option>
                                    <option value="Anteraja">Anteraja</option>
                                    <option value="ID Express">ID Express</option>
                                    <option value="Ninja Xpress">Ninja Xpress</option>
                                    <option value="GoSend / GrabExpress">GoSend / GrabExpress (Instant/Same Day)</option>
                                    <option value="Kurir Toko / Gudang">Kurir Toko / Gudang</option>
                                    <option value="Ambil Sendiri di Gudang">Ambil Sendiri di Gudang</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Nomor Resi Pengiriman (Airwaybill / Tracking ID)
                                </label>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                                        ID Pengiriman / Nomor Resi (Airwaybill)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShipTrackingNumber(generateTrackingId(shipCourier, selectedOrderForShip.order_number))}
                                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer"
                                        title="Generate ID pengiriman baru otomatis"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        <span>Auto Generate ID</span>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={shipTrackingNumber}
                                    onChange={(e) => setShipTrackingNumber(e.target.value)}
                                    placeholder="Contoh: JT8291039812 / JNE99281928"
                                    className="w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white font-mono"
                                    className="w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white font-mono font-bold text-blue-600 dark:text-blue-400"
                                    required
                                />
                                <p className="text-[10px] text-gray-400 mt-1">
                                    ✓ ID resi digenerate otomatis berdasarkan kurir & nomor pesanan. Dapat diedit jika ada resi fisik.
                                </p>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setSelectedOrderForShip(null)}
                                    className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processingId === selectedOrderForShip.id || !shipTrackingNumber.trim()}
                                    className="px-4 py-2 text-xs font-bold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Truck className="w-4 h-4" />
                                    <span>{processingId === selectedOrderForShip.id ? 'Mengirim...' : 'Konfirmasi Pengiriman'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL CHAT LANGSUNG DENGAN PELANGGAN */}
            <OrderChatModal
                isOpen={!!activeChatOrder}
                onClose={() => setSelectedOrderForChat(null)}
                order={activeChatOrder}
                currentUser={currentUser}
            />
        </div>
    );
}
