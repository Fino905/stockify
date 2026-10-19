<?php

namespace App\Http\Controllers;

use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\StockTransactionRepositoryInterface;
use App\Repositories\Contracts\SupplierRepositoryInterface;
use Illuminate\Http\Request;
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
        return Inertia::render('welcome', [
            'totalProducts' => $this->productRepository->count(),
            'totalSuppliers' => $this->supplierRepository->count(),
            'totalStockIn' => $this->transactionRepository->getTotalQuantityByType('in', 'completed'),
            'totalStockOut' => $this->transactionRepository->getTotalQuantityByType('out', 'completed'),
            'canLogin' => true,
        ]);
    }
}
