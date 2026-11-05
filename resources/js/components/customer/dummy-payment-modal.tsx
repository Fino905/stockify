import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
    X, 
    Check, 
    CreditCard, 
    QrCode, 
    Smartphone, 
    Building, 
    ShieldCheck, 
    Clock, 
    AlertCircle, 
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    ShoppingBag,
    Sparkles,
    UserCheck,
    UploadCloud,
    Receipt,
    Image as ImageIcon,
    Camera
} from 'lucide-react';
import { CameraCaptureModal } from '@/components/common/camera-capture-modal';

interface Product {
    id: number;
    name: string;
    sku: string;
    description: string | null;
    image?: string | null;
    selling_price: number;
    current_stock: number;
    category_name: string;
}

interface StaffMember {
    id: number;
    name: string;
    email: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    staffMembers: StaffMember[];
}

export function DummyPaymentModal({ isOpen, onClose, product, staffMembers }: Props) {
    if (!isOpen || !product) return null;

    const [step, setStep] = useState<'details' | 'method' | 'pay'>('details');
    const [quantity, setQuantity] = useState(1);
    const [selectedStaffId, setSelectedStaffId] = useState<number>(staffMembers[0]?.id || 0);
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('qris');
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(900); // 15 menit countdown

    // Reset state saat modal dibuka
    useEffect(() => {
        setStep('details');
        setQuantity(1);
        setSelectedStaffId(staffMembers[0]?.id || 0);
        setNotes('');
        setPaymentMethod('qris');
        setPaymentProofFile(null);
        setPaymentProofPreview(null);
        setIsSubmitting(false);
        setSecondsLeft(900);
    }, [product, isOpen]);

    useEffect(() => {
        if (step !== 'pay') return;
        const timer = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [step]);

    const formatMinutes = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const unitPrice = product.selling_price;
    const totalPrice = unitPrice * quantity;
    const dummyRef = `SIM-${Math.floor(100000 + Math.random() * 900000)}`;

    const handleConfirmPayment = () => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('product_id', String(product.id));
        formData.append('quantity', String(quantity));
        formData.append('payment_method', paymentMethod);
        if (selectedStaffId) formData.append('staff_id', String(selectedStaffId));
        if (notes) formData.append('notes', notes);
        if (paymentProofFile) {
            formData.append('payment_proof', paymentProofFile);
        }

        router.post('/orders', formData, {
            preserveScroll: true,
            onFinish: () => {
                setIsSubmitting(false);
                onClose();
            },
        });
    };

    const paymentMethods = [
        {
            id: 'qris',
            name: 'QRIS Instan (Simulasi)',
            desc: 'Scan barcode dummy langsung lunas otomatis',
            icon: QrCode,
            badge: 'Paling Cepat',
            badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        },
        {
            id: 'bca_va',
            name: 'BCA Virtual Account',
            desc: 'Kode Bayar Virtual: 8801 9283 1092 8371',
            icon: Building,
            badge: 'Otomatis',
            badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        },
        {
            id: 'mandiri_va',
            name: 'Mandiri Virtual Account',
            desc: 'Kode Bayar Virtual: 8901 3847 2910 4402',
            icon: Building,
            badge: 'Otomatis',
            badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        },
        {
            id: 'bri_va',
            name: 'BRI Virtual Account (BRIVA)',
            desc: 'Kode Bayar Virtual: 1283 4918 0294 8831',
            icon: Building,
            badge: 'Otomatis',
            badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
        },
        {
            id: 'gopay',
            name: 'GoPay / OVO / Dana',
            desc: 'Simulasi e-wallet instan tanpa biaya admin',
            icon: Smartphone,
            badge: 'E-Wallet',
            badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
        },
    ];

    const currentMethod = paymentMethods.find(m => m.id === paymentMethod) || paymentMethods[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                                Pembelian Produk
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                                    Simulasi Mainan
                                </span>
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Alur transaksi langsung memotong stok dari staff gudang
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Stepper Progress */}
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs">
                    <div className={`flex items-center gap-1.5 font-medium ${step === 'details' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500'}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>1</span>
                        Rincian Pesanan
                    </div>
                    <div className="w-6 h-0.5 bg-gray-200 dark:bg-gray-700" />
                    <div className={`flex items-center gap-1.5 font-medium ${step === 'method' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500'}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'method' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>2</span>
                        Pilih Pembayaran
                    </div>
                    <div className="w-6 h-0.5 bg-gray-200 dark:bg-gray-700" />
                    <div className={`flex items-center gap-1.5 font-medium ${step === 'pay' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500'}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'pay' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>3</span>
                        Bayar (Simulasi)
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                    {/* STEP 1: Rincian Produk & Kuantitas */}
                    {step === 'details' && (
                        <div className="space-y-4">
                            {/* Product Card */}
                            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex items-center gap-3.5">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-600 shrink-0 shadow-xs"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <Package className="w-8 h-8" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                                        {product.category_name}
                                    </span>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-base truncate">
                                        {product.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">SKU: {product.sku}</p>
                                    <div className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                                        Rp {unitPrice.toLocaleString('id-ID')} <span className="text-xs font-normal text-gray-500">/ unit</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                        Stok: {product.current_stock}
                                    </span>
                                </div>
                            </div>

                            {/* Quantity Selection */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Jumlah Pembelian (Unit)
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                        className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max={product.current_stock}
                                        value={quantity}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 1;
                                            setQuantity(Math.min(Math.max(1, val), product.current_stock));
                                        }}
                                        className="w-20 text-center font-bold py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.min(product.current_stock, quantity + 1))}
                                        disabled={quantity >= product.current_stock}
                                        className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
                                    >
                                        +
                                    </button>
                                    <span className="text-xs text-gray-500">Maks. {product.current_stock} unit</span>
                                </div>
                            </div>

                            {/* Staff Gudang Pengambil Barang */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                    <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                                    Staff Gudang yang Melayani Transaksi:
                                </label>
                                <select
                                    value={selectedStaffId}
                                    onChange={(e) => setSelectedStaffId(Number(e.target.value))}
                                    className="w-full text-sm py-2.5 px-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white"
                                >
                                    {staffMembers.length > 0 ? (
                                        staffMembers.map((staff) => (
                                            <option key={staff.id} value={staff.id}>
                                                {staff.name} (Staff Gudang - {staff.email})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="0">Staff Gudang Umum (Default Sistem)</option>
                                    )}
                                </select>
                                <p className="text-[11px] text-gray-500 mt-1">
                                    Stok akan otomatis tercatat keluar dan dipotong melalui akun staff gudang ini.
                                </p>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Catatan Pembelian (Opsional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Contoh: Tolong packing rapi dengan bubble wrap..."
                                    rows={2}
                                    className="w-full text-xs p-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {/* Subtotal summary */}
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-between border border-blue-100 dark:border-blue-900/50">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Total Pembayaran:</span>
                                <span className="text-base font-extrabold text-blue-700 dark:text-blue-300">
                                    Rp {totalPrice.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Pilih Metode Pembayaran Mainan */}
                    {step === 'method' && (
                        <div className="space-y-3">
                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Pilih Saluran Pembayaran (Simulasi Instan):
                            </div>
                            {paymentMethods.map((m) => {
                                const Icon = m.icon;
                                const isSelected = paymentMethod === m.id;
                                return (
                                    <div
                                        key={m.id}
                                        onClick={() => setPaymentMethod(m.id)}
                                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                            isSelected
                                                ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                                isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                            }`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-xs text-gray-900 dark:text-white">
                                                    {m.name}
                                                </div>
                                                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                                    {m.desc}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.badgeColor}`}>
                                                {m.badge}
                                            </span>
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                                            }`}>
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* STEP 3: Tampilan Layar Pembayaran Mainan (Simulasi Gateway) */}
                    {step === 'pay' && (
                        <div className="space-y-4">
                            {/* Notice Banner */}
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2.5">
                                <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                                    <strong>Mode Simulasi Mainan:</strong> Anda tidak akan dikenakan biaya riil. Klik tombol <strong>Bayar Sekarang (Simulasi)</strong> di bawah untuk mengonfirmasi transaksi dan mengurangi stok di gudang.
                                </div>
                            </div>

                            {/* Simulated Payment Gateway Card */}
                            <div className="p-5 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl relative overflow-hidden">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                            <CreditCard className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">Stockify Pay (Simulasi)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono bg-white/10 px-2 py-0.5 rounded-md">
                                        <Clock className="w-3.5 h-3.5" />
                                        {formatMinutes(secondsLeft)}
                                    </div>
                                </div>

                                <div className="text-center py-3 border-y border-white/10 my-3">
                                    <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">
                                        Total Tagihan Mainan
                                    </div>
                                    <div className="text-2xl font-black text-emerald-400">
                                        Rp {totalPrice.toLocaleString('id-ID')}
                                    </div>
                                </div>

                                {/* Channel specific detail */}
                                {paymentMethod === 'qris' ? (
                                    <div className="bg-white p-4 rounded-xl text-gray-900 flex flex-col items-center justify-center my-2">
                                        <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center p-2">
                                            <QrCode className="w-20 h-20 text-gray-800" />
                                            <span className="text-[9px] font-bold text-blue-700 mt-1 uppercase">QRIS DUMMY AKTIF</span>
                                        </div>
                                        <span className="text-[11px] text-gray-500 mt-2">NMID: ID1029384729104</span>
                                    </div>
                                ) : (
                                    <div className="bg-white/10 p-3 rounded-xl space-y-1 text-center my-2">
                                        <div className="text-[11px] text-gray-300 uppercase">{currentMethod.name}</div>
                                        <div className="font-mono text-base font-extrabold tracking-wider text-amber-300">
                                            {paymentMethod === 'bca_va' && '8801 9283 1092 8371'}
                                            {paymentMethod === 'mandiri_va' && '8901 3847 2910 4402'}
                                            {paymentMethod === 'bri_va' && '1283 4918 0294 8831'}
                                            {paymentMethod === 'gopay' && '0812-9928-1029'}
                                        </div>
                                        <div className="text-[10px] text-gray-400">Atas Nama: PT STOCKIFY INTI JAYA</div>
                                    </div>
                                )}

                                <div className="text-[11px] text-gray-400 text-center mt-3">
                                    No. Referensi: <span className="font-mono text-gray-200">{dummyRef}</span>
                                </div>
                            </div>

                            {/* UNGGAH BUKTI TRANSAKSI / TRANSFER (DITAMPILKAN KE MANAJER) */}
                            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-750/70 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                        <Receipt className="w-4 h-4 text-blue-600" />
                                        <span>Unggah Bukti Transaksi / Transfer</span>
                                        <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400 font-semibold">(Untuk Verifikasi Manajer)</span>
                                    </label>
                                    {paymentProofPreview && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentProofFile(null);
                                                setPaymentProofPreview(null);
                                            }}
                                            className="text-[11px] text-rose-500 hover:underline font-semibold cursor-pointer"
                                        >
                                            Hapus Foto
                                        </button>
                                    )}
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Lampirkan screenshot/foto struk transfer agar dapat langsung diperiksa dan dikonfirmasi oleh Manajer Gudang untuk mengeluarkan barang.
                                </p>

                                {paymentProofPreview ? (
                                    <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-gray-900/10 p-2 flex items-center justify-center">
                                        <img 
                                            src={paymentProofPreview} 
                                            alt="Bukti Transfer Customer" 
                                            className="max-h-48 rounded-lg object-contain"
                                        />
                                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setShowCameraModal(true)}
                                                className="px-2.5 py-1 bg-gray-900/80 hover:bg-black text-white text-[10px] font-bold rounded-lg shadow-sm flex items-center gap-1 backdrop-blur-xs cursor-pointer transition-colors"
                                            >
                                                <Camera className="w-3 h-3" /> Foto Ulang
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPaymentProofFile(null);
                                                    setPaymentProofPreview(null);
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
                                            onClick={() => setShowCameraModal(true)}
                                            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                                        >
                                            <Camera className="w-4 h-4" />
                                            <span>Buka Kamera Langsung (Jepret Foto Resi)</span>
                                        </button>

                                        <div className="flex items-center gap-2 my-1">
                                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                            <span className="text-[10px] uppercase font-semibold text-gray-400">Atau Pilih dari Galeri</span>
                                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                        </div>

                                        <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl cursor-pointer bg-white dark:bg-gray-800 transition-colors">
                                            <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                Pilih Foto Bukti Transfer / Resi
                                            </span>
                                            <span className="text-[10px] text-gray-400 mt-0.5">Format JPG, PNG, atau WEBP (Maksimal 5MB)</span>
                                            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-medium mt-1">
                                                *Jika dikosongkan, sistem akan membuat struk digital simulasi otomatis
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setPaymentProofFile(file);
                                                        setPaymentProofPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex items-center justify-between">
                    {step === 'details' && (
                        <>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep('method')}
                                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                            >
                                Lanjut Pilih Pembayaran
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </>
                    )}

                    {step === 'method' && (
                        <>
                            <button
                                type="button"
                                onClick={() => setStep('details')}
                                className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors flex items-center gap-1.5"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Kembali
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep('pay')}
                                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                            >
                                Konfirmasi Saluran Bayar
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </>
                    )}

                    {step === 'pay' && (
                        <>
                            <button
                                type="button"
                                onClick={() => setStep('method')}
                                disabled={isSubmitting}
                                className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors flex items-center gap-1.5"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Ganti Metode
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmPayment}
                                disabled={isSubmitting}
                                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Memproses Pembayaran...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Bayar Sekarang (Simulasi)
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Modal Kamera Langsung */}
            <CameraCaptureModal
                isOpen={showCameraModal}
                onClose={() => setShowCameraModal(false)}
                onCapture={(file, previewUrl) => {
                    setPaymentProofFile(file);
                    setPaymentProofPreview(previewUrl);
                }}
                title="Ambil Foto Bukti Pembayaran / Struk"
                fileNamePrefix="bukti-transfer"
            />
        </div>
    );
}
