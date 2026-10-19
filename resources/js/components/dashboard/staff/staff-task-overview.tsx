import React from 'react';
import { 
    CheckSquare, 
    ArrowDownToLine, 
    ArrowUpFromLine 
} from 'lucide-react';

export interface PendingTaskItem {
    id: string;
    raw_id: number;
    product: string;
    quantity: number;
    date: string;
    notes: string | null;
}

interface StaffTaskOverviewProps {
    pendingInTasks: PendingTaskItem[];
    pendingOutTasks: PendingTaskItem[];
    onConfirmTask: (rawId: number) => void;
}

export function StaffTaskOverview({
    pendingInTasks = [],
    pendingOutTasks = [],
    onConfirmTask,
}: StaffTaskOverviewProps) {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Ringkasan Tugas Operasional */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl dark:bg-blue-900/30 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
                        <CheckSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-blue-900 dark:text-blue-200">
                            Pusat Tugas Operasional Staff Gudang
                        </h2>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                            Konfirmasi penerimaan barang masuk setelah diperiksa fisik &amp; siapkan barang keluar.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 text-xs shrink-0">
                    <span className="px-3 py-1.5 bg-white dark:bg-gray-800 font-bold rounded-xl border border-blue-200 text-blue-800 dark:text-blue-200 shadow-2xs">
                        Masuk: {pendingInTasks.length} Pending
                    </span>
                    <span className="px-3 py-1.5 bg-white dark:bg-gray-800 font-bold rounded-xl border border-blue-200 text-blue-800 dark:text-blue-200 shadow-2xs">
                        Keluar: {pendingOutTasks.length} Pending
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tugas 1: Barang Masuk yang Perlu Diperiksa */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-gray-800 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl dark:bg-emerald-900/50 dark:text-emerald-300">
                                <ArrowDownToLine className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                                1. Barang Masuk (Perlu Diperiksa)
                            </h3>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            {pendingInTasks.length} Antrean
                        </span>
                    </div>

                    <div className="space-y-3">
                        {pendingInTasks.length > 0 ? (
                            pendingInTasks.map((task) => (
                                <div 
                                    key={task.id} 
                                    className="p-3.5 bg-gray-50/80 dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3 transition-colors hover:bg-gray-100/60"
                                >
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white text-xs">
                                            {task.product} <span className="text-emerald-600 font-bold">({task.quantity} unit)</span>
                                        </div>
                                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                                            {task.id} • Tgl: {task.date}
                                        </div>
                                        <div className="text-[11px] text-gray-400 mt-0.5 italic">
                                            {task.notes || 'Pemeriksaan fisik barang'}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onConfirmTask(task.raw_id)}
                                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                                    >
                                        ✓ Konfirmasi Masuk
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-xs">
                                Tidak ada barang masuk yang pending. Semua sudah terkonfirmasi!
                            </div>
                        )}
                    </div>
                </div>

                {/* Tugas 2: Barang Keluar yang Perlu Disiapkan */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-gray-800 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl dark:bg-indigo-900/50 dark:text-indigo-300">
                                <ArrowUpFromLine className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                                2. Barang Keluar (Perlu Disiapkan)
                            </h3>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                            {pendingOutTasks.length} Antrean
                        </span>
                    </div>

                    <div className="space-y-3">
                        {pendingOutTasks.length > 0 ? (
                            pendingOutTasks.map((task) => (
                                <div 
                                    key={task.id} 
                                    className="p-3.5 bg-gray-50/80 dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3 transition-colors hover:bg-gray-100/60"
                                >
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white text-xs">
                                            {task.product} <span className="text-indigo-600 font-bold">({task.quantity} unit)</span>
                                        </div>
                                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                                            {task.id} • Tgl: {task.date}
                                        </div>
                                        <div className="text-[11px] text-gray-400 mt-0.5 italic">
                                            {task.notes || 'Penyiapan barang ke ekspedisi'}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onConfirmTask(task.raw_id)}
                                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                                    >
                                        ✓ Konfirmasi Siap Kirim
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-xs">
                                Tidak ada pengeluaran barang yang pending. Siap untuk tugas berikutnya!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
