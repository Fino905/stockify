import { Link, usePage } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { Package } from 'lucide-react';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const pageProps = usePage().props as unknown as {
        appSettings?: {
            appName?: string;
            logo?: string | null;
            warehouseName?: string;
        };
    };

    const appSettings = pageProps.appSettings || {
        appName: 'Stockify',
        warehouseName: 'Gudang Pusat Logistik',
        logo: null,
    };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white p-4 sm:p-6 md:p-10 relative overflow-x-hidden">
            {/* Soft Ambient Tint (Bukan Neon Keras) */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.06),rgba(255,255,255,0))] pointer-events-none" />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <Link
                            href={home()}
                            className="flex items-center gap-3 group"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs transition-transform duration-200 group-hover:scale-105 overflow-hidden">
                                {appSettings.logo ? (
                                    appSettings.logo.startsWith('emoji:') ? (
                                        <span className="text-xl leading-none">
                                            {appSettings.logo.replace('emoji:', '')}
                                        </span>
                                    ) : (
                                        <img
                                            src={appSettings.logo}
                                            alt={appSettings.appName || 'Logo'}
                                            className="w-full h-full object-contain p-1"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLElement).style.display = 'none';
                                            }}
                                        />
                                    )
                                ) : (
                                    <Package className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xl font-black tracking-tight text-slate-900">
                                    {appSettings.appName || 'Stockify'}<span className="text-blue-600">.</span>
                                </span>
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                                    Warehouse OS
                                </span>
                            </div>
                        </Link>

                        <div className="space-y-1">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">{title}</h1>
                            {description && (
                                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
                        {children}
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} {appSettings.appName || 'Stockify'} Warehouse OS.
                </div>
            </div>
        </div>
    );
}
