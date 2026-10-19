import React, { useState } from 'react';
import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';
import type { TeamInvitationContext } from '@/types';
import { 
    Boxes, 
    ArrowLeft, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    ShieldCheck, 
    Sparkles, 
    ArrowRight,
    CheckCircle2,
    Users,
    ClipboardCheck,
    BarChart3
} from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    teamInvitation?: TeamInvitationContext | null;
};

export default function Login({
    status,
    canResetPassword,
    teamInvitation,
}: Props) {
    const [selectedRole, setSelectedRole] = useState<'admin' | 'manajer' | 'staff'>('admin');
    const [showPassword, setShowPassword] = useState(false);

    const handleQuickFill = (role: 'admin' | 'manajer' | 'staff', email: string) => {
        setSelectedRole(role);
        const emailEl = document.getElementById('email') as HTMLInputElement;
        const pwdEl = document.getElementById('password') as HTMLInputElement;
        if (emailEl) {
            emailEl.value = email;
            emailEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (pwdEl) {
            pwdEl.value = 'password';
            pwdEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-[#43637E]/20 selection:text-[#321E48]">
            <Head title="Masuk - Stockify Warehouse OS" />

            {/* Left Column: Visual Showcase (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#321E48] text-white flex-col justify-between p-12">
                {/* Top Nav: Back to Home & Logo */}
                <div className="flex items-center justify-between">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Beranda
                    </Link>

                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold">
                            <Boxes className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-lg text-white">Stockify</span>
                    </div>
                </div>

                {/* Middle Content: Tagline and Highlights */}
                <div className="max-w-lg my-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gray-200 text-xs font-medium mb-6">
                        <Sparkles className="w-3.5 h-3.5 text-gray-300" />
                        Warehouse & Inventory Platform
                    </div>

                    <h2 className="text-3xl font-bold text-white leading-snug">
                        Akurasi Inventaris, Efisiensi Logistik & Pengawasan Real-Time.
                    </h2>

                    <p className="mt-4 text-gray-300 text-sm leading-relaxed">
                        Dirancang khusus untuk mendukung operasional multi-role: Admin, Manajer Gudang, dan Staff Gudang secara terpadu dan efisien.
                    </p>

                    {/* Role Access Highlights */}
                    <div className="mt-8 space-y-3">
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                            <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-white">Administrator</h4>
                                <p className="text-[11px] text-gray-300">Kontrol sistem, master data produk, supplier, pengguna, dan laporan.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                            <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0">
                                <BarChart3 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-white">Manajer Gudang</h4>
                                <p className="text-[11px] text-gray-300">Monitoring stok menipis, mutasi masuk/keluar harian, & stock opname.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                            <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0">
                                <ClipboardCheck className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-white">Staff Gudang</h4>
                                <p className="text-[11px] text-gray-300">Pemeriksaan fisik barang masuk & penyiapan barang keluar.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer Note */}
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-white/10 pt-6">
                    <span>Stockify v2.0</span>
                    <span className="flex items-center gap-1.5 text-gray-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Sistem Terhubung Database
                    </span>
                </div>
            </div>

            {/* Right Column: Clean Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
                <div className="max-w-md w-full mx-auto">
                    {/* Mobile Back to Home */}
                    <div className="lg:hidden mb-6 flex items-center justify-between">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Beranda
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#321E48] text-white flex items-center justify-center font-bold">
                                <Boxes className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-[#321E48]">Stockify</span>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Masuk ke Akun
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Pilih akun demo di bawah atau masukkan email & password Anda.
                        </p>
                    </div>

                    {/* Demo Accounts Quick-Fill Box (Clean Minimalist) */}
                    <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                        <div className="flex items-center justify-between font-semibold text-gray-700 mb-2.5">
                            <span>Akun Demo Cepat (1-Klik):</span>
                            <span className="font-mono text-[11px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                                pw: password
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => handleQuickFill('admin', 'admin@stockify.test')}
                                className={`p-2.5 rounded-lg font-medium text-xs transition-all flex flex-col items-center gap-1 border cursor-pointer ${
                                    selectedRole === 'admin'
                                        ? 'bg-[#321E48] text-white border-[#321E48] shadow-xs'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span>Admin</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleQuickFill('manajer', 'manajer@stockify.test')}
                                className={`p-2.5 rounded-lg font-medium text-xs transition-all flex flex-col items-center gap-1 border cursor-pointer ${
                                    selectedRole === 'manajer'
                                        ? 'bg-[#43637E] text-white border-[#43637E] shadow-xs'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <BarChart3 className="w-4 h-4" />
                                <span>Manajer</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleQuickFill('staff', 'staff@stockify.test')}
                                className={`p-2.5 rounded-lg font-medium text-xs transition-all flex flex-col items-center gap-1 border cursor-pointer ${
                                    selectedRole === 'staff'
                                        ? 'bg-[#321E48] text-white border-[#321E48] shadow-xs'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <ClipboardCheck className="w-4 h-4" />
                                <span>Staff</span>
                            </button>
                        </div>
                    </div>

                    {teamInvitation && (
                        <TeamInvitationAlert
                            invitation={teamInvitation}
                            action="Log in"
                        />
                    )}

                    <PasskeyVerify />

                    {/* Main Login Form */}
                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Modern Minimalist Loading Screen (No Neon) */}
                                {processing && (
                                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                                        <div className="bg-white rounded-2xl p-8 max-w-xs w-full mx-4 shadow-xl border border-gray-100 flex flex-col items-center text-center">
                                            {/* Clean Minimal Icon */}
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                                                <Boxes className="w-6 h-6 text-[#321E48] animate-pulse" />
                                            </div>

                                            {/* Title & Role */}
                                            <h3 className="text-base font-bold text-gray-900">
                                                Memuat Dashboard
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Menghubungkan akun <span className="font-semibold text-gray-700 capitalize">{selectedRole}</span>
                                            </p>

                                            {/* Clean Slim Progress Bar */}
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-5">
                                                <div className="h-full bg-[#43637E] animate-progress-flow rounded-full" />
                                            </div>

                                            <span className="text-[11px] text-gray-400 mt-3">
                                                Menyiapkan data inventaris...
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold text-[#321E48] mb-1.5 uppercase tracking-wider">
                                        Alamat Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#43637E]">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            defaultValue="admin@stockify.test"
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="email@stockify.test"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#43637E]/20 focus:border-[#43637E] transition-all"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password Field */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="password" className="block text-xs font-bold text-[#321E48] uppercase tracking-wider">
                                            Kata Sandi
                                        </label>
                                        {canResetPassword && (
                                             <Link
                                                 href={request()}
                                                 className="text-xs font-semibold text-[#43637E] hover:text-[#321E48] hover:underline"
                                                 tabIndex={5}
                                             >
                                                 Lupa password?
                                             </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#43637E]">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            defaultValue="password"
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#43637E]/20 focus:border-[#43637E] transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#43637E] hover:text-[#321E48]"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-600">
                                        <input
                                            id="remember"
                                            name="remember"
                                            type="checkbox"
                                            tabIndex={3}
                                            defaultChecked
                                            className="w-4 h-4 rounded text-[#321E48] focus:ring-[#43637E] border-gray-300"
                                        />
                                        <span>Ingat saya di perangkat ini</span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    tabIndex={4}
                                    className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#321E48] hover:bg-[#251536] text-white font-semibold text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? (
                                        <Spinner className="w-4 h-4 text-white" />
                                    ) : (
                                        <>
                                            <span>Masuk ke Dashboard</span>
                                            <ArrowRight className="w-4 h-4 text-white" />
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </Form>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        Belum memiliki akun?{' '}
                        <Link
                            href="/register"
                            className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                            Daftar Sebagai Customer
                        </Link>
                    </div>

                    {status && (
                        <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs font-semibold text-emerald-800">
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

Login.layout = (page: React.ReactNode) => page;
