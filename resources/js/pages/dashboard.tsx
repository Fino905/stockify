import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import FlowbiteAdminLayout from '@/layouts/flowbite-admin-layout';
import { 
    CustomerCatalog, 
    CustomerOrdersTab, 
    CustomerRefundsTab,
    AdminOrdersTab,
    AdminRefundsTab 
} from '@/components/dashboard/customer';
import { StaffTaskOverview } from '@/components/dashboard/staff';
import { AdminAnalyticsOverview } from '@/components/dashboard/admin';
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
    Eye
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
    orders?: Array<any>;
    refundRequests?: Array<any>;
    staffMembers?: Array<any>;
    currentUser?: {
        id: number;
        name: string;
        email: string;
        role: string;
    } | null;
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
    orders = [],
    refundRequests = [],
    staffMembers = [],
    currentUser = null,
}: Props) {
    const userRole = currentUser?.role ?? 'admin';
    const [activeTab, setActiveTab] = useState(userRole === 'customer' ? 'catalog' : 'dashboard');
    const [isTabLoading, setIsTabLoading] = useState(false);

    React.useEffect(() => {
        if (userRole === 'customer' && !['catalog', 'my_orders', 'my_refunds'].includes(activeTab)) {
            setActiveTab('catalog');
        }
    }, [userRole, activeTab]);

    const handleSelectTab = (tab: string) => {
        if (tab === activeTab) return;
        setIsTabLoading(true);
        setTimeout(() => {
            setActiveTab(tab);
            setIsTabLoading(false);
        }, 300);
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [periodFilter, setPeriodFilter] = useState('Pekan Ini');

    // Modals
    const [showProductModal, setShowProductModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [transactionType, setTransactionType] = useState<'in' | 'out'>('in');
    const [showUserModal, setShowUserModal] = useState(false);
    const [showOpnameModal, setShowOpnameModal] = useState(false);
    const [showAttributeModal, setShowAttributeModal] = useState(false);
    const [selectedProductForAttr, setSelectedProductForAttr] = useState<number | null>(null);

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

    const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
    const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
    const [editSupplierForm, setEditSupplierForm] = useState({ name: '', address: '', phone: '', email: '' });

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
    const [supplierForm, setSupplierForm] = useState({ name: '', address: '', phone: '', email: '' });
    const [transactionForm, setTransactionForm] = useState({
        product_id: products[0]?.id ? String(products[0].id) : '',
        quantity: '1',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'completed',
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
    const [appSettings, setAppSettings] = useState({
        appName: 'Stockify',
        warehouseName: 'Gudang Pusat Logistik Cikarang',
        contact: '021-8976500',
        email: 'admin@stockify.test',
        address: 'Kawasan Industri GIIC Blok AA No. 1, Cikarang Pusat',
    });

    // Submissions
    const submitProduct = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/products', productForm, {
            onSuccess: () => {
                setShowProductModal(false);
                setProductForm({
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
                setSupplierForm({ name: '', address: '', phone: '', email: '' });
            },
        });
    };

    // Edit Product Handlers
    const openEditProductModal = (p: any) => {
        setEditingProductId(p.id);
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
        setShowEditProductModal(true);
    };

    const submitEditProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProductId) return;
        router.put(`/products/${editingProductId}`, editProductForm, {
            onSuccess: () => setShowEditProductModal(false),
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

    const deleteItem = (url: string, confirmMessage: string) => {
        if (confirm(confirmMessage)) {
            router.delete(url);
        }
    };

    const updateTrxStatus = (id: number, status: string) => {
        router.patch(`/transactions/${id}/status`, { status });
    };

    const confirmTask = (id: number) => {
        router.patch(`/transactions/${id}/confirm`, {});
    };

    const updateUserRole = (userId: number, role: string) => {
        router.patch(`/users/${userId}/role`, { role });
    };

    const openRestockModal = (productId: number) => {
        setTransactionType('in');
        setTransactionForm(prev => ({ ...prev, product_id: String(productId), quantity: '50' }));
        setShowTransactionModal(true);
    };

    const openOpnameModal = (productId: number) => {
        const prod = products.find(p => p.id === productId);
        setOpnameForm({
            product_id: String(productId),
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

    const filteredTransactions = transactions.filter(item => {
        const matchesSearch = item.product.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || item.type === filterType;
        return matchesSearch && matchesFilter;
    });

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
        >
            <Head title={`Stockify - ${activeTab.toUpperCase()}`} />

            {/* Breadcrumb Navigation */}
            <nav className="flex mb-4" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 text-sm">
                    <li className="inline-flex items-center">
                        <button 
                            type="button"
                            onClick={() => handleSelectTab('dashboard')}
                            className="inline-flex items-center text-gray-500 hover:text-[#4EE3D6] dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            <Home className="w-4 h-4 me-1.5" />
                            Utama
                        </button>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                            <span className="text-gray-500 dark:text-gray-400 capitalize">{activeTab}</span>
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
                <div className="space-y-6 animate-in fade-in-50 duration-150">
                    {/* Top Greeting & Action Card matching reference image (Khusus Staff Gudang, Manajer, Admin) */}
                    {userRole !== 'customer' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                                {activeTab === 'dashboard' ? (
                                    <>Halo, {currentUser?.name ?? 'Admin'} ! <span className="text-2xl">👋</span></>
                                ) : (
                                    <>
                                        {activeTab === 'products' && 'Manajemen Data Produk & Stok'}
                                        {activeTab === 'categories' && 'Kategori Produk'}
                                        {activeTab === 'suppliers' && 'Daftar Supplier / Pemasok'}
                                        {activeTab === 'transactions' && 'Riwayat Transaksi Stok'}
                                        {activeTab === 'opname' && 'Stock Opname (Pemeriksaan Fisik)'}
                                        {activeTab === 'reports' && 'Laporan Mutasi & Stok'}
                                        {activeTab === 'orders_management' && 'Pesanan Customer (Penjualan Gudang)'}
                                        {activeTab === 'refunds_management' && 'Pusat Persetujuan Refund Customer'}
                                        {activeTab === 'users' && 'Manajemen Pengguna & Hak Akses'}
                                        {activeTab === 'settings' && 'Pengaturan Umum Aplikasi'}
                                    </>
                                )}
                            </h1>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {activeTab === 'dashboard'
                                    ? 'Berikut ringkasan operasional dan inventaris gudang hari ini.'
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
                                        className="appearance-none bg-gray-50 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 pr-8 text-xs font-semibold text-gray-700 dark:text-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                                    >
                                        <option value="Pekan Ini">Pekan Ini</option>
                                        <option value="Bulan Ini">Bulan Ini</option>
                                        <option value="7 Hari Terakhir">7 Hari Terakhir</option>
                                        <option value="Tahun Ini">Tahun Ini</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            )}

                            {(userRole === 'admin' || userRole === 'manajer_gudang') && (
                                <button
                                    type="button"
                                    onClick={() => setShowProductModal(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#3B5BFD] hover:bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 cursor-pointer transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Tambah Produk
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setTransactionType('in');
                                    setShowTransactionModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl cursor-pointer transition-colors"
                            >
                                <ArrowDownToLine className="w-3.5 h-3.5" />
                                Barang Masuk
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setTransactionType('out');
                                    setShowTransactionModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl cursor-pointer transition-colors"
                            >
                                <ArrowUpFromLine className="w-3.5 h-3.5" />
                                Barang Keluar
                            </button>

                            {(userRole === 'admin' || userRole === 'manajer_gudang') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpnameForm({
                                            product_id: products[0]?.id ? String(products[0].id) : '',
                                            physical_stock: products[0] ? String(products[0].current_stock) : '0',
                                            notes: '',
                                        });
                                        setShowOpnameModal(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl cursor-pointer transition-colors"
                                >
                                    <ClipboardCheck className="w-3.5 h-3.5" />
                                    Stock Opname
                                </button>
                            )}
                        </div>
                    </div>
                    )}

            {/* TAB 1: DASHBOARD (HANYA UNTUK STAFF GUDANG, MANAJER, ADMIN) */}
            {activeTab === 'dashboard' && userRole !== 'customer' && (
                <>
                    {/* KHUSUS ROLE STAFF GUDANG: DAFTAR TUGAS OPERASIONAL */}
                    {userRole === 'staff_gudang' && (
                        <StaffTaskOverview
                            pendingInTasks={pendingInTasks}
                            pendingOutTasks={pendingOutTasks}
                            onConfirmTask={confirmTask}
                        />
                    )}

                    {/* DASHBOARD KHUSUS ADMIN & MANAJER GUDANG: STATISTIK, GRAFIK, DAN AKTIVITAS */}
                    {userRole !== 'staff_gudang' && (
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

            {/* TAB 2: MANAJEMEN PRODUK & ATRIBUT & EXPORT (Matching reference image: Gestion des commandes) */}
            {activeTab === 'products' && (
                <div className="bg-white border border-gray-100 dark:border-gray-700/60 rounded-2xl shadow-xs dark:bg-gray-800 p-5 sm:p-6 space-y-5">
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
                            {(userRole === 'admin' || userRole === 'manajer_gudang') && (
                                <button
                                    type="button"
                                    onClick={() => setShowProductModal(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#3B5BFD] hover:bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 cursor-pointer transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Tambah Produk
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 4 Status Summary Cards matching reference: Nouvelles, En attente, En cours, Terminées */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                        <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 rounded-2xl border border-blue-100/80 dark:border-blue-900/40">
                            <span className="text-xs font-semibold text-blue-900 dark:text-blue-300 block">Semua Produk</span>
                            <div className="flex items-baseline justify-between mt-1.5">
                                <span className="text-2xl font-bold text-blue-950 dark:text-white">{products.length}</span>
                                <span className="text-[11px] text-blue-600 font-semibold">▲ 2.5%</span>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-0.5 block">total item SKU</span>
                        </div>

                        <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-100/80 dark:border-amber-900/40">
                            <span className="text-xs font-semibold text-amber-900 dark:text-amber-300 block">Stok Menipis</span>
                            <div className="flex items-baseline justify-between mt-1.5">
                                <span className="text-2xl font-bold text-amber-950 dark:text-white">{lowStockItems.length}</span>
                                <span className="text-[11px] text-amber-600 font-semibold">Perlu restock</span>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-0.5 block">di bawah minimum</span>
                        </div>

                        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/80 dark:border-emerald-900/40">
                            <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 block">Barang Masuk</span>
                            <div className="flex items-baseline justify-between mt-1.5">
                                <span className="text-2xl font-bold text-emerald-950 dark:text-white">{pendingInTasks.length + 34}</span>
                                <span className="text-[11px] text-emerald-600 font-semibold">▲ 5%</span>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-0.5 block">penerimaan periode</span>
                        </div>

                        <div className="p-4 bg-purple-50/60 dark:bg-purple-950/20 rounded-2xl border border-purple-100/80 dark:border-purple-900/40">
                            <span className="text-xs font-semibold text-purple-900 dark:text-purple-300 block">Tersedia Aman</span>
                            <div className="flex items-baseline justify-between mt-1.5">
                                <span className="text-2xl font-bold text-purple-950 dark:text-white">{Math.max(0, products.length - lowStockItems.length)}</span>
                                <span className="text-[11px] text-purple-600 font-semibold">Stok normal</span>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-0.5 block">siap diproses</span>
                        </div>
                    </div>

                    {/* Filter & Search Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                        <div className="relative w-full sm:w-80">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama atau SKU produk..."
                                className="bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-xs rounded-xl pl-9 pr-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
                            >
                                <Filter className="w-3.5 h-3.5 text-gray-500" />
                                Filtres
                            </button>

                            {(userRole === 'admin' || userRole === 'manajer_gudang') && (
                                <button
                                    type="button"
                                    onClick={() => setShowImportModal(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 cursor-pointer shadow-2xs"
                                    title="Import Data Produk dari file CSV"
                                >
                                    <FileUp className="w-3.5 h-3.5 text-emerald-600" />
                                    Import CSV
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={exportProductsCSV}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 cursor-pointer shadow-2xs"
                            >
                                <Download className="w-3.5 h-3.5 text-blue-600" />
                                Export CSV
                            </button>
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
                                {filteredProducts.map((p) => (
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
                                                {(userRole === 'admin' || userRole === 'manajer_gudang') && (
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
                                            <div className={`font-bold ${p.current_stock <= p.minimum_stock ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                {p.current_stock} unit
                                            </div>
                                            <div className="text-[10px] text-gray-400">Min: {p.minimum_stock}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {(userRole === 'admin' || userRole === 'manajer_gudang') && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditProductModal(p)}
                                                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded cursor-pointer"
                                                        title="Edit Produk"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                )}
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
                                                {(userRole === 'admin' || userRole === 'manajer_gudang') && (
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteItem(`/products/${p.id}`, `Hapus produk "${p.name}"?`)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                                        title="Hapus Produk"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer matching reference screenshot (1-7 sur 141 < 1 2 3 ... 20 >) */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/60 text-xs text-gray-500">
                        <span>
                            Menampilkan 1-{Math.min(10, filteredProducts.length)} dari {filteredProducts.length} produk
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer transition-colors"
                            >
                                &lt;
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1 rounded-lg bg-[#3B5BFD] text-white font-bold shadow-xs cursor-pointer"
                            >
                                1
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer transition-colors"
                            >
                                2
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer transition-colors"
                            >
                                3
                            </button>
                            <span className="px-1 text-gray-400">...</span>
                            <button
                                type="button"
                                className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer transition-colors"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: STOCK OPNAME (PENYESUAIAN FISIK VS SISTEM) */}
            {activeTab === 'opname' && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden p-5">
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
                                                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
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

            {/* TAB 4: KATEGORI PRODUK */}
            {activeTab === 'categories' && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kategori Produk</h2>
                            <p className="text-xs text-gray-500">Kelompokkan produk gudang berdasarkan jenis material</p>
                        </div>
                        {userRole === 'admin' && (
                            <button
                                type="button"
                                onClick={() => setShowCategoryModal(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#3B5BFD] hover:bg-blue-600 rounded-lg shadow-xs cursor-pointer transition-colors"
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
                                                        onClick={() => deleteItem(`/categories/${c.id}`, `Hapus kategori "${c.name}"?`)}
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
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Daftar Rekanan Supplier</h2>
                            <p className="text-xs text-gray-500">Pemasok resmi pengadaan barang</p>
                        </div>
                        {userRole === 'admin' && (
                            <button
                                type="button"
                                onClick={() => setShowSupplierModal(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#3B5BFD] hover:bg-blue-600 rounded-lg shadow-xs cursor-pointer transition-colors"
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
                                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{s.name}</td>
                                        <td className="px-4 py-3 text-xs">
                                            <div>{s.phone || '-'}</div>
                                            <div className="text-blue-600">{s.email || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{s.address || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
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
                                                        onClick={() => deleteItem(`/suppliers/${s.id}`, `Hapus supplier "${s.name}"?`)}
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
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Riwayat Transaksi Mutasi Stok</h2>
                            <p className="text-xs text-gray-500">Pencatatan penerimaan barang masuk dan pengeluaran barang keluar</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setTransactionType('in');
                                    setShowTransactionModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-colors"
                            >
                                <ArrowDownToLine className="w-3.5 h-3.5" />
                                Catat Barang Masuk
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setTransactionType('out');
                                    setShowTransactionModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer transition-colors"
                            >
                                <ArrowUpFromLine className="w-3.5 h-3.5" />
                                Catat Barang Keluar
                            </button>
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
                                {transactions.map((trx) => (
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
                                                <select
                                                    value={trx.status}
                                                    onChange={(e) => updateTrxStatus(trx.raw_id, e.target.value)}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg p-1 font-medium"
                                                >
                                                    <option value="completed">Completed</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            ) : (
                                                <span className="capitalize text-xs font-semibold">{trx.status}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 7: LAPORAN MUTASI & AKTIVITAS */}
            {activeTab === 'reports' && (
                <div className="space-y-6">
                    <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pusat Laporan & Analitik Gudang</h2>
                            <p className="text-xs text-gray-500">Laporan stok per kategori, per periode, mutasi, dan aktivitas operasional</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
                        >
                            <Printer className="w-4 h-4" />
                            Cetak Laporan / PDF
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
                            <span className="text-xs font-medium text-gray-500 uppercase">Estimasi Nilai Aset Beli</span>
                            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                                Rp {products.reduce((acc, curr) => acc + (curr.purchase_price * curr.current_stock), 0).toLocaleString('id-ID')}
                            </div>
                            <p className="mt-1 text-xs text-gray-400">Total modal stok yang tersimpan</p>
                        </div>
                        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
                            <span className="text-xs font-medium text-gray-500 uppercase">Potensi Nilai Jual</span>
                            <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                Rp {products.reduce((acc, curr) => acc + (curr.selling_price * curr.current_stock), 0).toLocaleString('id-ID')}
                            </div>
                            <p className="mt-1 text-xs text-gray-400">Jika seluruh stok saat ini terjual</p>
                        </div>
                        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
                            <span className="text-xs font-medium text-gray-500 uppercase">Total Mutasi Transaksi</span>
                            <div className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {transactions.length} Transaksi
                            </div>
                            <p className="mt-1 text-xs text-gray-400">Aktivitas keluar-masuk tercatat</p>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 8: MANAJEMEN USER (ADMIN ONLY) */}
            {activeTab === 'users' && userRole === 'admin' && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Manajemen Pengguna & Role</h2>
                            <p className="text-xs text-gray-500">Kelola akun dan hak akses: Admin, Manajer Gudang, Staff Gudang</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowUserModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#3B5BFD] hover:bg-blue-600 rounded-lg shadow-xs cursor-pointer transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Tambah Pengguna
                        </button>
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
                                {users.map((u) => (
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
                                                    onClick={() => deleteItem(`/users/${u.id}`, `Hapus pengguna "${u.name}"?`)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 9: PENGATURAN UMUM APLIKASI (ADMIN ONLY) */}
            {activeTab === 'settings' && userRole === 'admin' && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 p-6 max-w-2xl">
                    <div className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-5">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-blue-600" />
                            Pengaturan Umum Aplikasi Stockify
                        </h2>
                        <p className="text-xs text-gray-500">Konfigurasi nama aplikasi, data gudang, dan kontak resmi</p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); alert('Pengaturan aplikasi berhasil disimpan!'); }} className="space-y-4 text-xs">
                        <div>
                            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Nama Aplikasi</label>
                            <input
                                type="text"
                                value={appSettings.appName}
                                onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-medium"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Nama Gudang / Fasilitas</label>
                            <input
                                type="text"
                                value={appSettings.warehouseName}
                                onChange={(e) => setAppSettings({ ...appSettings, warehouseName: e.target.value })}
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">No. Telepon Kontak</label>
                                <input
                                    type="text"
                                    value={appSettings.contact}
                                    onChange={(e) => setAppSettings({ ...appSettings, contact: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Email Gudang</label>
                                <input
                                    type="email"
                                    value={appSettings.email}
                                    onChange={(e) => setAppSettings({ ...appSettings, email: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Alamat Lengkap Gudang</label>
                            <textarea
                                rows={2}
                                value={appSettings.address}
                                onChange={(e) => setAppSettings({ ...appSettings, address: e.target.value })}
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                            >
                                Simpan Perubahan Pengaturan
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB KHUSUS CUSTOMER: DISPLAY & KATALOG PRODUK */}
            {activeTab === 'catalog' && (
                <CustomerCatalog 
                    products={products} 
                    categories={categories} 
                    staffMembers={staffMembers} 
                />
            )}

            {/* TAB KHUSUS CUSTOMER: PESANAN & PEMBAYARAN */}
            {activeTab === 'my_orders' && (
                <CustomerOrdersTab orders={orders} />
            )}

            {/* TAB KHUSUS CUSTOMER: STATUS REFUND */}
            {activeTab === 'my_refunds' && (
                <CustomerRefundsTab orders={orders} />
            )}

            {/* TAB STAFF & ADMIN: DAFTAR PESANAN CUSTOMER */}
            {activeTab === 'orders_management' && (
                <AdminOrdersTab orders={orders} />
            )}

            {/* TAB STAFF & ADMIN: PUSAT PERSETUJUAN REFUND */}
            {activeTab === 'refunds_management' && (
                <AdminRefundsTab refundRequests={refundRequests} />
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
                                    placeholder="Contoh: Baut Baja 10mm"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Kode SKU *</label>
                                    <input
                                        type="text"
                                        required
                                        value={productForm.sku}
                                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                                        placeholder="PRD-001"
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Kategori *</label>
                                    <select
                                        value={productForm.category_id}
                                        onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Supplier Rekanan</label>
                                <select
                                    value={productForm.supplier_id}
                                    onChange={(e) => setProductForm({ ...productForm, supplier_id: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">Pilih Supplier</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
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
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Gambar / Foto Produk (URL)</label>
                                <input
                                    type="text"
                                    value={productForm.image}
                                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                                    placeholder="https://... atau /images/produk.jpg"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
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
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => setShowTransactionModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Batal</button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-white font-medium rounded-lg ${
                                        transactionType === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
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
                                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Batal</button>
                                <button type="submit" className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg font-medium">Simpan</button>
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
                                    placeholder="PT Mitra Jaya"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
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
                                <button type="button" onClick={() => setShowSupplierModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Batal</button>
                                <button type="submit" className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg font-medium">Simpan Supplier</button>
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
                                <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Batal</button>
                                <button type="submit" className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg font-medium">Buat Akun</button>
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
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Kode SKU *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editProductForm.sku}
                                        onChange={(e) => setEditProductForm({ ...editProductForm, sku: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Kategori *</label>
                                    <select
                                        value={editProductForm.category_id}
                                        onChange={(e) => setEditProductForm({ ...editProductForm, category_id: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Supplier Rekanan</label>
                                <select
                                    value={editProductForm.supplier_id}
                                    onChange={(e) => setEditProductForm({ ...editProductForm, supplier_id: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">Pilih Supplier</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Gambar / Foto Produk (URL / Link Gambar)</label>
                                <input
                                    type="text"
                                    value={editProductForm.image}
                                    onChange={(e) => setEditProductForm({ ...editProductForm, image: e.target.value })}
                                    placeholder="https://... atau /images/produk.jpg"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
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
                                <Pencil className="w-5 h-5 text-purple-600" />
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
                                <button type="submit" className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg font-medium cursor-pointer">Simpan Perubahan</button>
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
                                <Pencil className="w-5 h-5 text-purple-600" />
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
                                <button type="submit" className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg font-medium cursor-pointer">Simpan Perubahan</button>
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
        </FlowbiteAdminLayout>
    );
}

Dashboard.layout = (page: React.ReactNode) => page;
