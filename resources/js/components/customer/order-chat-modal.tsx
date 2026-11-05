import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
    MessageSquare, 
    Send, 
    X, 
    Package, 
    User, 
    Shield, 
    Sparkles, 
    Minus, 
    Maximize2, 
    ChevronDown,
    ExternalLink,
    Check,
    Clock,
    Trash2
} from 'lucide-react';

interface OrderMessage {
    id: number | string;
    order_id: number;
    sender_id: number;
    sender_name: string;
    sender_role: string;
    message: string;
    created_at: string;
    isSending?: boolean;
}

interface OrderChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: {
        id: number;
        order_number: string;
        product_name: string;
        product_image?: string | null;
        customer_name?: string;
        customer_email?: string;
        staff_name?: string;
        order_status: string;
        messages?: OrderMessage[];
    } | null;
    currentUser?: {
        id: number;
        name: string;
        role: string;
    } | null;
}

export function OrderChatModal({ isOpen, onClose, order, currentUser }: OrderChatModalProps) {
    const [messageText, setMessageText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [localMessages, setLocalMessages] = useState<OrderMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const isCustomer = currentUser?.role === 'customer';

    // Sinkronisasi pesan lokal saat order atau pesan dari props server diperbarui
    useEffect(() => {
        if (order?.messages) {
            setLocalMessages(order.messages);
        } else {
            setLocalMessages([]);
        }
    }, [order?.id, order?.messages]);

    // Auto-scroll ke bawah saat ada pesan baru di localMessages
    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [localMessages.length, isOpen, isMinimized]);

    // Reset minimized state saat order berubah
    useEffect(() => {
        setIsMinimized(false);
    }, [order?.id]);

    // Auto-refresh pesan secara background setiap 5 detik saat jendela chat aktif terbuka
    useEffect(() => {
        if (!isOpen || isMinimized || !order?.id) return;

        const interval = setInterval(() => {
            router.reload({ only: ['orders'] });
        }, 5000);

        return () => clearInterval(interval);
    }, [isOpen, isMinimized, order?.id]);

    if (!isOpen || !order) return null;

    const handleSendMessage = (textToSend?: string) => {
        const text = (textToSend !== undefined ? textToSend : messageText).trim();
        if (!text || !order) return;

        // 1. KOSONGKAN INPUT SEGERA agar pengguna langsung merasakan respon instan tanpa delay
        if (textToSend === undefined) {
            setMessageText('');
        }

        // 2. TAMPILKAN PESAN SECARA OPTIMIS LANGSUNG ke daftar chat (0ms feedback)
        const tempId = 'temp-' + Date.now();
        const optimisticMsg: OrderMessage = {
            id: tempId,
            order_id: order.id,
            sender_id: currentUser?.id || 0,
            sender_name: currentUser?.name || (isCustomer ? 'Anda' : 'Staff Gudang'),
            sender_role: currentUser?.role || (isCustomer ? 'customer' : 'staff_gudang'),
            message: text,
            created_at: 'Baru saja',
            isSending: true,
        };

        setLocalMessages((prev) => [...prev, optimisticMsg]);
        setIsSending(true);

        // Auto-scroll instan
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 30);

        // 3. Kirim ke backend Laravel via Inertia
        router.post(
            `/orders/${order.id}/messages`,
            { message: text },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['orders'],
                onSuccess: () => {
                    setIsSending(false);
                },
                onError: (errors) => {
                    setIsSending(false);
                    // Jika gagal kirim, hapus pesan optimistik & pulihkan teks ke input
                    setLocalMessages((prev) => prev.filter((m) => m.id !== tempId));
                    setMessageText(text);
                    const errMsg = Object.values(errors)[0] || 'Gagal mengirim pesan. Silakan coba lagi.';
                    alert(errMsg);
                },
            }
        );
    };

    const handleDeleteMessage = (messageId: number | string) => {
        if (typeof messageId === 'string' && messageId.startsWith('temp-')) {
            setLocalMessages((prev) => prev.filter((m) => m.id !== messageId));
            return;
        }

        if (!confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;

        // Optimistic delete: hapus langsung dari daftar pesan
        setLocalMessages((prev) => prev.filter((m) => m.id !== messageId));

        router.delete(`/orders/${order.id}/messages/${messageId}`, {
            preserveScroll: true,
            preserveState: true,
            only: ['orders'],
            onError: () => {
                alert('Gagal menghapus pesan. Silakan coba lagi.');
            },
        });
    };

    const handleClearAllMessages = () => {
        if (localMessages.length === 0) return;
        if (!confirm(`Hapus seluruh riwayat obrolan untuk pesanan #${order.order_number}? Tindakan ini tidak dapat dibatalkan.`)) return;

        // Optimistic clear: kosongkan obrolan seketika
        setLocalMessages([]);

        router.delete(`/orders/${order.id}/messages`, {
            preserveScroll: true,
            preserveState: true,
            only: ['orders'],
            onError: () => {
                alert('Gagal membersihkan obrolan. Silakan coba lagi.');
            },
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const customerQuickChips = [
        'Halo kak, apakah barang sudah siap kirim?',
        'Tolong dipacking aman dengan bubble wrap ya.',
        'Kapan estimasi diserahkan ke kurir?',
        'Terima kasih banyak atas bantuannya!',
    ];

    const staffQuickChips = [
        'Halo kak, pesanan sedang kami periksa dan siapkan.',
        'Barang sudah selesai dipacking rapi dan aman.',
        'Pesanan siap diambil kurir pengiriman hari ini.',
        'Sama-sama kak, senang dapat membantu!',
    ];

    const activeChips = isCustomer ? customerQuickChips : staffQuickChips;

    // JIKA DALAM MODE MINIMIZED: Tampilkan Pil Mengambang di Pojok Kanan Bawah
    if (isMinimized) {
        return (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 p-2 pl-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl border-2 border-white dark:border-gray-800 transition-all cursor-pointer group animate-in slide-in-from-bottom-3 duration-200">
                <div 
                    className="flex items-center gap-2.5" 
                    onClick={() => setIsMinimized(false)}
                    title="Klik untuk membuka jendela chat"
                >
                    <div className="relative">
                        <MessageSquare className="w-5 h-5 text-white" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-blue-600 animate-pulse" />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="font-bold text-xs leading-tight">Chat #{order.order_number}</span>
                        <span className="text-[10px] text-blue-100 truncate max-w-[130px] leading-tight">
                            {isCustomer ? (order.staff_name || 'Staff Gudang') : (order.customer_name || 'Pelanggan')}
                        </span>
                    </div>
                    {localMessages.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-blue-600 shadow-xs">
                            {localMessages.length}
                        </span>
                    )}
                </div>

                <div className="flex items-center pl-1 border-l border-blue-500/60">
                    <button
                        type="button"
                        onClick={() => setIsMinimized(false)}
                        className="p-1 rounded-full hover:bg-white/20 text-blue-100 hover:text-white transition-colors cursor-pointer"
                        title="Buka kembali jendela chat"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-white/20 text-blue-100 hover:text-white transition-colors cursor-pointer ml-0.5"
                        title="Tutup obrolan"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        );
    }

    // JIKA DALAM MODE EXPANDED: Jendela Mengambang (Floating Window) di Pojok Kanan Bawah
    return (
        <aside 
            aria-label="Jendela Chat Pesanan"
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[550px] max-h-[85vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-5 duration-200 overflow-hidden"
            style={{
                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
        >
            {/* Header Jendela Mengambang */}
            <div className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between select-none shrink-0 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                    {order.product_image ? (
                        <img
                            src={order.product_image}
                            alt={order.product_name}
                            className="w-10 h-10 object-cover rounded-xl border border-white/30 shrink-0 shadow-xs bg-white"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold tracking-tight">
                                #{order.order_number}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white/20 text-white uppercase tracking-wider">
                                {order.order_status.replace('_', ' ')}
                            </span>
                        </div>
                        <h4 className="font-bold text-xs truncate max-w-[190px] leading-tight mt-0.5">
                            {order.product_name}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-blue-100 leading-tight mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="truncate max-w-[180px]">
                                {isCustomer 
                                    ? `Staff: ${order.staff_name || 'Staff Gudang'}`
                                    : `Customer: ${order.customer_name || 'Pelanggan'}`
                                }
                            </span>
                        </div>
                    </div>
                </div>

                {/* Kontrol Window: Hapus Semua Chat, Minimize & Close */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                    {localMessages.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAllMessages}
                            className="p-1.5 rounded-lg hover:bg-white/20 text-blue-100 hover:text-red-200 transition-colors cursor-pointer"
                            title="Bersihkan seluruh isi chat pesanan ini"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsMinimized(true)}
                        className="p-1.5 rounded-lg hover:bg-white/20 text-blue-100 hover:text-white transition-colors cursor-pointer"
                        title="Kecilkan jendela chat (Minimize)"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/20 text-blue-100 hover:text-white transition-colors cursor-pointer"
                        title="Tutup obrolan"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Area Aliran Pesan Obrolan */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-gray-50/80 dark:bg-gray-900/50">
                {localMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 shadow-xs">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <h5 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            Obrolan Langsung Pesanan
                        </h5>
                        <p className="text-[11px] text-gray-500 max-w-xs mt-1 leading-relaxed">
                            {isCustomer
                                ? 'Tanyakan seputar persiapan barang, kurir, atau instruksi kemasan langsung kepada staf gudang.'
                                : 'Pelanggan belum mengirim pesan. Anda dapat memulai memberi info estimasi kesiapan barang.'
                            }
                        </p>
                    </div>
                ) : (
                    localMessages.map((msg) => {
                        const isMine = currentUser && (msg.sender_id === currentUser.id || msg.id.toString().startsWith('temp-'));
                        const isStaff = msg.sender_role === 'staff_gudang' || msg.sender_role === 'admin' || msg.sender_role === 'manajer_gudang';
                        const canDelete = isMine || currentUser?.role === 'admin' || currentUser?.role === 'manajer_gudang' || currentUser?.role === 'staff_gudang';

                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group animate-in fade-in duration-150`}
                            >
                                <div className="flex items-center gap-1.5 mb-0.5 px-1">
                                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                                        {isMine ? 'Anda' : msg.sender_name}
                                    </span>
                                    {isStaff && (
                                        <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                                            <Shield className="w-2.5 h-2.5" />
                                            Staff
                                        </span>
                                    )}
                                    <span className="text-[9px] text-gray-400 flex items-center gap-1">
                                        {msg.isSending ? (
                                            <span className="inline-flex items-center gap-1 text-blue-500 font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                                                Mengirim...
                                            </span>
                                        ) : (
                                            msg.created_at
                                        )}
                                    </span>

                                    {/* Tombol Hapus Pesan Individu */}
                                    {canDelete && !msg.isSending && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteMessage(msg.id)}
                                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer ml-0.5"
                                            title="Hapus pesan ini"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-xs break-words leading-relaxed relative ${
                                        isMine
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-none'
                                    } ${msg.isSending ? 'opacity-90' : 'opacity-100'}`}
                                >
                                    {msg.message}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Bar Pesan Cepat (Quick Suggestion Chips) */}
            <div className="px-3 py-1.5 bg-gray-100/80 dark:bg-gray-800 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0 scrollbar-none">
                <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="font-semibold text-gray-500 shrink-0">Cepat:</span>
                {activeChips.map((chip, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(chip)}
                        className="shrink-0 px-2.5 py-0.5 rounded-full bg-white dark:bg-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer whitespace-nowrap active:scale-95"
                    >
                        {chip}
                    </button>
                ))}
            </div>

            {/* Input Pesan di Bagian Bawah Jendela */}
            <div className="p-2.5 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-end gap-2 shrink-0">
                <textarea
                    rows={2}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        isCustomer
                            ? "Tulis pesan ke Staff Gudang... (Tekan Enter untuk kirim)"
                            : "Balas pesan pelanggan... (Tekan Enter untuk kirim)"
                    }
                    className="flex-1 p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-20"
                />
                <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!messageText.trim()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0 h-[38px] active:scale-95"
                    title="Kirim pesan"
                >
                    <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-pulse' : ''}`} />
                    <span>Kirim</span>
                </button>
            </div>
        </aside>
    );
}
