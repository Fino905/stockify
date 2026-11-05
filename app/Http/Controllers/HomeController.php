<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Setting;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\StockTransactionRepositoryInterface;
use App\Repositories\Contracts\SupplierRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        protected ProductRepositoryInterface $productRepository,
        protected SupplierRepositoryInterface $supplierRepository,
        protected StockTransactionRepositoryInterface $transactionRepository
    ) {}

    public function __invoke(Request $request): Response
    {
        $appSettings = Setting::getAppSettings();

        $featuredProducts = $this->productRepository->getAllWithRelations()
            ->map(function ($p) {
                $imageUrl = $p->image_url;
                if (! $imageUrl && $p->image) {
                    if (str_starts_with($p->image, 'http://') || str_starts_with($p->image, 'https://') || str_starts_with($p->image, 'data:')) {
                        $imageUrl = $p->image;
                    } elseif (str_starts_with($p->image, '/storage/')) {
                        $imageUrl = $p->image;
                    } elseif (str_starts_with($p->image, 'storage/')) {
                        $imageUrl = '/'.$p->image;
                    } else {
                        $imageUrl = Storage::url($p->image);
                    }
                }

                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'category_name' => $p->category?->name ?? 'Umum',
                    'selling_price' => (float) $p->selling_price,
                    'current_stock' => (int) $p->current_stock,
                    'minimum_stock' => (int) $p->minimum_stock,
                    'image' => $imageUrl,
                ];
            });

        $categories = Category::withCount('products')->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'products_count' => $c->products_count,
            ];
        });

        return Inertia::render('welcome', [
            'totalProducts' => $this->productRepository->count(),
            'totalSuppliers' => $this->supplierRepository->count(),
            'totalStockIn' => $this->transactionRepository->getTotalQuantityByType('in', 'completed'),
            'totalStockOut' => $this->transactionRepository->getTotalQuantityByType('out', 'completed'),
            'canLogin' => true,
            'appSettings' => $appSettings,
            'featuredProducts' => $featuredProducts,
            'categories' => $categories,
        ]);
    }
}
