import React, { useState, useEffect } from 'react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import type { TeamInvitationContext } from '@/types';
import { 
    Package, 
    ArrowLeft, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    ShieldCheck, 
    ArrowRight, 
    User,
    CheckCircle2
} from 'lucide-react';

type Props = {
    passwordRules?: string;
    teamInvitation?: TeamInvitationContext | null;
    appSettings?: {
        appName?: string;
        warehouseName?: string;
        contact?: string;
        email?: string;
        address?: string;
        appInfo?: string;
        logo?: string | null;
    } | null;
};

export default function Register({
    passwordRules,
    teamInvitation,
    appSettings: initialAppSettings,
}: Props) {
    const pageProps = usePage().props as unknown as {
        appSettings?: {
            appName?: string;
            logo?: string | null;
            warehouseName?: string;
        };
    };

    const [appSettings, setAppSettings] = useState(() => {
        const base = initialAppSettings || pageProps.appSettings || {
            appName: 'Stockify',
            warehouseName: 'Gudang Pusat Logistik Cikarang',
            logo: null,
        };

        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('stockify_app_settings');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    return { ...base, ...parsed, logo: initialAppSettings?.logo ?? parsed.logo ?? base.logo ?? null };
                }
            } catch (e) {}
        }
        return base;
    });

    useEffect(() => {
        if (initialAppSettings) {
            setAppSettings(prev => ({ ...prev, ...initialAppSettings }));
        } else if (pageProps.appSettings) {
            setAppSettings(prev => ({ ...prev, ...pageProps.appSettings }));
        }
    }, [initialAppSettings, pageProps.appSettings]);

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
            <Head title={`Daftar Akun Staff Gudang - ${appSettings.appName || 'Stockify'} Warehouse OS`} />

            {/* Left Column: Visual Showcase (Identik dengan Login Page) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex-col justify-between p-12 border-r border-slate-800/80 overflow-hidden select-none">
                
                {/* Soft Ambient Lighting (Tenang, Tanpa Efek Neon Berlebihan) */}
                <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl z-0" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl z-0" />
                <div className="pointer-events-none absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-sky-500/5 blur-3xl z-0" />

                {/* Subtle Grid Pattern */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] z-0" />

                {/* Top Nav: Back to Home & Brand Logo */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-white/10"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Beranda
                    </Link>

                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold overflow-hidden shrink-0 shadow-md shadow-blue-500/25">
                            {appSettings.logo ? (
                                appSettings.logo.startsWith('emoji:') ? (
                                    <span className="text-xl leading-none select-none">{appSettings.logo.replace('emoji:', '')}</span>
                                ) : (
                                    <img 
                                        src={appSettings.logo} 
                                        alt={appSettings.appName || 'Logo'} 
                                        className="w-full h-full object-contain p-1" 
                                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} 
                                    />
                                )
                            ) : (
                                <Package className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-lg text-white tracking-tight">{appSettings.appName || 'Stockify'}<span className="text-blue-400">.</span></span>
                            <span className="text-[10px] text-slate-400 font-medium">Warehouse Portal</span>
                        </div>
                    </div>
                </div>

                {/* Middle Content: Tagline and Staff Benefits */}
                <div className="relative z-10 max-w-lg my-auto py-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-5 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span>Akses Sistem Internal Pergudangan &amp; Logistik</span>
                    </div>

                    <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight">
                        Registrasi Akun Baru{' '}
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
                            Staf Operasional Gudang.
                        </span>
                    </h2>

                    <p className="mt-4 text-slate-300 text-sm leading-relaxed">
                        Daftarkan akun staf baru untuk mengelola inventaris fisik, mencatat mutasi barang masuk &amp; keluar, dan berkolaborasi secara real-time.
                    </p>

                </div>

                {/* Bottom Footer Note */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-6">
                    <span>{appSettings.appName || 'Stockify'} Warehouse OS</span>
                    <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Layanan Gudang Aktif
                    </span>
                </div>
            </div>

            {/* Right Column: Clean Registration Form (Sama Persis dengan Login Page) */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between px-6 sm:px-10 lg:px-14 py-8 relative">
                
                {/* Background Soft Tint (Tenang Tanpa Efek Neon Keras) */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.06),rgba(255,255,255,0))] pointer-events-none" />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

                {/* Top Row for Mobile Header and Back Link */}
                <div className="flex items-center justify-between w-full mb-4">
                    {/* Mobile Brand Logo (< lg) */}
                    <div className="lg:hidden flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs overflow-hidden shrink-0">
                            {appSettings.logo ? (
                                appSettings.logo.startsWith('emoji:') ? (
                                    <span className="text-lg leading-none select-none">{appSettings.logo.replace('emoji:', '')}</span>
                                ) : (
                                    <img 
                                        src={appSettings.logo} 
                                        alt={appSettings.appName || 'Logo'} 
                                        className="w-full h-full object-contain p-0.5" 
                                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} 
                                    />
                                )
                            ) : (
                                <Package className="w-4 h-4 text-white" />
                            )}
                        </div>
                        <span className="font-extrabold text-base text-slate-900 tracking-tight">{appSettings.appName || 'Stockify'}</span>
                    </div>

                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-100 text-slate-600 hover:text-blue-600 text-xs font-semibold shadow-xs transition-all ml-auto"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Beranda</span>
                    </Link>
                </div>

                <div className="max-w-md w-full mx-auto my-auto">
                    {/* Form Card (Bersih & Elegan Sesuai Login Page) */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
                        
                        {/* Header */}
                        <div className="mb-5">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2.5 border border-blue-200/80">
                                <User className="w-3.5 h-3.5 text-blue-600" />
                                <span>Registrasi Akun Baru</span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                Daftar Akun Staff Gudang
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">
                                Buat akun staf operasional untuk mencatat penerimaan dan pengeluaran barang.
                            </p>
                        </div>

                        {/* Staff Role Highlight (Clean Slate Box) */}
                        <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="font-medium text-slate-700">Peran Akun:</span>
                            </div>
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                                Staff Gudang (Operasional)
                            </span>
                        </div>

                        {teamInvitation && (
                            <TeamInvitationAlert
                                invitation={teamInvitation}
                                action="Register"
                            />
                        )}

                        {/* Main Register Form */}
                        <Form
                            {...store.form()}
                            resetOnSuccess={['password', 'password_confirmation']}
                            className="flex flex-col gap-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Nama Lengkap Field */}
                                    <div>
                                        <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Nama Lengkap
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <input
                                                id="name"
                                                type="text"
                                                name="name"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                placeholder="Contoh: Ahmad Pratama"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                                            />
                                        </div>
                                        <InputError message={errors.name} />
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Alamat Email
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                tabIndex={2}
                                                autoComplete="email"
                                                placeholder="staff@stockify.test"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Kata Sandi
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                required
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                placeholder="Minimal 8 karakter"
                                                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Konfirmasi Password Field */}
                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Konfirmasi Kata Sandi
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <input
                                                id="password_confirmation"
                                                type={showPasswordConfirmation ? 'text' : 'password'}
                                                name="password_confirmation"
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                placeholder="Ulangi kata sandi"
                                                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                                                tabIndex={-1}
                                            >
                                                {showPasswordConfirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            tabIndex={5}
                                            data-test="register-user-button"
                                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <span className="flex items-center gap-2">
                                                    <Spinner className="w-4 h-4 text-white" /> Mendaftarkan...
                                                </span>
                                            ) : (
                                                <>
                                                    <span>Daftar Akun Baru</span>
                                                    <ArrowRight className="w-4 h-4 text-blue-200" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </Form>

                        {/* Link Kembali ke Login */}
                        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
                            Sudah memiliki akun?{' '}
                            <Link
                                href={
                                    teamInvitation
                                        ? login.url({
                                              query: {
                                                  invitation: teamInvitation.code,
                                              },
                                          })
                                        : login()
                                }
                                data-test="team-invitation-login-link"
                                tabIndex={6}
                                className="font-bold text-blue-600 hover:text-blue-700 hover:underline ml-1"
                            >
                                Masuk ke Sistem &rarr;
                            </Link>
                        </div>

                    </div>
                </div>

                {/* Bottom Footer Note */}
                <div className="text-center text-xs text-slate-400 pt-4">
                    &copy; {new Date().getFullYear()} {appSettings.appName || 'Stockify'} Warehouse OS. Sistem Manajemen Inventaris Terpadu.
                </div>
            </div>
        </div>
    );
}

Register.layout = (page: React.ReactNode) => page;
