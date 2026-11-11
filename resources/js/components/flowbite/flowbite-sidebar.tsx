import React from 'react';
import {
    LayoutDashboard,
    Boxes,
    Tags,
    Truck,
    ArrowLeftRight,
    FileText,
    Users,
    Sliders,
    Database,
    Shield,
    ClipboardCheck,
    CheckSquare,
    PackageCheck,
    TruckIcon,
    ChevronLeft,
    Power,
    User as UserIcon,
    Star,
    StickyNote,
    Wallet
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onToggleSidebar?: () => void;
    activeTab?: string;
    onSelectTab?: (tab: string) => void;
    userRole?: string;
    currentUser?: {
        name?: string;
        role?: string;
        email?: string;
        avatar?: string | null;
    } | null;
    productsCount?: number;
    transactionsCount?: number;
    pendingInCount?: number;
    pendingOutCount?: number;
}

export function FlowbiteSidebar({
    isOpen,
    onToggleSidebar,
    activeTab = 'dashboard',
    onSelectTab,
    userRole = 'admin',
    currentUser,
    productsCount = 0,
    transactionsCount = 0,
    pendingInCount = 0,
    pendingOutCount = 0,
}: SidebarProps) {
    const allNavItems = [
        {
            id: 'dashboard',
            label: userRole === 'staff_gudang' 
                ? 'Tugas Operasional' 
                : (userRole === 'manajer_gudang' ? 'Dashboard Stok' : 'Dashboard'),
            icon: LayoutDashboard,
            badge: userRole === 'staff_gudang' && (pendingInCount + pendingOutCount > 0)
                ? `${pendingInCount + pendingOutCount}`
                : null,
            badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            roles: ['admin', 'manajer_gudang', 'staff_gudang'],
        },
        {
            id: 'products',
            label: userRole === 'manajer_gudang' ? 'Daftar Produk' : 'Daftar Produk',
            icon: Boxes,
            badge: productsCount > 0 ? `${productsCount}` : null,
            roles: ['admin', 'manajer_gudang'],
        },
        {
            id: 'categories',
            label: 'Kategori Produk',
            icon: Tags,
            badge: null,
            roles: ['admin'],
        },
        {
            id: 'suppliers',
            label: userRole === 'manajer_gudang' ? 'Daftar Supplier' : 'Supplier / Pemasok',
            icon: Truck,
            badge: null,
            roles: ['admin', 'manajer_gudang'],
        },
        {
            id: 'transactions',
            label: userRole === 'staff_gudang' ? 'Konfirmasi Stok' : 'Transaksi Stok',
            icon: ArrowLeftRight,
            badge: userRole === 'staff_gudang'
                ? (pendingInCount + pendingOutCount > 0 ? `${pendingInCount + pendingOutCount}` : null)
                : (transactionsCount > 0 ? `${transactionsCount}` : null),
            badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
            roles: ['admin', 'manajer_gudang', 'staff_gudang'],
        },
        {
            id: 'opname',
            label: 'Stock Opname',
            icon: ClipboardCheck,
            badge: 'Fisik',
            badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            roles: ['admin', 'manajer_gudang'],
        },
        {
            id: 'reports',
            label: userRole === 'manajer_gudang' ? 'Laporan Stok & Mutasi' : 'Laporan Gudang',
            icon: FileText,
            badge: null,
            roles: ['admin', 'manajer_gudang'],
        },
        {
            id: 'cash_flow',
            label: userRole === 'staff_gudang' ? 'Kas Kecil Gudang' : 'Buku Kas / Arus Kas',
            icon: Wallet,
            badge: userRole === 'staff_gudang' ? 'Petty Cash' : 'Keuangan',
            badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
            roles: ['admin', 'manajer_gudang', 'staff_gudang'],
        },

        {
            id: 'warehouse_notes',
            label: 'Catatan Gudang',
            icon: StickyNote,
            badge: 'Baru',
            badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
            roles: ['admin', 'manajer_gudang', 'staff_gudang'],
        },
        {
            id: 'users',
            label: 'Manajemen User',
            icon: Users,
            badge: 'Admin',
            badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            roles: ['admin'],
        },
        {
            id: 'settings',
            label: 'Pengaturan Umum',
            icon: Sliders,
            badge: null,
            roles: ['admin'],
        },
        {
            id: 'profile',
            label: 'Profil Saya',
            icon: UserIcon,
            badge: null,
            roles: ['admin', 'manajer_gudang', 'staff_gudang'],
        },
    ];

    const visibleItems = allNavItems.filter(item => item.roles.includes(userRole));

    return (
        <aside
            id="logo-sidebar"
            className={`fixed top-0 left-0 z-40 h-screen pt-20 transition-all duration-300 ease-in-out print:hidden ${isOpen
                ? 'w-64 translate-x-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-lg md:shadow-none'
                : '-translate-x-full md:translate-x-0 md:w-20 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                }`}
            aria-label="Sidebar"
        >
            <div className="h-full px-3 pb-4 overflow-y-auto flex flex-col justify-between">
                <div>
                    {/* Top Profile / Header Avatar */}
                    {isOpen ? (
                        <div className="px-2 mb-4 flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/60">
                            <button
                                type="button"
                                onClick={() => onSelectTab && onSelectTab('profile')}
                                title="Buka Profil Saya"
                                className="flex items-center gap-2.5 text-left cursor-pointer p-1 -m-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors flex-1 overflow-hidden group"
                            >
                                {currentUser?.avatar ? (
                                    <img
                                        src={currentUser.avatar}
                                        alt={currentUser.name || 'User'}
                                        className="w-9 h-9 rounded-full object-cover shadow-xs ring-2 ring-blue-100 dark:ring-blue-950 flex-shrink-0 group-hover:ring-blue-300 dark:group-hover:ring-blue-500 transition-all"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-theme-primary-light text-theme-primary dark:bg-blue-900/40 dark:text-blue-300 font-bold flex items-center justify-center text-sm shadow-xs ring-2 ring-blue-100 dark:ring-blue-950 flex-shrink-0 group-hover:ring-blue-300 dark:group-hover:ring-blue-500 transition-all">
                                        {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div className="flex flex-col truncate">
                                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {currentUser?.name || 'User'}
                                    </span>
                                    <span className="text-[10px] text-theme-primary dark:text-blue-400 capitalize font-medium flex items-center gap-1">
                                        <Shield className="w-2.5 h-2.5" />
                                        {userRole.replace('_', ' ')}
                                    </span>
                                </div>
                            </button>
                            {onToggleSidebar && (
                                <button
                                    type="button"
                                    onClick={onToggleSidebar}
                                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                                    title="Ciutkan Sidebar"
                                    aria-label="Ciutkan Sidebar"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center mb-5 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                            <button
                                type="button"
                                onClick={() => onSelectTab && onSelectTab('profile')}
                                title="Buka Profil Saya"
                                className="cursor-pointer hover:scale-110 transition-transform"
                            >
                                {currentUser?.avatar ? (
                                    <img
                                        src={currentUser.avatar}
                                        alt={currentUser.name || 'User'}
                                        className="w-10 h-10 rounded-full object-cover shadow-xs ring-2 ring-blue-100 dark:ring-blue-950"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-theme-primary-light text-theme-primary dark:bg-blue-900/40 dark:text-blue-300 font-bold flex items-center justify-center text-sm shadow-xs ring-2 ring-blue-100 dark:ring-blue-950">
                                        {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Nav Items Stack */}
                    <ul className={`space-y-1.5 font-medium ${!isOpen ? 'flex flex-col items-center' : ''}`}>
                        {visibleItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <li key={item.id} className={!isOpen ? 'w-full flex justify-center' : ''}>
                                    <button
                                        type="button"
                                        onClick={() => onSelectTab && onSelectTab(item.id)}
                                        title={item.label}
                                        className={`transition-all duration-150 cursor-pointer ${!isOpen
                                            ? `w-11 h-11 flex items-center justify-center rounded-xl relative ${isActive
                                                ? 'bg-theme-primary text-white shadow-md shadow-md'
                                                : 'text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60'
                                            }`
                                            : `w-full flex items-center p-2.5 text-sm rounded-xl ${isActive
                                                ? 'bg-theme-primary text-white shadow-md shadow-md font-semibold'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60'
                                            }`
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        {isOpen && (
                                            <>
                                                <span className="ms-3 flex-1 text-left text-xs font-medium whitespace-nowrap">
                                                    {item.label}
                                                </span>
                                                {item.badge && (
                                                    <span
                                                        className={`inline-flex items-center justify-center px-2 py-0.5 ms-2 text-[10px] font-semibold rounded-full ${isActive
                                                            ? 'bg-white/20 text-white'
                                                            : item.badgeColor || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}
                                                    >
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                        {!isOpen && item.badge && (
                                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-gray-800" />
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Operational Tasks Quick Widget for Staff (When Open) */}
                    {isOpen && userRole === 'staff_gudang' && (
                        <div className="mt-4 p-3 bg-blue-50/70 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-xs">
                            <div className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-1.5">
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                                Antrean Hari Ini:
                            </div>
                            <div className="space-y-1.5 text-[11px]">
                                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                    <span>Pemeriksaan Masuk:</span>
                                    <span className="font-bold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded">
                                        {pendingInCount}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                    <span>Penyiapan Keluar:</span>
                                    <span className="font-bold px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 rounded">
                                        {pendingOutCount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Card / Power Icon */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60">
                    {isOpen ? (
                        <div className="p-2.5 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-200/60 dark:border-gray-700 text-center">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-left">
                                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                                        Stockify v1.0
                                    </span>
                                </div>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Sistem Online" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse my-2" title="Database Aktif" />
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
