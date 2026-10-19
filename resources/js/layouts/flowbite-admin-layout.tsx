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
    } | null;
    productsCount?: number;
    transactionsCount?: number;
    pendingInCount?: number;
    pendingOutCount?: number;
    isTabLoading?: boolean;
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
                <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-[#43637E] dark:bg-[#4EE3D6] animate-progress-flow rounded-full" />
                </div>
            )}

            {/* Top Fixed Flowbite Navbar */}
            <FlowbiteNavbar 
                sidebarOpen={sidebarOpen}
                onToggleSidebar={toggleSidebar}
                currentUser={currentUser}
            />

            {/* Backdrop for mobile */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-gray-900/50 dark:bg-gray-900/80 md:hidden backdrop-blur-xs"
                />
            )}

            {/* Left Fixed Flowbite Sidebar */}
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

            {/* Main Content Area with fluid width when sidebar is toggled */}
            <main className={`p-4 md:p-6 pt-20 transition-[margin] duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'md:ml-20 ml-0'}`}>
                <div className="max-w-7xl mx-auto space-y-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
