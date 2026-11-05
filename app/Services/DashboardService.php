<?php

namespace App\Services;

use App\Models\CashTransaction;
use App\Models\Order;
use App\Models\OrderFeedback;
use App\Models\OrderRefund;
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
        $isCustomer = ($authUser && $authUser->role === 'customer');
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
        $rawSuppliers = $this->supplierRepository->getAllWithProductsCount();
        $suppliers = $isCustomer
            ? $rawSuppliers->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'products_count' => $s->products_count ?? 0,
            ])
            : $rawSuppliers;

        $feedbacksGrouped = OrderFeedback::with('user')->get()->groupBy('product_id');

        $rawProducts = $this->productRepository->getAllWithRelations();
        $products = $rawProducts->map(function ($product) use ($feedbacksGrouped, $isCustomer) {
            $productFeedbacks = $feedbacksGrouped->get($product->id, collect());
            $avgRating = $productFeedbacks->isNotEmpty() ? round($productFeedbacks->avg('rating'), 1) : 5.0;
            $reviewsCount = $productFeedbacks->count();

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
                // Lindungi harga modal rahasia dari pelanggan
                'purchase_price' => $isCustomer ? 0.0 : (float) $product->purchase_price,
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

        $transactions = $isCustomer
            ? collect([])
            : $this->transactionRepository->getAllWithRelations()->map(function ($trx) {
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

        $ordersQuery = Order::with(['product.category', 'user', 'staff', 'feedback', 'refund.processor', 'refund.goodsReceiver', 'messages.sender']);
        if ($authUser && $authUser->role === 'customer') {
            $ordersQuery->where('user_id', $authUser->id);
        }
        $orders = $ordersQuery->latest()->get()->map(function ($ord) {
            $isPastThreeDays = $ord->created_at ? now()->diffInDays($ord->created_at) > 3 : false;
            return [
                'id' => $ord->id,
                'order_number' => $ord->order_number,
                'user_id' => $ord->user_id,
                'customer_name' => $ord->user?->name ?? 'Pelanggan',
                'customer_email' => $ord->user?->email ?? '-',
                'product_id' => $ord->product_id,
                'product_name' => $ord->product?->name ?? 'Produk Dihapus',
                'product_sku' => $ord->product?->sku ?? '-',
                'product_image' => $ord->product?->image,
                'category_name' => $ord->product?->category?->name ?? 'Tanpa Kategori',
                'staff_id' => $ord->staff_id,
                'staff_name' => $ord->staff?->name ?? 'Staff Gudang',
                'quantity' => (int) $ord->quantity,
                'unit_price' => (float) $ord->unit_price,
                'total_price' => (float) $ord->total_price,
                'payment_method' => $ord->payment_method,
                'payment_status' => $ord->payment_status,
                'payment_reference' => $ord->payment_reference,
                'payment_proof' => $ord->payment_proof,
                'order_status' => $ord->order_status,
                'shipping_courier' => $ord->shipping_courier,
                'tracking_number' => $ord->tracking_number,
                'shipped_at' => $ord->shipped_at ? $ord->shipped_at->format('d M Y, H:i') : null,
                'received_at' => $ord->received_at ? $ord->received_at->format('d M Y, H:i') : null,
                'notes' => $ord->notes,
                'created_at' => $ord->created_at ? $ord->created_at->format('d M Y, H:i') : '-',
                'created_at_raw' => $ord->created_at ? $ord->created_at->toISOString() : null,
                'is_past_three_days' => $isPastThreeDays,
                'messages' => $ord->messages->map(fn ($m) => [
                    'id' => $m->id,
                    'order_id' => $m->order_id,
                    'sender_id' => $m->sender_id,
                    'sender_name' => $m->sender?->name ?? 'Pengguna',
                    'sender_role' => $m->sender?->role ?? 'customer',
                    'message' => $m->message,
                    'created_at' => $m->created_at ? $m->created_at->format('H:i, d M Y') : '-',
                ])->values(),
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
                    'damage_image' => $ord->refund->damage_image,
                    'refund_transfer_proof' => $ord->refund->refund_transfer_proof,
                    'status' => $ord->refund->status,
                    'return_tracking_number' => $ord->refund->return_tracking_number,
                    'goods_received_by' => $ord->refund->goods_received_by,
                    'goods_received_at' => $ord->refund->goods_received_at ? $ord->refund->goods_received_at->format('d M Y, H:i') : null,
                    'goods_condition_notes' => $ord->refund->goods_condition_notes,
                    'goods_condition_status' => $ord->refund->goods_condition_status,
                    'is_restocked' => (bool) $ord->refund->is_restocked,
                    'quarantine_disposition' => $ord->refund->quarantine_disposition,
                    'quarantine_reference' => $ord->refund->quarantine_reference,
                    'goods_receiver_name' => $ord->refund->goodsReceiver?->name ?? null,
                    'admin_notes' => $ord->refund->admin_notes,
                    'processor_name' => $ord->refund->processor?->name ?? '-',
                    'created_at' => $ord->refund->created_at ? $ord->refund->created_at->format('d M Y, H:i') : '-',
                ] : null,
            ];
        })->values();

        $refundRequestsQuery = OrderRefund::with(['order.product', 'order.user', 'user', 'processor', 'goodsReceiver']);
        $refundRequestsQuery = OrderRefund::with(['order.product.supplier', 'order.user', 'user', 'processor', 'goodsReceiver', 'quarantineProcessor']);
        if ($isCustomer && $authUser) {
            $refundRequestsQuery->where('user_id', $authUser->id);
        }
        $refundRequests = $refundRequestsQuery
            ->latest()
            ->get()
            ->map(function ($ref) {
                return [
                    'id' => $ref->id,
                    'order_id' => $ref->order_id,
                    'order_number' => $ref->order?->order_number ?? '-',
                    'product_name' => $ref->order?->product?->name ?? '-',
                    'supplier_name' => $ref->order?->product?->supplier?->name ?? 'Supplier Pabrik',
                    'supplier_contact' => $ref->order?->product?->supplier?->phone ?? $ref->order?->product?->supplier?->email ?? '-',
                    'quantity' => (int) ($ref->order?->quantity ?? 0),
                    'total_price' => (float) ($ref->order?->total_price ?? 0),
                    'customer_name' => $ref->user?->name ?? 'Pelanggan',
                    'customer_email' => $ref->user?->email ?? '-',
                    'reason' => $ref->reason,
                    'description' => $ref->description,
                    'damage_image' => $ref->damage_image,
                    'refund_transfer_proof' => $ref->refund_transfer_proof,
                    'status' => $ref->status,
                    'return_tracking_number' => $ref->return_tracking_number,
                    'goods_received_by' => $ref->goods_received_by,
                    'goods_received_at' => $ref->goods_received_at ? $ref->goods_received_at->format('d M Y, H:i') : null,
                    'goods_condition_notes' => $ref->goods_condition_notes,
                    'goods_condition_status' => $ref->goods_condition_status,
                    'is_restocked' => (bool) $ref->is_restocked,
                    'quarantine_disposition' => $ref->quarantine_disposition,
                    'quarantine_reference' => $ref->quarantine_reference,
                    'quarantine_notes' => $ref->quarantine_notes,
                    'quarantine_processor_name' => $ref->quarantineProcessor?->name ?? null,
                    'quarantine_processed_at' => $ref->quarantine_processed_at ? $ref->quarantine_processed_at->format('d M Y, H:i') : null,
                    'goods_receiver_name' => $ref->goodsReceiver?->name ?? null,
                    'admin_notes' => $ref->admin_notes,
                    'processor_name' => $ref->processor?->name ?? '-',
                    'created_at' => $ref->created_at ? $ref->created_at->format('d M Y, H:i') : '-',
                ];
            })->values();

        $staffMembers = User::where('role', 'staff_gudang')->get(['id', 'name', 'email'])->values();

        $warehouseNotes = $isCustomer
            ? collect([])
            : WarehouseNote::with('user:id,name')
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

        // Buku Kas / Arus Kas: Catatan Kas Masuk (Penjualan, Modal) & Kas Keluar (Operasional, Supplier, Refund)
        $cashTransactions = $isCustomer 
            ? collect([]) 
            : CashTransaction::with(['user:id,name,role', 'order:id,order_number'])->latest('date')->latest('id')->get()->map(function ($c) {
                return [
                    'id' => $c->id,
                    'transaction_number' => $c->transaction_number,
                    'type' => $c->type,
                    'category' => $c->category,
                    'amount' => (float) $c->amount,
                    'date' => $c->date ? $c->date->format('Y-m-d') : '',
                    'date_formatted' => $c->date ? $c->date->format('d M Y') : '-',
                    'description' => $c->description,
                    'proof_image' => $c->proof_image,
                    'notes' => $c->notes,
                    'user_name' => $c->user?->name ?? 'Sistem',
                    'order_id' => $c->order_id,
                    'order_number' => $c->order?->order_number ?? null,
                    'created_at' => $c->created_at ? $c->created_at->format('d M Y, H:i') : '-',
                ];
            })->values();

        $totalCashIn = $cashTransactions->where('type', 'in')->sum('amount');
        $totalCashOut = $cashTransactions->where('type', 'out')->sum('amount');
        $netCashBalance = $totalCashIn - $totalCashOut;

        $today = now()->toDateString();
        $thisMonth = now()->format('Y-m');

        $todayCashIn = $cashTransactions->where('type', 'in')->where('date', $today)->sum('amount');
        $todayCashOut = $cashTransactions->where('type', 'out')->where('date', $today)->sum('amount');

        $monthCashIn = $cashTransactions->filter(fn ($c) => $c['type'] === 'in' && str_starts_with($c['date'], $thisMonth))->sum('amount');
        $monthCashOut = $cashTransactions->filter(fn ($c) => $c['type'] === 'out' && str_starts_with($c['date'], $thisMonth))->sum('amount');

        // Notifikasi Cerdas & Interaktif sesuai Role untuk Navbar Lonceng
        $notificationItems = collect();

        if ($authUser && in_array($authUser->role, ['admin', 'manajer_gudang'])) {
            $pendingOrders = $orders->where('order_status', 'pending_confirmation');
            if ($pendingOrders->count() > 0) {
                $notificationItems->push([
                    'id' => 'notif-pending-orders',
                    'title' => "{$pendingOrders->count()} Pesanan Menunggu Konfirmasi",
                    'subtitle' => 'Pelanggan telah transfer simulasi, butuh konfirmasi stok.',
                    'tab' => 'orders_management',
                    'time' => 'Perlu Tindakan',
                    'type' => 'alert',
                ]);
            }

            $processingOrders = $orders->where('order_status', 'processing');
            if ($processingOrders->count() > 0) {
                $notificationItems->push([
                    'id' => 'notif-processing-orders',
                    'title' => "{$processingOrders->count()} Pesanan Sedang Dikemas",
                    'subtitle' => 'Siap diserahkan ke kurir beserta input nomor resi.',
                    'tab' => 'orders_management',
                    'time' => 'Gudang',
                    'type' => 'info',
                ]);
            }

            $pendingRefunds = $refundRequests->where('status', 'pending');
            if ($pendingRefunds->count() > 0) {
                $notificationItems->push([
                    'id' => 'notif-pending-refunds',
                    'title' => "{$pendingRefunds->count()} Klaim Refund Baru",
                    'subtitle' => 'Pelanggan mengajukan bukti kerusakan fisik barang.',
                    'tab' => 'refunds_management',
                    'time' => 'Penting',
                    'type' => 'warning',
                ]);
            }

            $receivedGoodsRefunds = $refundRequests->where('status', 'goods_received');
            if ($receivedGoodsRefunds->count() > 0) {
                $notificationItems->push([
                    'id' => 'notif-payout-refunds',
                    'title' => "{$receivedGoodsRefunds->count()} Retur Tiba, Butuh Transfer Refund",
                    'subtitle' => 'Fisik barang telah diverifikasi staf gudang & direstok.',
                    'tab' => 'refunds_management',
                    'time' => 'Transfer',
                    'type' => 'success',
                ]);
            }

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
            $packingOrders = $orders->where('order_status', 'processing');
            if ($packingOrders->count() > 0) {
                $notificationItems->push([
                    'id' => 'notif-staff-pack',
                    'title' => "{$packingOrders->count()} Pesanan Siap Dikemas & Dikirim",
                    'subtitle' => 'Input kurir ekspedisi dan nomor resi pengiriman.',
                    'tab' => 'orders_management',
                    'time' => 'Tugas Staf',
                    'type' => 'info',
                ]);
            }

            $shippedReturns = $refundRequests->where('status', 'return_shipped');
            if ($shippedReturns->count() > 0) {
                $notificationItems->push([
                    'id' => 'notif-staff-return-check',
                    'title' => "{$shippedReturns->count()} Paket Retur Menuju Gudang",
                    'subtitle' => 'Periksa kondisi fisik barang saat kurir tiba di gudang.',
                    'tab' => 'refunds_management',
                    'time' => 'Pemeriksaan',
                    'type' => 'warning',
                ]);
            }

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
        } elseif ($authUser && $authUser->role === 'customer') {
            $customerShipped = $orders->where('order_status', 'shipped');
            if ($customerShipped->count() > 0) {
                $notificationItems->push([
                    'id' => 'notif-cust-shipped',
                    'title' => "{$customerShipped->count()} Pesanan Sedang Dikirimkan!",
                    'subtitle' => 'Cek kurir & nomor resi, lalu konfirmasi jika paket diterima.',
                    'tab' => 'my_orders',
                    'time' => 'Dalam Perjalanan',
                    'type' => 'info',
                ]);
            }

            $customerReturnApproved = $orders->filter(fn ($o) => ($o['refund']['status'] ?? null) === 'return_approved');
            if ($customerReturnApproved->count() > 0) {
                $notificationItems->push([
                    'id' => 'notif-cust-return-approved',
                    'title' => 'Klaim Retur Anda Disetujui!',
                    'subtitle' => 'Silakan kirimkan barang fisik ke gudang & masukkan no. resi.',
                    'tab' => 'my_orders',
                    'time' => 'Kirim Barang',
                    'type' => 'warning',
                ]);
            }

            $customerRefundDone = $orders->filter(fn ($o) => ($o['refund']['status'] ?? null) === 'approved');
            if ($customerRefundDone->count() > 0) {
                $notificationItems->push([
                    'id' => 'notif-cust-refund-done',
                    'title' => 'Dana Refund Telah Ditransfer!',
                    'subtitle' => 'Pihak manajemen telah mengirimkan bukti transfer pengembalian dana.',
                    'tab' => 'my_orders',
                    'time' => 'Selesai',
                    'type' => 'success',
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
                'total_orders' => $orders->count(),
                'pending_refunds_count' => $refundRequests->where('status', 'pending')->count(),
                'total_cash_in' => $totalCashIn,
                'total_cash_out' => $totalCashOut,
                'net_cash_balance' => $netCashBalance,
                'month_cash_in' => $monthCashIn,
                'month_cash_out' => $monthCashOut,
                'today_cash_in' => $todayCashIn,
                'today_cash_out' => $todayCashOut,
            ],
            'chartData' => $chartData,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'products' => $products,
            'transactions' => $transactions,
            'users' => $users,
            'orders' => $orders,
            'warehouseNotes' => $warehouseNotes,
            'cashTransactions' => $cashTransactions,
            'refundRequests' => $refundRequests,
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
