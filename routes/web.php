<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductAttributeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\QuickSwitchController;
use App\Http\Controllers\StockTransactionController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Menu Home sebelum login (Public Landing Page)
Route::get('/', HomeController::class)->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // Quick Role Switcher (untuk pengujian instan antar akun)
    Route::post('/switch-role/{role}', QuickSwitchController::class)->name('switch.role');

    // Khusus Admin: Kategori Produk & Supplier
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
        Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
        Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.role');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    // Admin & Manajer Gudang: Produk, Atribut, dan Stock Opname
    Route::middleware(['role:admin,manajer_gudang'])->group(function () {
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::post('/products/import', [ProductController::class, 'importCsv'])->name('products.import');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

        Route::post('/attributes', [ProductAttributeController::class, 'store'])->name('attributes.store');
        Route::delete('/attributes/{attribute}', [ProductAttributeController::class, 'destroy'])->name('attributes.destroy');

        Route::post('/stock-opname', [StockTransactionController::class, 'stockOpname'])->name('stock.opname');
    });

    // Transaksi Stok (Masuk & Keluar) & Konfirmasi: Khusus Staff Gudang, Manajer, Admin
    Route::middleware(['role:admin,manajer_gudang,staff_gudang'])->group(function () {
        Route::post('/transactions', [StockTransactionController::class, 'store'])->name('transactions.store');
        Route::patch('/transactions/{transaction}/status', [StockTransactionController::class, 'updateStatus'])->name('transactions.status');
        Route::patch('/transactions/{transaction}/confirm', [StockTransactionController::class, 'confirm'])->name('transactions.confirm');
        Route::patch('/refunds/{refund}/process', [OrderController::class, 'processRefund'])->name('refunds.process');
    });

    // Customer: Pembelian, Simulasi Pembayaran, Feedback, & Pengajuan Refund
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::post('/orders/{order}/feedback', [OrderController::class, 'submitFeedback'])->name('orders.feedback');
    Route::post('/orders/{order}/refund', [OrderController::class, 'requestRefund'])->name('orders.refund');
});

require __DIR__.'/settings.php';
