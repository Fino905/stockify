import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { FlowbiteNavbar } from '@/components/flowbite/flowbite-navbar';
import { FlowbiteSidebar } from '@/components/flowbite/flowbite-sidebar';

interface FlowbiteAdminLayoutProps {
    children: React.ReactNode;
    activeTab?: string;
    onSelectTab?: (tab: string) => void;
    currentUser?: {
        id: number;
        name: string;
        email: string;
        role: string;
        avatar?: string | null;
    } | null;
    productsCount?: number;
    transactionsCount?: number;
    pendingInCount?: number;
    pendingOutCount?: number;
    isTabLoading?: boolean;
    notifications?: any;
    appSettings?: {
        appName?: string;
        logo?: string | null;
    } | null;
}

export default function FlowbiteAdminLayout({
    children,
    activeTab = 'dashboard',
    onSelectTab,
    currentUser,
    productsCount = 0,
    transactionsCount = 0,
    pendingInCount = 0,
    pendingOutCount = 0,
    isTabLoading = false,
    notifications,
    appSettings,
}: FlowbiteAdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isPageLoading, setIsPageLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar_open');
            if (saved !== null) {
                setSidebarOpen(saved === 'true');
            } else if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        }
    }, []);

    useEffect(() => {
        const unregisterStart = router.on('start', () => setIsPageLoading(true));
        const unregisterFinish = router.on('finish', () => setIsPageLoading(false));
        return () => {
            unregisterStart();
            unregisterFinish();
        };
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('sidebar_open', String(next));
            }
            return next;
        });
    };

    const showLoader = isPageLoading || isTabLoading;

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans antialiased text-gray-900 dark:text-gray-100 relative">
            {/* Top Minimalist Page Loading Bar */}
            {showLoader && (
                <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gray-200 dark:bg-gray-800 overflow-hidden print:hidden">
                    <div className="h-full bg-blue-600 dark:bg-blue-400 animate-progress-flow rounded-full" />
                </div>
            )}

            {/* Top Fixed Flowbite Navbar */}
            <div className="print:hidden">
                <FlowbiteNavbar
                    sidebarOpen={sidebarOpen}
                    onToggleSidebar={toggleSidebar}
                    currentUser={currentUser}
                    onSelectTab={onSelectTab}
                    notifications={notifications}
                    appSettings={appSettings}
                />
            </div>

            {/* Backdrop for mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-gray-900/50 dark:bg-gray-900/80 md:hidden backdrop-blur-xs print:hidden"
                />
            )}

            {/* Left Fixed Flowbite Sidebar */}
            <div className="print:hidden">
                <FlowbiteSidebar
                    isOpen={sidebarOpen}
                    onToggleSidebar={toggleSidebar}
                    activeTab={activeTab}
                    onSelectTab={(tab) => {
                        if (onSelectTab) onSelectTab(tab);
                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                            setSidebarOpen(false);
                        }
                    }}
                    userRole={currentUser?.role ?? 'admin'}
                    currentUser={currentUser}
                    productsCount={productsCount}
                    transactionsCount={transactionsCount}
                    pendingInCount={pendingInCount}
                    pendingOutCount={pendingOutCount}
                />
            </div>

            {/* Main Content Area with fluid width when sidebar is toggled */}
            <main className={`px-4 md:px-6 pb-6 md:pb-8 pt-24 md:pt-24 print:pt-0 print:pb-0 print:px-0 print:m-0 print:ml-0 transition-[margin] duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64 print:ml-0' : 'md:ml-20 ml-0 print:ml-0'}`}>
                <div className="max-w-7xl mx-auto space-y-6 print:max-w-full print:space-y-4">
                    {children}
                </div>
            </main>
        </div>
    );
}
