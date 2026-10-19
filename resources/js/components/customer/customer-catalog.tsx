import React, { useState } from 'react';
import { 
    Search, 
    Filter, 
    ShoppingBag, 
    Star, 
    CheckCircle2, 
    AlertTriangle, 
    Package, 
    Tag, 
    Sparkles, 
    MessageSquare,
    Store,
    Info,
    X,
    ThumbsUp
} from 'lucide-react';
import { DummyPaymentModal } from './dummy-payment-modal';

interface Product {
    id: number;
    name: string;
    sku: string;
    description: string | null;
    purchase_price: number;
    selling_price: number;
    minimum_stock: number;
    current_stock: number;
    category_id: number;
    category_name: string;
    supplier_id: number | null;
    supplier_name: string;
    avg_rating?: number;
    reviews_count?: number;
    reviews?: Array<{
        id: number;
        rating: number;
        comment: string;
        user_name: string;
        date: string;
    }>;
}

interface Category {
    id: number;
    name: string;
}

interface StaffMember {
    id: number;
    name: string;
    email: string;
}

interface Props {
    products: Product[];
    categories: Category[];
    staffMembers: StaffMember[];
}

export function CustomerCatalog({ products = [], categories = [], staffMembers = [] }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [stockFilter, setStockFilter] = useState<'all' | 'ready'>('all');
    
    // Modal states
    const [selectedProductForBuy, setSelectedProductForBuy] = useState<Product | null>(null);
    const [reviewProduct, setReviewProduct] = useState<Product | null>(null);

    // Filter products
    const filteredProducts = products.filter((p) => {
        const matchesSearch = 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat = selectedCategory === 'all' || String(p.category_id) === selectedCategory;
        const matchesStock = stockFilter === 'all' || p.current_stock > 0;

        return matchesSearch && matchesCat && matchesStock;
    });

    return (
        <div className="space-y-6">
            {/* Top Showcase Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 md:p-8 shadow-xl">
                <div className="relative z-10 max-w-2xl space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
                        <Store className="w-4 h-4 text-amber-300" />
                        <span>Katalog Display Produk Toko</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                        Pesan Barang Langsung Dari Gudang Pusat
                    </h1>
                    <p className="text-blue-100 text-xs md:text-sm leading-relaxed">
                        Pilih produk kebutuhan Anda dari rak inventaris. Transaksi akan dilayani oleh staff gudang bertugas, memotong stok secara real-time dengan sistem pembayaran simulasi instan.
                    </p>
                </div>
                {/* Decorative background glow */}
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 right-20 w-48 h-48 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama barang atau kode SKU..."
                        className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Category Selector */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-xs py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="all">Semua Kategori ({categories.length})</option>
                        {categories.map((c) => (
                            <option key={c.id} value={String(c.id)}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    {/* Stock filter toggles */}
                    <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl text-xs">
                        <button
                            type="button"
                            onClick={() => setStockFilter('all')}
                            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                                stockFilter === 'all'
                                    ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 shadow-xs'
                                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                            }`}
                        >
                            Semua ({products.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStockFilter('ready')}
                            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                                stockFilter === 'ready'
                                    ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 shadow-xs'
                                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                            }`}
                        >
                            Stok Ready
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Display Cards Grid */}
            {filteredProducts.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Tidak ada produk ditemukan</h3>
                    <p className="text-xs text-gray-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter kategori Anda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredProducts.map((product) => {
                        const isOutOfStock = product.current_stock <= 0;
                        const rating = product.avg_rating || 5.0;
                        const reviewsCount = product.reviews_count || 0;

                        return (
                            <div 
                                key={product.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                            >
                                {/* Card Top Image Placeholder / Category Badge */}
                                <div className="p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-700/30 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700/60 relative">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                            {product.category_name}
                                        </span>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                            isOutOfStock 
                                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                                                : product.current_stock <= product.minimum_stock
                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        }`}>
                                            {isOutOfStock ? 'Stok Habis' : `Tersedia: ${product.current_stock} unit`}
                                        </span>
                                    </div>

                                    {/* Display Product Icon or Name Box */}
                                    <div className="h-28 rounded-xl bg-white dark:bg-gray-700/60 flex flex-col items-center justify-center p-3 text-center border border-gray-100 dark:border-gray-600/40 group-hover:scale-[1.02] transition-transform">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 shadow-xs">
                                            <Package className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-mono text-gray-400 dark:text-gray-400">
                                            {product.sku}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                    <div>
                                        <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {product.name}
                                        </h3>
                                        {product.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                                {product.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Rating & Review Counter */}
                                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-gray-700/60">
                                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                            <span>{rating.toFixed(1)}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setReviewProduct(product)}
                                            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            <MessageSquare className="w-3 h-3" />
                                            {reviewsCount} Ulasan
                                        </button>
                                    </div>

                                    {/* Price and Buy Button */}
                                    <div className="pt-2 flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] text-gray-400 uppercase font-medium">Harga Jual</div>
                                            <div className="text-base font-extrabold text-gray-900 dark:text-white">
                                                Rp {product.selling_price.toLocaleString('id-ID')}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedProductForBuy(product)}
                                            disabled={isOutOfStock}
                                            className="px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                            {isOutOfStock ? 'Habis' : 'Beli'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Dummy Payment */}
            {selectedProductForBuy && (
                <DummyPaymentModal
                    isOpen={!!selectedProductForBuy}
                    onClose={() => setSelectedProductForBuy(null)}
                    product={selectedProductForBuy}
                    staffMembers={staffMembers}
                />
            )}

            {/* Modal Review Pelanggan */}
            {reviewProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700 max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                            <div>
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                    Ulasan Pelanggan: {reviewProduct.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mt-0.5">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span>{reviewProduct.avg_rating?.toFixed(1) || '5.0'} / 5.0</span>
                                    <span className="text-gray-400 font-normal">({reviewProduct.reviews_count || 0} Ulasan)</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setReviewProduct(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="py-4 space-y-3 overflow-y-auto flex-1">
                            {reviewProduct.reviews && reviewProduct.reviews.length > 0 ? (
                                reviewProduct.reviews.map((rev) => (
                                    <div key={rev.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-gray-800 dark:text-gray-200">{rev.user_name}</span>
                                            <div className="flex items-center gap-0.5 text-amber-400">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 italic">
                                            "{rev.comment}"
                                        </p>
                                        <div className="text-[10px] text-gray-400 text-right">{rev.date}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500 text-xs">
                                    Belum ada ulasan untuk produk ini. Jadilah yang pertama membeli dan memberikan feedback!
                                </div>
                            )}
                        </div>

                        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 text-right">
                            <button
                                type="button"
                                onClick={() => setReviewProduct(null)}
                                className="px-4 py-2 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
