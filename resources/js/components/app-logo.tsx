import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name, appSettings } = usePage().props as { 
        name?: string; 
        appSettings?: { 
            appName?: string; 
            logo?: string | null; 
        } 
    };

    const logo = appSettings?.logo;
    const displayName = appSettings?.appName || name || 'Stockify';

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden shrink-0">
                {logo ? (
                    logo.startsWith('emoji:') ? (
                        <span className="text-lg leading-none select-none">{logo.replace('emoji:', '')}</span>
                    ) : (
                        <img 
                            src={logo} 
                            alt={displayName} 
                            className="w-full h-full object-contain p-0.5" 
                            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} 
                        />
                    )
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {displayName}
                </span>
            </div>
        </>
    );
}
