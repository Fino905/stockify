<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\TeamInvitation;
use App\Models\User;
use App\Models\WarehouseNote;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\StockTransactionRepositoryInterface;
use App\Repositories\Contracts\SupplierRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;

class DashboardService
{
    public function __construct(
        protected ProductRepositoryInterface $productRepository,
        protected StockTransactionRepositoryInterface $transactionRepository,
        protected CategoryRepositoryInterface $categoryRepository,
        protected SupplierRepositoryInterface $supplierRepository,
        protected UserRepositoryInterface $userRepository,
        protected ProductService $productService
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function getDashboardData(?User $authUser): array
    {
        $email = $authUser ? strtolower($authUser->email) : '';

        $pendingInvitations = $email ? TeamInvitation::query()
            ->with(['inviter', 'team'])
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNull('accepted_at')
            ->where(fn ($query) => $query
                ->whereNull('expires_at')
                ->orWhere('expires_at', '>=', now()))
            ->latest()
            ->get()
            ->map(fn (TeamInvitation $invitation) => [
                'code' => $invitation->code,
                'inviterName' => $invitation->inviter->name,
                'team' => [
                    'name' => $invitation->team->name,
                    'slug' => $invitation->team->slug,
                ],
            ]) : [];

        $categories = $this->categoryRepository->getAllWithProductsCount();
        $suppliers = $this->supplierRepository->getAllWithProductsCount();

        $rawProducts = $this->productRepository->getAllWithRelations();
        $products = $rawProducts->map(function ($product) {
            $isZeroStock = $product->current_stock <= 0;
            $zeroDays = ($isZeroStock && $product->zero_stock_since)
                ? (int) $product->zero_stock_since->diffInDays(now())
                : 0;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'description' => $product->description,
                'image' => $product->image,
                'purchase_price' => (float) $product->purchase_price,
                'selling_price' => (float) $product->selling_price,
                'minimum_stock' => (int) $product->minimum_stock,
                'current_stock' => (int) $product->current_stock,
                'zero_stock_since' => $product->zero_stock_since?->format('Y-m-d H:i:s'),
                'zero_stock_days' => $zeroDays,
                'days_until_deletion' => $isZeroStock ? max(0, 3 - $zeroDays) : null,
                'category_id' => $product->category_id,
                'category_name' => $product->category?->name ?? 'Tanpa Kategori',
                'supplier_id' => $product->supplier_id,
                'supplier_name' => $product->supplier?->name ?? 'Tanpa Supplier',
                'avg_rating' => 5.0,
                'reviews_count' => 0,
                'reviews' => [],
                'attributes' => $product->attributes->map(fn ($attr) => [
                    'id' => $attr->id,
                    'name' => $attr->name,
                    'value' => $attr->value,
                ])->values()->all(),
            ];
        })->values();

        $transactions = $this->transactionRepository->getAllWithRelations()->map(function ($trx) {
            return [
                'id' => 'TRX-'.str_pad((string) $trx->id, 4, '0', STR_PAD_LEFT),
                'raw_id' => $trx->id,
                'product_id' => $trx->product_id,
                'product' => $trx->product?->name ?? 'Produk Dihapus',
                'sku' => $trx->product?->sku ?? '-',
                'type' => $trx->type,
                'quantity' => (int) $trx->quantity,
                'date' => $trx->date ? $trx->date->format('d M Y') : '-',
                'raw_date' => $trx->date ? $trx->date->format('Y-m-d') : '',
                'user' => $trx->user?->name ?? 'Sistem',
                'role' => $trx->user?->role ?? 'staff_gudang',
                'status' => $trx->status,
                'notes' => $trx->notes,
            ];
        })->values();

        $users = ($authUser && in_array($authUser->role, ['admin', 'manajer_gudang']))
            ? $this->userRepository->getAll()
            : collect([]);

        $totalStockIn = $this->transactionRepository->getTotalQuantityByType('in', 'completed');
        $totalStockOut = $this->transactionRepository->getTotalQuantityByType('out', 'completed');

        $todayStockIn = $this->transactionRepository->getTodayQuantityByType('in', 'completed');
        $todayStockOut = $this->transactionRepository->getTodayQuantityByType('out', 'completed');

        $pendingInTasks = $transactions->where('type', 'in')->where('status', 'pending')->values();
        $pendingOutTasks = $transactions->where('type', 'out')->where('status', 'pending')->values();

        $lowStockItems = $products->filter(function ($item) {
            return $item['current_stock'] <= $item['minimum_stock'];
        })->values();

        $chartData = [
            ['month' => 'Mei', 'masuk' => 120, 'keluar' => 80],
            ['month' => 'Jun', 'masuk' => 180, 'keluar' => 110],
            ['month' => 'Jul', 'masuk' => 240, 'keluar' => 190],
            ['month' => 'Agu', 'masuk' => 310, 'keluar' => 220],
            ['month' => 'Sep', 'masuk' => 280, 'keluar' => 260],
            ['month' => 'Okt', 'masuk' => max(50, $totalStockIn), 'keluar' => max(30, $totalStockOut)],
        ];

        $staffMembers = User::where('role', 'staff_gudang')->get(['id', 'name', 'email'])->values();

        $warehouseNotes = WarehouseNote::with('user:id,name')
            ->orderByDesc('is_pinned')
            ->latest()
            ->get()
            ->map(fn (WarehouseNote $note) => [
                'id' => $note->id,
                'title' => $note->title,
                'content' => $note->content,
                'category' => $note->category,
                'priority' => $note->priority,
                'is_pinned' => (bool) $note->is_pinned,
                'author_name' => $note->user?->name ?? 'Staff Gudang',
                'created_at' => $note->created_at ? $note->created_at->format('d M Y, H:i') : '-',
            ]);

        // Notifikasi Cerdas & Interaktif sesuai Role untuk Navbar Lonceng
        $notificationItems = collect();

        if ($authUser && in_array($authUser->role, ['admin', 'manajer_gudang'])) {
            if ($lowStockItems->count() > 0) {
                $notificationItems->push([
                    'id' => 'notif-low-stock',
                    'title' => "{$lowStockItems->count()} Produk Stok Menipis",
                    'subtitle' => 'Jumlah stok fisik berada di bawah ambang batas minimum.',
                    'tab' => 'products',
                    'time' => 'Inventaris',
                    'type' => 'warning',
                ]);
            }

            if ($pendingInTasks->count() > 0) {
                $notificationItems->push([
                    'id' => 'notif-pending-in',
                    'title' => "{$pendingInTasks->count()} Mutasi Barang Masuk Pending",
                    'subtitle' => 'Menunggu verifikasi dan pengesahan dari Manajer/Admin.',
                    'tab' => 'transactions',
                    'time' => 'Mutasi',
                    'type' => 'info',
                ]);
            }
        } elseif ($authUser && $authUser->role === 'staff_gudang') {
            if ($pendingInTasks->count() > 0 || $pendingOutTasks->count() > 0) {
                $totPending = $pendingInTasks->count() + $pendingOutTasks->count();
                $notificationItems->push([
                    'id' => 'notif-staff-tasks',
                    'title' => "{$totPending} Tugas Mutasi Barang Pending",
                    'subtitle' => 'Periksa atau ajukan ke manajemen untuk konfirmasi resmi.',
                    'tab' => 'transactions',
                    'time' => 'Tugas',
                    'type' => 'info',
                ]);
            }
        }

        $notifications = [
            'total_unread' => $notificationItems->count(),
            'items' => $notificationItems->values()->all(),
        ];

        return [
            'stats' => [
                'total_products' => $products->count(),
                'total_stock_in' => $totalStockIn,
                'total_stock_out' => $totalStockOut,
                'total_suppliers' => $suppliers->count(),
                'today_stock_in' => $todayStockIn,
                'today_stock_out' => $todayStockOut,
                'low_stock_count' => $lowStockItems->count(),
            ],
            'chartData' => $chartData,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'products' => $products,
            'transactions' => $transactions,
            'users' => $users,
            'warehouseNotes' => $warehouseNotes,
            'staffMembers' => $staffMembers,
            'lowStockItems' => $lowStockItems,
            'pendingInTasks' => $pendingInTasks,
            'pendingOutTasks' => $pendingOutTasks,
            'pendingInvitations' => $pendingInvitations,
            'notifications' => $notifications,
            'currentUser' => $authUser ? [
                'id' => $authUser->id,
                'name' => $authUser->name,
                'email' => $authUser->email,
                'role' => $authUser->role,
                'avatar' => $authUser->avatar,
            ] : null,
            'appSettings' => Setting::getAppSettings(),
        ];
    }
}
