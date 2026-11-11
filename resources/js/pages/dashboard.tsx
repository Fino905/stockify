import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import FlowbiteAdminLayout from '@/layouts/flowbite-admin-layout';
import { StaffTaskOverview } from '@/components/dashboard/staff';
import { ManagerStockOverview } from '@/components/dashboard/manager';
import { AdminAnalyticsOverview } from '@/components/dashboard/admin';
import { WarehouseNotesTab } from '@/components/dashboard/warehouse-notes-tab';
import { CashFlowTab } from '@/components/dashboard/cash-flow-tab';
import { ProfileTab } from '@/components/dashboard/profile-tab';
import { ConfirmAlertModal } from '@/components/common/confirm-alert-modal';
import { triggerAlertToast } from '@/components/common/alert-toast-banner';
import {
    Boxes,
    ArrowDownToLine,
    ArrowUpFromLine,
    Truck,
    TrendingUp,
    TrendingDown,
    Plus,
    Search,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Home,
    Trash2,
    Users,
    Tags,
    Shield,
    Printer,
    X,
    ClipboardCheck,
    CheckSquare,
    Sliders,
    Download,
    Upload,
    FileText,
    BarChart3,
    Activity,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Building2,
    Check,
    Pencil,
    Package,
    FileUp,
    Star,
    Headphones,
    MessageSquare,
    Filter,
    ChevronDown,
    Coins,
    Eye,
    Sparkles,
    Image as ImageIcon,
    Smile,
    RotateCcw,
    Link as LinkIcon,
    ExternalLink
} from 'lucide-react';

interface Props {
    stats?: {
        total_products: number;
        total_stock_in: number;
        total_stock_out: number;
        total_suppliers: number;
        today_stock_in: number;
        today_stock_out: number;
        low_stock_count: number;
    };
    chartData?: Array<{
        month: string;
        masuk: number;
        keluar: number;
    }>;
    categories?: Array<{
        id: number;
        name: string;
        description: string | null;
        products_count: number;
    }>;
    suppliers?: Array<{
        id: number;
        name: string;
        category_id?: number | null;
        category?: { id: number; name: string } | null;
        address: string | null;
        phone: string | null;
        email: string | null;
        products_count: number;
    }>;
    products?: Array<{
        id: number;
        name: string;
        sku: string;
        description: string | null;
        image?: string | null;
        purchase_price: number;
        selling_price: number;
        minimum_stock: number;
        current_stock: number;
        zero_stock_since?: string | null;
        zero_stock_days?: number;
        days_until_deletion?: number | null;
        category_id: number;
        category_name: string;
        supplier_id: number | null;
        supplier_name: string;
        attributes?: Array<{
            id: number;
            name: string;
            value: string;
        }>;
    }>;
    transactions?: Array<{
        id: string;
        raw_id: number;
        product_id: number;
        product: string;
        sku: string;
        type: 'in' | 'out';
        quantity: number;
        date: string;
        raw_date: string;
        user: string;
        role: string;
        status: 'pending' | 'completed' | 'cancelled';
        notes: string | null;
    }>;
    users?: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        created_at: string;
    }>;
    lowStockItems?: Array<{
        id: number;
        name: string;
        sku: string;
        minimum_stock: number;
        current_stock: number;
    }>;
    pendingInTasks?: Array<{
        id: string;
        raw_id: number;
        product: string;
        sku: string;
        quantity: number;
        date: string;
        notes: string | null;
    }>;
    pendingOutTasks?: Array<{
        id: string;
        raw_id: number;
        product: string;
        sku: string;
        quantity: number;
        date: string;
        notes: string | null;
    }>;
    staffMembers?: Array<any>;
    cashTransactions?: Array<any>;
    notifications?: any;
    currentUser?: {
        id: number;
        name: string;
        email: string;
        role: string;
        avatar?: string | null;
    } | null;
    appSettings?: {
        appName?: string;
        warehouseName?: string;
        contact?: string;
        email?: string;
        address?: string;
        appInfo?: string;
        logo?: string | null;
        warehouseNotes?: Array<any>;
    };
}

export default function Dashboard({
    stats = { total_products: 0, total_stock_in: 0, total_stock_out: 0, total_suppliers: 0, today_stock_in: 0, today_stock_out: 0, low_stock_count: 0 },
    chartData = [],
    categories = [],
    suppliers = [],
    products = [],
    transactions = [],
    users = [],
    lowStockItems = [],
    pendingInTasks = [],
    pendingOutTasks = [],
    staffMembers = [],
    warehouseNotes = [],
    cashTransactions = [],
    notifications = null,
    currentUser = null,
    appSettings: initialAppSettings = null,
}: Props) {
    const userRole = currentUser?.role ?? 'admin';
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam) return tabParam;

            const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
            if (['products', 'categories', 'suppliers', 'transactions', 'opname', 'reports', 'users', 'settings', 'profile', 'warehouse_notes', 'cash_flow', 'cash-flow'].includes(path)) {
                if (path === 'cash-flow') return 'cash_flow';
                return path;
            }
        }
        return 'dashboard';
    });
    const [isTabLoading, setIsTabLoading] = useState(false);

    React.useEffect(() => {
        if (userRole === 'staff_gudang' && !['dashboard', 'transactions', 'warehouse_notes', 'cash_flow', 'profile'].includes(activeTab)) {
            setActiveTab('dashboard');
        } else if (userRole === 'manajer_gudang' && ['categories', 'users', 'settings'].includes(activeTab)) {
            setActiveTab('dashboard');
        }
    }, [userRole, activeTab]);

    const handleSelectTab = (tab: string) => {
        if (tab === activeTab) return;
        setIsTabLoading(true);
        setTimeout(() => {
            setActiveTab(tab);
            setIsTabLoading(false);
            if (typeof window !== 'undefined') {
                window.history.pushState({}, '', `/dashboard?tab=${tab}`);
            }
        }, 150);
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
    const [productStockFilter, setProductStockFilter] = useState<'all' | 'low' | 'empty' | 'safe'>('all');
    const [filterType, setFilterType] = useState('all');
    const [periodFilter, setPeriodFilter] = useState('Pekan Ini');

    // Transactions tab filter states
    const [trxSearchQuery, setTrxSearchQuery] = useState('');
    const [trxTypeFilter, setTrxTypeFilter] = useState<'all' | 'in' | 'out'>('all');
    const [trxStatusFilter, setTrxStatusFilter] = useState<string>('all');
    const [trxPeriodFilter, setTrxPeriodFilter] = useState<string>('all');

    // Users tab filter states
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

    // Pagination State for Products (Batasi 10 produk per halaman)
    const [productCurrentPage, setProductCurrentPage] = useState(1);
    const PRODUCTS_PER_PAGE = 10;

    useEffect(() => {
        setProductCurrentPage(1);
    }, [searchQuery, productCategoryFilter, productStockFilter]);

    // Modals
    const [showProductModal, setShowProductModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [transactionType, setTransactionType] = useState<'in' | 'out'>('in');
    const [showUserModal, setShowUserModal] = useState(false);
    const [showOpnameModal, setShowOpnameModal] = useState(false);

    // Modal Alert Konfirmasi Transaksi / Mutasi Stok Produk
    const [taskToConfirm, setTaskToConfirm] = useState<{
        id: number;
        productName: string;
        sku?: string;
        quantity: number;
        type: 'in' | 'out';
        action: 'prepare' | 'confirm' | 'reject';
    } | null>(null);
    const [isProcessingTask, setIsProcessingTask] = useState(false);

    // Modal Alert Konfirmasi Hapus Data (Produk, Kategori, Supplier, Pengguna)
    const [itemToDelete, setItemToDelete] = useState<{
        url: string;
        title: string;
        name: string;
        categoryTitle: string;
        badge?: string;
        message: string;
        fields?: Array<{ label: string; value: string | number; isHighlight?: boolean }>;
    } | null>(null);
    const [isDeletingItem, setIsDeletingItem] = useState(false);

    // Modal Alert Konfirmasi Reset Pengaturan & Bersihkan Stok Kosong
    const [showResetSettingsConfirm, setShowResetSettingsConfirm] = useState(false);
    const [isResettingSettings, setIsResettingSettings] = useState(false);
    const [showCleanZeroStockConfirm, setShowCleanZeroStockConfirm] = useState(false);
    const [isCleaningZeroStock, setIsCleaningZeroStock] = useState(false);
    const [showAttributeModal, setShowAttributeModal] = useState(false);
    const [selectedProductForAttr, setSelectedProductForAttr] = useState<number | null>(null);
    const [selectedProductDetail, setSelectedProductDetail] = useState<any | null>(null);

    // Reports sub-tab & filter states
    const [reportActiveSubTab, setReportActiveSubTab] = useState<'stock' | 'transactions' | 'user_activity'>('stock');
    const [reportCategoryFilter, setReportCategoryFilter] = useState<string>('all');
    const [reportStockStatusFilter, setReportStockStatusFilter] = useState<string>('all');
    const [reportTrxTypeFilter, setReportTrxTypeFilter] = useState<string>('all');

    // Edit Modals State
    const [showEditProductModal, setShowEditProductModal] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [editProductForm, setEditProductForm] = useState({
        name: '',
        sku: '',
        category_id: '',
        supplier_id: '',
        description: '',
        image: '',
        purchase_price: '',
        selling_price: '',
        minimum_stock: '10',
    });

    const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [editCategoryForm, setEditCategoryForm] = useState({ name: '', description: '' });

    // AI Auto-Category Suggestion State & Handler
    interface AiCategoryOption {
        category_id: number | string;
        category_name: string;
        score: number;
        is_top?: boolean;
    }

    const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);
    const [aiSuggestionMessage, setAiSuggestionMessage] = useState<string | null>(null);

    // AI 3-Option Category Recommendation States
    const [aiCategoryOptions, setAiCategoryOptions] = useState<AiCategoryOption[]>(() => {
        if (!categories || categories.length === 0) return [];
        return categories.slice(0, 3).map((c, idx) => ({
            category_id: c.id,
            category_name: c.name,
            score: idx === 0 ? 96 : idx === 1 ? 82 : 71,
            is_top: idx === 0,
        }));
    });
    const [showManualCategorySelect, setShowManualCategorySelect] = useState(false);

    const [editAiCategoryOptions, setEditAiCategoryOptions] = useState<AiCategoryOption[]>(() => {
        if (!categories || categories.length === 0) return [];
        return categories.slice(0, 3).map((c, idx) => ({
            category_id: c.id,
            category_name: c.name,
            score: idx === 0 ? 96 : idx === 1 ? 82 : 71,
            is_top: idx === 0,
        }));
    });
    const [showEditManualCategorySelect, setShowEditManualCategorySelect] = useState(false);

    useEffect(() => {
        if (categories && categories.length > 0 && aiCategoryOptions.length === 0) {
            setAiCategoryOptions(
                categories.slice(0, 3).map((c, idx) => ({
                    category_id: c.id,
                    category_name: c.name,
                    score: idx === 0 ? 96 : idx === 1 ? 82 : 71,
                    is_top: idx === 0,
                }))
            );
        }
    }, [categories]);

    // Product Image Upload & Preview States
    const [productImageFile, setProductImageFile] = useState<File | null>(null);
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
    const [editProductImageFile, setEditProductImageFile] = useState<File | null>(null);
    const [editProductImagePreview, setEditProductImagePreview] = useState<string | null>(null);

    const getCategoryIcon = (_categoryName: string) => {
        return '';
    };

    const handleAutoSuggestCategory = async (name: string, imageSource: string | File | null, isEdit = false) => {
        const trimmedImage = typeof imageSource === 'string' ? imageSource.trim() : imageSource;
        const trimmedName = (name || '').trim();

        if (!trimmedName && !trimmedImage) {
            setAiSuggestionMessage('Masukkan nama produk atau upload/masukkan URL gambar terlebih dahulu.');
            return;
        }

        setIsSuggestingCategory(true);
        setAiSuggestionMessage(null);

        try {
            let response;
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            if (trimmedImage instanceof File) {
                const formData = new FormData();
                if (trimmedName) formData.append('name', trimmedName);
                formData.append('image', trimmedImage);

                response = await fetch('/products/suggest-category', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: formData,
                });
            } else {
                response = await fetch('/products/suggest-category', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ name: trimmedName, image: trimmedImage || '' }),
                });
            }

            const result = await response.json();
            if (result.success && result.data?.category_id) {
                const catId = String(result.data.category_id);
                const rawOptions = Array.isArray(result.data.options) && result.data.options.length > 0
                    ? result.data.options
                    : [
                        { category_id: result.data.category_id, category_name: result.data.category_name, score: result.data.score || 95, is_top: true }
                    ];

                const formattedOptions: AiCategoryOption[] = rawOptions.map((opt: any, idx: number) => ({
                    category_id: opt.category_id,
                    category_name: opt.category_name,
                    score: Math.round(Number(opt.score) || 70),
                    is_top: opt.is_top ?? (idx === 0),
                }));

                if (isEdit) {
                    setEditProductForm(prev => ({ ...prev, category_id: catId }));
                    setEditAiCategoryOptions(formattedOptions);
                    setShowEditManualCategorySelect(false);
                } else {
                    setProductForm(prev => ({ ...prev, category_id: catId }));
                    setAiCategoryOptions(formattedOptions);
                    setShowManualCategorySelect(false);
                }
                const sourceLabel = result.data.source === 'ml_vision' ? 'Model Machine Learning (Vision)' : 'AI Analisis Kata Kunci';
                const matchedInfo = result.data.matched_sample ? ` • Cocok dengan referensi: ${result.data.matched_sample}` : '';
                setAiSuggestionMessage(`Saran AI: "${result.data.category_name}" (${result.data.score}% kecocokan - ${sourceLabel}${matchedInfo})`);
            } else {
                setAiSuggestionMessage('AI belum dapat mengenali kategori dari data yang diberikan. Silakan pilih dari 3 opsi atau gunakan pilihan manual.');
            }
        } catch (err) {
            console.error('Error auto-suggesting category:', err);
            setAiSuggestionMessage('Gagal menganalisis kategori via AI.');
        } finally {
            setIsSuggestingCategory(false);
        }
    };

    const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProductImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setProductImagePreview(previewUrl);
            setProductForm(prev => ({ ...prev, image: '' }));
            const nameHint = productForm.name.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            // Otomatis picu Machine Learning seketika setelah upload foto dengan petunjuk nama/file!
            handleAutoSuggestCategory(nameHint, file, false);
        }
    };

    const handleEditProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditProductImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setEditProductImagePreview(previewUrl);
            setEditProductForm(prev => ({ ...prev, image: '' }));
            const nameHint = editProductForm.name.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            // Otomatis picu Machine Learning seketika setelah upload foto dengan petunjuk nama/file!
            handleAutoSuggestCategory(nameHint, file, true);
        }
    };

    const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
    const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
    const [editSupplierForm, setEditSupplierForm] = useState({ name: '', category_id: '', address: '', phone: '', email: '' });

    // Generator Kode SKU Otomatis
    const generateAutoSku = (catId?: string, prodName?: string) => {
        const cat = categories.find(c => String(c.id) === String(catId || productForm.category_id));
        let prefix = 'PRD';
        if (cat) {
            const clean = cat.name.replace(/[^a-zA-Z]/g, '').toUpperCase();
            prefix = clean.substring(0, 3) || 'PRD';
        } else if (prodName) {
            const clean = prodName.replace(/[^a-zA-Z]/g, '').toUpperCase();
            prefix = clean.substring(0, 3) || 'PRD';
        }
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `SKU-${prefix}-${randomNum}`;
    };

    const openAddProductModal = () => {
        const defaultCatId = categories[0]?.id ? String(categories[0].id) : '';
        setProductForm({
            name: '',
            sku: generateAutoSku(defaultCatId),
            category_id: defaultCatId,
            supplier_id: '',
            description: '',
            image: '',
            purchase_price: '',
            selling_price: '',
            minimum_stock: '10',
            initial_stock: '0',
        });
        setProductImageFile(null);
        setProductImagePreview(null);
        setShowProductModal(true);
    };

    // Import CSV State
    const [showImportModal, setShowImportModal] = useState(false);
    const [csvImportText, setCsvImportText] = useState('');

    // Form States
    const [productForm, setProductForm] = useState({
        name: '',
        sku: '',
        category_id: categories[0]?.id ? String(categories[0].id) : '',
        supplier_id: suppliers[0]?.id ? String(suppliers[0].id) : '',
        description: '',
        image: '',
        purchase_price: '',
        selling_price: '',
        minimum_stock: '10',
        initial_stock: '0',
    });

    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
    const [supplierForm, setSupplierForm] = useState({ name: '', category_id: '', address: '', phone: '', email: '' });
    const [transactionForm, setTransactionForm] = useState({
        product_id: products[0]?.id ? String(products[0].id) : '',
        quantity: '1',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'completed',
        record_cash_flow: true,
    });
    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff_gudang',
    });
    const [opnameForm, setOpnameForm] = useState({
        product_id: products[0]?.id ? String(products[0].id) : '',
        physical_stock: '',
        notes: '',
    });
    const [attributeForm, setAttributeForm] = useState({
        name: 'Ukuran',
        value: '',
    });
    const [appSettings, setAppSettings] = useState(() => {
        const defaults = {
            appName: initialAppSettings?.appName || 'Stockify',
            warehouseName: initialAppSettings?.warehouseName || 'Gudang Pusat Logistik Cikarang',
            contact: initialAppSettings?.contact || '021-8976500',
            email: initialAppSettings?.email || 'admin@stockify.test',
            address: initialAppSettings?.address || 'Kawasan Industri GIIC Blok AA No. 1, Cikarang Pusat',
            appInfo: initialAppSettings?.appInfo || 'Kelola produk, pantau stok, dan bantu tim gudang bekerja lebih kompak.',
            logo: initialAppSettings?.logo || null,
        };

        if (typeof window !== 'undefined') {
            const local = localStorage.getItem('stockify_app_settings');
            if (local) {
                try {
                    const parsed = JSON.parse(local);
                    return { ...defaults, ...parsed, logo: initialAppSettings?.logo ?? parsed.logo ?? null };
                } catch (e) {
                    // Ignore parse error
                }
            }
        }
        return defaults;
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialAppSettings?.logo || null);
    const [logoUrlInput, setLogoUrlInput] = useState('');
    const [logoTypeMode, setLogoTypeMode] = useState<'upload' | 'preset' | 'url'>('upload');

    const PRESET_LOGOS = [
        { emoji: '📦', label: 'Paket Box' },
        { emoji: '⚡', label: 'Petir Kilat' },
        { emoji: '🏢', label: 'Gudang Modern' },
        { emoji: '🚗', label: 'Kendaraan' },
        { emoji: '🚀', label: 'Ekspres Roket' },
        { emoji: '💎', label: 'Premium' },
        { emoji: '🛡️', label: 'Keamanan' },
        { emoji: '🏭', label: 'Pabrik Industri' },
        { emoji: '🛠️', label: 'Perkakas' },
        { emoji: '🌟', label: 'Bintang Utama' },
    ];

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const previewUrl = URL.createObjectURL(file);
            setLogoPreview(previewUrl);
            setAppSettings(prev => ({ ...prev, logo: previewUrl }));
        }
    };

    const handleSelectPresetEmoji = (emoji: string) => {
        setLogoFile(null);
        const emojiVal = `emoji:${emoji}`;
        setLogoPreview(emojiVal);
        setAppSettings(prev => ({ ...prev, logo: emojiVal }));
    };

    const handleApplyLogoUrl = () => {
        if (!logoUrlInput.trim()) return;
        setLogoFile(null);
        setLogoPreview(logoUrlInput.trim());
        setAppSettings(prev => ({ ...prev, logo: logoUrlInput.trim() }));
    };

    const handleResetLogoToDefault = () => {
        setLogoFile(null);
        setLogoPreview(null);
        setLogoUrlInput('');
        setAppSettings(prev => ({ ...prev, logo: null }));
    };

    const [settingsSavedMessage, setSettingsSavedMessage] = useState<string | null>(null);
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingSettings(true);

        const formData = new FormData();
        formData.append('appName', appSettings.appName);
        formData.append('warehouseName', appSettings.warehouseName);
        if (appSettings.contact) formData.append('contact', appSettings.contact);
        if (appSettings.email) formData.append('email', appSettings.email);
        if (appSettings.address) formData.append('address', appSettings.address);
        if (appSettings.appInfo) formData.append('appInfo', appSettings.appInfo);

        if (logoFile) {
            formData.append('logo', logoFile);
        } else if (appSettings.logo) {
            formData.append('logo_url', appSettings.logo);
        } else {
            formData.append('remove_logo', '1');
        }

        router.post('/app-settings', formData, {
            preserveScroll: true,
            onSuccess: (page) => {
                setIsSavingSettings(false);
                const serverLogo = (page.props as any)?.appSettings?.logo ?? (logoFile && logoPreview ? logoPreview : appSettings.logo);
                const updated = { ...appSettings, logo: serverLogo };
                setAppSettings(updated);
                setLogoFile(null);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('stockify_app_settings', JSON.stringify(updated));
                    window.dispatchEvent(new CustomEvent('app_settings_changed', { detail: updated }));
                }
                setSettingsSavedMessage('Pengaturan aplikasi & logo Stockify berhasil disimpan ke sistem dan database!');
                triggerAlertToast('Pengaturan aplikasi & logo Stockify berhasil disimpan!', 'success');
                setTimeout(() => setSettingsSavedMessage(null), 4000);
            },
            onError: () => {
                setIsSavingSettings(false);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('stockify_app_settings', JSON.stringify(appSettings));
                    window.dispatchEvent(new CustomEvent('app_settings_changed', { detail: appSettings }));
                }
                setSettingsSavedMessage('Pengaturan berhasil diperbarui di browser!');
                triggerAlertToast('Pengaturan diperbarui di browser lokal.', 'info');
                setTimeout(() => setSettingsSavedMessage(null), 4000);
            },
        });
    };

    const handleResetSettings = () => {
        setShowResetSettingsConfirm(true);
    };

    const executeResetSettings = () => {
        setIsResettingSettings(true);
        const defaults = {
            appName: 'Stockify',
            warehouseName: 'Gudang Pusat Logistik Cikarang',
            contact: '021-8976500',
            email: 'admin@stockify.test',
            address: 'Kawasan Industri GIIC Blok AA No. 1, Cikarang Pusat',
            appInfo: 'Kelola produk, pantau stok, dan bantu tim gudang bekerja lebih kompak—semuanya dalam satu tempat yang nyaman dipakai.',
            logo: null,
        };
        setAppSettings(defaults);
        setLogoFile(null);
        setLogoPreview(null);
        if (typeof window !== 'undefined') {
            localStorage.setItem('stockify_app_settings', JSON.stringify(defaults));
            window.dispatchEvent(new CustomEvent('app_settings_changed', { detail: defaults }));
        }
        router.post('/app-settings', { ...defaults, remove_logo: '1' }, { 
            preserveScroll: true,
            onFinish: () => {
                setIsResettingSettings(false);
                setShowResetSettingsConfirm(false);
                setSettingsSavedMessage('Pengaturan & logo Stockify telah direset ke setelan awal!');
                triggerAlertToast('Pengaturan & identitas Stockify berhasil dikembalikan ke setelan awal.', 'success');
            }
        });
    };

    // Submissions
    const submitProduct = (e: React.FormEvent) => {
        e.preventDefault();

        const finalSku = productForm.sku.trim() || generateAutoSku(productForm.category_id, productForm.name);
        const formData = new FormData();
        formData.append('name', productForm.name);
        formData.append('sku', finalSku);
        formData.append('category_id', productForm.category_id);
        if (productForm.supplier_id) formData.append('supplier_id', productForm.supplier_id);
        if (productForm.description) formData.append('description', productForm.description);
        formData.append('purchase_price', productForm.purchase_price);
        formData.append('selling_price', productForm.selling_price);
        formData.append('minimum_stock', productForm.minimum_stock);
        formData.append('initial_stock', productForm.initial_stock);

        if (productImageFile) {
            formData.append('image', productImageFile);
        } else if (productForm.image) {
            formData.append('image', productForm.image);
        }

        router.post('/products', formData, {
            onSuccess: () => {
                setShowProductModal(false);
                setProductImageFile(null);
                setProductImagePreview(null);
                setAiSuggestionMessage(null);
                setShowManualCategorySelect(false);
                const defaultCatId = categories[0]?.id ? String(categories[0].id) : '';
                setProductForm({
                    name: '',
                    sku: generateAutoSku(defaultCatId),
                    category_id: defaultCatId,
                    supplier_id: suppliers[0]?.id ? String(suppliers[0].id) : '',
                    description: '',
                    image: '',
                    purchase_price: '',
                    selling_price: '',
                    minimum_stock: '10',
                    initial_stock: '0',
                });
            },
        });
    };

    const submitCategory = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/categories', categoryForm, {
            onSuccess: () => {
                setShowCategoryModal(false);
                setCategoryForm({ name: '', description: '' });
            },
        });
    };

    const submitSupplier = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/suppliers', supplierForm, {
            onSuccess: () => {
                setShowSupplierModal(false);
                setSupplierForm({ name: '', category_id: '', address: '', phone: '', email: '' });
            },
        });
    };

    // Edit Product Handlers
    const openEditProductModal = (p: any) => {
        setEditingProductId(p.id);
        setEditProductImageFile(null);
        setEditProductImagePreview(p.image || null);
        setAiSuggestionMessage(null);
        setShowEditManualCategorySelect(false);
        setEditProductForm({
            name: p.name,
            sku: p.sku,
            category_id: String(p.category_id),
            supplier_id: p.supplier_id ? String(p.supplier_id) : '',
            description: p.description || '',
            image: p.image || '',
            purchase_price: String(p.purchase_price),
            selling_price: String(p.selling_price),
            minimum_stock: String(p.minimum_stock),
        });

        // Setup 3 options including current category as top
        const currentCat = categories.find(c => String(c.id) === String(p.category_id));
        const otherCats = categories.filter(c => String(c.id) !== String(p.category_id));
        const initialEditOptions: AiCategoryOption[] = currentCat
            ? [
                { category_id: currentCat.id, category_name: currentCat.name, score: 98, is_top: true },
                ...otherCats.slice(0, 2).map((c, idx) => ({
                    category_id: c.id,
                    category_name: c.name,
                    score: idx === 0 ? 82 : 70,
                    is_top: false,
                })),
            ]
            : categories.slice(0, 3).map((c, idx) => ({
                category_id: c.id,
                category_name: c.name,
                score: idx === 0 ? 95 : idx === 1 ? 80 : 65,
                is_top: idx === 0,
            }));
        setEditAiCategoryOptions(initialEditOptions);
        setShowEditProductModal(true);
    };

    const submitEditProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProductId) return;

        const finalSku = editProductForm.sku.trim() || generateAutoSku(editProductForm.category_id, editProductForm.name);
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', editProductForm.name);
        formData.append('sku', finalSku);
        formData.append('category_id', editProductForm.category_id);
        if (editProductForm.supplier_id) formData.append('supplier_id', editProductForm.supplier_id);
        if (editProductForm.description) formData.append('description', editProductForm.description);
        formData.append('purchase_price', editProductForm.purchase_price);
        formData.append('selling_price', editProductForm.selling_price);
        formData.append('minimum_stock', editProductForm.minimum_stock);

        if (editProductImageFile) {
            formData.append('image', editProductImageFile);
        } else if (editProductForm.image) {
            formData.append('image', editProductForm.image);
        }

        router.post(`/products/${editingProductId}`, formData, {
            onSuccess: () => {
                setShowEditProductModal(false);
                setEditProductImageFile(null);
                setEditProductImagePreview(null);
            },
        });
    };

    // Edit Category Handlers
    const openEditCategoryModal = (c: any) => {
        setEditingCategoryId(c.id);
        setEditCategoryForm({
            name: c.name,
            description: c.description || '',
        });
        setShowEditCategoryModal(true);
    };

    const submitEditCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategoryId) return;
        router.put(`/categories/${editingCategoryId}`, editCategoryForm, {
            onSuccess: () => setShowEditCategoryModal(false),
        });
    };

    // Edit Supplier Handlers
    const openEditSupplierModal = (s: any) => {
        setEditingSupplierId(s.id);
        setEditSupplierForm({
            name: s.name,
            category_id: s.category_id ? String(s.category_id) : '',
            address: s.address || '',
            phone: s.phone || '',
            email: s.email || '',
        });
        setShowEditSupplierModal(true);
    };

    const submitEditSupplier = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSupplierId) return;
        router.put(`/suppliers/${editingSupplierId}`, editSupplierForm, {
            onSuccess: () => setShowEditSupplierModal(false),
        });
    };

    // CSV Import Handlers
    const submitImportCsv = (e: React.FormEvent) => {
        e.preventDefault();
        if (!csvImportText.trim()) return;
        router.post('/products/import', { csv_content: csvImportText }, {
            onSuccess: () => {
                setShowImportModal(false);
                setCsvImportText('');
            },
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setCsvImportText(content);
        };
        reader.readAsText(file);
    };

    const submitTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/transactions', { ...transactionForm, type: transactionType }, {
            onSuccess: () => {
                setShowTransactionModal(false);
                setTransactionForm({
                    product_id: products[0]?.id ? String(products[0].id) : '',
                    quantity: '1',
                    date: new Date().toISOString().split('T')[0],
                    notes: '',
                    status: 'completed',
                });
            },
        });
    };

    const submitUser = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/users', userForm, {
            onSuccess: () => {
                setShowUserModal(false);
                setUserForm({ name: '', email: '', password: '', role: 'staff_gudang' });
            },
        });
    };

    const submitStockOpname = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/stock-opname', opnameForm, {
            onSuccess: () => {
                setShowOpnameModal(false);
                setOpnameForm({
                    product_id: products[0]?.id ? String(products[0].id) : '',
                    physical_stock: '',
                    notes: '',
                });
            },
        });
    };

    const submitAttribute = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductForAttr) return;
        router.post('/attributes', { ...attributeForm, product_id: selectedProductForAttr }, {
            onSuccess: () => {
                setShowAttributeModal(false);
                setAttributeForm({ name: 'Ukuran', value: '' });
            },
        });
    };

    const handleExecuteDelete = () => {
        if (!itemToDelete) return;
        setIsDeletingItem(true);
        router.delete(itemToDelete.url, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeletingItem(false);
                triggerAlertToast(`${itemToDelete.categoryTitle} "${itemToDelete.name}" berhasil dihapus.`, 'success');
                setItemToDelete(null);
            },
            onError: (errs) => {
                setIsDeletingItem(false);
                const errText = (Object.values(errs)[0] as string) || `Gagal menghapus ${itemToDelete.categoryTitle.toLowerCase()}.`;
                triggerAlertToast(errText, 'error');
                setItemToDelete(null);
            }
        });
    };

    const deleteItem = (
        url: string, 
        nameOrMessage: string, 
        categoryTitle = 'Data', 
        badge?: string,
        fields?: Array<{ label: string; value: string | number; isHighlight?: boolean }>
    ) => {
        const cleanName = nameOrMessage.replace(/^Hapus\s+(produk|kategori|supplier|pengguna)?\s*["']?|["']?\?$/gi, '').trim() || nameOrMessage;
        setItemToDelete({
            url,
            title: `Hapus ${categoryTitle}`,
            name: cleanName,
            categoryTitle,
            badge,
            message: `Apakah Anda yakin ingin menghapus ${categoryTitle.toLowerCase()} "${cleanName}"? Tindakan ini bersifat permanen dan data akan dihapus dari sistem.`,
            fields
        });
    };

    const executeCleanZeroStock = () => {
        setIsCleaningZeroStock(true);
        router.post('/products/clean-zero-stock', {}, {
            preserveScroll: true,
            onFinish: () => {
                setIsCleaningZeroStock(false);
                setShowCleanZeroStockConfirm(false);
                triggerAlertToast('Pembersihan produk stok 0 (>3 hari) berhasil dijalankan.', 'success');
            }
        });
    };

    const updateTrxStatus = (id: number, status: string) => {
        router.patch(`/transactions/${id}/status`, { status });
    };

    const handleExecuteTaskAction = () => {
        if (!taskToConfirm) return;
        setIsProcessingTask(true);
        const { id, action } = taskToConfirm;

        const endpoint = 
            action === 'prepare' 
                ? `/transactions/${id}/prepare` 
                : action === 'reject'
                ? `/transactions/${id}/reject`
                : `/transactions/${id}/confirm`;

        router.patch(endpoint, {}, {
            onFinish: () => {
                setIsProcessingTask(false);
                setTaskToConfirm(null);
            }
        });
    };

    const confirmTask = (id: number, productDetails?: { name: string; sku?: string; quantity: number; type: 'in' | 'out' }) => {
        if (productDetails) {
            setTaskToConfirm({
                id,
                productName: productDetails.name,
                sku: productDetails.sku,
                quantity: productDetails.quantity,
                type: productDetails.type,
                action: userRole === 'staff_gudang' ? 'prepare' : 'confirm',
            });
            return;
        }

        const trx = transactions.find(t => t.raw_id === id);
        if (trx) {
            setTaskToConfirm({
                id,
                productName: trx.product,
                sku: trx.sku,
                quantity: trx.quantity,
                type: trx.type,
                action: userRole === 'staff_gudang' ? 'prepare' : 'confirm',
            });
            return;
        }

        const inTask = pendingInTasks.find(t => t.raw_id === id);
        if (inTask) {
            setTaskToConfirm({
                id,
                productName: inTask.product,
                sku: inTask.sku,
                quantity: inTask.quantity,
                type: 'in',
                action: userRole === 'staff_gudang' ? 'prepare' : 'confirm',
            });
            return;
        }

        const outTask = pendingOutTasks.find(t => t.raw_id === id);
        if (outTask) {
            setTaskToConfirm({
                id,
                productName: outTask.product,
                sku: outTask.sku,
                quantity: outTask.quantity,
                type: 'out',
                action: userRole === 'staff_gudang' ? 'prepare' : 'confirm',
            });
            return;
        }

        setTaskToConfirm({
            id,
            productName: `ID #${id}`,
            quantity: 1,
            type: 'in',
            action: userRole === 'staff_gudang' ? 'prepare' : 'confirm',
        });
    };

    const rejectTask = (id: number) => {
        const trx = transactions.find(t => t.raw_id === id);
        setTaskToConfirm({
            id,
            productName: trx?.product || `Transaksi #${id}`,
            sku: trx?.sku,
            quantity: trx?.quantity || 1,
            type: trx?.type || 'in',
            action: 'reject',
        });
    };

    const updateUserRole = (userId: number, role: string) => {
        router.patch(`/users/${userId}/role`, { role });
    };

    const openRestockModal = (productId?: number) => {
        setTransactionType('in');
        const targetId = productId ?? (products[0]?.id || '');
        setTransactionForm(prev => ({ ...prev, product_id: String(targetId), quantity: '50' }));
        setShowTransactionModal(true);
    };

    const openStockOutModal = (productId?: number) => {
        setTransactionType('out');
        const targetId = productId ?? (products[0]?.id || '');
        setTransactionForm(prev => ({ ...prev, product_id: String(targetId), quantity: '10' }));
        setShowTransactionModal(true);
    };

    const openOpnameModal = (productId?: number) => {
        const targetId = productId ?? (products[0]?.id || 0);
        const prod = products.find(p => p.id === targetId);
        setOpnameForm({
            product_id: String(targetId),
            physical_stock: prod ? String(prod.current_stock) : '0',
            notes: '',
        });
        setShowOpnameModal(true);
    };

    const openAttributeModal = (productId: number) => {
        setSelectedProductForAttr(productId);
        setShowAttributeModal(true);
    };

    // Export CSV Helper
    const exportProductsCSV = () => {
        const headers = ['ID,Nama Produk,SKU,Kategori,Supplier,Harga Beli,Harga Jual,Stok Saat Ini,Stok Minimum'];
        const rows = products.map(p =>
            `"${p.id}","${p.name}","${p.sku}","${p.category_name}","${p.supplier_name}",${p.purchase_price},${p.selling_price},${p.current_stock},${p.minimum_stock}`
        );
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `data_produk_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Empty stock count
    const emptyStockCount = products.filter(p => p.current_stock <= 0).length;

    const filteredTransactions = transactions.filter(item => {
        const query = trxSearchQuery.toLowerCase().trim();
        const matchesSearch = !query ||
            item.product.toLowerCase().includes(query) ||
            item.sku.toLowerCase().includes(query) ||
            item.id.toLowerCase().includes(query) ||
            item.user.toLowerCase().includes(query);
            
        const matchesType = trxTypeFilter === 'all' || item.type === trxTypeFilter;
        const matchesStatus = trxStatusFilter === 'all' || item.status.toLowerCase() === trxStatusFilter.toLowerCase();

        let matchesPeriod = true;
        if (trxPeriodFilter !== 'all' && item.date) {
            const trxDate = new Date(item.date);
            const now = new Date();
            if (trxPeriodFilter === 'today') {
                const todayStr = now.toISOString().split('T')[0];
                matchesPeriod = item.date.startsWith(todayStr);
            } else if (trxPeriodFilter === 'week') {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(now.getDate() - 7);
                matchesPeriod = trxDate >= sevenDaysAgo;
            } else if (trxPeriodFilter === 'month') {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(now.getDate() - 30);
                matchesPeriod = trxDate >= thirtyDaysAgo;
            }
        }

        return matchesSearch && matchesType && matchesStatus && matchesPeriod;
    });

    const filteredProducts = products.filter(p => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query ||
            p.name.toLowerCase().includes(query) ||
            p.sku.toLowerCase().includes(query) ||
            p.category_name.toLowerCase().includes(query) ||
            (p.supplier_name && p.supplier_name.toLowerCase().includes(query));

        const matchesCategory =
            productCategoryFilter === 'all' || String(p.category_id) === String(productCategoryFilter);

        let matchesStock = true;
        if (productStockFilter === 'empty') {
            matchesStock = p.current_stock <= 0;
        } else if (productStockFilter === 'low') {
            matchesStock = p.current_stock > 0 && p.current_stock <= p.minimum_stock;
        } else if (productStockFilter === 'safe') {
            matchesStock = p.current_stock > p.minimum_stock;
        }

        return matchesSearch && matchesCategory && matchesStock;
    });

    const filteredUsers = users.filter(u => {
        const query = userSearchQuery.toLowerCase().trim();
        const matchesSearch = !query ||
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query);
        const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
        return matchesSearch && matchesRole;
    });

    const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
    const safeProductPage = Math.min(Math.max(1, productCurrentPage), totalProductPages);
    const productStartIndex = (safeProductPage - 1) * PRODUCTS_PER_PAGE;
    const productEndIndex = Math.min(productStartIndex + PRODUCTS_PER_PAGE, filteredProducts.length);
    const paginatedProducts = filteredProducts.slice(productStartIndex, productEndIndex);

    const getPageNumbers = (current: number, total: number): (number | string)[] => {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        if (current <= 4) {
            return [1, 2, 3, 4, 5, '...', total];
        }
        if (current >= total - 3) {
            return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        }
        return [1, '...', current - 1, current, current + 1, '...', total];
    };

    return (
        <FlowbiteAdminLayout
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            isTabLoading={isTabLoading}
            currentUser={currentUser}
            productsCount={products.length}
            transactionsCount={transactions.length}
            pendingInCount={pendingInTasks.length}
            pendingOutCount={pendingOutTasks.length}
            notifications={notifications}
            appSettings={appSettings}
        >
            <Head title={`Stockify - ${activeTab.toUpperCase()}`} />

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-3 print:hidden" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2">
                    <li className="inline-flex items-center">
                        <button
                            type="button"
                            onClick={() => handleSelectTab('dashboard')}
                            className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-theme-primary dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            <Home className="w-3.5 h-3.5 me-1.5" />
                            Utama
                        </button>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 mx-1" />
                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 capitalize">
                                {activeTab === 'dashboard' ? 'Dashboard' : activeTab.replace('_', ' ')}
                            </span>
                        </div>
                    </li>
                </ol>
            </nav>

            {isTabLoading ? (
                <div className="space-y-4 animate-pulse">
                    {/* Top 3 Skeleton Cards (Matching user layout) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="h-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-5 flex flex-col justify-between">
                            <div className="h-3.5 bg-gray-100 dark:bg-gray-700 rounded-md w-2/5" />
                            <div className="h-7 bg-gray-100 dark:bg-gray-700 rounded-md w-1/2" />
                        </div>
                        <div className="h-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-5 flex flex-col justify-between">
                            <div className="h-3.5 bg-gray-100 dark:bg-gray-700 rounded-md w-2/5" />
                            <div className="h-7 bg-gray-100 dark:bg-gray-700 rounded-md w-1/2" />
                        </div>
                        <div className="h-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-5 flex flex-col justify-between">
                            <div className="h-3.5 bg-gray-100 dark:bg-gray-700 rounded-md w-2/5" />
                            <div className="h-7 bg-gray-100 dark:bg-gray-700 rounded-md w-1/2" />
                        </div>
                    </div>

                    {/* Middle Skeleton Bar (Search / Action Bar) */}
                    <div className="h-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60 p-3.5 flex items-center justify-between">
                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-md w-48" />
                        <div className="flex gap-2">
                            <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded-md w-16" />
                            <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded-md w-20" />
                        </div>
                    </div>

                    {/* Large Skeleton Table Card (Exact match with user screenshot) */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-5 shadow-xs">
                        {/* Table Header Row */}
                        <div className="grid grid-cols-6 gap-4 pb-3.5 border-b border-gray-100 dark:border-gray-700/60">
                            <div className="h-3.5 bg-gray-200/80 dark:bg-gray-700 rounded-md w-3/4" />
                            <div className="h-3.5 bg-gray-200/80 dark:bg-gray-700 rounded-md w-2/3" />
                            <div className="h-3.5 bg-gray-200/80 dark:bg-gray-700 rounded-md w-1/2" />
                            <div className="h-3.5 bg-gray-200/80 dark:bg-gray-700 rounded-md w-3/4" />
                            <div className="h-3.5 bg-gray-200/80 dark:bg-gray-700 rounded-md w-1/2" />
                            <div className="h-3.5 bg-gray-200/80 dark:bg-gray-700 rounded-md w-1/3" />
                        </div>

                        {/* Table Rows (7 placeholder rows) */}
                        <div className="divide-y divide-gray-50 dark:divide-gray-700/40">
                            {[1, 2, 3, 4, 5, 6, 7].map((row) => (
                                <div key={row} className="grid grid-cols-6 gap-4 py-3.5 items-center">
                                    <div className="h-3 bg-gray-100/90 dark:bg-gray-700/60 rounded-md w-4/5" />
                                    <div className="h-3 bg-gray-100/90 dark:bg-gray-700/60 rounded-md w-3/5" />
                                    <div className="h-3 bg-gray-100/90 dark:bg-gray-700/60 rounded-md w-2/3" />
                                    <div className="h-3 bg-gray-100/90 dark:bg-gray-700/60 rounded-md w-1/2" />
                                    <div className="h-3 bg-gray-100/90 dark:bg-gray-700/60 rounded-md w-3/4" />
                                    <div className="h-3 bg-gray-100/90 dark:bg-gray-700/60 rounded-md w-2/5" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in-50 duration-150 print:animate-none print:opacity-100">
                    {/* Top Greeting & Action Card matching reference image (Staff Gudang, Manajer, Admin) */}
                    <div className="card-lift bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/60 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 scroll-reveal print:hidden">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                                {activeTab === 'dashboard' ? (
                                    <>Halo, {currentUser?.name ?? 'Admin'}! <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 ml-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-beacon" /> Operasional Aktif</span></>
                                ) : (
                                    <>
                                        {activeTab === 'products' && 'Manajemen Data Produk & Stok'}
                                        {activeTab === 'categories' && 'Kategori Produk'}
                                        {activeTab === 'suppliers' && 'Daftar Supplier / Pemasok'}
                                        {activeTab === 'transactions' && 'Riwayat Transaksi Stok'}
                                        {activeTab === 'opname' && 'Stock Opname (Pemeriksaan Fisik)'}
                                        {activeTab === 'reports' && 'Laporan Mutasi & Stok'}
                                        {activeTab === 'cash_flow' && 'Buku Kas & Laporan Arus Kas'}
                                        {activeTab === 'warehouse_notes' && 'Catatan Cepat Operasional Gudang'}
                                        {activeTab === 'users' && 'Manajemen Pengguna & Hak Akses'}
                                        {activeTab === 'settings' && 'Pengaturan Umum Aplikasi'}
                                        {activeTab === 'profile' && 'Pengaturan Profil & Foto Saya'}
                                    </>
                                )}
                            </h1>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {activeTab === 'dashboard'
                                        ? 'Berikut ringkasan operasional dan inventaris gudang hari ini.'
                                        : activeTab === 'profile'
                                            ? 'Kelola informasi identitas, foto avatar profil, dan keamanan akun Anda.'
                                            : `${userRole.replace('_', ' ').toUpperCase()} — Sistem Manajemen Stok & Logistik Gudang Stockify.`}
                                </p>
                            </div>

                            {/* Right: Period Dropdown Pill & Primary Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2.5">
                                {activeTab === 'dashboard' && (
                                    <div className="relative">
                                        <select
                                            value={periodFilter}
                                            onChange={(e) => setPeriodFilter(e.target.value)}
                                            className="appearance-none bg-gray-50 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 pr-8 text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                                        >
                                            <option value="Pekan Ini">Pekan Ini</option>
                                            <option value="Bulan Ini">Bulan Ini</option>
                                            <option value="7 Hari Terakhir">7 Hari Terakhir</option>
                                            <option value="Tahun Ini">Tahun Ini</option>
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                )}

                                {userRole === 'admin' && (
                                    <button
                                        type="button"
                                        onClick={openAddProductModal}
                                        className="btn-press cascade-1 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-xl shadow-md cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Tambah Produk
                                    </button>
                                )}

                                {(userRole === 'admin' || userRole === 'manajer_gudang') && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => openRestockModal()}
                                            className="btn-press cascade-2 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl cursor-pointer"
                                        >
                                            <ArrowDownToLine className="w-3.5 h-3.5" />
                                            Barang Masuk
                                        </button>

                                        <button
                                            type="button"
                                            onClick={openStockOutModal}
                                            className="btn-press cascade-3 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl cursor-pointer"
                                        >
                                            <ArrowUpFromLine className="w-3.5 h-3.5" />
                                            Barang Keluar
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => openOpnameModal()}
                                            className="btn-press cascade-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl cursor-pointer"
                                        >
                                            <ClipboardCheck className="w-3.5 h-3.5" />
                                            Stock Opname
                                        </button>
                                    </>
                                )}

                                {userRole === 'staff_gudang' && (
                                    <span className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800">
                                        Pusat Konfirmasi & Pemeriksaan Fisik Barang
                                    </span>
                                )}
                            </div>
                        </div>

                    {/* TAB 1: DASHBOARD (STAFF GUDANG, MANAJER, ADMIN) */}
                    {activeTab === 'dashboard' && (
                        <>
                            {/* KHUSUS ROLE STAFF GUDANG: DAFTAR TUGAS OPERASIONAL */}
                            {userRole === 'staff_gudang' && (
                                <StaffTaskOverview
                                    pendingInTasks={pendingInTasks}
                                    pendingOutTasks={pendingOutTasks}
                                    onConfirmTask={confirmTask}
                                />
                            )}

                            {/* KHUSUS ROLE MANAJER GUDANG: RINGKASAN STOK, STOK MENIPIS, BARANG MASUK & KELUAR HARI INI */}
                            {userRole === 'manajer_gudang' && (
                                <ManagerStockOverview
                                    stats={stats}
                                    lowStockItems={lowStockItems}
                                    transactions={transactions}
                                    onSelectTab={handleSelectTab}
                                    onOpenRestock={openRestockModal}
                                    onOpenStockOut={openStockOutModal}
                                    onOpenOpname={openOpnameModal}
                                />
                            )}

                            {/* DASHBOARD KHUSUS ADMIN: STATISTIK LENGKAP, GRAFIK PERPUTARAN, AKTIVITAS PENGGUNA TERBARU */}
                            {userRole === 'admin' && (
                                <AdminAnalyticsOverview
                                    stats={stats}
                                    products={products}
                                    categories={categories}
                                    transactions={transactions}
                                    lowStockItems={lowStockItems}
                                    pendingInTasks={pendingInTasks}
                                    onSelectTab={handleSelectTab}
                                    onOpenRestock={openRestockModal}
                                />
                            )}
                        </>
                    )}
                    {/* TAB: CATATAN GUDANG */}
                    {activeTab === 'warehouse_notes' && (
                        <WarehouseNotesTab notes={warehouseNotes} />
                    )}


                    {/* TAB 2: MANAJEMEN PRODUK & ATRIBUT & EXPORT (Matching reference image: Gestion des commandes) */}
                    {activeTab === 'products' && (
                        <div className="cascade-1 bg-white border border-gray-100 dark:border-gray-700/60 rounded-2xl shadow-xs dark:bg-gray-800 p-5 sm:p-6 space-y-5 scroll-reveal">
                            {/* Header: Title & CTA Button */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Manajemen Produk & Stok Gudang
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Kelola katalog inventaris, stok fisik, varian atribut, dan mutasi barang
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {userRole === 'admin' && (
                                        <button
                                            type="button"
                                            onClick={openAddProductModal}
                                            className="btn-press inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-xl shadow-md shadow-sm cursor-pointer transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Tambah Produk
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* 4 Status Summary Cards - Interaktif untuk filter cepat status produk */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                                <button
                                    type="button"
                                    onClick={() => setProductStockFilter('all')}
                                    className={`card-lift-sm cascade-1 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                        productStockFilter === 'all'
                                            ? 'bg-blue-100/90 dark:bg-blue-900/50 border-blue-400 dark:border-blue-600 ring-2 ring-blue-500 shadow-sm'
                                            : 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-100/80 dark:border-blue-900/40 hover:border-blue-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">Semua Produk</span>
                                        {productStockFilter === 'all' && (
                                            <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded-full">Aktif</span>
                                        )}
                                    </div>
                                    <div className="flex items-baseline justify-between mt-1.5">
                                        <span className="text-2xl font-bold text-blue-950 dark:text-white">{products.length}</span>
                                        <span className="text-[11px] text-blue-600 font-semibold">Total Item</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-0.5 block">klik untuk tampilkan semua</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setProductStockFilter(prev => prev === 'low' ? 'all' : 'low')}
                                    className={`card-lift-sm cascade-2 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                        productStockFilter === 'low'
                                            ? 'bg-amber-100/90 dark:bg-amber-900/50 border-amber-400 dark:border-amber-600 ring-2 ring-amber-500 shadow-sm'
                                            : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-100/80 dark:border-amber-900/40 hover:border-amber-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">Stok Menipis</span>
                                        {productStockFilter === 'low' && (
                                            <span className="text-[10px] font-bold bg-amber-600 text-white px-1.5 py-0.2 rounded-full">Aktif</span>
                                        )}
                                    </div>
                                    <div className="flex items-baseline justify-between mt-1.5">
                                        <span className="text-2xl font-bold text-amber-950 dark:text-white">{lowStockItems.length}</span>
                                        <span className="text-[11px] text-amber-600 font-semibold">Perlu restock</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-0.5 block">di bawah minimum</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setProductStockFilter(prev => prev === 'empty' ? 'all' : 'empty')}
                                    className={`card-lift-sm cascade-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                        productStockFilter === 'empty'
                                            ? 'bg-rose-100/90 dark:bg-rose-900/50 border-rose-400 dark:border-rose-600 ring-2 ring-rose-500 shadow-sm'
                                            : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-100/80 dark:border-rose-900/40 hover:border-rose-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-rose-900 dark:text-rose-300">Stok Habis (0)</span>
                                        {productStockFilter === 'empty' && (
                                            <span className="text-[10px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full">Aktif</span>
                                        )}
                                    </div>
                                    <div className="flex items-baseline justify-between mt-1.5">
                                        <span className="text-2xl font-bold text-rose-950 dark:text-white">{emptyStockCount}</span>
                                        <span className="text-[11px] text-rose-600 font-semibold">Kritis</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-0.5 block">stok kosong siap auto-clean</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setProductStockFilter(prev => prev === 'safe' ? 'all' : 'safe')}
                                    className={`card-lift-sm cascade-4 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                        productStockFilter === 'safe'
                                            ? 'bg-emerald-100/90 dark:bg-emerald-900/50 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-500 shadow-sm'
                                            : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100/80 dark:border-emerald-900/40 hover:border-emerald-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">Tersedia Aman</span>
                                        {productStockFilter === 'safe' && (
                                            <span className="text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">Aktif</span>
                                        )}
                                    </div>
                                    <div className="flex items-baseline justify-between mt-1.5">
                                        <span className="text-2xl font-bold text-emerald-950 dark:text-white">
                                            {Math.max(0, products.length - lowStockItems.length - emptyStockCount)}
                                        </span>
                                        <span className="text-[11px] text-emerald-600 font-semibold">Stok normal</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-0.5 block">siap diproses</span>
                                </button>
                            </div>

                            {/* Filter & Search Toolbar */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-1">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-2xl">
                                    <div className="relative flex-1">
                                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Cari nama, SKU, kategori..."
                                            className="bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-xs rounded-xl pl-9 pr-8 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs cursor-pointer"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    {/* Filter Kategori Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={productCategoryFilter}
                                            onChange={(e) => setProductCategoryFilter(e.target.value)}
                                            className="appearance-none bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-xs rounded-xl px-3 py-2.5 pr-8 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        >
                                            <option value="all">Semua Kategori ({categories.length})</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={String(c.id)}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>

                                    {/* Filter Status Stok Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={productStockFilter}
                                            onChange={(e) => setProductStockFilter(e.target.value as any)}
                                            className="appearance-none bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-xs rounded-xl px-3 py-2.5 pr-8 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        >
                                            <option value="all">Semua Status Stok</option>
                                            <option value="safe">Stok Aman</option>
                                            <option value="low">Stok Menipis ({lowStockItems.length})</option>
                                            <option value="empty">Stok Habis ({emptyStockCount})</option>
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>

                                    {/* Tombol Reset Filter */}
                                    {(productCategoryFilter !== 'all' || productStockFilter !== 'all' || searchQuery.trim() !== '') && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setProductCategoryFilter('all');
                                                setProductStockFilter('all');
                                            }}
                                            className="btn-press px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                                        >
                                            Reset Filter
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {userRole === 'admin' && (
                                        <button
                                            type="button"
                                            onClick={() => setShowImportModal(true)}
                                            className="btn-press inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 cursor-pointer shadow-2xs"
                                            title="Import Data Produk dari file CSV"
                                        >
                                            <FileUp className="w-3.5 h-3.5 text-emerald-600" />
                                            Import CSV
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={exportProductsCSV}
                                        className="btn-press inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 cursor-pointer shadow-2xs"
                                    >
                                        <Download className="w-3.5 h-3.5 text-blue-600" />
                                        Export CSV
                                    </button>

                                    {userRole === 'admin' && (
                                        <button
                                            type="button"
                                            onClick={() => setShowCleanZeroStockConfirm(true)}
                                            className="btn-press inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 cursor-pointer shadow-2xs"
                                            title="Bersihkan otomatis produk dengan stok 0 lebih dari 3 hari"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                            Bersihkan Stok 0 (&gt;3 Hari)
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-4 py-3">Nama Produk & SKU</th>
                                            <th className="px-4 py-3">Kategori</th>
                                            <th className="px-4 py-3">Atribut (Ukuran/Warna)</th>
                                            <th className="px-4 py-3">Harga Beli / Jual</th>
                                            <th className="px-4 py-3">Sisa Stok</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-xs">
                                                    Tidak ada produk ditemukan.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedProducts.map((p) => (
                                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {p.image ? (
                                                                <img
                                                                    src={p.image}
                                                                    alt={p.name}
                                                                    className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                                                                    onError={(e) => {
                                                                        // Fallback to placeholder icon if image link fails to load
                                                                        e.currentTarget.style.display = 'none';
                                                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 shrink-0 ${p.image ? 'hidden' : ''}`}>
                                                                <Package className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900 dark:text-white">{p.name}</div>
                                                                <div className="text-xs text-gray-500 font-mono">SKU: {p.sku}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 font-medium">
                                                            {p.category_name}
                                                        </span>
                                                        <div className="text-[11px] text-gray-400 mt-0.5">{p.supplier_name}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-wrap gap-1 items-center">
                                                            {p.attributes && p.attributes.length > 0 ? (
                                                                p.attributes.map(attr => (
                                                                    <span key={attr.id} className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                                                                        {attr.name}: {attr.value}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-[11px] text-gray-400">-</span>
                                                            )}
                                                            {userRole === 'admin' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openAttributeModal(p.id)}
                                                                    className="text-[11px] text-blue-600 hover:underline font-semibold ml-1 cursor-pointer"
                                                                >
                                                                    Atribut
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs">
                                                        <div className="text-gray-900 dark:text-white font-medium">Rp {p.selling_price.toLocaleString('id-ID')}</div>
                                                        <div className="text-gray-400">Modal: Rp {p.purchase_price.toLocaleString('id-ID')}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {p.current_stock <= 0 ? (
                                                            <div>
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                                                    <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                                                    Stok 0 (Habis)
                                                                </span>
                                                                <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-1">
                                                                    {p.days_until_deletion !== null && p.days_until_deletion !== undefined ? (
                                                                        p.days_until_deletion <= 0
                                                                            ? 'Auto-hapus hari ini'
                                                                            : `Auto-hapus dlm ${p.days_until_deletion} hari`
                                                                    ) : (
                                                                        'Auto-hapus dlm 3 hari'
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div className={`font-bold ${p.current_stock <= p.minimum_stock ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                                    {p.current_stock} unit
                                                                </div>
                                                                <div className="text-[10px] text-gray-400">Min: {p.minimum_stock}</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedProductDetail(p)}
                                                                className="p-1 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded cursor-pointer"
                                                                title="Detail Produk"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            {userRole === 'admin' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditProductModal(p)}
                                                                    className="p-1 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded cursor-pointer"
                                                                    title="Edit Produk"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            {(userRole === 'admin' || userRole === 'manajer_gudang') && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openOpnameModal(p.id)}
                                                                        className="px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded cursor-pointer"
                                                                        title="Pemeriksaan Stock Opname"
                                                                    >
                                                                        Opname
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openRestockModal(p.id)}
                                                                        className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                                                        title="Catat Stok Masuk"
                                                                    >
                                                                        Stok
                                                                    </button>
                                                                </>
                                                            )}
                                                            {userRole === 'admin' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => deleteItem(`/products/${p.id}`, p.name, 'Produk', p.sku, [
                                                                        { label: 'Kategori', value: p.category_name },
                                                                        { label: 'Stok Saat Ini', value: `${p.current_stock} Unit`, isHighlight: true },
                                                                    ])}
                                                                    className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                                                    title="Hapus Produk"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/60 text-xs text-gray-500">
                                <span>
                                    Menampilkan {filteredProducts.length === 0 ? 0 : productStartIndex + 1}-{productEndIndex} dari {filteredProducts.length} produk (Halaman {safeProductPage} dari {totalProductPages})
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        disabled={safeProductPage <= 1}
                                        onClick={() => setProductCurrentPage(p => Math.max(1, p - 1))}
                                        className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                        title="Halaman Sebelumnya"
                                        aria-label="Previous Page"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    {getPageNumbers(safeProductPage, totalProductPages).map((p, idx) => {
                                        if (p === '...') {
                                            return (
                                                <span key={`ellipsis-${idx}`} className="px-1.5 text-gray-400 select-none">
                                                    ...
                                                </span>
                                            );
                                        }
                                        const pageNum = Number(p);
                                        const isCurrent = pageNum === safeProductPage;
                                        return (
                                            <button
                                                key={pageNum}
                                                type="button"
                                                onClick={() => setProductCurrentPage(pageNum)}
                                                className={`min-w-[32px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer text-xs ${isCurrent
                                                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                                                    : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        type="button"
                                        disabled={safeProductPage >= totalProductPages}
                                        onClick={() => setProductCurrentPage(p => Math.min(totalProductPages, p + 1))}
                                        className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                        title="Halaman Berikutnya"
                                        aria-label="Next Page"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: STOCK OPNAME (PENYESUAIAN FISIK VS SISTEM) */}
                    {activeTab === 'opname' && (
                        <div className="card-lift-sm bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 dark:border-gray-700 mb-4 gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <ClipboardCheck className="w-5 h-5 text-blue-600" />
                                        Modul Stock Opname Gudang
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Periksa jumlah fisik aktual di rak gudang dan bandingkan dengan data di database.
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-4 py-3">Nama Produk & SKU</th>
                                            <th className="px-4 py-3">Kategori</th>
                                            <th className="px-4 py-3">Stok di Database</th>
                                            <th className="px-4 py-3">Status Selisih</th>
                                            <th className="px-4 py-3 text-right">Aksi Opname</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {products.map(p => (
                                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-gray-900 dark:text-white">{p.name}</div>
                                                    <div className="text-xs font-mono text-gray-400">{p.sku}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs">{p.category_name}</td>
                                                <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                                                    {p.current_stock} unit
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/40">
                                                        Tersinkronisasi
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => openOpnameModal(p.id)}
                                                        className="btn-press px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                                                    >
                                                        Periksa & Sesuaikan Fisik
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: KATEGORI PRODUK (KHUSUS ADMIN) */}
                    {activeTab === 'categories' && userRole === 'admin' && (
                        <div className="card-lift-sm bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kategori Produk</h2>
                                    <p className="text-xs text-gray-500">Kelompokkan produk gudang berdasarkan jenis material</p>
                                </div>
                                {userRole === 'admin' && (
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryModal(true)}
                                        className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-lg shadow-xs cursor-pointer transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Tambah Kategori
                                    </button>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-4 py-3">Nama Kategori</th>
                                            <th className="px-4 py-3">Deskripsi</th>
                                            <th className="px-4 py-3">Jumlah Produk</th>
                                            {userRole === 'admin' && <th className="px-4 py-3 text-right">Aksi</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {categories.map(c => (
                                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{c.name}</td>
                                                <td className="px-4 py-3 text-xs text-gray-500">{c.description || '-'}</td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                                        {c.products_count} Item
                                                    </span>
                                                </td>
                                                {userRole === 'admin' && (
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditCategoryModal(c)}
                                                                className="p-1 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded cursor-pointer"
                                                                title="Edit Kategori"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteItem(`/categories/${c.id}`, c.name, 'Kategori', undefined, [
                                                                    { label: 'Jumlah Produk Terkait', value: `${c.products_count ?? 0} Produk` },
                                                                ])}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                                                title="Hapus Kategori"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: SUPPLIER */}
                    {activeTab === 'suppliers' && (
                        <div className="card-lift-sm bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Daftar Rekanan Supplier</h2>
                                    <p className="text-xs text-gray-500">Pemasok resmi pengadaan barang</p>
                                </div>
                                {userRole === 'admin' && (
                                    <button
                                        type="button"
                                        onClick={() => setShowSupplierModal(true)}
                                        className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-lg shadow-xs cursor-pointer transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Tambah Supplier
                                    </button>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-4 py-3">Nama Supplier</th>
                                            <th className="px-4 py-3">Kontak & Email</th>
                                            <th className="px-4 py-3">Alamat</th>
                                            <th className="px-4 py-3">Jumlah Produk</th>
                                            {userRole === 'admin' && <th className="px-4 py-3 text-right">Aksi</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {suppliers.map(s => (
                                            <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-gray-900 dark:text-white">{s.name}</div>
                                                    {s.category_id ? (
                                                        <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                                            Khusus: {s.category?.name || categories.find(c => c.id === s.category_id)?.name || 'Kategori Terkait'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400">Semua Kategori (Umum)</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    <div>{s.phone || '-'}</div>
                                                    <div className="text-blue-600">{s.email || '-'}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500">{s.address || '-'}</td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                                        {s.products_count} Produk
                                                    </span>
                                                </td>
                                                {userRole === 'admin' && (
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditSupplierModal(s)}
                                                                className="p-1 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded cursor-pointer"
                                                                title="Edit Supplier"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteItem(`/suppliers/${s.id}`, s.name, 'Supplier', s.phone || 'Mitra', [
                                                                    { label: 'Kontak Telepon', value: s.phone || '-' },
                                                                    { label: 'Email', value: s.email || '-' },
                                                                ])}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                                                title="Hapus Supplier"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 6: TRANSAKSI MUTASI STOK */}
                    {activeTab === 'transactions' && (
                        <div className="card-lift-sm bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Riwayat Transaksi Mutasi Stok</h2>
                                    <p className="text-xs text-gray-500">Pencatatan penerimaan barang masuk dan pengeluaran barang keluar</p>
                                </div>
                                {(userRole === 'admin' || userRole === 'manajer_gudang' || userRole === 'staff_gudang') && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTransactionType('in');
                                                setShowTransactionModal(true);
                                            }}
                                            className="btn-press inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-colors"
                                        >
                                            <ArrowDownToLine className="w-3.5 h-3.5" />
                                            {userRole === 'staff_gudang' ? 'Input Barang Masuk' : 'Catat Barang Masuk'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTransactionType('out');
                                                setShowTransactionModal(true);
                                            }}
                                            className="btn-press inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer transition-colors"
                                        >
                                            <ArrowUpFromLine className="w-3.5 h-3.5" />
                                            {userRole === 'staff_gudang' ? 'Input Barang Keluar' : 'Catat Barang Keluar'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Filter & Search Toolbar Transaksi */}
                            <div className="p-4 bg-gray-50/70 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                                    {/* Search */}
                                    <div className="relative flex-1 min-w-[200px]">
                                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={trxSearchQuery}
                                            onChange={(e) => setTrxSearchQuery(e.target.value)}
                                            placeholder="Cari produk, SKU, ID, petugas..."
                                            className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-xs rounded-xl pl-9 pr-8 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {trxSearchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setTrxSearchQuery('')}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs cursor-pointer"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    {/* Jenis Mutasi Filter */}
                                    <div className="relative">
                                        <select
                                            value={trxTypeFilter}
                                            onChange={(e) => setTrxTypeFilter(e.target.value as any)}
                                            className="appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs rounded-xl px-3 py-2 pr-8 text-gray-900 dark:text-white font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">Semua Jenis</option>
                                            <option value="in">Barang Masuk (In)</option>
                                            <option value="out">Barang Keluar (Out)</option>
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>

                                    {/* Status Filter */}
                                    <div className="relative">
                                        <select
                                            value={trxStatusFilter}
                                            onChange={(e) => setTrxStatusFilter(e.target.value)}
                                            className="appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs rounded-xl px-3 py-2 pr-8 text-gray-900 dark:text-white font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">Semua Status</option>
                                            <option value="completed">Completed (Selesai)</option>
                                            <option value="pending">Pending (Menunggu)</option>
                                            <option value="cancelled">Cancelled (Dibatalkan)</option>
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>

                                    {/* Periode Filter */}
                                    <div className="relative">
                                        <select
                                            value={trxPeriodFilter}
                                            onChange={(e) => setTrxPeriodFilter(e.target.value)}
                                            className="appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs rounded-xl px-3 py-2 pr-8 text-gray-900 dark:text-white font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">Semua Waktu</option>
                                            <option value="today">Hari Ini</option>
                                            <option value="week">7 Hari Terakhir</option>
                                            <option value="month">30 Hari Terakhir</option>
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>

                                    {(trxSearchQuery.trim() !== '' || trxTypeFilter !== 'all' || trxStatusFilter !== 'all' || trxPeriodFilter !== 'all') && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTrxSearchQuery('');
                                                setTrxTypeFilter('all');
                                                setTrxStatusFilter('all');
                                                setTrxPeriodFilter('all');
                                            }}
                                            className="btn-press px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl cursor-pointer whitespace-nowrap"
                                        >
                                            Reset Filter
                                        </button>
                                    )}
                                </div>

                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                                    Menampilkan <strong className="text-gray-900 dark:text-white">{filteredTransactions.length}</strong> dari {transactions.length} mutasi
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-4 py-3">ID & Tanggal</th>
                                            <th className="px-4 py-3">Produk</th>
                                            <th className="px-4 py-3">Jenis</th>
                                            <th className="px-4 py-3">Jumlah</th>
                                            <th className="px-4 py-3">Petugas</th>
                                            <th className="px-4 py-3">Catatan</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-xs">
                                                    Tidak ada transaksi mutasi stok yang sesuai dengan filter atau kata kunci.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTransactions.map((trx) => (
                                                <tr key={trx.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                    <td className="px-4 py-3">
                                                        <div className="font-mono text-xs font-semibold text-blue-600">{trx.id}</div>
                                                        <div className="text-[11px] text-gray-400">{trx.date}</div>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                        {trx.product}
                                                        <div className="text-[11px] text-gray-400 font-mono">{trx.sku}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {trx.type === 'in' ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                                <ArrowDownToLine className="w-3 h-3" /> Masuk
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                                <ArrowUpFromLine className="w-3 h-3" /> Keluar
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                                                        {trx.quantity} unit
                                                    </td>
                                                    <td className="px-4 py-3 text-xs">
                                                        <div className="font-semibold text-gray-900 dark:text-white">{trx.user}</div>
                                                        <div className="text-gray-400 capitalize">{trx.role.replace('_', ' ')}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                                                        {trx.notes || '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {(userRole === 'admin' || userRole === 'manajer_gudang') ? (
                                                            <div className="flex items-center gap-1.5">
                                                                {trx.status === 'pending' ? (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => confirmTask(trx.raw_id, { name: trx.product, sku: trx.sku, quantity: trx.quantity, type: trx.type })}
                                                                            className="btn-press px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs cursor-pointer inline-flex items-center gap-1"
                                                                            title="Konfirmasi & sahkan mutasi stok"
                                                                        >
                                                                            <Check className="w-3 h-3" />
                                                                            Konfirmasi
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => rejectTask(trx.raw_id)}
                                                                            className="btn-press px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer"
                                                                            title="Tolak mutasi"
                                                                        >
                                                                            Tolak
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <select
                                                                        value={trx.status}
                                                                        onChange={(e) => updateTrxStatus(trx.raw_id, e.target.value)}
                                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg p-1 font-medium"
                                                                    >
                                                                        <option value="completed">Completed</option>
                                                                        <option value="pending">Pending</option>
                                                                        <option value="cancelled">Cancelled</option>
                                                                    </select>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <span className={`capitalize text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                                    trx.status === 'completed'
                                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                                                                }`}>
                                                                    {trx.status === 'pending' ? 'Pending (Menunggu Persetujuan Admin)' : trx.status}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 7: LAPORAN MUTASI & AKTIVITAS */}
                    {activeTab === 'reports' && (
                        <div className="space-y-6 animate-in fade-in duration-200 print:animate-none print:opacity-100 print:space-y-3">
                            {/* Kop Dokumen Resmi Laporan Gudang (Khusus Cetak / Print-Only) */}
                            <div className="print-only mb-6 pb-4 border-b-2 border-gray-900">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        {appSettings?.logo && !appSettings.logo.startsWith('emoji:') ? (
                                            <img src={appSettings.logo} alt="Logo" className="w-14 h-14 object-contain" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gray-900 text-white font-black text-xl flex items-center justify-center">
                                                {appSettings?.appName ? appSettings.appName.charAt(0).toUpperCase() : 'S'}
                                            </div>
                                        )}
                                        <div>
                                            <h1 className="text-lg font-black uppercase tracking-wider text-gray-900 leading-tight">
                                                {appSettings?.appName || 'Stockify'} &bull; {appSettings?.warehouseName || 'Gudang Pusat Logistik'}
                                            </h1>
                                            <p className="text-[10px] text-gray-600 leading-snug">
                                                {appSettings?.address || 'Kawasan Industri Terpadu GIIC Blok AA No. 1, Cikarang Pusat'}
                                            </p>
                                            <p className="text-[10px] text-gray-600">
                                                Telp: {appSettings?.contact || '021-8976500'} | Email: {appSettings?.email || 'operasional@stockify.test'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right text-[10px] text-gray-500">
                                        <p className="font-semibold text-gray-800">DOKUMEN RESMI INTERNAL</p>
                                        <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                        <p>Dicetak Oleh: <span className="font-semibold text-gray-900">{currentUser?.name ?? 'Petugas'}</span> ({userRole.replace('_', ' ').toUpperCase()})</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-2 border-t border-gray-300 text-center">
                                    <h2 className="text-base font-black uppercase tracking-wide text-gray-900">
                                        {reportActiveSubTab === 'stock' && 'LAPORAN REKAPITULASI INVENTARIS & VALUASI STOK BARANG'}
                                        {reportActiveSubTab === 'transactions' && 'LAPORAN REKAPITULASI MUTASI BARANG MASUK & KELUAR'}
                                        {reportActiveSubTab === 'user_activity' && 'LAPORAN AUDIT TRAIL AKTIVITAS OPERASIONAL PENGGUNA'}
                                    </h2>
                                    <p className="text-[10px] text-gray-500 italic">
                                        {reportActiveSubTab === 'stock' && `Periode data aktif per ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`}
                                        {reportActiveSubTab === 'transactions' && `Total mutasi tercatat: ${transactions.length} transaksi operasional`}
                                        {reportActiveSubTab === 'user_activity' && 'Arsip log audit keamanan & otorisasi sistem'}
                                    </p>
                                </div>
                            </div>

                            {/* Header Laporan */}
                            <div className="print:hidden card-lift-sm p-5 bg-white border border-gray-200 rounded-2xl shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pusat Laporan Logistik & Mutasi</h2>
                                    <p className="text-xs text-gray-500">
                                        {userRole === 'admin'
                                            ? 'Laporan stok barang per kategori, rekap mutasi barang masuk & keluar, dan audit aktivitas pengguna.'
                                            : 'Laporan inventaris stok barang per kategori dan rekap mutasi barang masuk & keluar.'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="btn-press inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm cursor-pointer"
                                >
                                    <Printer className="w-4 h-4" />
                                    Cetak Dokumen / Simpan PDF
                                </button>
                            </div>

                            {/* Sub-tab Switcher Pills */}
                            <div className="print:hidden flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
                                <button
                                    type="button"
                                    onClick={() => setReportActiveSubTab('stock')}
                                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                        reportActiveSubTab === 'stock'
                                            ? 'bg-theme-primary text-white shadow-xs'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    1. Laporan Stok Barang (Per Kategori)
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setReportActiveSubTab('transactions')}
                                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                        reportActiveSubTab === 'transactions'
                                            ? 'bg-theme-primary text-white shadow-xs'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    2. Laporan Transaksi Masuk & Keluar
                                </button>

                                {userRole === 'admin' && (
                                    <button
                                        type="button"
                                        onClick={() => setReportActiveSubTab('user_activity')}
                                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                            reportActiveSubTab === 'user_activity'
                                                ? 'bg-theme-primary text-white shadow-xs'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        3. Laporan Aktivitas Pengguna (Admin)
                                    </button>
                                )}
                            </div>

                            {/* Top Summary Metric Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3 print:mb-3">
                                <div className="card-lift p-4 print:p-2.5 bg-white border border-gray-200 rounded-2xl print:rounded-md shadow-xs print:shadow-none dark:bg-gray-800 dark:border-gray-700">
                                    <span className="text-[11px] print:text-[10px] font-semibold text-gray-400 print:text-gray-600 uppercase tracking-wider">Estimasi Nilai Modal</span>
                                    <div className="mt-1 text-2xl print:text-lg font-black text-gray-900 dark:text-white">
                                        Rp {products.reduce((acc, curr) => acc + (curr.purchase_price * curr.current_stock), 0).toLocaleString('id-ID')}
                                    </div>
                                    <p className="mt-0.5 text-xs print:text-[9px] text-gray-400 print:text-gray-600">Total nilai modal stok saat ini</p>
                                </div>
                                <div className="card-lift p-4 print:p-2.5 bg-white border border-gray-200 rounded-2xl print:rounded-md shadow-xs print:shadow-none dark:bg-gray-800 dark:border-gray-700">
                                    <span className="text-[11px] print:text-[10px] font-semibold text-gray-400 print:text-gray-600 uppercase tracking-wider">Potensi Nilai Penjualan</span>
                                    <div className="mt-1 text-2xl print:text-lg font-black text-emerald-600 dark:text-emerald-400">
                                        Rp {products.reduce((acc, curr) => acc + (curr.selling_price * curr.current_stock), 0).toLocaleString('id-ID')}
                                    </div>
                                    <p className="mt-0.5 text-xs print:text-[9px] text-gray-400 print:text-gray-600">Jika seluruh stok terjual habis</p>
                                </div>
                                <div className="card-lift p-4 print:p-2.5 bg-white border border-gray-200 rounded-2xl print:rounded-md shadow-xs print:shadow-none dark:bg-gray-800 dark:border-gray-700">
                                    <span className="text-[11px] print:text-[10px] font-semibold text-gray-400 print:text-gray-600 uppercase tracking-wider">Total Mutasi Transaksi</span>
                                    <div className="mt-1 text-2xl print:text-lg font-black text-indigo-600 dark:text-indigo-400">
                                        {transactions.length} Mutasi
                                    </div>
                                    <p className="mt-0.5 text-xs print:text-[9px] text-gray-400 print:text-gray-600">Masuk ({stats?.total_stock_in || 0}) • Keluar ({stats?.total_stock_out || 0})</p>
                                </div>
                            </div>

                            {/* SUB-TAB 1: LAPORAN STOK BARANG */}
                            {reportActiveSubTab === 'stock' && (
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl print:rounded-none print:border-none print:p-0 print:shadow-none p-5 shadow-xs space-y-4 print:space-y-2">
                                    <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                                Laporan Rincian Stok Barang
                                            </h3>
                                            <p className="text-xs text-gray-400">
                                                Pantau posisi stok per kategori, ambang batas minimum, dan valuasi aset
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Filter Kategori */}
                                            <select
                                                value={reportCategoryFilter}
                                                onChange={(e) => setReportCategoryFilter(e.target.value)}
                                                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs rounded-xl px-3 py-2 text-gray-900 dark:text-white font-medium cursor-pointer"
                                            >
                                                <option value="all">Semua Kategori ({categories.length})</option>
                                                {categories.map((c) => (
                                                    <option key={c.id} value={String(c.id)}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Filter Status Stok */}
                                            <select
                                                value={reportStockStatusFilter}
                                                onChange={(e) => setReportStockStatusFilter(e.target.value)}
                                                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs rounded-xl px-3 py-2 text-gray-900 dark:text-white font-medium cursor-pointer"
                                            >
                                                <option value="all">Semua Status Stok</option>
                                                <option value="safe">Stok Aman</option>
                                                <option value="low">Stok Menipis / Kritis</option>
                                                <option value="empty">Stok Habis (0)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
                                            <thead className="text-[11px] text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                                                <tr>
                                                    <th className="px-3 py-2.5">SKU & Nama Produk</th>
                                                    <th className="px-3 py-2.5">Kategori</th>
                                                    <th className="px-3 py-2.5">Supplier</th>
                                                    <th className="px-3 py-2.5 text-center">Stok Fisik</th>
                                                    <th className="px-3 py-2.5 text-center">Min. Stok</th>
                                                    <th className="px-3 py-2.5">Status</th>
                                                    <th className="px-3 py-2.5 text-right">Modal Aset</th>
                                                    <th className="px-3 py-2.5 text-right">Nilai Jual</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {products
                                                    .filter((p) => {
                                                        if (reportCategoryFilter !== 'all' && String(p.category_id) !== reportCategoryFilter) return false;
                                                        if (reportStockStatusFilter === 'empty' && p.current_stock > 0) return false;
                                                        if (reportStockStatusFilter === 'low' && (p.current_stock <= 0 || p.current_stock > p.minimum_stock)) return false;
                                                        if (reportStockStatusFilter === 'safe' && p.current_stock <= p.minimum_stock) return false;
                                                        return true;
                                                    })
                                                    .map((p) => (
                                                        <tr key={p.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-750">
                                                            <td className="px-3 py-2.5">
                                                                <div className="font-bold text-gray-900 dark:text-white">{p.name}</div>
                                                                <div className="text-[10px] font-mono text-gray-400">{p.sku}</div>
                                                            </td>
                                                            <td className="px-3 py-2.5">{p.category_name}</td>
                                                            <td className="px-3 py-2.5">{p.supplier_name || '-'}</td>
                                                            <td className="px-3 py-2.5 text-center font-bold text-gray-900 dark:text-white">
                                                                {p.current_stock} Unit
                                                            </td>
                                                            <td className="px-3 py-2.5 text-center text-gray-400">
                                                                {p.minimum_stock} Unit
                                                            </td>
                                                            <td className="px-3 py-2.5">
                                                                {p.current_stock <= 0 ? (
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                                                        Habis (0)
                                                                    </span>
                                                                ) : p.current_stock <= p.minimum_stock ? (
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                                                                        Menipis
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                                                        Aman
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2.5 text-right font-semibold text-gray-900 dark:text-white">
                                                                Rp {(p.purchase_price * p.current_stock).toLocaleString('id-ID')}
                                                            </td>
                                                            <td className="px-3 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                                                Rp {(p.selling_price * p.current_stock).toLocaleString('id-ID')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* SUB-TAB 2: LAPORAN TRANSAKSI MASUK & KELUAR */}
                            {reportActiveSubTab === 'transactions' && (
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl print:rounded-none print:border-none print:p-0 print:shadow-none p-5 shadow-xs space-y-4 print:space-y-2">
                                    <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                                Laporan Transaksi Barang Masuk & Keluar
                                            </h3>
                                            <p className="text-xs text-gray-400">
                                                Rekap mutasi barang masuk dari supplier dan barang keluar ke ekspedisi/tujuan operasional
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={reportTrxTypeFilter}
                                                onChange={(e) => setReportTrxTypeFilter(e.target.value)}
                                                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs rounded-xl px-3 py-2 text-gray-900 dark:text-white font-medium cursor-pointer"
                                            >
                                                <option value="all">Semua Jenis Mutasi</option>
                                                <option value="in">Barang Masuk Saja</option>
                                                <option value="out">Barang Keluar Saja</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
                                            <thead className="text-[11px] text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                                                <tr>
                                                    <th className="px-3 py-2.5">ID & Waktu</th>
                                                    <th className="px-3 py-2.5">Produk</th>
                                                    <th className="px-3 py-2.5">SKU</th>
                                                    <th className="px-3 py-2.5">Jenis Mutasi</th>
                                                    <th className="px-3 py-2.5 text-center">Kuantitas</th>
                                                    <th className="px-3 py-2.5">Petugas Pencatat</th>
                                                    <th className="px-3 py-2.5">Status</th>
                                                    <th className="px-3 py-2.5">Catatan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {transactions
                                                    .filter((trx) => {
                                                        if (reportTrxTypeFilter !== 'all' && trx.type !== reportTrxTypeFilter) return false;
                                                        return true;
                                                    })
                                                    .map((trx) => (
                                                        <tr key={trx.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-750">
                                                            <td className="px-3 py-2.5">
                                                                <div className="font-mono font-bold text-blue-600">{trx.id}</div>
                                                                <div className="text-[10px] text-gray-400">{trx.date}</div>
                                                            </td>
                                                            <td className="px-3 py-2.5 font-bold text-gray-900 dark:text-white">{trx.product}</td>
                                                            <td className="px-3 py-2.5 font-mono text-gray-400">{trx.sku}</td>
                                                            <td className="px-3 py-2.5">
                                                                {trx.type === 'in' ? (
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                                        Masuk (In)
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                                                        Keluar (Out)
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2.5 text-center font-bold text-gray-900 dark:text-white">
                                                                {trx.quantity} Unit
                                                            </td>
                                                            <td className="px-3 py-2.5">
                                                                <div className="font-semibold text-gray-900 dark:text-white">{trx.user}</div>
                                                                <div className="text-[10px] text-gray-400 capitalize">{trx.role.replace('_', ' ')}</div>
                                                            </td>
                                                            <td className="px-3 py-2.5">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                                                    trx.status === 'completed'
                                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                                                                }`}>
                                                                    {trx.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2.5 text-gray-400 max-w-xs truncate">{trx.notes || '-'}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* SUB-TAB 3: LAPORAN AKTIVITAS PENGGUNA (ADMIN ONLY) */}
                            {reportActiveSubTab === 'user_activity' && userRole === 'admin' && (
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl print:rounded-none print:border-none print:p-0 print:shadow-none p-5 shadow-xs space-y-4 print:space-y-2">
                                    <div className="print:hidden pb-3 border-b border-gray-100 dark:border-gray-700">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                            Laporan Audit & Aktivitas Pengguna
                                        </h3>
                                        <p className="text-xs text-gray-400">
                                            Log rekam jejak operasional seluruh user sistem (Admin, Manajer Gudang, Staff Gudang)
                                        </p>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
                                            <thead className="text-[11px] text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                                                <tr>
                                                    <th className="px-3 py-2.5">Waktu / Tanggal</th>
                                                    <th className="px-3 py-2.5">Pengguna</th>
                                                    <th className="px-3 py-2.5">Role</th>
                                                    <th className="px-3 py-2.5">Aksi / Kegiatan Operasional</th>
                                                    <th className="px-3 py-2.5">Item Terkait</th>
                                                    <th className="px-3 py-2.5 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {transactions.map((trx, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/80 dark:hover:bg-gray-750">
                                                        <td className="px-3 py-2.5 text-gray-400 font-medium">
                                                            {trx.date}
                                                        </td>
                                                        <td className="px-3 py-2.5 font-bold text-gray-900 dark:text-white">
                                                            {trx.user}
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 capitalize border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                                                                {trx.role.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">
                                                            {trx.type === 'in'
                                                                ? `Mencatat penerimaan barang masuk sebanyak ${trx.quantity} unit`
                                                                : `Mencatat pengiriman barang keluar sebanyak ${trx.quantity} unit`}
                                                        </td>
                                                        <td className="px-3 py-2.5 font-semibold text-gray-900 dark:text-white">
                                                            {trx.product} ({trx.sku})
                                                        </td>
                                                        <td className="px-3 py-2.5 text-center">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                                                trx.status === 'completed'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : 'bg-amber-100 text-amber-800'
                                                            }`}>
                                                                {trx.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Lembar Pengesahan Tanda Tangan Resmi (Khusus Cetak / Print-Only) */}
                            <div className="print-only mt-8 pt-6 border-t-2 border-gray-800 page-break-avoid">
                                <div className="flex justify-between items-start text-xs text-gray-800 px-6">
                                    <div className="text-center w-64">
                                        <p className="text-[11px] text-gray-500">Dibuat & Diverifikasi Oleh,</p>
                                        <p className="font-bold mt-1 text-gray-900">Petugas Operasional Gudang</p>
                                        <div className="h-16 border-b border-dashed border-gray-400 mt-2" />
                                        <p className="font-bold mt-2 text-gray-900">{currentUser?.name ?? 'Petugas Gudang'}</p>
                                        <p className="text-[10px] text-gray-500 capitalize">{userRole.replace('_', ' ')}</p>
                                    </div>
                                    <div className="text-center w-64">
                                        <p className="text-[11px] text-gray-500">
                                            {appSettings?.address?.split(',')[0] || 'Cikarang'}, {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                        <p className="font-bold mt-1 text-gray-900">Mengetahui & Menyetujui,</p>
                                        <div className="h-16 border-b border-dashed border-gray-400 mt-2" />
                                        <p className="font-bold mt-2 text-gray-900">Manajer Operasional Logistik</p>
                                        <p className="text-[10px] text-gray-500">Head of Supply Chain & Warehouse</p>
                                    </div>
                                </div>
                                <div className="mt-6 text-center text-[9px] text-gray-400">
                                    Dokumen ini dicetak secara sah melalui Sistem Manajemen Pergudangan {appSettings?.appName || 'Stockify'}. Keabsahan data sesuai dengan catatan transaksi pada basis data saat pencetakan.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 8: MANAJEMEN USER (ADMIN ONLY) */}
                    {activeTab === 'users' && userRole === 'admin' && (
                        <div className="card-lift-sm bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Manajemen Pengguna & Role</h2>
                                    <p className="text-xs text-gray-500">Kelola akun dan hak akses: Admin, Manajer Gudang, Staff Gudang</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowUserModal(true)}
                                    className="btn-press inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-lg shadow-xs cursor-pointer transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Tambah Pengguna
                                </button>
                            </div>

                            {/* Filter & Search Bar Pengguna */}
                            <div className="p-4 bg-gray-50/70 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-lg">
                                    <div className="relative flex-1">
                                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={userSearchQuery}
                                            onChange={(e) => setUserSearchQuery(e.target.value)}
                                            placeholder="Cari nama atau email pengguna..."
                                            className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-xs rounded-xl pl-9 pr-8 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {userSearchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setUserSearchQuery('')}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs cursor-pointer"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <select
                                            value={userRoleFilter}
                                            onChange={(e) => setUserRoleFilter(e.target.value)}
                                            className="appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs rounded-xl px-3 py-2 pr-8 text-gray-900 dark:text-white font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">Semua Role</option>
                                            <option value="admin">Admin</option>
                                            <option value="manajer_gudang">Manajer Gudang</option>
                                            <option value="staff_gudang">Staff Gudang</option>
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>

                                    {(userSearchQuery.trim() !== '' || userRoleFilter !== 'all') && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUserSearchQuery('');
                                                setUserRoleFilter('all');
                                            }}
                                            className="btn-press px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl cursor-pointer whitespace-nowrap"
                                        >
                                            Reset Filter
                                        </button>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    Total: <strong className="text-gray-900 dark:text-white">{filteredUsers.length}</strong> pengguna
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-4 py-3">Nama Pengguna</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Role / Hak Akses</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-xs">
                                                    Tidak ada pengguna ditemukan.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{u.name}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-500">{u.email}</td>
                                                    <td className="px-4 py-3">
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => updateUserRole(u.id, e.target.value)}
                                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg p-1.5 font-medium"
                                                        >
                                                            <option value="admin">Admin (Akses Penuh)</option>
                                                            <option value="manajer_gudang">Manajer Gudang (Stok & Produk)</option>
                                                            <option value="staff_gudang">Staff Gudang (Operasional)</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {u.id !== currentUser?.id && (
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteItem(`/users/${u.id}`, u.name, 'Pengguna', u.role.replace('_', ' ').toUpperCase(), [
                                                                    { label: 'Email', value: u.email },
                                                                    { label: 'Role Akses', value: u.role.replace('_', ' ') },
                                                                ])}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 9: PENGATURAN UMUM APLIKASI (KHUSUS ADMIN) */}
                    {activeTab === 'settings' && userRole === 'admin' && (
                        <div className="space-y-6">
                            {/* Notification Toast Banner Konsisten */}
                            {settingsSavedMessage && (
                                <div className="p-4 bg-emerald-600 dark:bg-emerald-700 text-white rounded-2xl shadow-md border border-emerald-500 dark:border-emerald-600 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-xl bg-emerald-700/60 dark:bg-emerald-800/60 shrink-0">
                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-[11px] tracking-wider uppercase opacity-95">Berhasil Disimpan</h4>
                                            <p className="text-xs font-medium mt-0.5">{settingsSavedMessage}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSettingsSavedMessage(null)}
                                        className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
                                        title="Tutup Alert"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Form Pengaturan */}
                                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 p-6">
                                    <div className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-6 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <Sliders className="w-5 h-5 text-blue-600" />
                                                Pengaturan Sistem & Identitas Stockify
                                            </h2>
                                            <p className="text-xs text-gray-500 mt-0.5">Konfigurasi nama aplikasi, informasi fasilitas gudang, dan kontak operasional</p>
                                        </div>
                                        <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 px-2.5 py-1 rounded-full">
                                            Aktif
                                        </span>
                                    </div>

                                    <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                1. Identitas Aplikasi & Branding
                                            </h3>

                                            {/* Section Ubah Logo & Ikon Stockify */}
                                            <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3.5">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div>
                                                        <label className="block font-semibold text-gray-850 dark:text-gray-200 text-sm">
                                                            Ikon & Logo Stockify
                                                        </label>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                            Ganti logo Stockify di bilah navigasi dengan foto sendiri, ikon preset, atau tautan gambar.
                                                        </p>
                                                    </div>

                                                    {/* Badge Preview Ikon Aktif */}
                                                    <div className="flex items-center gap-2.5 bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs shrink-0">
                                                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Ikon Aktif:</span>
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 overflow-hidden">
                                                            {appSettings.logo ? (
                                                                appSettings.logo.startsWith('emoji:') ? (
                                                                    <span className="text-lg leading-none">{appSettings.logo.replace('emoji:', '')}</span>
                                                                ) : (
                                                                    <img
                                                                        src={appSettings.logo}
                                                                        alt="Logo Preview"
                                                                        className="w-full h-full object-contain p-0.5"
                                                                        onError={(e) => {
                                                                            (e.currentTarget as HTMLElement).style.display = 'none';
                                                                        }}
                                                                    />
                                                                )
                                                            ) : (
                                                                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                            )}
                                                        </div>
                                                        {appSettings.logo && (
                                                            <button
                                                                type="button"
                                                                onClick={handleResetLogoToDefault}
                                                                title="Hapus kustomisasi & gunakan ikon bawaan Stockify"
                                                                className="text-gray-400 hover:text-red-500 transition p-1"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Pilihan Metode Ganti Ikon */}
                                                <div className="flex items-center gap-1.5 p-1 bg-gray-200/70 dark:bg-gray-800 rounded-lg text-xs font-medium w-fit">
                                                    <button
                                                        type="button"
                                                        onClick={() => setLogoTypeMode('upload')}
                                                        className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${logoTypeMode === 'upload'
                                                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                            }`}
                                                    >
                                                        <Upload className="w-3.5 h-3.5" />
                                                        Upload Foto
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setLogoTypeMode('preset')}
                                                        className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${logoTypeMode === 'preset'
                                                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                            }`}
                                                    >
                                                        <Smile className="w-3.5 h-3.5" />
                                                        Pilih Ikon Preset
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setLogoTypeMode('url')}
                                                        className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${logoTypeMode === 'url'
                                                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                            }`}
                                                    >
                                                        <LinkIcon className="w-3.5 h-3.5" />
                                                        Tautan URL
                                                    </button>
                                                </div>

                                                {/* Konten Tab 1: Upload File Gambar */}
                                                {logoTypeMode === 'upload' && (
                                                    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 space-y-2">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-300 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-700 transition">
                                                                <ImageIcon className="w-4 h-4" />
                                                                Pilih Berkas Foto / Logo...
                                                                <input
                                                                    type="file"
                                                                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
                                                                    onChange={handleLogoFileChange}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {logoFile ? (
                                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                                        File: {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                                                                    </span>
                                                                ) : (
                                                                    'Format: PNG, JPG, WebP, SVG, ICO (Maks. 2MB)'
                                                                )}
                                                            </span>
                                                        </div>
                                                        {logoFile && (
                                                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                                                                <Check className="w-3.5 h-3.5" /> Foto telah dipilih! Klik tombol "Simpan Perubahan Pengaturan" di bawah untuk mengunggah ke server.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Konten Tab 2: Koleksi Ikon Preset */}
                                                {logoTypeMode === 'preset' && (
                                                    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                            Pilih salah satu ikon yang mewakili kategori atau karakteristik gudang Anda:
                                                        </p>
                                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                                            {PRESET_LOGOS.map((item) => {
                                                                const isSelected = appSettings.logo === `emoji:${item.emoji}`;
                                                                return (
                                                                    <button
                                                                        key={item.emoji}
                                                                        type="button"
                                                                        onClick={() => handleSelectPresetEmoji(item.emoji)}
                                                                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left transition cursor-pointer ${isSelected
                                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 font-semibold text-blue-900 dark:text-blue-200 ring-2 ring-blue-400/30'
                                                                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300'
                                                                            }`}
                                                                    >
                                                                        <span className="text-xl leading-none">{item.emoji}</span>
                                                                        <span className="truncate">{item.label}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Konten Tab 3: Tautan URL Gambar Online */}
                                                {logoTypeMode === 'url' && (
                                                    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
                                                        <label className="block text-xs text-gray-600 dark:text-gray-400">
                                                            Masukkan URL foto atau ikon dari internet:
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="url"
                                                                value={logoUrlInput}
                                                                onChange={(e) => setLogoUrlInput(e.target.value)}
                                                                placeholder="https://domain.com/path/ke/logo.png"
                                                                className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={handleApplyLogoUrl}
                                                                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                                                            >
                                                                Terapkan
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 dark:border-gray-700 text-[11px] text-gray-500 dark:text-gray-400">
                                                    <span>Ikon otomatis disinkronkan ke navbar dan preview.</span>
                                                    {appSettings.logo && (
                                                        <button
                                                            type="button"
                                                            onClick={handleResetLogoToDefault}
                                                            className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center gap-1 transition"
                                                        >
                                                            <RotateCcw className="w-3 h-3" />
                                                            Kembalikan ke Ikon Default Stockify
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block mb-1.5 font-semibold text-gray-700 dark:text-gray-300">
                                                    Nama Aplikasi
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={appSettings.appName}
                                                    onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-medium text-sm focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Contoh: Stockify"
                                                />
                                            </div>

                                            <div>
                                                <label className="block mb-1.5 font-semibold text-gray-700 dark:text-gray-300">
                                                    Deskripsi / Info Singkat Aplikasi
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={appSettings.appInfo || ''}
                                                    onChange={(e) => setAppSettings({ ...appSettings, appInfo: e.target.value })}
                                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Deskripsi singkat sistem pergudangan"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                2. Fasilitas Gudang & Kontak Resmi
                                            </h3>

                                            <div>
                                                <label className="block mb-1.5 font-semibold text-gray-700 dark:text-gray-300">
                                                    Nama Gudang / Fasilitas
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={appSettings.warehouseName}
                                                    onChange={(e) => setAppSettings({ ...appSettings, warehouseName: e.target.value })}
                                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Contoh: Gudang Pusat Logistik Cikarang"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block mb-1.5 font-semibold text-gray-700 dark:text-gray-300">
                                                        No. Telepon / Hotline
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={appSettings.contact}
                                                        onChange={(e) => setAppSettings({ ...appSettings, contact: e.target.value })}
                                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Contoh: 021-8976500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block mb-1.5 font-semibold text-gray-700 dark:text-gray-300">
                                                        Email Operasional Gudang
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={appSettings.email}
                                                        onChange={(e) => setAppSettings({ ...appSettings, email: e.target.value })}
                                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Contoh: admin@stockify.test"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block mb-1.5 font-semibold text-gray-700 dark:text-gray-300">
                                                    Alamat Fisik Gudang
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={appSettings.address}
                                                    onChange={(e) => setAppSettings({ ...appSettings, address: e.target.value })}
                                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Alamat lengkap fasilitas pergudangan"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
                                            <button
                                                type="submit"
                                                disabled={isSavingSettings}
                                                className="btn-press inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                                            >
                                                {isSavingSettings ? (
                                                    <>
                                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Simpan Perubahan Pengaturan
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleResetSettings}
                                                className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                            >
                                                Reset ke Setelan Awal
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Kartu Ringkasan & Info Live */}
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl p-5 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-lg overflow-hidden border border-white/20 shadow-xs shrink-0">
                                                {appSettings.logo ? (
                                                    appSettings.logo.startsWith('emoji:') ? (
                                                        <span className="text-2xl leading-none">
                                                            {appSettings.logo.replace('emoji:', '')}
                                                        </span>
                                                    ) : (
                                                        <img
                                                            src={appSettings.logo}
                                                            alt="Logo"
                                                            className="w-full h-full object-contain p-1"
                                                            onError={(e) => {
                                                                (e.currentTarget as HTMLElement).style.display = 'none';
                                                            }}
                                                        />
                                                    )
                                                ) : (
                                                    <Package className="w-6 h-6 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-base">{appSettings.appName}</h4>
                                                    <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-medium tracking-wide">
                                                        Preview
                                                    </span>
                                                </div>
                                                <p className="text-xs text-blue-100">{appSettings.warehouseName}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/15 space-y-2 text-xs text-blue-50">
                                            <p className="flex items-center gap-2">
                                                <span className="font-medium text-white/80">Kontak:</span> {appSettings.contact}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <span className="font-medium text-white/80">Email:</span> {appSettings.email}
                                            </p>
                                            <p className="text-[11px] text-blue-100/90 leading-relaxed mt-1">
                                                {appSettings.address}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Kartu Pratinjau Cepat Landing Page & Login Page */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-gray-800 dark:border-gray-700 space-y-3 text-xs shadow-xs">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                Pratinjau Publik & Login
                                            </h4>
                                            <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                                                Tersinkron Otomatis
                                            </span>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 text-[11px] leading-relaxed">
                                            Logo dan identitas yang diubah di sini langsung diterapkan secara dinamis pada <strong>Landing Page</strong> utama dan <strong>Login Page</strong> autentikasi.
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <a
                                                href="/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-300 font-semibold transition border border-blue-200 dark:border-blue-800 text-center"
                                                title="Buka Landing Page di Tab Baru"
                                            >
                                                <span>Landing Page</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                            <a
                                                href="/login"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800 dark:bg-gray-750 dark:hover:bg-gray-700 dark:text-gray-200 font-semibold transition border border-gray-200 dark:border-gray-700 text-center"
                                                title="Buka Login Page di Tab Baru"
                                            >
                                                <span>Login Page</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-gray-800 dark:border-gray-700 space-y-3 text-xs">
                                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-emerald-600" />
                                            Status Sinkronisasi
                                        </h4>
                                        <div className="space-y-2 text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                                                <span>Penyimpanan Lokal (Browser):</span>
                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Tersambung</span>
                                            </div>
                                            <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                                                <span>Database MySQL:</span>
                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Aktif</span>
                                            </div>
                                            <div className="flex items-center justify-between py-1">
                                                <span>Pembaruan Terakhir:</span>
                                                <span className="font-medium text-gray-500">Real-time</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB MANAGEMENT: BUKU KAS & LAPORAN ARUS KAS */}
                    {activeTab === 'cash_flow' && (
                        <CashFlowTab 
                            cashTransactions={cashTransactions} 
                            stats={stats} 
                            currentUser={currentUser} 
                        />
                    )}

                    {/* TAB PENGATURAN PROFIL & UPLOAD FOTO AVATAR */}
                    {activeTab === 'profile' && (
                        <ProfileTab currentUser={currentUser} />
                    )}
                </div>
            )}

            {/* MODAL 1: TAMBAH PRODUK BARU */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah Produk Baru</h3>
                            <button type="button" onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submitProduct} className="space-y-4 text-xs">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Nama Produk *</label>
                                <input
                                    type="text"
                                    required
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    onBlur={() => {
                                        if (productForm.name.trim().length >= 3) {
                                            handleAutoSuggestCategory(productForm.name, productImageFile || productForm.image, false);
                                        }
                                    }}
                                    placeholder="Contoh: Sepeda Motor Honda Beat / Baut Baja 10mm"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            {/* Foto / Gambar Produk */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                        <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span>Foto / Gambar Produk</span>
                                    </label>
                                    {isSuggestingCategory && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full animate-pulse">
                                            <Sparkles className="w-3 h-3 animate-spin" />
                                            <span>Menganalisis objek gambar...</span>
                                        </span>
                                    )}
                                </div>

                                {productImagePreview ? (
                                    <div className="relative border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-3 bg-blue-50/40 dark:bg-blue-950/20 flex items-center gap-3">
                                        <img
                                            src={productImagePreview}
                                            alt="Preview Produk"
                                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs bg-white dark:bg-gray-800"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                                                {productImageFile ? productImageFile.name : 'Foto Produk'}
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                {productImageFile ? `${(productImageFile.size / 1024).toFixed(1)} KB` : 'Tautan gambar'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <label className="cursor-pointer text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                                    Ganti Foto
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleProductImageChange}
                                                    />
                                                </label>
                                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setProductImageFile(null);
                                                        setProductImagePreview(null);
                                                    }}
                                                    className="text-[11px] font-medium text-red-500 hover:text-red-700 cursor-pointer"
                                                >
                                                    Hapus Foto
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-950/20 hover:border-blue-400 transition-all text-center group">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                            <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                            Pilih atau Upload Foto Produk
                                        </p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                            PNG, JPG, WEBP • Kategori objek langsung terdeteksi otomatis via Machine Learning
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleProductImageChange}
                                        />
                                    </label>
                                )}

                                <div className="mt-2">
                                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                        Atau gunakan tautan URL gambar (Web atau /storage/...):
                                    </span>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={productForm.image}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setProductForm({ ...productForm, image: val });
                                                if (val) {
                                                    setProductImagePreview(val);
                                                    setProductImageFile(null);
                                                }
                                            }}
                                            onBlur={() => {
                                                if (productForm.image && (productForm.image.trim().startsWith('http') || productForm.image.trim().startsWith('/storage/'))) {
                                                    handleAutoSuggestCategory(productForm.name, productForm.image.trim(), false);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (productForm.image) {
                                                        handleAutoSuggestCategory(productForm.name, productForm.image.trim(), false);
                                                    }
                                                }
                                            }}
                                            placeholder="https://... atau /storage/products/..."
                                            className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs"
                                        />
                                        <button
                                            type="button"
                                            disabled={isSuggestingCategory || !productForm.image}
                                            onClick={() => handleAutoSuggestCategory(productForm.name, productForm.image.trim(), false)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                                            title="Pindai gambar via AI Machine Learning"
                                        >
                                            <Sparkles className={`w-3.5 h-3.5 ${isSuggestingCategory ? 'animate-spin' : ''}`} />
                                            <span>{isSuggestingCategory ? 'Menganalisis...' : 'Cek AI'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* REKOMENDASI KATEGORI MACHINE LEARNING: 3 OPSI COCOK */}
                            <div className="p-3 bg-gradient-to-br from-blue-50/70 via-indigo-50/20 to-blue-50/70 dark:from-blue-950/30 dark:via-gray-800/80 dark:to-indigo-950/30 rounded-xl border border-blue-200/80 dark:border-blue-800/60 shadow-xs space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-xs flex items-center gap-1.5">
                                                Rekomendasi Kategori AI (Machine Learning) *
                                            </h4>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                Mendeteksi benda pada gambar • 3 opsi paling cocok:
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={isSuggestingCategory}
                                        onClick={() => handleAutoSuggestCategory(productForm.name, productImageFile || productForm.image, false)}
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white hover:bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:hover:bg-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 cursor-pointer disabled:opacity-50 transition-all shadow-2xs"
                                        title="Pindai ulang gambar menggunakan Machine Learning"
                                    >
                                        <Sparkles className={`w-3 h-3 ${isSuggestingCategory ? 'animate-spin text-blue-500' : 'text-blue-600'}`} />
                                        <span>{isSuggestingCategory ? 'Memindai...' : 'Pindai Ulang'}</span>
                                    </button>
                                </div>

                                {aiSuggestionMessage && (
                                    <div className="text-[11px] text-blue-900 dark:text-blue-200 bg-white/95 dark:bg-blue-900/40 p-2 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                            <span className="truncate">{aiSuggestionMessage}</span>
                                        </div>
                                        <button type="button" onClick={() => setAiSuggestionMessage(null)} className="text-blue-400 hover:text-blue-700 ml-2 font-bold cursor-pointer">✕</button>
                                    </div>
                                )}

                                {/* 3 Opsi Kartu Rekomendasi */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {aiCategoryOptions.slice(0, 3).map((opt, idx) => {
                                        const isSelected = String(productForm.category_id) === String(opt.category_id);
                                        const icon = getCategoryIcon(opt.category_name);
                                        const badgeLabel = idx === 0 ? 'Paling Cocok' : `Alternatif ${idx}`;
                                        const badgeStyle = idx === 0
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';

                                        return (
                                            <button
                                                key={`${opt.category_id}-${idx}`}
                                                type="button"
                                                onClick={() => {
                                                    const selectedCatId = String(opt.category_id);
                                                    setProductForm(prev => ({
                                                        ...prev,
                                                        category_id: selectedCatId,
                                                        sku: generateAutoSku(selectedCatId, prev.name)
                                                    }));
                                                }}
                                                className={`relative flex flex-col items-start p-2.5 rounded-lg border text-left transition-all duration-200 cursor-pointer ${isSelected
                                                    ? 'bg-white dark:bg-gray-800 border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-500/30'
                                                    : 'bg-white/80 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/20'
                                                    }`}
                                            >
                                                <div className="w-full flex items-center justify-between mb-1">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                                                        {badgeLabel}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                                                        {opt.score}%
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 w-full mt-1">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                                                        <Tags className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                                            {opt.category_name}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                                            {isSelected ? '✓ Terpilih' : 'Klik untuk memilih'}
                                                        </p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                                                            <Check className="w-3 h-3 stroke-[3]" />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Fallback Manual Dropdown (Jika Benda Gambar Tidak Cocok dengan 3 Opsi di Atas) */}
                                <div className="pt-1.5 border-t border-blue-100 dark:border-blue-900/50 flex flex-col gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowManualCategorySelect(prev => !prev)}
                                        className="text-[11px] font-medium text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1 self-start cursor-pointer"
                                    >
                                        <span>{showManualCategorySelect ? '▲ Sembunyikan pilihan manual' : '▼ Benda di gambar tidak cocok dengan 3 opsi di atas? Pilih manual'}</span>
                                    </button>

                                    {showManualCategorySelect && (
                                        <div className="mt-1 animate-fade-in">
                                            <select
                                                value={productForm.category_id}
                                                onChange={(e) => {
                                                    const selectedCatId = e.target.value;
                                                    setProductForm(prev => ({
                                                        ...prev,
                                                        category_id: selectedCatId,
                                                        sku: generateAutoSku(selectedCatId, prev.name)
                                                    }));
                                                }}
                                                className="w-full p-2 bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-700 rounded-lg text-xs dark:text-white focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">-- Pilih Semua Kategori Tersedia --</option>
                                                {categories.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                            <span>Kode Produk (SKU)</span>
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                                                Otomatis
                                            </span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setProductForm(prev => ({ ...prev, sku: generateAutoSku(prev.category_id, prev.name) }))}
                                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                                            title="Acak ulang kode produk"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            <span>Acak Baru</span>
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={productForm.sku}
                                            onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                                            placeholder="Dibuat otomatis oleh sistem..."
                                            className="w-full p-2.5 font-mono text-xs bg-blue-50/50 border border-blue-200 dark:bg-gray-700/80 dark:border-blue-800 dark:text-blue-200 rounded-lg font-bold tracking-wider"
                                        />
                                        <span className="absolute right-3 top-2.5 text-[10px] text-blue-600 dark:text-blue-400 font-semibold pointer-events-none">
                                            ✓ Auto
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Dibuat otomatis oleh sistem, tidak perlu diisi manual.</p>
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
                                        Supplier Rekanan
                                    </label>
                                    <select
                                        value={productForm.supplier_id}
                                        onChange={(e) => setProductForm({ ...productForm, supplier_id: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs"
                                    >
                                        <option value="">-- Pilih Supplier --</option>
                                        {suppliers.map((s) => {
                                            const isMatch = !s.category_id || String(s.category_id) === String(productForm.category_id);
                                            const catName = s.category?.name || categories.find(c => c.id === s.category_id)?.name;
                                            return (
                                                <option 
                                                    key={s.id} 
                                                    value={s.id}
                                                    disabled={!isMatch}
                                                >
                                                    {s.name} {s.category_id ? `(Khusus: ${catName})` : '(Umum)'} {!isMatch ? ' - [Kategori Tidak Sesuai]' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-1">Supplier spesialisasi (seperti Honda) hanya menerima kategori terkait.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Harga Beli (Rp) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={productForm.purchase_price}
                                        onChange={(e) => setProductForm({ ...productForm, purchase_price: e.target.value })}
                                        placeholder="10000"
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Harga Jual (Rp) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={productForm.selling_price}
                                        onChange={(e) => setProductForm({ ...productForm, selling_price: e.target.value })}
                                        placeholder="15000"
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Stok Awal</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={productForm.initial_stock}
                                        onChange={(e) => setProductForm({ ...productForm, initial_stock: e.target.value })}
                                        placeholder="50"
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Catatan: Stok 0 selama &gt;3 hari akan otomatis dihapus oleh sistem.</p>
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Batas Minimum Stok *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={productForm.minimum_stock}
                                        onChange={(e) => setProductForm({ ...productForm, minimum_stock: e.target.value })}
                                        placeholder="10"
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Deskripsi Produk</label>
                                <textarea
                                    rows={2}
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                    placeholder="Spesifikasi atau catatan barang"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Batal</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">Simpan Produk</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: CATAT TRANSAKSI (MASUK / KELUAR) */}
            {showTransactionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {transactionType === 'in' ? (
                                    <>
                                        <ArrowDownToLine className="w-5 h-5 text-emerald-500" />
                                        Penerimaan Barang Masuk
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpFromLine className="w-5 h-5 text-indigo-500" />
                                        Pengeluaran Barang Keluar
                                    </>
                                )}
                            </h3>
                            <button type="button" onClick={() => setShowTransactionModal(false)} className="text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submitTransaction} className="space-y-4 text-xs">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Pilih Produk *</label>
                                <select
                                    required
                                    value={transactionForm.product_id}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, product_id: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-medium"
                                >
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Sisa: {p.current_stock} unit)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Jumlah Unit *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={transactionForm.quantity}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, quantity: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Tanggal Transaksi *</label>
                                    <input
                                        type="date"
                                        required
                                        value={transactionForm.date}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Keterangan / Catatan</label>
                                <textarea
                                    rows={2}
                                    value={transactionForm.notes}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                                    placeholder={transactionType === 'in' ? "Nomor surat jalan atau pengiriman supplier" : "Tujuan divisi proyek atau nomor delivery order"}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            {transactionType === 'in' && (
                                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={transactionForm.record_cash_flow !== false}
                                            onChange={(e) => setTransactionForm({ ...transactionForm, record_cash_flow: e.target.checked })}
                                            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                        />
                                        <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                                            Otomatis Catat Pengeluaran ke Buku Kas (Pembelian dari Supplier)
                                        </span>
                                    </label>
                                    {transactionForm.record_cash_flow !== false && (
                                        <div className="text-[11px] text-emerald-700 dark:text-emerald-300 space-y-1 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
                                            {(() => {
                                                const p = products.find(prod => String(prod.id) === String(transactionForm.product_id));
                                                const price = p?.purchase_price ? Number(p.purchase_price) : 0;
                                                const qty = Number(transactionForm.quantity) || 0;
                                                return (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span>Estimasi Harga Beli:</span>
                                                            <span className="font-bold">Rp {price.toLocaleString('id-ID')} / unit</span>
                                                        </div>
                                                        <div className="flex justify-between font-bold">
                                                            <span>Total Pengeluaran Kas:</span>
                                                            <span className="text-emerald-800 dark:text-emerald-200">Rp {(price * qty).toLocaleString('id-ID')}</span>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => setShowTransactionModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Batal</button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-white font-medium rounded-lg ${transactionType === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
                                        }`}
                                >
                                    Simpan Transaksi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: STOCK OPNAME PENYESUAIAN STOK */}
            {showOpnameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                                Penyesuaian Stock Opname
                            </h3>
                            <button type="button" onClick={() => setShowOpnameModal(false)} className="text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submitStockOpname} className="space-y-4 text-xs">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Pilih Produk *</label>
                                <select
                                    required
                                    value={opnameForm.product_id}
                                    onChange={(e) => {
                                        const pid = e.target.value;
                                        const prod = products.find(p => p.id === Number(pid));
                                        setOpnameForm({
                                            ...opnameForm,
                                            product_id: pid,
                                            physical_stock: prod ? String(prod.current_stock) : '0',
                                        });
                                    }}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-medium"
                                >
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Stok Sistem: {p.current_stock} unit)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Hasil Perhitungan Fisik Aktual (Unit) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={opnameForm.physical_stock}
                                    onChange={(e) => setOpnameForm({ ...opnameForm, physical_stock: e.target.value })}
                                    placeholder="Masukkan jumlah fisik aktual di rak gudang"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold text-sm"
                                />
                                <p className="text-[11px] text-gray-400 mt-1">
                                    Sistem akan otomatis mencatat selisih mutasi masuk/keluar untuk menyamakan stok.
                                </p>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Alasan / Catatan Opname</label>
                                <textarea
                                    rows={2}
                                    value={opnameForm.notes}
                                    onChange={(e) => setOpnameForm({ ...opnameForm, notes: e.target.value })}
                                    placeholder="Contoh: Barang rusak saat penyimpanan / salah hitung sebelumnya"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => setShowOpnameModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Batal</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">
                                    Sesuaikan Stok Sekarang
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: TAMBAH ATRIBUT PRODUK (UKURAN / WARNA / BERAT) */}
            {showAttributeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah Atribut Produk</h3>
                            <button type="button" onClick={() => setShowAttributeModal(false)} className="text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submitAttribute} className="space-y-3 text-xs">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Nama Atribut *</label>
                                <select
                                    value={attributeForm.name}
                                    onChange={(e) => setAttributeForm({ ...attributeForm, name: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-medium"
                                >
                                    <option value="Ukuran">Ukuran (Size / Dimensi)</option>
                                    <option value="Warna">Warna (Color)</option>
                                    <option value="Berat">Berat (Weight / Bobot)</option>
                                    <option value="Bahan">Material / Bahan Baku</option>
                                    <option value="Garansi">Masa Garansi</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Nilai Atribut *</label>
                                <input
                                    type="text"
                                    required
                                    value={attributeForm.value}
                                    onChange={(e) => setAttributeForm({ ...attributeForm, value: e.target.value })}
                                    placeholder="Contoh: XL / Merah / 2.5 Kg / 12 Bulan"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => setShowAttributeModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Batal</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">Simpan Atribut</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 5: TAMBAH KATEGORI */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah Kategori Baru</h3>
                            <button type="button" onClick={() => setShowCategoryModal(false)} className="text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submitCategory} className="space-y-4 text-xs">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Nama Kategori *</label>
                                <input
                                    type="text"
                                    required
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    placeholder="Contoh: Perkakas Listrik"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Deskripsi</label>
                                <textarea
                                    rows={2}
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                    placeholder="Keterangan singkat kategori"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg cursor-pointer">Batal</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium cursor-pointer">Simpan Kategori</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 6: TAMBAH SUPPLIER */}
            {showSupplierModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah Supplier Baru</h3>
                            <button type="button" onClick={() => setShowSupplierModal(false)} className="text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submitSupplier} className="space-y-3 text-xs">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Nama Supplier *</label>
                                <input
                                    type="text"
                                    required
                                    value={supplierForm.name}
                                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                                    placeholder="PT Astra Honda Motor"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Spesialisasi Kategori (Misal: Honda hanya Motor)
                                </label>
                                <select
                                    value={supplierForm.category_id}
                                    onChange={(e) => setSupplierForm({ ...supplierForm, category_id: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">-- Menerima Semua Kategori (Umum) --</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            Khusus: {c.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-gray-400 mt-1">Jika diset khusus, supplier hanya dapat dipilih untuk produk dengan kategori ini.</p>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Nomor Telepon</label>
                                <input
                                    type="text"
                                    value={supplierForm.phone}
                                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                                    placeholder="021-1234567"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Email</label>
                                <input
                                    type="email"
                                    value={supplierForm.email}
                                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                                    placeholder="sales@mitrajaya.com"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Alamat</label>
                                <textarea
                                    rows={2}
                                    value={supplierForm.address}
                                    onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                                    placeholder="Alamat kantor/gudang supplier"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => setShowSupplierModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg cursor-pointer">Batal</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium cursor-pointer">Simpan Supplier</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 7: TAMBAH USER / PENGGUNA (ADMIN) */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah Pengguna Baru</h3>
                            <button type="button" onClick={() => setShowUserModal(false)} className="text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submitUser} className="space-y-3 text-xs">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    required
                                    value={userForm.name}
                                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                    placeholder="Nama staf gudang"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Alamat Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    placeholder="nama@stockify.test"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Password *</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={userForm.password}
                                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                    placeholder="Minimal 6 karakter"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Pilih Role *</label>
                                <select
                                    value={userForm.role}
                                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-medium"
                                >
                                    <option value="staff_gudang">Staff Gudang (Operasional)</option>
                                    <option value="manajer_gudang">Manajer Gudang (Manajemen Stok)</option>
                                    <option value="admin">Administrator (Akses Penuh)</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg cursor-pointer">Batal</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium cursor-pointer">Buat Akun</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 8: EDIT PRODUK */}
            {showEditProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Pencil className="w-5 h-5 text-blue-600" />
                                Edit Data Produk
                            </h3>
                            <button type="button" onClick={() => setShowEditProductModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submitEditProduct} className="space-y-4 text-xs">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Nama Produk *</label>
                                <input
                                    type="text"
                                    required
                                    value={editProductForm.name}
                                    onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
                                    onBlur={() => {
                                        if (editProductForm.name.trim().length >= 3) {
                                            handleAutoSuggestCategory(editProductForm.name, editProductImageFile || editProductForm.image, true);
                                        }
                                    }}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            {/* Foto / Gambar Produk */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                        <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span>Foto / Gambar Produk</span>
                                    </label>
                                    {isSuggestingCategory && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full animate-pulse">
                                            <Sparkles className="w-3 h-3 animate-spin" />
                                            <span>Menganalisis objek gambar...</span>
                                        </span>
                                    )}
                                </div>

                                {editProductImagePreview ? (
                                    <div className="relative border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-3 bg-blue-50/40 dark:bg-blue-950/20 flex items-center gap-3">
                                        <img
                                            src={editProductImagePreview}
                                            alt="Preview Produk"
                                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs bg-white dark:bg-gray-800"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                                                {editProductImageFile ? editProductImageFile.name : 'Foto Produk Saat Ini'}
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                {editProductImageFile ? `${(editProductImageFile.size / 1024).toFixed(1)} KB` : 'Foto tersimpan'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <label className="cursor-pointer text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                                    Ganti Foto
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleEditProductImageChange}
                                                    />
                                                </label>
                                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditProductImageFile(null);
                                                        setEditProductImagePreview(null);
                                                        setEditProductForm(prev => ({ ...prev, image: '' }));
                                                    }}
                                                    className="text-[11px] font-medium text-red-500 hover:text-red-700 cursor-pointer"
                                                >
                                                    Hapus Foto
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-950/20 hover:border-blue-400 transition-all text-center group">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                            <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                            Pilih atau Upload Foto Produk Baru
                                        </p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                            PNG, JPG, WEBP • Kategori objek langsung terdeteksi otomatis via Machine Learning
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleEditProductImageChange}
                                        />
                                    </label>
                                )}

                                <div className="mt-2">
                                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                        Atau gunakan URL gambar (Web atau /storage/...):
                                    </span>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editProductForm.image}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setEditProductForm({ ...editProductForm, image: val });
                                                if (val) {
                                                    setEditProductImagePreview(val);
                                                    setEditProductImageFile(null);
                                                }
                                            }}
                                            onBlur={() => {
                                                if (editProductForm.image && (editProductForm.image.trim().startsWith('http') || editProductForm.image.trim().startsWith('/storage/'))) {
                                                    handleAutoSuggestCategory(editProductForm.name, editProductForm.image.trim(), true);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (editProductForm.image) {
                                                        handleAutoSuggestCategory(editProductForm.name, editProductForm.image.trim(), true);
                                                    }
                                                }
                                            }}
                                            placeholder="https://... atau /storage/products/..."
                                            className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs"
                                        />
                                        <button
                                            type="button"
                                            disabled={isSuggestingCategory || !editProductForm.image}
                                            onClick={() => handleAutoSuggestCategory(editProductForm.name, editProductForm.image.trim(), true)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                                            title="Pindai gambar via AI Machine Learning"
                                        >
                                            <Sparkles className={`w-3.5 h-3.5 ${isSuggestingCategory ? 'animate-spin' : ''}`} />
                                            <span>{isSuggestingCategory ? 'Menganalisis...' : 'Cek AI'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* REKOMENDASI KATEGORI MACHINE LEARNING: 3 OPSI COCOK */}
                            <div className="p-3 bg-gradient-to-br from-blue-50/70 via-indigo-50/20 to-blue-50/70 dark:from-blue-950/30 dark:via-gray-800/80 dark:to-indigo-950/30 rounded-xl border border-blue-200/80 dark:border-blue-800/60 shadow-xs space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-xs flex items-center gap-1.5">
                                                Rekomendasi Kategori AI (Machine Learning) *
                                            </h4>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                Mendeteksi benda pada gambar • 3 opsi paling cocok:
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={isSuggestingCategory}
                                        onClick={() => handleAutoSuggestCategory(editProductForm.name, editProductImageFile || editProductForm.image, true)}
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white hover:bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:hover:bg-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 cursor-pointer disabled:opacity-50 transition-all shadow-2xs"
                                        title="Pindai ulang gambar menggunakan Machine Learning"
                                    >
                                        <Sparkles className={`w-3.5 h-3.5 ${isSuggestingCategory ? 'animate-spin text-blue-500' : 'text-blue-600'}`} />
                                        <span>{isSuggestingCategory ? 'Memindai...' : 'Pindai Ulang'}</span>
                                    </button>
                                </div>

                                {aiSuggestionMessage && (
                                    <div className="text-[11px] text-blue-900 dark:text-blue-200 bg-white/95 dark:bg-blue-900/40 p-2 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                            <span className="truncate">{aiSuggestionMessage}</span>
                                        </div>
                                        <button type="button" onClick={() => setAiSuggestionMessage(null)} className="text-blue-400 hover:text-blue-700 ml-2 font-bold cursor-pointer">✕</button>
                                    </div>
                                )}

                                {/* 3 Opsi Kartu Rekomendasi */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {editAiCategoryOptions.slice(0, 3).map((opt, idx) => {
                                        const isSelected = String(editProductForm.category_id) === String(opt.category_id);
                                        const icon = getCategoryIcon(opt.category_name);
                                        const badgeLabel = idx === 0 ? 'Paling Cocok' : `Alternatif ${idx}`;
                                        const badgeStyle = idx === 0
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';

                                        return (
                                            <button
                                                key={`${opt.category_id}-${idx}`}
                                                type="button"
                                                onClick={() => setEditProductForm(prev => ({ ...prev, category_id: String(opt.category_id) }))}
                                                className={`relative flex flex-col items-start p-2.5 rounded-lg border text-left transition-all duration-200 cursor-pointer ${isSelected
                                                    ? 'bg-white dark:bg-gray-800 border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-500/30'
                                                    : 'bg-white/80 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/20'
                                                    }`}
                                            >
                                                <div className="w-full flex items-center justify-between mb-1">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                                                        {badgeLabel}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                                                        {opt.score}%
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 w-full mt-1">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                                                        <Tags className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                                            {opt.category_name}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                                            {isSelected ? '✓ Terpilih' : 'Klik untuk memilih'}
                                                        </p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                                                            <Check className="w-3 h-3 stroke-[3]" />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Fallback Manual Dropdown (Jika Benda Gambar Tidak Cocok dengan 3 Opsi di Atas) */}
                                <div className="pt-1.5 border-t border-blue-100 dark:border-blue-900/50 flex flex-col gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditManualCategorySelect(prev => !prev)}
                                        className="text-[11px] font-medium text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1 self-start cursor-pointer"
                                    >
                                        <span>{showEditManualCategorySelect ? '▲ Sembunyikan pilihan manual' : '▼ Benda di gambar tidak cocok dengan 3 opsi di atas? Pilih manual'}</span>
                                    </button>

                                    {showEditManualCategorySelect && (
                                        <div className="mt-1 animate-fade-in">
                                            <select
                                                value={editProductForm.category_id}
                                                onChange={(e) => setEditProductForm({ ...editProductForm, category_id: e.target.value })}
                                                className="w-full p-2 bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-700 rounded-lg text-xs dark:text-white focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">-- Pilih Semua Kategori Tersedia --</option>
                                                {categories.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                            <span>Kode Produk (SKU)</span>
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                                                Otomatis
                                            </span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setEditProductForm(prev => ({ ...prev, sku: generateAutoSku(prev.category_id, prev.name) }))}
                                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                                            title="Acak ulang kode produk"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            <span>Acak Baru</span>
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            value={editProductForm.sku}
                                            onChange={(e) => setEditProductForm({ ...editProductForm, sku: e.target.value })}
                                            placeholder="SKU Otomatis..."
                                            className="w-full p-2.5 font-mono text-xs bg-blue-50/50 border border-blue-200 dark:bg-gray-700/80 dark:border-blue-800 dark:text-blue-200 rounded-lg font-bold tracking-wider"
                                        />
                                        <span className="absolute right-3 top-2.5 text-[10px] text-blue-600 dark:text-blue-400 font-semibold pointer-events-none">
                                            ✓ Auto
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Dibuat otomatis oleh sistem, dapat diacak ulang jika diperlukan.</p>
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Supplier Rekanan</label>
                                    <select
                                        value={editProductForm.supplier_id}
                                        onChange={(e) => setEditProductForm({ ...editProductForm, supplier_id: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs"
                                    >
                                        <option value="">-- Pilih Supplier --</option>
                                        {suppliers.map((s) => {
                                            const isMatch = !s.category_id || String(s.category_id) === String(editProductForm.category_id);
                                            const catName = s.category?.name || categories.find(c => c.id === s.category_id)?.name;
                                            return (
                                                <option key={s.id} value={s.id} disabled={!isMatch}>
                                                    {s.name} {s.category_id ? `(Khusus: ${catName})` : '(Umum)'} {!isMatch ? ' - [Kategori Tidak Sesuai]' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-1">Supplier spesialisasi (seperti Honda) hanya menerima kategori terkait.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Harga Beli (Rp) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={editProductForm.purchase_price}
                                        onChange={(e) => setEditProductForm({ ...editProductForm, purchase_price: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Harga Jual (Rp) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={editProductForm.selling_price}
                                        onChange={(e) => setEditProductForm({ ...editProductForm, selling_price: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Batas Min Stok *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={editProductForm.minimum_stock}
                                        onChange={(e) => setEditProductForm({ ...editProductForm, minimum_stock: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Deskripsi Produk</label>
                                <textarea
                                    rows={2}
                                    value={editProductForm.description}
                                    onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => setShowEditProductModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg cursor-pointer">Batal</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium cursor-pointer">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 9: EDIT KATEGORI */}
            {showEditCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Pencil className="w-5 h-5 text-blue-600" />
                                Edit Kategori
                            </h3>
                            <button type="button" onClick={() => setShowEditCategoryModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submitEditCategory} className="space-y-4 text-xs">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Nama Kategori *</label>
                                <input
                                    type="text"
                                    required
                                    value={editCategoryForm.name}
                                    onChange={(e) => setEditCategoryForm({ ...editCategoryForm, name: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Deskripsi</label>
                                <textarea
                                    rows={2}
                                    value={editCategoryForm.description}
                                    onChange={(e) => setEditCategoryForm({ ...editCategoryForm, description: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => setShowEditCategoryModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg cursor-pointer">Batal</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium cursor-pointer">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 10: EDIT SUPPLIER */}
            {showEditSupplierModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Pencil className="w-5 h-5 text-blue-600" />
                                Edit Data Supplier
                            </h3>
                            <button type="button" onClick={() => setShowEditSupplierModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submitEditSupplier} className="space-y-3 text-xs">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Nama Supplier *</label>
                                <input
                                    type="text"
                                    required
                                    value={editSupplierForm.name}
                                    onChange={(e) => setEditSupplierForm({ ...editSupplierForm, name: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
                                    Spesialisasi Kategori (Misal: Honda hanya Motor)
                                </label>
                                <select
                                    value={editSupplierForm.category_id}
                                    onChange={(e) => setEditSupplierForm({ ...editSupplierForm, category_id: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">-- Menerima Semua Kategori (Umum) --</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            Khusus: {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Nomor Telepon</label>
                                <input
                                    type="text"
                                    value={editSupplierForm.phone}
                                    onChange={(e) => setEditSupplierForm({ ...editSupplierForm, phone: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Email</label>
                                <input
                                    type="email"
                                    value={editSupplierForm.email}
                                    onChange={(e) => setEditSupplierForm({ ...editSupplierForm, email: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Alamat</label>
                                <textarea
                                    rows={2}
                                    value={editSupplierForm.address}
                                    onChange={(e) => setEditSupplierForm({ ...editSupplierForm, address: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => setShowEditSupplierModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg cursor-pointer">Batal</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium cursor-pointer">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 11: IMPORT PRODUK CSV */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileUp className="w-5 h-5 text-emerald-600" />
                                Import Produk dari File CSV
                            </h3>
                            <button type="button" onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submitImportCsv} className="space-y-4 text-xs">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Upload File CSV</label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="font-semibold text-gray-700 dark:text-gray-300">Atau Tempel / Edit Data CSV:</label>
                                    <button
                                        type="button"
                                        onClick={() => setCsvImportText("Nama Produk,SKU,Kategori,Harga Beli,Harga Jual,Stok Awal,Stok Minimum\nKabel LAN Cat6,LAN-CAT6-01,Elektronik,50000,75000,100,15\nMouse Wireless,MOU-WIR-02,Elektronik,85000,120000,50,10")}
                                        className="text-[11px] text-blue-600 hover:underline font-medium cursor-pointer"
                                    >
                                        Gunakan Contoh Format
                                    </button>
                                </div>
                                <textarea
                                    rows={6}
                                    required
                                    value={csvImportText}
                                    onChange={(e) => setCsvImportText(e.target.value)}
                                    placeholder={"Nama Produk,SKU,Kategori,Harga Beli,Harga Jual,Stok Awal,Stok Minimum\nProduk Contoh,SKU-001,Elektronik,10000,15000,50,10"}
                                    className="w-full p-2.5 font-mono text-[11px] bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <p className="text-[11px] text-gray-500 mt-1">
                                    Format: <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">Nama,SKU,Kategori,HargaBeli,HargaJual,StokAwal,MinStok</code>
                                </p>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => setShowImportModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg cursor-pointer">Batal</button>
                                <button type="submit" className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold cursor-pointer">
                                    Mulai Import Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: DETAIL PRODUK (UNTUK ADMIN & MANAJER GUDANG) */}
            {selectedProductDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Boxes className="w-5 h-5 text-blue-600" />
                                Detail Informasi Produk
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedProductDetail(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Product Header Card */}
                            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700">
                                {selectedProductDetail.image ? (
                                    <img
                                        src={selectedProductDetail.image}
                                        alt={selectedProductDetail.name}
                                        className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 shrink-0">
                                        <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-base text-gray-900 dark:text-white">
                                        {selectedProductDetail.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-bold">
                                            {selectedProductDetail.sku}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 rounded font-medium">
                                            {selectedProductDetail.category_name}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-gray-400 mt-1">
                                        Supplier: {selectedProductDetail.supplier_name || 'Tanpa Supplier'}
                                    </div>
                                </div>
                            </div>

                            {/* Stock & Status Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl">
                                    <span className="text-[11px] font-semibold text-blue-900 dark:text-blue-300 block">
                                        Stok Fisik Saat Ini
                                    </span>
                                    <div className="text-xl font-black text-blue-950 dark:text-white mt-0.5">
                                        {selectedProductDetail.current_stock} Unit
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                                        Batas Min: {selectedProductDetail.minimum_stock} Unit
                                    </span>
                                </div>

                                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl">
                                    <span className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 block">
                                        Harga Jual Satuan
                                    </span>
                                    <div className="text-xl font-black text-emerald-950 dark:text-white mt-0.5">
                                        Rp {selectedProductDetail.selling_price?.toLocaleString('id-ID')}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                                        Modal: Rp {selectedProductDetail.purchase_price?.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            {/* Attributes */}
                            <div>
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                                    Atribut & Varian Produk:
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedProductDetail.attributes && selectedProductDetail.attributes.length > 0 ? (
                                        selectedProductDetail.attributes.map((attr: any) => (
                                            <span
                                                key={attr.id}
                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                                            >
                                                {attr.name}: <span className="font-bold">{attr.value}</span>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">
                                            Tidak ada atribut spesifik (warna/ukuran) yang terdaftar.
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                    Deskripsi Produk:
                                </label>
                                <p className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-750 p-3 rounded-xl border border-gray-100 dark:border-gray-700 leading-relaxed">
                                    {selectedProductDetail.description || 'Tidak ada deskripsi tambahan untuk produk ini.'}
                                </p>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setSelectedProductDetail(null)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded-xl cursor-pointer"
                                >
                                    Tutup
                                </button>

                                <div className="flex items-center gap-2">
                                    {(userRole === 'admin' || userRole === 'manajer_gudang') && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const prodId = selectedProductDetail.id;
                                                    setSelectedProductDetail(null);
                                                    openRestockModal(prodId);
                                                }}
                                                className="btn-press px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
                                            >
                                                + Catat Masuk
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const prodId = selectedProductDetail.id;
                                                    setSelectedProductDetail(null);
                                                    openOpnameModal(prodId);
                                                }}
                                                className="btn-press px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                                            >
                                                Stock Opname
                                            </button>
                                        </>
                                    )}

                                    {userRole === 'admin' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const prod = selectedProductDetail;
                                                setSelectedProductDetail(null);
                                                openEditProductModal(prod);
                                            }}
                                            className="btn-press px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl shadow-xs cursor-pointer"
                                        >
                                            Edit Produk
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Alert Konfirmasi Transaksi / Mutasi Stok Produk */}
            {taskToConfirm && (
                <ConfirmAlertModal
                    isOpen={!!taskToConfirm}
                    onClose={() => setTaskToConfirm(null)}
                    onConfirm={handleExecuteTaskAction}
                    isLoading={isProcessingTask}
                    title={
                        taskToConfirm.action === 'prepare'
                            ? (taskToConfirm.type === 'in' ? 'Konfirmasi Pemeriksaan Barang Masuk' : 'Konfirmasi Penyiapan Barang Keluar')
                            : taskToConfirm.action === 'reject'
                            ? 'Tolak Mutasi Stok Produk'
                            : (taskToConfirm.type === 'in' ? 'Sahkan Mutasi Masuk (Tambah Stok)' : 'Sahkan Mutasi Keluar (Potong Stok)')
                    }
                    message={
                        taskToConfirm.action === 'prepare'
                            ? (taskToConfirm.type === 'in'
                                ? `Tandai bahwa produk fisik "${taskToConfirm.productName}" sebanyak ${taskToConfirm.quantity} unit telah tiba di gudang dan selesai diperiksa kondisi fisiknya.`
                                : `Tandai bahwa produk fisik "${taskToConfirm.productName}" sebanyak ${taskToConfirm.quantity} unit telah disiapkan dari rak gudang untuk proses pengiriman.`)
                            : taskToConfirm.action === 'reject'
                            ? `Apakah Anda yakin ingin menolak transaksi mutasi produk "${taskToConfirm.productName}"? Saldo inventaris tidak akan berubah.`
                            : (taskToConfirm.type === 'in'
                                ? `Apakah Anda yakin ingin mengesahkan transaksi masuk ini? Saldo stok inventaris untuk "${taskToConfirm.productName}" akan bertambah sebanyak +${taskToConfirm.quantity} unit.`
                                : `Apakah Anda yakin ingin mengesahkan transaksi keluar ini? Saldo stok inventaris untuk "${taskToConfirm.productName}" akan berkurang sebanyak -${taskToConfirm.quantity} unit.`)
                    }
                    variant={
                        taskToConfirm.action === 'reject'
                            ? 'danger'
                            : taskToConfirm.type === 'in'
                            ? 'success'
                            : taskToConfirm.action === 'prepare'
                            ? 'primary'
                            : 'warning'
                    }
                    confirmText={
                        taskToConfirm.action === 'prepare'
                            ? (taskToConfirm.type === 'in' ? 'Ya, Tandai Diperiksa' : 'Ya, Tandai Disiapkan')
                            : taskToConfirm.action === 'reject'
                            ? 'Ya, Tolak Mutasi'
                            : (taskToConfirm.type === 'in' ? 'Ya, Sahkan & Tambah Stok' : 'Ya, Sahkan & Potong Stok')
                    }
                    cancelText="Batal"
                    productDetails={{
                        name: taskToConfirm.productName,
                        sku: taskToConfirm.sku,
                        quantity: taskToConfirm.quantity,
                        unit: 'unit',
                        actionLabel: taskToConfirm.action === 'prepare'
                            ? (taskToConfirm.type === 'in' ? 'Status: Selesai Diperiksa Staff' : 'Status: Selesai Disiapkan Staff')
                            : taskToConfirm.action === 'reject'
                            ? 'Status: Ditolak / Dibatalkan'
                            : (taskToConfirm.type === 'in' ? 'Mutasi Masuk (Penambahan Saldo)' : 'Mutasi Keluar (Pengurangan Saldo)')
                    }}
                />
            )}

            {/* Modal Alert Konfirmasi Hapus Data (Produk, Kategori, Supplier, Pengguna) */}
            {itemToDelete && (
                <ConfirmAlertModal
                    isOpen={!!itemToDelete}
                    onClose={() => setItemToDelete(null)}
                    onConfirm={handleExecuteDelete}
                    isLoading={isDeletingItem}
                    title={itemToDelete.title}
                    message={itemToDelete.message}
                    variant="danger"
                    confirmText={`Ya, Hapus ${itemToDelete.categoryTitle}`}
                    cancelText="Batal"
                    itemDetails={{
                        headerTitle: `Rincian ${itemToDelete.categoryTitle} yang akan dihapus`,
                        name: itemToDelete.name,
                        badge: itemToDelete.badge,
                        fields: itemToDelete.fields
                    }}
                />
            )}

            {/* Modal Alert Konfirmasi Reset Pengaturan Aplikasi */}
            {showResetSettingsConfirm && (
                <ConfirmAlertModal
                    isOpen={showResetSettingsConfirm}
                    onClose={() => setShowResetSettingsConfirm(false)}
                    onConfirm={executeResetSettings}
                    isLoading={isResettingSettings}
                    title="Kembalikan Pengaturan ke Default"
                    message="Apakah Anda yakin ingin mengembalikan logo, nama aplikasi, alamat gudang, dan seluruh konfigurasi identitas Stockify ke setelan awal pabrik?"
                    variant="warning"
                    confirmText="Ya, Reset ke Setelan Awal"
                    cancelText="Batal"
                    itemDetails={{
                        headerTitle: 'Konfigurasi Sistem',
                        name: 'Identitas & Logo Stockify',
                        badge: 'Reset Pabrik',
                        description: 'Pengaturan kustom saat ini akan digantikan dengan konfigurasi default Stockify.'
                    }}
                />
            )}

            {/* Modal Alert Konfirmasi Pembersihan Stok 0 */}
            {showCleanZeroStockConfirm && (
                <ConfirmAlertModal
                    isOpen={showCleanZeroStockConfirm}
                    onClose={() => setShowCleanZeroStockConfirm(false)}
                    onConfirm={executeCleanZeroStock}
                    isLoading={isCleaningZeroStock}
                    title="Pembersihan Otomatis Produk Kosong"
                    message="Sistem akan memeriksa dan menghapus data produk yang memiliki saldo stok 0 selama lebih dari 3 hari. Tindakan ini membantu menjaga kerapian katalog inventaris Anda."
                    variant="warning"
                    confirmText="Ya, Jalankan Pembersihan"
                    cancelText="Batal"
                    itemDetails={{
                        headerTitle: 'Pemeliharaan Inventaris',
                        name: 'Pembersihan Produk Stok Kosong',
                        badge: '> 3 Hari Kosong',
                        description: 'Produk yang dihapus tidak dapat dipulihkan secara otomatis.'
                    }}
                />
            )}
        </FlowbiteAdminLayout>
    );
}

Dashboard.layout = (page: React.ReactNode) => page;
