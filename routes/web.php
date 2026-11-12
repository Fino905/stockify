<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductAttributeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\QuickSwitchController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\StockTransactionController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WarehouseNoteController;
use Illuminate\Support\Facades\Route;

// Menu Home sebelum login (Public Landing Page)
Route::get('/', HomeController::class)->name('home');

// Halaman Kontak Gudang
Route::get('/kontak', [ContactController::class, 'index'])->name('kontak.kami');

// Quick Role Switcher / Demo Login (Hanya aktif di environment development lokal / testing)
Route::post('/switch-role/{role}', QuickSwitchController::class)->name('switch.role');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // Khusus Admin: CRUD Produk, Kategori, Atribut, Supplier, Manajemen User, & Pengaturan Aplikasi
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::post('/products/suggest-category', [ProductController::class, 'suggestCategory'])->name('products.suggest-category');
        Route::post('/products/import', [ProductController::class, 'importCsv'])->name('products.import');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
        Route::post('/products/clean-zero-stock', [ProductController::class, 'cleanZeroStock'])->name('products.clean-zero-stock');

        Route::post('/attributes', [ProductAttributeController::class, 'store'])->name('attributes.store');
        Route::delete('/attributes/{attribute}', [ProductAttributeController::class, 'destroy'])->name('attributes.destroy');

        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
        Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
        Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.role');
        Route::put('/users/{user}', [UserController::class, 'updateRole'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::get('/users', [DashboardController::class, '__invoke'])->name('users.index');

        Route::get('/app-settings', [SettingController::class, 'index'])->name('settings.index');
        Route::match(['post', 'put', 'patch'], '/app-settings', [SettingController::class, 'update'])->name('settings.update');
    });

    // Pencatatan Transaksi Barang Masuk & Keluar: Admin, Manajer Gudang, & Staff Gudang
    // (Jika diinput oleh Staff Gudang, otomatis status 'pending' menunggu konfirmasi Manajemen/Admin)
    Route::middleware(['role:admin,manajer_gudang,staff_gudang'])->group(function () {
        Route::post('/transactions', [StockTransactionController::class, 'store'])->name('transactions.store');
    });

    // Admin & Manajer Gudang (Management): Stock Opname & Konfirmasi Pengesahan Transaksi Barang
    Route::middleware(['role:admin,manajer_gudang'])->group(function () {
        Route::post('/stock-opname', [StockTransactionController::class, 'stockOpname'])->name('stock.opname');
        Route::post('/opnames', [StockTransactionController::class, 'stockOpname'])->name('opnames.store');
        Route::match(['post', 'patch'], '/transactions/{transaction}/confirm', [StockTransactionController::class, 'confirm'])->name('transactions.confirm');
    });

    // Operasional Gudang: Khusus Staff Gudang, Manajer, Admin
    Route::middleware(['role:admin,manajer_gudang,staff_gudang'])->group(function () {
        Route::patch('/transactions/{transaction}/status', [StockTransactionController::class, 'updateStatus'])->name('transactions.status');
        Route::match(['post', 'patch'], '/transactions/{transaction}/prepare', [StockTransactionController::class, 'prepare'])->name('transactions.prepare');
        Route::match(['post', 'patch'], '/transactions/{transaction}/reject', [StockTransactionController::class, 'reject'])->name('transactions.reject');

        // Catatan Cepat Gudang (Warehouse Notes)
        Route::post('/warehouse-notes', [WarehouseNoteController::class, 'store'])->name('warehouse-notes.store');
        Route::delete('/warehouse-notes/{note}', [WarehouseNoteController::class, 'destroy'])->name('warehouse-notes.destroy');
    });

    // Helper navigasi views untuk kompatibilitas Blade template
    Route::get('/transactions', [DashboardController::class, '__invoke'])->name('transactions.index');
    Route::get('/products', [DashboardController::class, '__invoke'])->name('products.index');
    Route::get('/products/create', [DashboardController::class, '__invoke'])->name('products.create');
    Route::get('/products/{product}', [DashboardController::class, '__invoke'])->name('products.show');
    Route::get('/products/{product}/edit', [DashboardController::class, '__invoke'])->name('products.edit');
    Route::get('/products-template', [DashboardController::class, '__invoke'])->name('products.import-template');
    Route::get('/products-export', [DashboardController::class, '__invoke'])->name('products.export');
    Route::get('/suppliers', [DashboardController::class, '__invoke'])->name('suppliers.index');
    Route::get('/categories', [DashboardController::class, '__invoke'])->name('categories.index');
    Route::get('/reports', [DashboardController::class, '__invoke'])->name('reports.index');
    Route::get('/attribute-definitions', [DashboardController::class, '__invoke'])->name('attribute-definitions.index');
});

require __DIR__ . '/settings.php';
