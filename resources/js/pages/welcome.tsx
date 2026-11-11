import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Package,
    Boxes,
    ArrowRight,
    ShieldCheck,
    Truck,
    BarChart3,
    CheckCircle2,
    ClipboardCheck,
    Layers,
    Sparkles,
    FileSpreadsheet,
    Lock,
    ArrowDownToLine,
    ArrowUpFromLine,
    ChevronRight,
    Users,
    Zap,
    Building2,
    Check,
    TrendingUp,
    PackageCheck,
    Activity,
    CheckCircle,
    Store,
    Receipt,
    Mail,
    ShoppingBag,
    Eye,
    Cpu,
    Search,
    Sliders,
    Smartphone,
    Shirt,
    Wrench,
    Car,
    Clock,
    Award,
    Star,
    RefreshCw,
    ExternalLink,
    ChevronLeft,
    ChevronUp,
    Lightbulb,
    X,
    Menu,
} from 'lucide-react';

interface FeaturedProduct {
    id: number;
    name: string;
    sku: string;
    category_name: string;
    selling_price: number;
    current_stock: number;
    minimum_stock: number;
    image: string | null;
}

interface CategoryItem {
    id: number;
    name: string;
    products_count: number;
}

interface AppSettings {
    appName: string;
    warehouseName: string;
    contact: string;
    email: string;
    address: string;
    appInfo: string;
    logo: string | null;
}

interface Props {
    totalProducts?: number;
    totalSuppliers?: number;
    totalStockIn?: number;
    totalStockOut?: number;
    canLogin?: boolean;
    appSettings?: AppSettings;
    featuredProducts?: FeaturedProduct[];
    categories?: CategoryItem[];
}

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
    kendaraan: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    otomotif: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    bahan: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    material: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    perkakas: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80',
    baut: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80',
    elektronik: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    kelistrikan: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=800&q=80',
    k3: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&w=800&q=80',
    keselamatan: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80',
    sayur: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    pangan: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
    pakaian: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
};

function getProductImage(image: string | null | undefined, category: string | undefined): string {
    if (image && typeof image === 'string' && image.trim().length > 0) {
        return image;
    }
    const cat = (category || '').toLowerCase();
    for (const [key, url] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
        if (key !== 'default' && cat.includes(key)) {
            return url;
        }
    }
    return CATEGORY_FALLBACK_IMAGES.default;
}

export default function Welcome({
    totalProducts = 12,
    totalSuppliers = 4,
    totalStockIn = 240,
    totalStockOut = 85,
    canLogin = true,
    appSettings: initialAppSettings,
    featuredProducts = [],
    categories = [],
}: Props) {
    const pageProps = usePage().props as unknown as { 
        auth?: { user?: { name: string; role: string } };
        appSettings?: AppSettings;
    };
    const auth = pageProps.auth;

    const [appSettings, setAppSettings] = useState<AppSettings>(() => {
        const base = initialAppSettings || pageProps.appSettings || {
            appName: 'Stockify',
            warehouseName: 'Gudang Pusat Logistik Cikarang',
            contact: '021-8976500',
            email: 'admin@stockify.test',
            address: 'Kawasan Industri GIIC Blok AA No. 1, Cikarang Pusat',
            appInfo: 'Kelola produk, pantau stok, dan bantu tim gudang bekerja lebih kompak—semuanya dalam satu tempat yang nyaman dipakai.',
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

    // Scroll progress bar and scroll-to-top button
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Mobile Navigation Menu State & Listeners
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setMobileMenuOpen(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        setMobileMenuOpen(false);
        scrollToSection(e, targetId);
    };

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const currentProgress = totalScroll > 0 ? (window.scrollY / totalScroll) * 100 : 0;
            setScrollProgress(currentProgress);
            setShowScrollTop(window.scrollY > 400);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // IntersectionObserver scroll reveal animation
    useEffect(() => {
        const observerCallback: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    entry.target.classList.remove('opacity-0', 'translate-y-8');
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px',
        });

        const elements = document.querySelectorAll('.scroll-reveal');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);
    
    // Hero Interactive Mockup Tab State
    const [heroTab, setHeroTab] = useState<'ai_scanner' | 'stok_matrix' | 'tugas_staff'>('ai_scanner');

    // Interactive AI Scanner Sample State with clean Lucide icons (no emojis)
    const AI_SAMPLES = [
        {
            name: 'Mobil Sedan Sport 2.0 Turbo',
            category: 'Kendaraan',
            score: '98.5%',
            source: 'Deep Learning Vision (MobileNet)',
            desc: 'Terdeteksi fitur bodi kendaraan, roda, dan gril mesin mobil.',
            icon: Car,
        },
        {
            name: 'Smartphone Pro Max 256GB',
            category: 'Elektronik',
            score: '99.1%',
            source: 'Vision & Keyword Recognition',
            desc: 'Terdeteksi modul kamera kaca, layar sentuh digital, dan baterai.',
            icon: Smartphone,
        },
        {
            name: 'Kemeja Formal Katun Lengan Panjang',
            category: 'Pakaian',
            score: '97.4%',
            source: 'Deep Learning Vision',
            desc: 'Terdeteksi tekstur serat katun, kerah pakaian, dan kancing.',
            icon: Shirt,
        },
        {
            name: 'Baut Baja Hexagonal M10 50mm',
            category: 'Bahan Bangunan',
            score: '98.8%',
            source: 'Machine Learning Vision',
            desc: 'Terdeteksi ulir metalik baja presisi tahan karat.',
            icon: Wrench,
        },
    ];
    const [selectedAiSample, setSelectedAiSample] = useState(AI_SAMPLES[0]);
    const [isScanning, setIsScanning] = useState(false);

    const triggerSampleScan = (sample: typeof AI_SAMPLES[0]) => {
        setIsScanning(true);
        setTimeout(() => {
            setSelectedAiSample(sample);
            setIsScanning(false);
        }, 350);
    };

    // ROI Calculator State
    const [skuVolume, setSkuVolume] = useState<number>(500);

    // Filter, Search & Pagination for Product Catalog Showcase
    const ITEMS_PER_PAGE = 6;
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);

    const filteredCatalogProducts = useMemo(() => {
        return featuredProducts.filter(p => {
            const matchesCategory = selectedCategoryFilter === 'all' || 
                p.category_name.toLowerCase() === selectedCategoryFilter.toLowerCase();
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = !q || 
                p.name.toLowerCase().includes(q) || 
                p.sku.toLowerCase().includes(q) || 
                p.category_name.toLowerCase().includes(q);
            return matchesCategory && matchesSearch;
        });
    }, [featuredProducts, selectedCategoryFilter, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredCatalogProducts.length / ITEMS_PER_PAGE));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCatalogProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCatalogProducts, currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
        setCurrentPage(newPage);
        const catalogEl = document.getElementById('katalog');
        if (catalogEl) {
            const navHeight = 72;
            const targetPos = catalogEl.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
    };

    const handleCategoryFilterSelect = (cat: string) => {
        setSelectedCategoryFilter(cat);
        setCurrentPage(1);
    };

    const handleSearchInputChange = (val: string) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (!element) return;

        const navHeight = 72;
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - navHeight;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 600;
        let start: number | null = null;

        const easeInOutQuart = (t: number) => {
            return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
        };

        const animation = (currentTime: number) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutQuart(progress);

            window.scrollTo(0, startPosition + distance * ease);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white relative">
            <Head title={`${appSettings.appName} - Sistem Manajemen Gudang, AI Vision & Katalog Inventaris Modern`} />

            {/* Top Sticky Scroll Progress Indicator */}
            <div
                className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 z-[60] transition-all duration-150 pointer-events-none"
                style={{ width: `${scrollProgress}%` }}
            />

            {/* Floating Back to Top Button */}
            {showScrollTop && (
                <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer"
                    title="Kembali ke atas"
                >
                    <ChevronUp className="w-5 h-5" />
                </button>
            )}

            {/* TOP FLOATING NAVBAR DENGAN LOGO KUSTOM & RESPONSIVE MOBILE MENU */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs transition-all">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
                    {/* Brand Logo & Dynamic Icon */}
                    <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 min-w-0">
                        <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 transition-transform duration-200 group-hover:scale-105 overflow-hidden shrink-0">
                            {appSettings.logo ? (
                                appSettings.logo.startsWith('emoji:') ? (
                                    <span className="text-lg sm:text-xl leading-none">
                                        {appSettings.logo.replace('emoji:', '')}
                                    </span>
                                ) : (
                                    <img
                                        src={appSettings.logo}
                                        alt={appSettings.appName}
                                        className="w-full h-full object-contain p-1"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                )
                            ) : (
                                <Package className="w-5 h-5" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-sans truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
                                    {appSettings.appName}<span className="text-blue-600">.</span>
                                </span>
                                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full hidden md:inline-block border border-blue-200">
                                    Warehouse OS
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium hidden md:block truncate max-w-[180px]">
                                {appSettings.warehouseName}
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Menu (Desktop & Tablet Landscape) */}
                    <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs font-semibold text-slate-600">
                        <a
                            href="#katalog"
                            onClick={(e) => scrollToSection(e, 'katalog')}
                            className="hover:text-blue-600 transition flex items-center gap-1.5 cursor-pointer py-1"
                        >
                            <Store className="w-3.5 h-3.5 text-slate-500" />
                            <span>Katalog Produk</span>
                        </a>
                        <a
                            href="#role"
                            onClick={(e) => scrollToSection(e, 'role')}
                            className="hover:text-blue-600 transition flex items-center gap-1.5 cursor-pointer py-1"
                        >
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span>Hierarki Multi-Role</span>
                        </a>
                        <a
                            href="#kalkulator"
                            onClick={(e) => scrollToSection(e, 'kalkulator')}
                            className="hover:text-blue-600 transition flex items-center gap-1.5 cursor-pointer py-1"
                        >
                            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Simulasi Efisiensi</span>
                        </a>
                        <a
                            href="/kontak"
                            className="hover:text-blue-600 transition flex items-center gap-1.5 cursor-pointer py-1"
                        >
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>Kontak Gudang</span>
                        </a>
                    </nav>

                    {/* Action Buttons & Mobile Hamburger Button */}
                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                        {auth?.user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <span className="hidden xs:inline">Buka</span>
                                <span>Dashboard</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        ) : (
                            <>
                                <a
                                    href="#katalog"
                                    onClick={(e) => scrollToSection(e, 'katalog')}
                                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 font-semibold text-xs border border-slate-200 transition"
                                >
                                    <Store className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Katalog Produk</span>
                                </a>
                                <a
                                    href="/login"
                                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    <Lock className="w-3.5 h-3.5 text-blue-200" />
                                    <span>Masuk<span className="hidden sm:inline"> ke Sistem</span></span>
                                </a>
                            </>
                        )}

                        {/* Hamburger Button for Mobile / Tablet screens (< lg) */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(prev => !prev)}
                            className="inline-flex lg:hidden items-center justify-center p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                            aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
                            title={mobileMenuOpen ? 'Tutup Menu' : 'Buka Menu'}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5 text-slate-800 stroke-[2.5]" />
                            ) : (
                                <Menu className="w-5 h-5 text-slate-800 stroke-[2.5]" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown Drawer */}
                {mobileMenuOpen && (
                    <div className="lg:hidden">
                        {/* Backdrop Overlay */}
                        <div
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 top-16 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
                            aria-hidden="true"
                        />

                        {/* Slide-Down Mobile Drawer Panel */}
                        <div className="fixed top-16 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-b border-slate-200/90 shadow-2xl p-4 sm:p-5 max-h-[calc(100vh-4rem)] overflow-y-auto space-y-3 animate-in slide-in-from-top-4 duration-200">
                            {/* Warehouse Info Card */}
                            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50/90 border border-blue-100/90 text-xs text-blue-900">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold truncate text-slate-900">{appSettings.warehouseName}</p>
                                    <p className="text-[11px] text-blue-600 font-medium truncate">{appSettings.contact}</p>
                                </div>
                            </div>

                            {/* Mobile Links */}
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
                                    Menu Navigasi
                                </p>

                                <a
                                    href="#katalog"
                                    onClick={(e) => handleMobileNavClick(e, 'katalog')}
                                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <Store className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="block font-bold text-slate-900 truncate">Katalog Produk</span>
                                            <span className="block text-[11px] text-slate-500 font-normal truncate">Jelajahi stok barang & harga grosir</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </a>

                                <a
                                    href="#role"
                                    onClick={(e) => handleMobileNavClick(e, 'role')}
                                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="block font-bold text-slate-900 truncate">Hierarki Multi-Role</span>
                                            <span className="block text-[11px] text-slate-500 font-normal truncate">Admin, Manajer, Staff Gudang</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </a>

                                <a
                                    href="#kalkulator"
                                    onClick={(e) => handleMobileNavClick(e, 'kalkulator')}
                                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <BarChart3 className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="block font-bold text-slate-900 truncate">Simulasi Efisiensi Gudang</span>
                                            <span className="block text-[11px] text-slate-500 font-normal truncate">Hitung kalkulasi hemat waktu & biaya</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </a>

                                <a
                                    href="/kontak"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="block font-bold text-slate-900 truncate">Kontak Gudang</span>
                                            <span className="block text-[11px] text-slate-500 font-normal truncate">Pusat bantuan & informasi operasional</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </a>
                            </div>

                            {/* Mobile Actions Bottom */}
                            <div className="pt-2 border-t border-slate-200/80">
                                {auth?.user ? (
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all"
                                    >
                                        <span>Buka Dashboard ({auth.user.name})</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <a
                                            href="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 text-center transition-all"
                                        >
                                            <Lock className="w-3.5 h-3.5 text-blue-200" />
                                            <span>Masuk</span>
                                        </a>
                                        <a
                                            href="/register"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs text-center transition-all"
                                        >
                                            <span>Daftar Akun</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* HERO SECTION DENGAN RADIAL GLOW & COMMAND CENTER INTERAKTIF */}
            <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]">
                {/* Background Ambient Grid & Glow */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                        
                        {/* Kolom Kiri: Headline & Value Proposition */}
                        <div className="lg:col-span-6 space-y-6 text-left scroll-reveal transition-all duration-700 ease-out opacity-0 translate-y-8">
                            {/* Pill Banner */}
                            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-xs backdrop-blur-xs">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                                </span>
                                <span>Didukung Machine Learning Vision v2.0</span>
                                <span className="text-blue-300">•</span>
                                <span className="text-slate-600 font-medium flex items-center gap-1">
                                    Multi-Role Otorisasi
                                    <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.12]">
                                Kendali Presisi Gudang, Stok & Logistik{' '}
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                                    Berbasis Kecerdasan Buatan.
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                                Otomatisasi penerimaan barang, audit <strong>Stock Opname</strong> tanpa selisih, identifikasi kategori produk instan via <strong>AI Vision</strong>, dan katalog toko belanja interaktif terpercaya.
                            </p>

                            {/* Action CTA Buttons */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <a
                                    href="/login"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                                >
                                    <Lock className="w-4 h-4 text-blue-200" />
                                    <span>Masuk ke Sistem</span>
                                    <ArrowRight className="w-4 h-4" />
                                </a>

                                <a
                                    href="#katalog"
                                    onClick={(e) => scrollToSection(e, 'katalog')}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition-all hover:border-slate-300"
                                >
                                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                                    <span>Katalog Produk</span>
                                </a>
                            </div>

                            {/* Key Highlights Indicators */}
                            <div className="pt-3 border-t border-slate-200/70 grid grid-cols-3 gap-3 text-xs text-slate-600">
                                <div>
                                    <span className="block font-black text-lg text-slate-900">99.8%</span>
                                    <span className="text-[11px] text-slate-500">Akurasi Fisik Opname</span>
                                </div>
                                <div>
                                    <span className="block font-black text-lg text-blue-600">&lt;0.2 Detik</span>
                                    <span className="text-[11px] text-slate-500">Prediksi Kategori AI</span>
                                </div>
                                <div>
                                    <span className="block font-black text-lg text-emerald-600">4 Role</span>
                                    <span className="text-[11px] text-slate-500">Sistem Hak Akses</span>
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan: LIVE COMMAND CENTER INTERAKTIF */}
                        <div className="lg:col-span-6 relative scroll-reveal transition-all duration-700 delay-150 ease-out opacity-0 translate-y-8">
                            {/* Decorative Floating Pill */}
                            <div className="absolute -top-4 -right-2 sm:-right-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-lg text-[11px] font-bold text-slate-800">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Status Sistem: Aktif Normal</span>
                            </div>

                            {/* Main Interactive Glass Container */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-blue-500/10 overflow-hidden">
                                
                                {/* Window Navigation Bar */}
                                <div className="bg-slate-100/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-full bg-rose-500" />
                                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                                        <span className="text-xs font-bold text-slate-600 ml-2">Stockify Interactive Simulator</span>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-600 shadow-2xs">
                                        <button
                                            type="button"
                                            onClick={() => setHeroTab('ai_scanner')}
                                            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                                heroTab === 'ai_scanner'
                                                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                                                    : 'hover:bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            AI Vision
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setHeroTab('stok_matrix')}
                                            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                                heroTab === 'stok_matrix'
                                                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                                                    : 'hover:bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            <Boxes className="w-3 h-3" />
                                            Stok
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setHeroTab('tugas_staff')}
                                            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                                heroTab === 'tugas_staff'
                                                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                                                    : 'hover:bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            <ClipboardCheck className="w-3 h-3" />
                                            Tugas
                                        </button>
                                    </div>
                                </div>

                                {/* Content Tab 1: AI Vision Scanner Demo */}
                                {heroTab === 'ai_scanner' && (
                                    <div className="p-5 space-y-4 bg-gradient-to-b from-blue-50/30 to-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                                                    <Cpu className="w-3.5 h-3.5" />
                                                    Simulasi Model Deep Learning Vision
                                                </h4>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Klik contoh item di bawah untuk melihat bagaimana Stockify mengklasifikasikan produk otomatis:
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                Online
                                            </span>
                                        </div>

                                        {/* Sample Selectors with Lucide Icons */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {AI_SAMPLES.map((sample, idx) => {
                                                const IconComp = sample.icon;
                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => triggerSampleScan(sample)}
                                                        className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col gap-1.5 ${
                                                            selectedAiSample.name === sample.name
                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                                            selectedAiSample.name === sample.name ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                                                        }`}>
                                                            <IconComp className="w-4 h-4" />
                                                        </div>
                                                        <span className="truncate block font-semibold">{sample.category}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* AI Recognition Result Card */}
                                        <div className="relative p-4 rounded-xl bg-slate-900 text-white space-y-3 overflow-hidden shadow-inner">
                                            {isScanning && (
                                                <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-xs flex items-center justify-center z-10 text-xs font-bold text-white gap-2">
                                                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                                                    Menganalisis fitur visual dengan Machine Learning...
                                                </div>
                                            )}

                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                                                        Produk Terdeteksi
                                                    </span>
                                                    <h5 className="font-black text-sm text-white mt-1 flex items-center gap-2">
                                                        <selectedAiSample.icon className="w-4 h-4 text-blue-400 shrink-0" />
                                                        <span>{selectedAiSample.name}</span>
                                                    </h5>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] text-slate-400 block font-medium">Confidence Score</span>
                                                    <span className="text-sm font-black text-emerald-400">{selectedAiSample.score}</span>
                                                </div>
                                            </div>

                                            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block">Kategori yang Direkomendasikan:</span>
                                                    <span className="font-extrabold text-blue-300 text-sm">{selectedAiSample.category}</span>
                                                </div>
                                                <span className="px-2 py-1 rounded bg-blue-950 text-blue-300 text-[10px] font-semibold border border-blue-800">
                                                    {selectedAiSample.source}
                                                </span>
                                            </div>

                                            <p className="text-[11px] text-slate-300 font-normal leading-relaxed flex items-start gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                                <span>{selectedAiSample.desc}</span>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Content Tab 2: Stock Matrix */}
                                {heroTab === 'stok_matrix' && (
                                    <div className="p-5 space-y-4 bg-gradient-to-b from-blue-50/20 to-white">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total SKU</span>
                                                <span className="text-xl font-black text-slate-900 mt-1 block">{totalProducts}</span>
                                                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                                                    <TrendingUp className="w-3 h-3" /> Terpantau Realtime
                                                </span>
                                            </div>
                                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Barang Masuk</span>
                                                <span className="text-xl font-black text-blue-600 mt-1 block">+{totalStockIn}</span>
                                                <span className="text-[10px] text-slate-500 font-medium mt-1 block">Penerimaan selesai</span>
                                            </div>
                                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Barang Keluar</span>
                                                <span className="text-xl font-black text-indigo-600 mt-1 block">-{totalStockOut}</span>
                                                <span className="text-[10px] text-slate-500 font-medium mt-1 block">Terkonfirmasi</span>
                                            </div>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-slate-700">Kapasitas Fasilitas Gudang</span>
                                                <span className="font-black text-blue-600">82% Terisi</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full w-[82%]" />
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                                    <CheckCircle className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-800 block text-xs">Stock Opname Otomatis</span>
                                                    <span className="text-[11px] text-slate-500">Selisih fisik vs sistem: 0 unit</span>
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                                                Audit Sempurna
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Content Tab 3: Tugas Staff */}
                                {heroTab === 'tugas_staff' && (
                                    <div className="p-5 space-y-3 bg-gradient-to-b from-blue-50/20 to-white text-xs">
                                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                                                <div>
                                                    <span className="font-bold text-slate-800 block">Pemeriksaan Barang Masuk Supplier</span>
                                                    <span className="text-[11px] text-slate-500">50 Unit Baut & Komponen Mesin</span>
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                                                Menunggu Verifikasi
                                            </span>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                                <div>
                                                    <span className="font-bold text-slate-800 block">Penyiapan Pengeluaran Ekspedisi</span>
                                                    <span className="text-[11px] text-slate-500">20 Unit Alokasi Mutasi Keluar</span>
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                                                Disiapkan
                                            </span>
                                        </div>

                                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <Check className="w-4 h-4 text-emerald-600" />
                                                Konfirmasi 1-Klik seketika memutakhirkan stok database
                                            </span>
                                            <span className="font-black text-[10px]">100% Akurat</span>
                                        </div>
                                    </div>
                                )}

                                {/* Footer Bar of the Mockup Window */}
                                <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                                        MySQL ACID Transaction Protected
                                    </span>
                                    <a
                                        href="/login"
                                        className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                                    >
                                        Buka Dashboard Langsung
                                        <ChevronRight className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* SECTION HIERARKI MULTI-ROLE */}
            <section id="role" className="scroll-mt-20 py-20 bg-white border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14 scroll-reveal transition-all duration-700 ease-out opacity-0 translate-y-8">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
                            Arsitektur Multi-Role
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
                            Struktur Otorisasi 3 Peran Gudang Terintegrasi
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                            Satu sistem terpadu melayani seluruh hierarki operasional dari kepemilikan data, pengawasan manajerial, hingga pelaksana fisik gudang:
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
                        
                        {/* Role 1: Administrator */}
                        <div className="p-6 rounded-2xl border border-slate-200 bg-gradient-to-b from-blue-50/50 to-white hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 scroll-reveal transition-all duration-700 delay-75 ease-out opacity-0 translate-y-8 group">
                            <div className="space-y-3">
                                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                                    Otoritas Penuh
                                </span>
                                <h3 className="text-lg font-black text-slate-900">1. Administrator</h3>
                                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                    Kelola master data: produk, varian atribut khusus, mitra supplier, manajemen user, ekspor CSV, dan audit valuasi finansial.
                                </p>
                            </div>
                            <a
                                href="/login"
                                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5"
                            >
                                <Lock className="w-3.5 h-3.5 text-blue-200" />
                                <span>Akses Portal Admin</span>
                            </a>
                        </div>

                        {/* Role 2: Manajer Gudang */}
                        <div className="p-6 rounded-2xl border border-slate-200 bg-gradient-to-b from-emerald-50/50 to-white hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 scroll-reveal transition-all duration-700 delay-150 ease-out opacity-0 translate-y-8 group">
                            <div className="space-y-3">
                                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                                    Pengawas Operasional
                                </span>
                                <h3 className="text-lg font-black text-slate-900">2. Manajer Gudang</h3>
                                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                    Monitoring Low Stock Alert, kontrol mutasi keluar-masuk, audit fisik stock opname, dan approval penyesuaian selisih kuantitas.
                                </p>
                            </div>
                            <a
                                href="/login"
                                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition hover:-translate-y-0.5"
                            >
                                <Lock className="w-3.5 h-3.5 text-emerald-200" />
                                <span>Akses Portal Manajer</span>
                            </a>
                        </div>

                        {/* Role 3: Staff Lapangan */}
                        <div className="p-6 rounded-2xl border border-slate-200 bg-gradient-to-b from-amber-50/50 to-white hover:border-amber-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 scroll-reveal transition-all duration-700 delay-200 ease-out opacity-0 translate-y-8 group">
                            <div className="space-y-3">
                                <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform">
                                    <ClipboardCheck className="w-6 h-6" />
                                </div>
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                                    Pelaksana Fisik
                                </span>
                                <h3 className="text-lg font-black text-slate-900">3. Staff Gudang</h3>
                                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                    Daftar antrean verifikasi barang masuk dari vendor dan penyiapan ekspedisi barang keluar dengan konfirmasi aman dan cepat.
                                </p>
                            </div>
                            <a
                                href="/login"
                                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 transition hover:-translate-y-0.5"
                            >
                                <Lock className="w-3.5 h-3.5 text-amber-200" />
                                <span>Akses Portal Staff</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION KATALOG PRODUK INTERAKTIF (PRODUCT SHOWCASE) */}
            <section id="katalog" className="scroll-mt-20 py-20 bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 scroll-reveal transition-all duration-700 ease-out opacity-0 translate-y-8">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100/70 px-3.5 py-1 rounded-full border border-blue-200">
                                Katalog Terbuka
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2.5">
                                Produk Aktif di Gudang Stockify
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Data inventaris real-time yang tersimpan di sistem manajemen pergudangan:
                            </p>
                        </div>

                        {/* Interactive Instant Search Bar */}
                        <div className="relative w-full lg:w-72">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchInputChange(e.target.value)}
                                placeholder="Cari nama barang atau SKU..."
                                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-2xs"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => handleSearchInputChange('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                    title="Hapus pencarian"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Filter Pills with Item Count */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 scroll-reveal transition-all duration-700 ease-out opacity-0 translate-y-8">
                        <button
                            type="button"
                            onClick={() => handleCategoryFilterSelect('all')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                selectedCategoryFilter === 'all'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Semua ({featuredProducts.length})
                        </button>
                        {categories.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => handleCategoryFilterSelect(c.name)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    selectedCategoryFilter.toLowerCase() === c.name.toLowerCase()
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {c.name} ({c.products_count})
                            </button>
                        ))}
                    </div>

                    {/* Products Grid with Clean Pagination */}
                    {filteredCatalogProducts.length > 0 ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedProducts.map((p, idx) => (
                                    <div
                                        key={p.id}
                                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group scroll-reveal transition-all duration-700 ease-out opacity-0 translate-y-8"
                                        style={{ transitionDelay: `${(idx % 3) * 100}ms` }}
                                    >
                                        <div>
                                            {/* Product Photo Box with smart resolution and reliable fallback */}
                                            <div className="h-52 bg-slate-100 border-b border-slate-100 relative overflow-hidden flex items-center justify-center group/img">
                                                <img
                                                    src={getProductImage(p.image, p.category_name)}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                                    onError={(e) => {
                                                        const fallback = getProductImage(null, p.category_name);
                                                        const target = e.currentTarget as HTMLImageElement;
                                                        if (target.src !== fallback) {
                                                            target.src = fallback;
                                                        }
                                                    }}
                                                />

                                                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-2xs border border-slate-200">
                                                    {p.category_name}
                                                </span>

                                                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-2xs ${
                                                    p.current_stock > p.minimum_stock
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-amber-500 text-white'
                                                }`}>
                                                    Stok: {p.current_stock}
                                                </span>
                                            </div>

                                            {/* Product Details */}
                                            <div className="p-5 space-y-2">
                                                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                                                    <span>SKU: {p.sku}</span>
                                                    <span>Min: {p.minimum_stock}</span>
                                                </div>
                                                <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                                                    {p.name}
                                                </h4>
                                                <div className="pt-2 flex items-baseline justify-between">
                                                    <span className="text-xs text-slate-500 font-medium">Harga Satuan:</span>
                                                    <span className="text-base font-black text-blue-600">
                                                        {formatCurrency(p.selling_price)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button: Langsung ke Login untuk Membeli */}
                                        <div className="p-5 pt-0">
                                            <a
                                                href={auth?.user ? "/dashboard?tab=products" : "/login"}
                                                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                            >
                                                <Package className="w-3.5 h-3.5" />
                                                <span>{auth?.user ? 'Kelola Stok di Dashboard' : 'Masuk ke Sistem'}</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Clean Pagination Bar (Next/Prev & Page Numbers) */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
                                    <p className="text-xs text-slate-500 font-medium order-2 sm:order-1">
                                        Menampilkan <span className="font-bold text-slate-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>–<span className="font-bold text-slate-800">{Math.min(currentPage * ITEMS_PER_PAGE, filteredCatalogProducts.length)}</span> dari <span className="font-bold text-slate-800">{filteredCatalogProducts.length}</span> produk aktif
                                    </p>

                                    <div className="flex items-center gap-1.5 order-1 sm:order-2">
                                        {/* Prev Button */}
                                        <button
                                            type="button"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                                                currentPage === 1
                                                    ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed pointer-events-none'
                                                    : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100 shadow-2xs'
                                            }`}
                                            aria-label="Halaman sebelumnya"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Sebelumnya</span>
                                        </button>

                                        {/* Page Numbers */}
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                                                if (
                                                    totalPages <= 6 ||
                                                    pageNum === 1 ||
                                                    pageNum === totalPages ||
                                                    Math.abs(pageNum - currentPage) <= 1
                                                ) {
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            type="button"
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                                                currentPage === pageNum
                                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-2xs'
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                } else if (
                                                    pageNum === currentPage - 2 ||
                                                    pageNum === currentPage + 2
                                                ) {
                                                    return (
                                                        <span key={pageNum} className="w-5 text-center text-xs text-slate-400 select-none">
                                                            ...
                                                        </span>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>

                                        {/* Next Button */}
                                        <button
                                            type="button"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                                                currentPage === totalPages
                                                    ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed pointer-events-none'
                                                    : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100 shadow-2xs'
                                            }`}
                                            aria-label="Halaman berikutnya"
                                        >
                                            <span className="hidden sm:inline">Berikutnya</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-md mx-auto space-y-3 shadow-xs">
                            <Package className="w-12 h-12 text-slate-300 mx-auto" />
                            <h4 className="font-bold text-slate-700">Tidak ada produk yang cocok</h4>
                            <p className="text-xs text-slate-500">
                                Coba ganti kata kunci pencarian atau pilih kategori lain.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    handleCategoryFilterSelect('all');
                                    handleSearchInputChange('');
                                }}
                                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition inline-block cursor-pointer"
                            >
                                Reset Filter &amp; Pencarian
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* SECTION SIMULASI EFISIENSI & KALKULATOR ROI */}
            <section id="kalkulator" className="scroll-mt-20 py-20 bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-xl mx-auto mb-12 scroll-reveal transition-all duration-700 ease-out opacity-0 translate-y-8">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                            Simulasi Penghematan
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2.5">
                            Berapa Efisiensi yang Dihasilkan?
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Geser slider kuantitas SKU untuk melihat perkiraan penghematan waktu dan biaya operasional tim gudang Anda:
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm space-y-8 scroll-reveal transition-all duration-700 delay-100 ease-out opacity-0 translate-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-bold text-slate-800">
                                    Jumlah Varian Produk / SKU di Fasilitas:
                                </label>
                                <span className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-black text-base shadow-xs">
                                    {skuVolume.toLocaleString('id-ID')} SKU
                                </span>
                            </div>
                            <input
                                type="range"
                                min={50}
                                max={5000}
                                step={50}
                                value={skuVolume}
                                onChange={(e) => setSkuVolume(Number(e.target.value))}
                                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                                <span>50 SKU (Gudang Kecil)</span>
                                <span>2.500 SKU</span>
                                <span>5.000+ SKU (Pusat Logistik)</span>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                                <span className="text-[11px] font-bold text-slate-400 uppercase block">Waktu Opname Hemat</span>
                                <span className="text-2xl font-black text-blue-600 mt-1 block">
                                    {Math.round(skuVolume * 0.12)} Jam
                                </span>
                                <span className="text-[11px] text-slate-500 mt-0.5 block">per siklus audit bulanan</span>
                            </div>

                            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                                <span className="text-[11px] font-bold text-slate-400 uppercase block">Efisiensi Biaya Audit</span>
                                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                                    {formatCurrency(Math.round(skuVolume * 35000))}
                                </span>
                                <span className="text-[11px] text-slate-500 mt-0.5 block">estimasi nilai operasional</span>
                            </div>

                            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                                <span className="text-[11px] font-bold text-slate-400 uppercase block">Akurasi Selisih Fisik</span>
                                <span className="text-2xl font-black text-indigo-600 mt-1 block">
                                    99.8%
                                </span>
                                <span className="text-[11px] text-slate-500 mt-0.5 block">sinkronisasi database ACID</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION BOTTOM BANNER */}
            <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-5 scroll-reveal transition-all duration-700 ease-out opacity-0 translate-y-8">
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                        Tingkatkan Standar Operasional Gudang Anda Sekarang
                    </h2>
                    <p className="text-blue-100 text-xs sm:text-sm max-w-xl mx-auto font-normal leading-relaxed">
                        Rasakan kemudahan verifikasi barang masuk, stock opname instan, dan otorisasi multi-role dalam satu solusi handal {appSettings.appName}.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                        <a
                            href="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 font-black text-xs sm:text-sm shadow-xl hover:bg-slate-50 transition hover:-translate-y-0.5"
                        >
                            <Lock className="w-4 h-4 text-blue-600" />
                            <span>Masuk ke Portal Login</span>
                            <ArrowRight className="w-4 h-4" />
                        </a>
                        <a
                            href="/kontak"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm border border-blue-400/30 transition hover:-translate-y-0.5"
                        >
                            <Mail className="w-4 h-4" />
                            <span>Hubungi Kontak Gudang</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* ENTERPRISE FOOTER WITH DYNAMIC BRANDING */}
            <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800 text-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="grid grid-cols-2 md:grid-cols-12 gap-8 pb-12 border-b border-slate-800">
                        {/* Column 1: Brand & Contact Info */}
                        <div className="col-span-2 md:col-span-5 space-y-4">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white font-black shadow-md overflow-hidden">
                                    {appSettings.logo ? (
                                        appSettings.logo.startsWith('emoji:') ? (
                                            <span className="text-xl leading-none">
                                                {appSettings.logo.replace('emoji:', '')}
                                            </span>
                                        ) : (
                                            <img
                                                src={appSettings.logo}
                                                alt={appSettings.appName}
                                                className="w-full h-full object-contain p-1"
                                            />
                                        )
                                    ) : (
                                        <Package className="w-5 h-5" />
                                    )}
                                </div>
                                <span className="text-xl font-black tracking-tight text-white">
                                    {appSettings.appName}<span className="text-blue-500">.</span>
                                </span>
                            </Link>

                            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                                {appSettings.appInfo}
                            </p>

                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-medium">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Status Fasilitas: <strong>Operasional Normal (99.98%)</strong></span>
                            </div>

                            <div className="space-y-1 text-slate-400 text-xs pt-1">
                                <p className="flex items-center gap-2">
                                    <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span>{appSettings.address}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span>Email: {appSettings.email} · Telp: {appSettings.contact}</span>
                                </p>
                            </div>
                        </div>

                        {/* Column 2: Navigasi Halaman */}
                        <div className="col-span-1 md:col-span-3 space-y-3">
                            <p className="text-xs font-black uppercase tracking-wider text-white">Navigasi Halaman</p>
                            <ul className="space-y-2 text-xs font-medium">
                                <li>
                                    <a href="#katalog" onClick={(e) => scrollToSection(e, 'katalog')} className="hover:text-blue-400 transition">
                                        Katalog Terbuka Produk
                                    </a>
                                </li>
                                <li>
                                    <a href="#role" onClick={(e) => scrollToSection(e, 'role')} className="hover:text-blue-400 transition">
                                        Audit Stock Opname Otomatis
                                    </a>
                                </li>
                                <li>
                                    <a href="#kalkulator" onClick={(e) => scrollToSection(e, 'kalkulator')} className="hover:text-blue-400 transition">
                                        Kalkulator Efisiensi SKU
                                    </a>
                                </li>
                                <li>
                                    <a href="/kontak" className="hover:text-blue-400 transition">
                                        Hotline Bantuan &amp; Kontak
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Akses Portal & Autentikasi */}
                        <div className="col-span-1 md:col-span-4 space-y-3">
                            <p className="text-xs font-black uppercase tracking-wider text-white">Portal &amp; Autentikasi</p>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                                Sistem manajemen operasional terlindungi otorisasi multi-role berbasis sesi terenkripsi dengan audit log transaksi real-time.
                            </p>
                            <div className="space-y-2.5 pt-1">
                                <a
                                    href="/login"
                                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                                >
                                    <Lock className="w-3.5 h-3.5 text-blue-200" />
                                    <span>Masuk ke Halaman Login</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </a>
                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                                    <span className="text-slate-300 font-semibold block mb-0.5">Simulasi Akun Demo:</span>
                                    Fitur akun demo (Admin, Manajer, Staff Gudang) tersedia langsung di dalam halaman login resmi.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-slate-500">
                        <p>© {new Date().getFullYear()} {appSettings.appName}. Seluruh hak cipta dilindungi undang-undang.</p>
                        <p>Dikembangkan dengan Laravel 12, React Inertia, TypeScript &amp; Python Machine Learning.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
