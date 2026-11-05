<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Services\ProductService;

beforeEach(function () {
    $this->category = Category::firstOrCreate(['name' => 'Peralatan & Perkakas']);
    $this->admin = User::firstOrCreate(
        ['email' => 'admin_test@stockify.test'],
        ['name' => 'Admin Test', 'password' => bcrypt('password'), 'role' => 'admin']
    );
});

test('produk dengan stok 0 lebih dari 3 hari otomatis terhapus', function () {
    $productService = app(ProductService::class);

    // Produk 1: Stok 0 sejak 4 hari lalu (harus terhapus)
    $staleProduct = Product::create([
        'name' => 'Baut Bekas Lama',
        'sku' => 'TEST-DEL-001',
        'category_id' => $this->category->id,
        'purchase_price' => 1000,
        'selling_price' => 2000,
        'minimum_stock' => 5,
        'zero_stock_since' => now()->subDays(4),
    ]);

    // Produk 2: Stok 0 baru 1 hari lalu (tidak boleh terhapus)
    $freshZeroProduct = Product::create([
        'name' => 'Mur Baru Habis',
        'sku' => 'TEST-KEEP-002',
        'category_id' => $this->category->id,
        'purchase_price' => 1000,
        'selling_price' => 2000,
        'minimum_stock' => 5,
        'zero_stock_since' => now()->subDays(1),
    ]);

    // Jalankan auto-delete
    $result = $productService->autoDeleteZeroStockProducts(3);

    expect($result['deleted_count'])->toBe(1)
        ->and($result['deleted_products'])->toContain('Baut Bekas Lama')
        ->and(Product::find($staleProduct->id))->toBeNull()
        ->and(Product::find($freshZeroProduct->id))->not->toBeNull();

    // Bersihkan
    $freshZeroProduct->delete();
});

test('artisan command products:delete-zero-stock berhasil menghapus produk kadaluarsa', function () {
    $staleProduct = Product::create([
        'name' => 'Barang Rusak 0 Stok',
        'sku' => 'TEST-CMD-003',
        'category_id' => $this->category->id,
        'purchase_price' => 5000,
        'selling_price' => 7000,
        'minimum_stock' => 5,
        'zero_stock_since' => now()->subDays(5),
    ]);

    $this->artisan('products:delete-zero-stock --days=3')
        ->assertExitCode(0);

    expect(Product::find($staleProduct->id))->toBeNull();
});

test('admin dapat menjalankan pembersihan stok nol via route clean-zero-stock', function () {
    $staleProduct = Product::create([
        'name' => 'Produk Usang Stok Nol',
        'sku' => 'TEST-ROUTE-004',
        'category_id' => $this->category->id,
        'purchase_price' => 5000,
        'selling_price' => 7000,
        'minimum_stock' => 5,
        'zero_stock_since' => now()->subDays(4),
    ]);

    $response = $this->actingAs($this->admin)
        ->post(route('products.clean-zero-stock'));

    $response->assertSessionHas('success');
    expect(Product::find($staleProduct->id))->toBeNull();
});
