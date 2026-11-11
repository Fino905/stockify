import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
    Search, 
    Bell, 
    Moon, 
    Sun, 
    Menu, 
    X, 
    PanelLeftClose,
    Package, 
    User, 
    Settings, 
    LogOut, 
    ShieldCheck, 
    CheckCircle2, 
    AlertTriangle,
    ArrowRightLeft,
    Clock,
    Truck
} from 'lucide-react';

interface NotificationItem {
    id: string;
    title: string;
    subtitle: string;
    tab: string;
    time: string;
    type: string;
}

interface NavbarProps {
    onToggleSidebar: () => void;
    sidebarOpen: boolean;
    currentUser?: {
        id: number;
        name: string;
        email: string;
        role: string;
        avatar?: string | null;
    } | null;
    onSelectTab?: (tab: string) => void;
    notifications?: {
        total_unread: number;
        items: NotificationItem[];
    } | null;
    appSettings?: {
        appName?: string;
        logo?: string | null;
    } | null;
}

export function FlowbiteNavbar({ onToggleSidebar, sidebarOpen, currentUser, onSelectTab, notifications, appSettings }: NavbarProps) {
    const [isDark, setIsDark] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [appName, setAppName] = useState(() => {
        if (appSettings?.appName) return appSettings.appName;
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('stockify_app_settings');
            if (saved) {
                try {
                    return JSON.parse(saved).appName || 'Stockify';
                } catch (e) {
                    // Ignore
                }
            }
        }
        return 'Stockify';
    });
    const [appLogo, setAppLogo] = useState<string | null>(() => {
        if (appSettings?.logo) return appSettings.logo;
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('stockify_app_settings');
            if (saved) {
                try {
                    return JSON.parse(saved).logo || null;
                } catch (e) {
                    // Ignore
                }
            }
        }
        return null;
    });

    useEffect(() => {
        if (appSettings?.appName) setAppName(appSettings.appName);
        if (appSettings?.logo !== undefined) setAppLogo(appSettings.logo);
    }, [appSettings]);

    useEffect(() => {
        const handleSettingsChanged = (e: any) => {
            if (e.detail?.appName) {
                setAppName(e.detail.appName);
            }
            if (e.detail?.logo !== undefined) {
                setAppLogo(e.detail.logo);
            }
        };
        window.addEventListener('app_settings_changed', handleSettingsChanged);
        return () => window.removeEventListener('app_settings_changed', handleSettingsChanged);
    }, []);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = () => {
        setIsLoggingOut(true);
        router.post('/logout');
    };

    const handleSwitchRole = (role: string) => {
        router.post(`/switch-role/${role}`, {}, {
            preserveScroll: true,
            onSuccess: () => setShowUserDropdown(false),
        });
    };

    const getRoleBadge = (role?: string) => {
        switch (role) {
            case 'admin':
                return { label: 'Admin (Full Access)', color: 'bg-theme-primary-light text-theme-primary-text dark:bg-blue-900 dark:text-blue-300' };
            case 'manajer_gudang':
                return { label: 'Manajer Gudang', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' };
            case 'staff_gudang':
                return { label: 'Staff Gudang', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' };
            default:
                return { label: 'Tamu', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
        }
    };

    const roleInfo = getRoleBadge(currentUser?.role);

    return (
        <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 print:hidden">
            <div className="px-2.5 py-2.5 sm:px-4 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    {/* Left: Mobile hamburger & Logo */}
                    <div className="flex items-center justify-start rtl:justify-end min-w-0">
                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            className="inline-flex items-center justify-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 cursor-pointer transition-colors shrink-0"
                            aria-label="Toggle sidebar"
                            title={sidebarOpen ? "Tutup Sidebar (Perlebar Layar)" : "Buka Sidebar"}
                        >
                            {sidebarOpen ? (
                                <PanelLeftClose className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            )}
                        </button>

                        <a href="/dashboard" className="flex ms-1.5 sm:ms-2 md:me-10 lg:me-16 items-center gap-2 sm:gap-2.5 group min-w-0">
                            {appLogo ? (
                                appLogo.startsWith('emoji:') ? (
                                    <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-theme-primary text-lg sm:text-xl shadow-sm select-none shrink-0 group-hover:scale-105 transition-transform">
                                        {appLogo.replace('emoji:', '')}
                                    </div>
                                ) : (
                                    <img
                                        src={appLogo}
                                        alt={appName}
                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0 group-hover:scale-105 transition-transform"
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            target.style.display = 'none';
                                        }}
                                    />
                                )
                            ) : (
                                <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-theme-primary text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                                    <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                            )}
                            <span className="self-center text-base sm:text-xl font-bold tracking-tight truncate max-w-[110px] xs:max-w-[150px] sm:max-w-xs md:max-w-none text-gray-900 dark:text-white">
                                {appName}<span className="text-theme-primary">.</span>
                            </span>
                            <span className="bg-theme-primary-light text-theme-primary-text text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300 hidden md:inline-block shrink-0">
                                Gudang
                            </span>
                        </a>

                        {/* Search input in Navbar */}
                        <div className="hidden lg:block relative ms-4 w-72">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari produk, SKU, supplier..."
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Right: Actions, Theme Toggle, Notification & User Dropdown */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {/* Theme Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2 sm:p-2.5 transition-colors"
                            title={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5 text-amber-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-700" />
                            )}
                        </button>

                        {/* Notifications Dropdown Button */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    setShowUserDropdown(false);
                                }}
                                className="relative text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2 sm:p-2.5 cursor-pointer"
                                aria-label="Notifikasi"
                            >
                                <Bell className="w-5 h-5" />
                                {notifications && notifications.total_unread > 0 ? (
                                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-extrabold text-white bg-rose-600 rounded-full shadow-xs ring-2 ring-white dark:ring-gray-800 animate-pulse">
                                        {notifications.total_unread > 99 ? '99+' : notifications.total_unread}
                                    </span>
                                ) : (
                                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 z-50 mt-2 w-[calc(100vw-1.5rem)] sm:w-88 max-w-sm text-base list-none bg-white divide-y divide-gray-100 rounded-2xl shadow-xl dark:bg-gray-800 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 overflow-hidden">
                                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Bell className="w-4 h-4 text-blue-600" />
                                            <span className="font-bold text-xs text-gray-900 dark:text-white">
                                                Pusat Notifikasi & Tugas
                                            </span>
                                        </div>
                                        {notifications && notifications.total_unread > 0 && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                                {notifications.total_unread} Perlu Aksi
                                            </span>
                                        )}
                                    </div>

                                    <div className="divide-y divide-gray-100 dark:divide-gray-700/60 max-h-80 overflow-y-auto">
                                        {notifications && notifications.items && notifications.items.length > 0 ? (
                                            notifications.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => {
                                                        if (onSelectTab && item.tab) {
                                                            onSelectTab(item.tab);
                                                        }
                                                        setShowNotifications(false);
                                                    }}
                                                    className="flex items-start px-4 py-3 hover:bg-blue-50/50 dark:hover:bg-gray-700/60 cursor-pointer transition-colors group"
                                                >
                                                    <div className="shrink-0 mt-0.5">
                                                        {item.type === 'alert' && (
                                                            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                                                                <AlertTriangle className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                        {item.type === 'warning' && (
                                                            <div className="p-2 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
                                                                <Clock className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                        {item.type === 'success' && (
                                                            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                        {item.type === 'info' && (
                                                            <div className="p-2 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                                                                <Truck className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="w-full ps-3 min-w-0">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <div className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                                {item.title}
                                                            </div>
                                                            <span className="text-[10px] font-medium text-gray-400 shrink-0">
                                                                {item.time}
                                                            </span>
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                                                            {item.subtitle}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-6 text-center text-xs text-gray-500 space-y-1">
                                                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1" />
                                                <p className="font-semibold text-gray-700 dark:text-gray-300">Semua Terkendali!</p>
                                                <p className="text-[11px]">Tidak ada tugas atau transaksi yang menunggu tindakan.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile Avatar & Dropdown */}
                        <div className="relative ms-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUserDropdown(!showUserDropdown);
                                    setShowNotifications(false);
                                }}
                                className="flex items-center gap-3 text-sm rounded-full focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 p-1"
                            >
                                {currentUser?.avatar ? (
                                    <img
                                        src={currentUser.avatar}
                                        alt={currentUser.name || 'User'}
                                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-700 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white dark:ring-gray-700 uppercase">
                                        {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                                    </div>
                                )}
                                <div className="hidden md:flex flex-col text-left">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                                        {currentUser?.name ?? 'Akun Pengguna'}
                                    </span>
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">
                                        {currentUser?.role ? currentUser.role.replace('_', ' ') : 'Guest'}
                                    </span>
                                </div>
                            </button>

                            {showUserDropdown && (
                                <div className="absolute right-0 z-50 mt-2 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700 dark:divide-gray-600 border border-gray-200 dark:border-gray-600 w-[calc(100vw-1.5rem)] sm:w-64 max-w-xs animate-in fade-in zoom-in-95">
                                    <div className="px-4 py-3" role="none">
                                        <div className="flex items-center gap-3 mb-2">
                                            {currentUser?.avatar ? (
                                                <img
                                                    src={currentUser.avatar}
                                                    alt={currentUser.name || 'User'}
                                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900 shadow-xs"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm uppercase">
                                                    {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                                                </div>
                                            )}
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                    {currentUser?.name ?? 'Pengguna'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                                                    {currentUser?.email ?? '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${roleInfo.color}`}>
                                            {roleInfo.label}
                                        </span>
                                    </div>

                                    {/* Direct Profile Tab Access Button */}
                                    <div className="p-1.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowUserDropdown(false);
                                                if (onSelectTab) {
                                                    onSelectTab('profile');
                                                } else {
                                                    router.visit('/dashboard');
                                                }
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-600 transition-colors cursor-pointer text-left"
                                        >
                                            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            <span>Pengaturan Profil & Foto</span>
                                        </button>
                                    </div>

                                    {/* Fast Role Switcher Section for Demo & Testing (Khusus Admin Saja) */}
                                    {currentUser?.role === 'admin' && (
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800/60">
                                            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <ArrowRightLeft className="w-3 h-3 text-blue-500" />
                                                Ganti Role Demo:
                                            </div>
                                            <div className="grid grid-cols-1 gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSwitchRole('admin')}
                                                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between ${
                                                        currentUser?.role === 'admin' 
                                                            ? 'bg-theme-primary text-white font-semibold' 
                                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    <span>1. Admin</span>
                                                    <span className="text-[10px] opacity-75">Semua Fitur</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSwitchRole('manajer_gudang')}
                                                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between ${
                                                        currentUser?.role === 'manajer_gudang' 
                                                            ? 'bg-theme-primary text-white font-semibold' 
                                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    <span>2. Manajer Gudang</span>
                                                    <span className="text-[10px] opacity-75">Produk & Stok</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSwitchRole('staff_gudang')}
                                                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between ${
                                                        currentUser?.role === 'staff_gudang' 
                                                            ? 'bg-theme-primary text-white font-semibold' 
                                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    <span>3. Staff Gudang</span>
                                                    <span className="text-[10px] opacity-75">Masuk & Keluar</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="py-1">
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-red-400 font-medium"
                                        >
                                            <LogOut className="w-4 h-4" /> Keluar (Log out)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Loading Screen Overlay saat Logout */}
            {isLoggingOut && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-xs w-full mx-4 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                            <LogOut className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Keluar dari Sistem
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Menutup sesi kerja dan mengamankan data...
                        </p>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-5">
                            <div className="h-full bg-blue-600 dark:bg-blue-400 animate-progress-flow rounded-full" />
                        </div>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-3">
                            Mengalihkan ke halaman masuk...
                        </span>
                    </div>
                </div>
            )}
        </nav>
    );
}
