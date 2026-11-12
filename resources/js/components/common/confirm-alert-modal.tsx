import React from 'react';
import {
    AlertCircle,
    CheckCircle2,
    AlertTriangle,
    Package,
    Truck,
    Boxes,
    X,
    RotateCcw,
    Info,
    Trash2
} from 'lucide-react';

export interface ConfirmAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    subtitle?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
    isLoading?: boolean;
    productDetails?: {
        name: string;
        sku?: string;
        quantity?: number;
        unit?: string;
        price?: number;
        referenceNumber?: string;
        destinationOrPartner?: string;
        actionLabel?: string;
    };
    itemDetails?: {
        headerTitle?: string;
        name: string;
        badge?: string;
        badgeColor?: string;
        description?: string;
        fields?: Array<{ label: string; value: string | number; isHighlight?: boolean }>;
    };
}

export function ConfirmAlertModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    subtitle,
    message,
    confirmText = 'Konfirmasi Sekarang',
    cancelText = 'Batal',
    variant = 'success',
    isLoading = false,
    productDetails,
    itemDetails
}: ConfirmAlertModalProps) {
    if (!isOpen) return null;

    const variantStyles = {
        success: {
            iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
            buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
            borderColor: 'border-emerald-200 dark:border-emerald-800',
            messageBg: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200',
            messageIcon: 'text-emerald-600 dark:text-emerald-400',
            badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
            defaultSubtitle: 'Konfirmasi persetujuan & eksekusi tindakan sistem',
            Icon: CheckCircle2,
        },
        warning: {
            iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
            buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
            borderColor: 'border-amber-200 dark:border-amber-800',
            messageBg: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800 text-amber-950 dark:text-amber-200',
            messageIcon: 'text-amber-600 dark:text-amber-400',
            badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
            defaultSubtitle: 'Perhatikan peringatan sistem sebelum melanjutkan',
            Icon: AlertTriangle,
        },
        danger: {
            iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
            buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
            borderColor: 'border-rose-200 dark:border-rose-800',
            messageBg: 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800 text-rose-950 dark:text-rose-200',
            messageIcon: 'text-rose-600 dark:text-rose-400',
            badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200',
            defaultSubtitle: 'Tindakan ini memerlukan konfirmasi penghapusan permanen',
            Icon: AlertCircle,
        },
        info: {
            iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
            buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
            messageBg: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800 text-blue-950 dark:text-blue-200',
            messageIcon: 'text-blue-600 dark:text-blue-400',
            badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
            defaultSubtitle: 'Informasi penting terkait proses data sistem',
            Icon: Info,
        },
        primary: {
            iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
            buttonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
            borderColor: 'border-indigo-200 dark:border-indigo-800',
            messageBg: 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200',
            messageIcon: 'text-indigo-600 dark:text-indigo-400',
            badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200',
            defaultSubtitle: 'Konfirmasi tindakan operasional pada item data',
            Icon: Package,
        },
    }[variant];

    const IconComponent = variantStyles.Icon;
    const finalSubtitle = subtitle || variantStyles.defaultSubtitle;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="p-5 pb-4 flex items-start justify-between border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl ${variantStyles.iconBg} shadow-xs shrink-0`}>
                            <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-base text-gray-900 dark:text-white leading-tight">
                                {title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {finalSubtitle}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        title="Batal & Tutup"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 text-xs">
                    {/* Kotak Rincian Produk (Backward-Compatible) */}
                    {productDetails && !itemDetails && (
                        <div className="p-3.5 bg-gray-50 dark:bg-gray-750/70 rounded-2xl border border-gray-200/70 dark:border-gray-700 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5 min-w-0">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                        Rincian Produk Terkait
                                    </span>
                                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                                        {productDetails.name}
                                    </h4>
                                    {productDetails.sku && (
                                        <p className="text-[11px] font-mono text-gray-500">
                                            SKU: {productDetails.sku}
                                        </p>
                                    )}
                                </div>
                                {productDetails.actionLabel && (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 shrink-0">
                                        {productDetails.actionLabel}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60 text-[11px]">
                                {productDetails.quantity !== undefined && (
                                    <div>
                                        <span className="text-gray-500 block">Jumlah Kuantitas:</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {productDetails.quantity} {productDetails.unit || 'Unit'}
                                        </span>
                                    </div>
                                )}
                                {productDetails.price !== undefined && (
                                    <div>
                                        <span className="text-gray-500 block">Total Nominal:</span>
                                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                            Rp {productDetails.price.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}
                                {productDetails.referenceNumber && (
                                    <div>
                                        <span className="text-gray-500 block">No. Referensi:</span>
                                        <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                                            {productDetails.referenceNumber}
                                        </span>
                                    </div>
                                )}
                                {productDetails.destinationOrPartner && (
                                    <div>
                                        <span className="text-gray-500 block">Tujuan / Mitra:</span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                                            {productDetails.destinationOrPartner}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Kotak Rincian Item Umum (Kategori, Supplier, User, Data Lain) */}
                    {itemDetails && (
                        <div className="p-3.5 bg-gray-50 dark:bg-gray-750/70 rounded-2xl border border-gray-200/70 dark:border-gray-700 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5 min-w-0">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                        {itemDetails.headerTitle || 'Rincian Data Terkait'}
                                    </span>
                                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                                        {itemDetails.name}
                                    </h4>
                                    {itemDetails.description && (
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                            {itemDetails.description}
                                        </p>
                                    )}
                                </div>
                                {itemDetails.badge && (
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border shrink-0 ${itemDetails.badgeColor || variantStyles.badgeBg
                                        }`}>
                                        {itemDetails.badge}
                                    </span>
                                )}
                            </div>

                            {itemDetails.fields && itemDetails.fields.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60 text-[11px]">
                                    {itemDetails.fields.map((field, idx) => (
                                        <div key={idx}>
                                            <span className="text-gray-500 block">{field.label}:</span>
                                            <span className={`font-semibold ${field.isHighlight
                                                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                                                    : 'text-gray-900 dark:text-white'
                                                }`}>
                                                {field.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pesan Penjelasan / Peringatan yang Adaptif dengan Variant Warna */}
                    <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 transition-colors ${variantStyles.messageBg}`}>
                        <IconComponent className={`w-4 h-4 shrink-0 mt-0.5 ${variantStyles.messageIcon}`} />
                        <div className="text-[11px] leading-relaxed">
                            {message}
                        </div>
                    </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/80 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all ${variantStyles.buttonBg}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Memproses...</span>
                            </span>
                        ) : (
                            <>
                                <IconComponent className="w-4 h-4" />
                                <span>{confirmText}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
