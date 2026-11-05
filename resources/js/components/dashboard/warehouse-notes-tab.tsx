import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    StickyNote, 
    Plus, 
    Trash2, 
    Pin, 
    AlertCircle, 
    Clock, 
    User, 
    CheckCircle2, 
    X,
    Tag
} from 'lucide-react';

export interface WarehouseNoteItem {
    id: number;
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high' | string;
    category: string;
    is_pinned: boolean;
    author_name: string;
    created_at: string;
}

interface WarehouseNotesTabProps {
    notes?: WarehouseNoteItem[];
}

export function WarehouseNotesTab({ notes = [] }: WarehouseNotesTabProps) {
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    // State Form
    const [form, setForm] = useState({
        title: '',
        content: '',
        category: 'Stok',
        priority: 'medium',
        is_pinned: false,
    });

    const categories = ['Semua', 'Stok', 'Pengiriman', 'Maintenance', 'Urgent', 'Umum'];

    const filteredNotes = selectedCategory === 'Semua' 
        ? notes 
        : notes.filter(n => n.category.toLowerCase() === selectedCategory.toLowerCase());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) return;

        setIsSubmitting(true);
        router.post('/warehouse-notes', form, {
            preserveScroll: true,
            onSuccess: () => {
                setShowModal(false);
                setForm({
                    title: '',
                    content: '',
                    category: 'Stok',
                    priority: 'medium',
                    is_pinned: false,
                });
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Apakah kamu yakin ingin menghapus catatan gudang ini?')) return;
        router.delete(`/warehouse-notes/${id}`, {
            preserveScroll: true,
        });
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return {
                    label: 'Penting / High',
                    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
                    dotClass: 'bg-rose-500',
                };
            case 'medium':
                return {
                    label: 'Sedang / Normal',
                    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
                    dotClass: 'bg-amber-500',
                };
            default:
                return {
                    label: 'Rendah / Low',
                    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
                    dotClass: 'bg-emerald-500',
                };
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header Tab */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center">
                            <StickyNote className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Catatan Cepat Gudang (Warehouse Memo)
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Catat memo operasional penting, instruksi tim shift, atau pengingat stok harian.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="btn-press inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-xl shadow-md cursor-pointer transition-all duration-150"
                    >
                        <Plus className="w-4 h-4" />
                        Tulis Catatan Baru
                    </button>
                </div>
            </div>

            {/* Filter Kategori */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
                    <Tag className="w-3.5 h-3.5" /> Kategori:
                </span>
                {categories.map(cat => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                            selectedCategory === cat
                                ? 'bg-theme-primary text-white shadow-xs'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* List Catatan (Grid) */}
            {filteredNotes.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 mx-auto flex items-center justify-center mb-3">
                        <StickyNote className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                        Belum Ada Catatan Gudang
                    </h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1 mb-5">
                        Klik tombol di bawah untuk membuat catatan atau instruksi operasional pertama bagi tim.
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="btn-press inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-xl shadow-md cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Memo Pertama
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredNotes.map(item => {
                        const prio = getPriorityBadge(item.priority);
                        return (
                            <div
                                key={item.id}
                                className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-5 border transition-all duration-200 hover:shadow-lg flex flex-col justify-between ${
                                    item.is_pinned 
                                        ? 'border-amber-300 dark:border-amber-600/70 shadow-sm ring-1 ring-amber-300/30' 
                                        : 'border-gray-100 dark:border-gray-700/60 shadow-xs'
                                }`}
                            >
                                <div>
                                    {/* Top Row: Category & Badges */}
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                {item.category}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md ${prio.badgeClass}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${prio.dotClass}`} />
                                                {prio.label}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {item.is_pinned && (
                                                <span title="Disematkan di Atas" className="text-amber-500 p-1">
                                                    <Pin className="w-3.5 h-3.5 fill-amber-500" />
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item.id)}
                                                title="Hapus Catatan"
                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Title & Content */}
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed line-clamp-4">
                                        {item.content}
                                    </p>
                                </div>

                                {/* Footer Info */}
                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between text-[11px] text-gray-400">
                                    <span className="flex items-center gap-1 truncate max-w-[140px]">
                                        <User className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{item.author_name}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{item.created_at}</span>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Tambah Catatan */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-lg w-full p-6 animate-scale-up">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <StickyNote className="w-5 h-5 text-theme-primary" />
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Tulis Memo Catatan Gudang
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Judul Catatan *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Stok beras karung bocor di blok B"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Kategori
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary"
                                    >
                                        <option value="Stok">Stok Fisik</option>
                                        <option value="Pengiriman">Pengiriman & Logistik</option>
                                        <option value="Maintenance">Maintenance & Rak</option>
                                        <option value="Urgent">Penting / Darurat</option>
                                        <option value="Umum">Umum</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Tingkat Prioritas
                                    </label>
                                    <select
                                        value={form.priority}
                                        onChange={e => setForm({ ...form, priority: e.target.value })}
                                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary"
                                    >
                                        <option value="low">Rendah (Info Santai)</option>
                                        <option value="medium">Normal / Sedang</option>
                                        <option value="high">Tinggi (Harus Cepat)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Isi Catatan / Instruksi *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Tulis detail catatan atau instruksi di sini..."
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary resize-none"
                                />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={form.is_pinned}
                                    onChange={e => setForm({ ...form, is_pinned: e.target.checked })}
                                    className="rounded text-theme-primary focus:ring-theme-primary"
                                />
                                <span className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1 font-medium">
                                    <Pin className="w-3 h-3 text-amber-500" /> Sematkan di atas (Pinned Memo)
                                </span>
                            </label>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-press px-5 py-2 text-xs font-bold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Catatan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
