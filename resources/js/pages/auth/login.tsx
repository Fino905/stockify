import React, { useState, useEffect } from 'react';
import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';
import type { TeamInvitationContext } from '@/types';
import { 
    Package, 
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
    BarChart3,
    Zap,
    ChevronDown
} from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
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

export default function Login({
    status,
    canResetPassword,
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

    useEffect(() => {
        const handleSettingsChanged = (e: any) => {
            if (e.detail) {
                setAppSettings(prev => ({ ...prev, ...e.detail }));
            }
        };
        window.addEventListener('app_settings_changed', handleSettingsChanged);
        return () => window.removeEventListener('app_settings_changed', handleSettingsChanged);
    }, []);

    const [showDemoAccounts, setShowDemoAccounts] = useState(true);
    const [selectedRole, setSelectedRole] = useState<'admin' | 'manajer' | 'staff'>('admin');
    const [showPassword, setShowPassword] = useState(false);
    const [isInstantLoggingIn, setIsInstantLoggingIn] = useState(false);

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

    const handleInstantLogin = (role: string) => {
        setIsInstantLoggingIn(true);
        router.post(`/switch-role/${role}`, {}, {
            onError: () => setIsInstantLoggingIn(false),
            onFinish: () => setIsInstantLoggingIn(false),
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
            <Head title={`Masuk - ${appSettings.appName || 'Stockify'} Warehouse OS`} />

            {/* Left Column: Visual Showcase (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex-col justify-between p-12 border-r border-slate-800/80 overflow-hidden select-none">
                
                {/* Ambient Glow Lighting */}
                <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl z-0" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl z-0" />
                <div className="pointer-events-none absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl z-0" />

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
                            <span className="text-[10px] text-slate-400 font-medium">Warehouse OS</span>
                        </div>
                    </div>
                </div>

                {/* Middle Content: Tagline and Highlights */}
                <div className="relative z-10 max-w-lg my-auto py-8">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-5 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>Command Center Logistik &amp; Inventaris v2.0</span>
                    </div>

                    <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight">
                        Kendali Presisi Gudang &amp; Mutasi Logistik{' '}
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
                            Berbasis Cerdas Terpadu.
                        </span>
                    </h2>

                    <p className="mt-4 text-slate-300 text-sm leading-relaxed">
                        Dirancang khusus untuk mendukung operasional multi-role terisolasi: Admin, Manajer Gudang, dan Staff Lapangan secara real-time.
                    </p>

                </div>

                {/* Bottom Footer Note */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-6">
                    <span>{appSettings.appName || 'Stockify'} Warehouse OS</span>
                    <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Sistem Terhubung Real-Time
                    </span>
                </div>
            </div>

            {/* Right Column: Clean Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between px-6 sm:px-10 lg:px-14 py-8 relative">
                
                {/* Background Ambient Glow & Grid (Identik dengan welcome.tsx) */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.14),rgba(255,255,255,0))] pointer-events-none" />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

                {/* Top Row for Mobile Header and Back Link */}
                <div className="flex items-center justify-between w-full mb-4">
                    {/* Mobile Brand Logo (< lg) */}
                    <div className="lg:hidden flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 overflow-hidden shrink-0">
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
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-100 text-slate-600 hover:text-blue-600 text-xs font-semibold shadow-2xs transition-all ml-auto"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Beranda</span>
                    </Link>
                </div>

                <div className="max-w-md w-full mx-auto my-auto">
                    {/* Form Card (Glassmorphism Sesuai Tema Landing Page) */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-xl shadow-blue-500/5 p-6 sm:p-8">
                        
                        {/* Header */}
                        <div className="mb-5">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2.5 border border-blue-200/80">
                                <Lock className="w-3.5 h-3.5 text-blue-600" />
                                <span>Portal Autentikasi Pengguna</span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                Masuk ke Sistem
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">
                                Pilih akun demo di bawah untuk auto-fill atau masukkan kredensial Anda.
                            </p>
                        </div>

                        {/* Demo Accounts Pill Switcher (Admin, Manajer, Staff) */}
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Pilih Akun Demo (Auto-Fill)
                                </span>
                                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    3 Role
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => handleQuickFill('admin', 'admin@stockify.test')}
                                    className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                                        selectedRole === 'admin'
                                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                                    }`}
                                >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Admin</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleQuickFill('manajer', 'manajer@stockify.test')}
                                    className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                                        selectedRole === 'manajer'
                                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                                    }`}
                                >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    <span>Manajer</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleQuickFill('staff', 'staff@stockify.test')}
                                    className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                                        selectedRole === 'staff'
                                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                                    }`}
                                >
                                    <ClipboardCheck className="w-3.5 h-3.5" />
                                    <span>Staff</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                disabled={isInstantLoggingIn}
                                onClick={() => handleInstantLogin(selectedRole)}
                                className="mt-2.5 w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50 hover:border-slate-300"
                            >
                                {isInstantLoggingIn ? (
                                    <Spinner className="w-3.5 h-3.5 text-blue-600" />
                                ) : (
                                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                                )}
                                <span>1-Klik Masuk Langsung ({selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)})</span>
                            </button>
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
                                    {/* Modern Minimalist Loading Screen */}
                                    {processing && (
                                        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
                                            <div className="bg-white rounded-2xl p-8 max-w-xs w-full mx-4 shadow-2xl border border-slate-100 flex flex-col items-center text-center">
                                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                                    <Package className="w-6 h-6 animate-pulse" />
                                                </div>

                                                <h3 className="text-base font-bold text-slate-900">
                                                    Menghubungkan Sesi
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Menyiapkan peran <span className="font-semibold text-blue-600 capitalize">{selectedRole}</span>
                                                </p>

                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-5">
                                                    <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-progress-flow rounded-full" />
                                                </div>

                                                <span className="text-[11px] text-slate-400 mt-3">
                                                    Memuat data inventaris gudang...
                                                </span>
                                            </div>
                                        </div>
                                    )}

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
                                                defaultValue="admin@stockify.test"
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="email@stockify.test"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                                                Kata Sandi
                                            </label>
                                            {canResetPassword && (
                                                 <Link
                                                     href={request()}
                                                     className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                                     tabIndex={5}
                                                 >
                                                     Lupa password?
                                                 </Link>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                                                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Remember Me */}
                                    <div className="flex items-center justify-between pt-0.5">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 select-none">
                                            <input
                                                id="remember"
                                                name="remember"
                                                type="checkbox"
                                                tabIndex={3}
                                                defaultChecked
                                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                                            />
                                            <span>Ingat saya di perangkat ini</span>
                                        </label>
                                    </div>

                                    {/* Submit Button (Gradient Landing Page) */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        tabIndex={4}
                                        className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {processing ? (
                                            <Spinner className="w-4 h-4 text-white" />
                                        ) : (
                                            <>
                                                <span>Masuk ke Dashboard</span>
                                                <ArrowRight className="w-4 h-4 text-blue-200" />
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </Form>

                        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
                            Belum memiliki akun?{' '}
                            <Link
                                href="/register"
                                className="font-bold text-blue-600 hover:text-blue-700 hover:underline ml-1"
                            >
                                Daftar Akun Staff Gudang &rarr;
                            </Link>
                        </div>

                        {status && (
                            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs font-semibold text-emerald-800">
                                {status}
                            </div>
                        )}
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

Login.layout = (page: React.ReactNode) => page;
