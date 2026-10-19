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
    ArrowRightLeft
} from 'lucide-react';

interface NavbarProps {
    onToggleSidebar: () => void;
    sidebarOpen: boolean;
    currentUser?: {
        id: number;
        name: string;
        email: string;
        role: string;
    } | null;
}

export function FlowbiteNavbar({ onToggleSidebar, sidebarOpen, currentUser }: NavbarProps) {
    const [isDark, setIsDark] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

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
                return { label: 'Admin (Full Access)', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
            case 'manajer_gudang':
                return { label: 'Manajer Gudang', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' };
            case 'staff_gudang':
                return { label: 'Staff Gudang', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' };
            case 'customer':
                return { label: 'Customer (Pembeli)', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
            default:
                return { label: 'Tamu', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
        }
    };

    const roleInfo = getRoleBadge(currentUser?.role);

    return (
        <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    {/* Left: Mobile hamburger & Logo */}
                    <div className="flex items-center justify-start rtl:justify-end">
                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            className="inline-flex items-center justify-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 cursor-pointer transition-colors"
                            aria-label="Toggle sidebar"
                            title={sidebarOpen ? "Tutup Sidebar (Perlebar Layar)" : "Buka Sidebar"}
                        >
                            {sidebarOpen ? (
                                <PanelLeftClose className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            )}
                        </button>

                        <a href="/dashboard" className="flex ms-2 md:me-24 items-center gap-2">
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white shadow-sm">
                                <Package className="w-5 h-5" />
                            </div>
                            <span className="self-center text-xl font-bold tracking-tight whitespace-nowrap text-gray-900 dark:text-white">
                                Stockify<span className="text-blue-600">.</span>
                            </span>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300 hidden sm:inline-block">
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
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 transition-colors"
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
                                className="relative text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 z-50 mt-2 w-80 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700 dark:divide-gray-600 border border-gray-200 dark:border-gray-600 animate-in fade-in zoom-in-95">
                                    <div className="block px-4 py-2 font-medium text-center text-gray-700 rounded-t-lg bg-gray-50 dark:bg-gray-800 dark:text-white">
                                        Notifikasi Gudang
                                    </div>
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-64 overflow-y-auto">
                                        <div className="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                                            <div className="flex-shrink-0">
                                                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300">
                                                    <AlertTriangle className="w-4 h-4" />
                                                </div>
                                            </div>
                                            <div className="w-full ps-3">
                                                <div className="text-gray-600 text-xs mb-1 dark:text-gray-300">
                                                    Peringatan: Stok beberapa produk mendekati batas minimum!
                                                </div>
                                                <div className="text-[11px] text-blue-600 dark:text-blue-500">Baru saja</div>
                                            </div>
                                        </div>
                                        <div className="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                                            <div className="flex-shrink-0">
                                                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                            </div>
                                            <div className="w-full ps-3">
                                                <div className="text-gray-600 text-xs mb-1 dark:text-gray-300">
                                                    Transaksi stok berhasil disinkronisasi ke database MySQL.
                                                </div>
                                                <div className="text-[11px] text-blue-600 dark:text-blue-500">Sistem aktif</div>
                                            </div>
                                        </div>
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
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white dark:ring-gray-700 uppercase">
                                    {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                                </div>
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
                                <div className="absolute right-0 z-50 mt-2 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700 dark:divide-gray-600 border border-gray-200 dark:border-gray-600 w-64 animate-in fade-in zoom-in-95">
                                    <div className="px-4 py-3" role="none">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {currentUser?.name ?? 'Pengguna'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                                            {currentUser?.email ?? '-'}
                                        </p>
                                        <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold rounded-full ${roleInfo.color}`}>
                                            {roleInfo.label}
                                        </span>
                                    </div>

                                    {/* Fast Role Switcher Section for Demo & Testing */}
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
                                                        ? 'bg-blue-600 text-white font-semibold' 
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
                                                        ? 'bg-blue-600 text-white font-semibold' 
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
                                                        ? 'bg-blue-600 text-white font-semibold' 
                                                        : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                <span>3. Staff Gudang</span>
                                                <span className="text-[10px] opacity-75">Masuk & Keluar</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSwitchRole('customer')}
                                                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between ${
                                                    currentUser?.role === 'customer' 
                                                        ? 'bg-blue-600 text-white font-semibold' 
                                                        : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                <span>4. Customer</span>
                                                <span className="text-[10px] opacity-75">Beli & Refund</span>
                                            </button>
                                        </div>
                                    </div>

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
                            <LogOut className="w-6 h-6 text-[#43637E] dark:text-[#4EE3D6] animate-pulse" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Keluar dari Sistem
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Menutup sesi kerja dan mengamankan data...
                        </p>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-5">
                            <div className="h-full bg-[#43637E] dark:bg-[#4EE3D6] animate-progress-flow rounded-full" />
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
