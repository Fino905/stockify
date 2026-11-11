<?php

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('landing page renders featured products with normalized image url', function () {
    $category = Category::create([
        'name' => 'Kendaraan & Otomotif',
    ]);

    $productWithStorage = Product::create([
        'category_id' => $category->id,
        'name' => 'fu 120',
        'sku' => 'PRD-01',
        'image' => '/storage/products/GLBH81WBSk1HWGJz6laktEk2bnVaUT7z02o5kQeQ.jpg',
        'purchase_price' => 450000000,
        'selling_price' => 500000000,
        'minimum_stock' => 10,
    ]);

    expect($productWithStorage->image_url)->toBe('/storage/products/GLBH81WBSk1HWGJz6laktEk2bnVaUT7z02o5kQeQ.jpg');

    $response = $this->get(route('home'));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('welcome')
        ->has('featuredProducts', 1)
        ->where('featuredProducts.0.name', 'fu 120')
        ->where('featuredProducts.0.image', '/storage/products/GLBH81WBSk1HWGJz6laktEk2bnVaUT7z02o5kQeQ.jpg')
    );
});

test('login page renders with appSettings and canResetPassword', function () {
    $response = $this->get(route('login'));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/login')
        ->has('appSettings')
    );
});

test('login blade view renders with landing page blue theme and 3 demo roles', function () {
    $view = $this->view('auth.login', [
        'canResetPassword' => true,
        'appSettings' => [
            'appName' => 'Stockify Test',
            'warehouseName' => 'Gudang Pusat Logistik',
            'logo' => null,
        ],
    ]);

    $view->assertSee('Stockify Test');
    $view->assertSee('role-tab-admin');
    $view->assertSee('role-tab-manajer');
    $view->assertSee('role-tab-staff');
    $view->assertDontSee('role-tab-customer');
    $view->assertSee('from-blue-600 to-indigo-600');
    $view->assertSee('1-Klik (Admin)');
    $view->assertSee('Daftar Akun Staff Gudang');
});

test('register blade view renders with landing page blue theme and staff registration', function () {
    $view = $this->view('auth.register', [
        'appSettings' => [
            'appName' => 'Stockify Test',
            'warehouseName' => 'Gudang Pusat Logistik',
            'logo' => null,
        ],
    ]);

    $view->assertSee('Stockify Test');
    $view->assertSee('Daftar Akun Staff Gudang');
    $view->assertSee('hidden lg:flex lg:w-1/2');
    $view->assertSee('Warehouse Portal');
    $view->assertDontSee('Customer Portal');
    $view->assertSee('from-blue-600 to-indigo-600');
    $view->assertSee('Kembali ke Beranda');
    $view->assertSee('Masuk ke Sistem');
});
