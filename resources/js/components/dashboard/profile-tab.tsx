import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    User,
    Mail,
    Lock,
    Camera,
    Shield,
    CheckCircle2,
    AlertCircle,
    KeyRound,
    Sparkles,
    Calendar,
    BadgeCheck,
    X,
    Save,
    UploadCloud
} from 'lucide-react';

interface ProfileTabProps {
    currentUser?: {
        id: number;
        name: string;
        email: string;
        role: string;
        avatar?: string | null;
        created_at?: string;
    } | null;
}

export function ProfileTab({ currentUser }: ProfileTabProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form Profil State
    const [name, setName] = useState(currentUser?.name ?? '');
    const [email, setEmail] = useState(currentUser?.email ?? '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Form Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    // Status & Feedback States
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

    // Sync state when currentUser prop changes (e.g. after update)
    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setEmail(currentUser.email);
        }
    }, [currentUser]);

    // Handle File Selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setProfileErrors({ avatar: 'Ukuran foto maksimal 2MB' });
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setProfileErrors(prev => {
                const next = { ...prev };
                delete next.avatar;
                return next;
            });
        }
    };

    const handleCancelSelectedFile = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Submit Profile & Avatar
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        setProfileSuccess(null);
        setProfileErrors({});

        const formData: Record<string, any> = {
            _method: 'patch',
            name: name,
            email: email,
        };

        if (selectedFile) {
            formData.avatar = selectedFile;
        }

        router.post('/settings/profile', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsSavingProfile(false);
                setProfileSuccess('Profil dan foto avatar berhasil diperbarui!');
                handleCancelSelectedFile();
                setTimeout(() => setProfileSuccess(null), 4000);
            },
            onError: (errs) => {
                setIsSavingProfile(false);
                setProfileErrors(errs);
            },
        });
    };

    // Submit Password Change
    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingPassword(true);
        setPasswordSuccess(null);
        setPasswordErrors({});

        router.put('/settings/password', {
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: passwordConfirmation,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSavingPassword(false);
                setPasswordSuccess('Kata sandi berhasil diperbarui dengan aman!');
                setCurrentPassword('');
                setNewPassword('');
                setPasswordConfirmation('');
                setTimeout(() => setPasswordSuccess(null), 4000);
            },
            onError: (errs) => {
                setIsSavingPassword(false);
                setPasswordErrors(errs);
            },
        });
    };

    const currentAvatarDisplay = previewUrl || currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=321E48&color=ffffff&bold=true`;

    const getRoleDetails = (role?: string) => {
        switch (role) {
            case 'admin':
                return {
                    name: 'Administrator Utama',
                    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    desc: 'Akses penuh ke seluruh sistem, stok gudang, laporan keuangan, transaksi, dan kelola akun pengguna.',
                };
            case 'manajer_gudang':
                return {
                    name: 'Manajer Gudang',
                    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    desc: 'Mengelola persediaan stok produk, supplier, kategori, stock opname fisik, serta laporan mutasi.',
                };
            case 'staff_gudang':
                return {
                    name: 'Staff Logistik & Gudang',
                    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                    desc: 'Fokus pada operasional gudang, pemeriksaan barang masuk, penyiapan pesanan keluar, dan catatan gudang.',
                };
            case 'customer':
                return {
                    name: 'Customer / Pelanggan',
                    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
                    desc: 'Dapat menjelajahi katalog barang, melakukan pemesanan, melihat riwayat transaksi, serta mengajukan refund.',
                };
            default:
                return {
                    name: 'Pengguna',
                    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
                    desc: 'Akun terdaftar pada sistem Stockify.',
                };
        }
    };

    const roleDetails = getRoleDetails(currentUser?.role);

    return (
        <div className="space-y-6">
            {/* Top Showcase Banner & Profile Identity Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/60 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                    {/* Big Avatar Display with Change Trigger */}
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-blue-100 dark:ring-blue-900/40 shadow-md bg-gray-100 dark:bg-gray-700">
                            <img
                                src={currentAvatarDisplay}
                                alt={currentUser?.name || 'User'}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                        </div>

                        {/* Camera Quick Button Badge */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Ganti Foto Profil"
                            className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg ring-2 ring-white dark:ring-gray-800 transition-all cursor-pointer transform hover:scale-110"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Identity Details */}
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                {currentUser?.name ?? 'Pengguna Stockify'}
                            </h2>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${roleDetails.badge}`}>
                                <Shield className="w-3 h-3" />
                                {roleDetails.name}
                            </span>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {currentUser?.email ?? 'email@stockify.test'}
                        </p>

                        <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <BadgeCheck className="w-4 h-4 text-emerald-500" />
                                <span>Akun Aktif Terverifikasi</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span>ID Pengguna: #{currentUser?.id ?? 1}</span>
                            </div>
                        </div>

                        {selectedFile && (
                            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                                <span>Foto baru dipilih: <strong>{selectedFile.name}</strong></span>
                                <button
                                    type="button"
                                    onClick={handleCancelSelectedFile}
                                    className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded text-blue-700 dark:text-blue-300 cursor-pointer"
                                    title="Batalkan foto baru"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Quick Button to browse photo */}
                    <div className="flex md:flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-theme-primary hover:opacity-95 rounded-xl shadow-xs transition cursor-pointer"
                        >
                            <UploadCloud className="w-4 h-4" />
                            <span>Pilih Foto Baru</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden Real File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* 2-Column Responsive Layout for Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CARD 1: Update Profil & Foto */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/60 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 dark:border-gray-700 mb-5">
                            <div className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Informasi Data Diri & Foto
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Perbarui nama akun, alamat email, dan foto profil Anda.
                                </p>
                            </div>
                        </div>

                        {profileSuccess && (
                            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <span>{profileSuccess}</span>
                            </div>
                        )}

                        {profileErrors.avatar && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-800 flex items-center gap-2 text-xs text-red-800 dark:text-red-300">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <span>{profileErrors.avatar}</span>
                            </div>
                        )}

                        <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block mb-1.5 font-semibold text-gray-700 dark:text-gray-300">
                                    Nama Lengkap *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nama Pengguna"
                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl dark:bg-gray-700/60 dark:border-gray-600 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                {profileErrors.name && (
                                    <p className="mt-1 text-red-600 text-[11px]">{profileErrors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-1.5 font-semibold text-gray-700 dark:text-gray-300">
                                    Alamat Email *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nama@email.com"
                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl dark:bg-gray-700/60 dark:border-gray-600 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                {profileErrors.email && (
                                    <p className="mt-1 text-red-600 text-[11px]">{profileErrors.email}</p>
                                )}
                            </div>

                            {/* Upload Area Visual Box */}
                            <div>
                                <label className="block mb-1.5 font-semibold text-gray-700 dark:text-gray-300">
                                    File Foto Profil (Avatar)
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer group"
                                >
                                    <div className="flex flex-col items-center justify-center gap-1.5">
                                        <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            {selectedFile ? selectedFile.name : 'Pilih file gambar untuk mengganti avatar'}
                                        </span>
                                        <span className="text-[11px] text-gray-400">
                                            Format: JPG, JPEG, PNG, atau WebP (Maksimal 2MB)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="pt-5 mt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                        <button
                            type="submit"
                            form="profile-form"
                            disabled={isSavingProfile}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-theme-primary hover:opacity-95 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                        >
                            {isSavingProfile ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Menyimpan Profil...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Simpan Perubahan Profil</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* CARD 2: Update Kata Sandi (Password) */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/60 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 dark:border-gray-700 mb-5">
                            <div className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                <KeyRound className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Keamanan & Ganti Kata Sandi
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Pastikan kata sandi Anda kuat untuk menjaga keamanan akun.
                                </p>
                            </div>
                        </div>

                        {passwordSuccess && (
                            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <span>{passwordSuccess}</span>
                            </div>
                        )}

                        <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block mb-1.5 font-semibold text-gray-700 dark:text-gray-300">
                                    Kata Sandi Saat Ini *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Masukkan kata sandi lama"
                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl dark:bg-gray-700/60 dark:border-gray-600 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                {passwordErrors.current_password && (
                                    <p className="mt-1 text-red-600 text-[11px]">{passwordErrors.current_password}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-1.5 font-semibold text-gray-700 dark:text-gray-300">
                                    Kata Sandi Baru *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <KeyRound className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Minimal 8 karakter"
                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl dark:bg-gray-700/60 dark:border-gray-600 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                {passwordErrors.password && (
                                    <p className="mt-1 text-red-600 text-[11px]">{passwordErrors.password}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-1.5 font-semibold text-gray-700 dark:text-gray-300">
                                    Konfirmasi Kata Sandi Baru *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <KeyRound className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        placeholder="Ulangi kata sandi baru"
                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl dark:bg-gray-700/60 dark:border-gray-600 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="pt-5 mt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                        <button
                            type="submit"
                            form="password-form"
                            disabled={isSavingPassword}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                        >
                            {isSavingPassword ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Memperbarui Password...</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    <span>Perbarui Password</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* CARD 3: Penjelasan Hak Akses Akun & Sesi */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/60 shadow-xs">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Ringkasan Hak Akses Peran Anda ({roleDetails.name})
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {roleDetails.desc}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 block mb-1">Akses Halaman</span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">Sesuai wewenang role operasional</span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 block mb-1">Keamanan Sesi</span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Terenkripsi & Terproteksi</span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 block mb-1">Avatar & Foto</span>
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Tersimpan di Storage Publik</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
