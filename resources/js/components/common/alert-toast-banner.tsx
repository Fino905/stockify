import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, AlertTriangle, X, Info } from 'lucide-react';

export type AlertToastType = 'success' | 'error' | 'warning' | 'info';

export function triggerAlertToast(
    message: string, 
    type: AlertToastType = 'success', 
    duration: number = 4500
) {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new CustomEvent('show-alert-toast', { 
                detail: { message, type, duration } 
            })
        );
    }
}

export function AlertToastBanner() {
    const { flash } = usePage<any>().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [type, setType] = useState<AlertToastType>('success');

    useEffect(() => {
        if (flash?.success) {
            setMessage(flash.success);
            setType('success');
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 5000);
            return () => clearTimeout(timer);
        } else if (flash?.error) {
            setMessage(flash.error);
            setType('error');
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 6000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Listener untuk custom dispatchEvent('show-alert-toast', { detail: { message, type, duration } })
    useEffect(() => {
        const handleCustomToast = (e: any) => {
            if (e.detail?.message) {
                setMessage(e.detail.message);
                setType(e.detail.type || 'success');
                setVisible(true);
                const duration = e.detail.duration || 4500;
                const timer = setTimeout(() => setVisible(false), duration);
                return () => clearTimeout(timer);
            }
        };

        window.addEventListener('show-alert-toast', handleCustomToast);
        return () => window.removeEventListener('show-alert-toast', handleCustomToast);
    }, []);

    if (!visible || !message) return null;

    const styles = {
        success: {
            bg: 'bg-emerald-600 dark:bg-emerald-700 text-white',
            border: 'border-emerald-500 dark:border-emerald-600',
            iconBg: 'bg-emerald-700/60 dark:bg-emerald-800/60 text-white',
            icon: CheckCircle2,
            title: 'Berhasil!',
        },
        error: {
            bg: 'bg-rose-600 dark:bg-rose-700 text-white',
            border: 'border-rose-500 dark:border-rose-600',
            iconBg: 'bg-rose-700/60 dark:bg-rose-800/60 text-white',
            icon: AlertCircle,
            title: 'Perhatian!',
        },
        warning: {
            bg: 'bg-amber-600 dark:bg-amber-700 text-white',
            border: 'border-amber-500 dark:border-amber-600',
            iconBg: 'bg-amber-700/60 dark:bg-amber-800/60 text-white',
            icon: AlertTriangle,
            title: 'Peringatan!',
        },
        info: {
            bg: 'bg-blue-600 dark:bg-blue-700 text-white',
            border: 'border-blue-500 dark:border-blue-600',
            iconBg: 'bg-blue-700/60 dark:bg-blue-800/60 text-white',
            icon: Info,
            title: 'Informasi',
        },
    }[type];

    const Icon = styles.icon;

    return (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-200 pointer-events-auto">
            <div className={`p-4 rounded-2xl shadow-2xl border ${styles.bg} ${styles.border} flex items-start justify-between gap-3 backdrop-blur-md`}>
                <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-xl ${styles.iconBg} shrink-0 mt-0.5`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-extrabold text-[11px] tracking-wider uppercase opacity-95">
                            {styles.title}
                        </h4>
                        <p className="text-xs font-medium mt-0.5 leading-snug">
                            {message}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="p-1 rounded-lg hover:bg-white/20 transition-colors shrink-0 text-white cursor-pointer"
                    title="Tutup Alert"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

