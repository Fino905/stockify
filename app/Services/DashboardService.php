<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderFeedback;
use App\Models\OrderRefund;
use App\Models\TeamInvitation;
use App\Models\User;
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
        protected UserRepositoryInterface $userRepository
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

        $feedbacksGrouped = OrderFeedback::with('user')->get()->groupBy('product_id');

        $rawProducts = $this->productRepository->getAllWithRelations();
        $products = $rawProducts->map(function ($product) use ($feedbacksGrouped) {
            $productFeedbacks = $feedbacksGrouped->get($product->id, collect());
            $avgRating = $productFeedbacks->isNotEmpty() ? round($productFeedbacks->avg('rating'), 1) : 5.0;
            $reviewsCount = $productFeedbacks->count();

            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'description' => $product->description,
                'purchase_price' => (float) $product->purchase_price,
                'selling_price' => (float) $product->selling_price,
                'minimum_stock' => (int) $product->minimum_stock,
                'current_stock' => (int) $product->current_stock,
                'category_id' => $product->category_id,
                'category_name' => $product->category?->name ?? 'Tanpa Kategori',
                'supplier_id' => $product->supplier_id,
                'supplier_name' => $product->supplier?->name ?? 'Tanpa Supplier',
                'avg_rating' => $avgRating,
                'reviews_count' => $reviewsCount,
                'reviews' => $productFeedbacks->map(fn ($f) => [
                    'id' => $f->id,
                    'rating' => (int) $f->rating,
                    'comment' => $f->comment,
                    'user_name' => $f->user?->name ?? 'Pelanggan',
                    'date' => $f->created_at?->format('d M Y') ?? '-',
                ])->values()->all(),
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

        $users = $this->userRepository->getAll();

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

        $ordersQuery = Order::with(['product.category', 'user', 'staff', 'feedback', 'refund']);
        if ($authUser && $authUser->role === 'customer') {
            $ordersQuery->where('user_id', $authUser->id);
        }
        $orders = $ordersQuery->latest()->get()->map(function ($ord) {
            return [
                'id' => $ord->id,
                'order_number' => $ord->order_number,
                'user_id' => $ord->user_id,
                'customer_name' => $ord->user?->name ?? 'Pelanggan',
                'customer_email' => $ord->user?->email ?? '-',
                'product_id' => $ord->product_id,
                'product_name' => $ord->product?->name ?? 'Produk Dihapus',
                'product_sku' => $ord->product?->sku ?? '-',
                'category_name' => $ord->product?->category?->name ?? 'Tanpa Kategori',
                'staff_id' => $ord->staff_id,
                'staff_name' => $ord->staff?->name ?? 'Staff Gudang',
                'quantity' => (int) $ord->quantity,
                'unit_price' => (float) $ord->unit_price,
                'total_price' => (float) $ord->total_price,
                'payment_method' => $ord->payment_method,
                'payment_status' => $ord->payment_status,
                'payment_reference' => $ord->payment_reference,
                'order_status' => $ord->order_status,
                'notes' => $ord->notes,
                'created_at' => $ord->created_at ? $ord->created_at->format('d M Y, H:i') : '-',
                'feedback' => $ord->feedback ? [
                    'id' => $ord->feedback->id,
                    'rating' => (int) $ord->feedback->rating,
                    'comment' => $ord->feedback->comment,
                    'created_at' => $ord->feedback->created_at ? $ord->feedback->created_at->format('d M Y') : '-',
                ] : null,
                'refund' => $ord->refund ? [
                    'id' => $ord->refund->id,
                    'reason' => $ord->refund->reason,
                    'description' => $ord->refund->description,
                    'status' => $ord->refund->status,
                    'admin_notes' => $ord->refund->admin_notes,
                    'processor_name' => $ord->refund->processor?->name ?? '-',
                    'created_at' => $ord->refund->created_at ? $ord->refund->created_at->format('d M Y, H:i') : '-',
                ] : null,
            ];
        })->values();

        $refundRequests = OrderRefund::with(['order.product', 'order.user', 'user', 'processor'])
            ->latest()
            ->get()
            ->map(function ($ref) {
                return [
                    'id' => $ref->id,
                    'order_id' => $ref->order_id,
                    'order_number' => $ref->order?->order_number ?? '-',
                    'product_name' => $ref->order?->product?->name ?? '-',
                    'quantity' => (int) ($ref->order?->quantity ?? 0),
                    'total_price' => (float) ($ref->order?->total_price ?? 0),
                    'customer_name' => $ref->user?->name ?? 'Pelanggan',
                    'customer_email' => $ref->user?->email ?? '-',
                    'reason' => $ref->reason,
                    'description' => $ref->description,
                    'status' => $ref->status,
                    'admin_notes' => $ref->admin_notes,
                    'processor_name' => $ref->processor?->name ?? '-',
                    'created_at' => $ref->created_at ? $ref->created_at->format('d M Y, H:i') : '-',
                ];
            })->values();

        $staffMembers = User::where('role', 'staff_gudang')->get(['id', 'name', 'email'])->values();

        return [
            'stats' => [
                'total_products' => $products->count(),
                'total_stock_in' => $totalStockIn,
                'total_stock_out' => $totalStockOut,
                'total_suppliers' => $suppliers->count(),
                'today_stock_in' => $todayStockIn,
                'today_stock_out' => $todayStockOut,
                'low_stock_count' => $lowStockItems->count(),
                'total_orders' => $orders->count(),
                'pending_refunds_count' => $refundRequests->where('status', 'pending')->count(),
            ],
            'chartData' => $chartData,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'products' => $products,
            'transactions' => $transactions,
            'users' => $users,
            'orders' => $orders,
            'refundRequests' => $refundRequests,
            'staffMembers' => $staffMembers,
            'lowStockItems' => $lowStockItems,
            'pendingInTasks' => $pendingInTasks,
            'pendingOutTasks' => $pendingOutTasks,
            'pendingInvitations' => $pendingInvitations,
            'currentUser' => $authUser ? [
                'id' => $authUser->id,
                'name' => $authUser->name,
                'email' => $authUser->email,
                'role' => $authUser->role,
            ] : null,
        ];
    }
}
