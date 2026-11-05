<?php

use App\Models\Category;
use App\Models\User;
use App\Services\AutoCategoryService;
use Illuminate\Http\UploadedFile;

test('auto category service suggests correct category from product name keywords', function () {
    Category::firstOrCreate(['name' => 'Perkakas & Baut'], ['description' => 'Baut dan perkakas']);
    Category::firstOrCreate(['name' => 'Peralatan & Perkakas'], ['description' => 'Peralatan mesin']);
    Category::firstOrCreate(['name' => 'Perlengkapan K3'], ['description' => 'Alat safety']);
    Category::firstOrCreate(['name' => 'Elektronik & Kelistrikan'], ['description' => 'Kabel dan panel']);
    Category::firstOrCreate(['name' => 'Kendaraan & Otomotif'], ['description' => 'Sparepart kendaraan']);
    Category::firstOrCreate(['name' => 'Sayur & Bahan Pangan'], ['description' => 'Sayuran dan bahan pangan']);

    $service = new AutoCategoryService;

    $motorResult = $service->suggestCategory('motor');
    expect($motorResult['category_name'])->toBe('Kendaraan & Otomotif');
    expect($motorResult['score'])->toBeGreaterThanOrEqual(75);

    $beatResult = $service->suggestCategory('motor honda beat');
    expect($beatResult['category_name'])->toBe('Kendaraan & Otomotif');

    $varioResult = $service->suggestCategory('sepeda motor vario 160');
    expect($varioResult['category_name'])->toBe('Kendaraan & Otomotif');

    $bautResult = $service->suggestCategory('Baut Hexagonal M8 Baja');
    expect($bautResult['category_name'])->toBeIn(['Perkakas & Baut', 'Peralatan & Perkakas']);
    expect($bautResult['score'])->toBeGreaterThanOrEqual(60);

    $kendaraanResult = $service->suggestCategory('Ban Luar Motor Tubeless 90/90 Ring 14');
    expect($kendaraanResult['category_name'])->toBe('Kendaraan & Otomotif');

    $sayurResult = $service->suggestCategory('Wortel Segar Organik 1 Kg');
    expect($sayurResult['category_name'])->toBe('Sayur & Bahan Pangan');

    $peralatanResult = $service->suggestCategory('Peralatan Mesin Gerinda Tangan 4 Inch');
    expect($peralatanResult['category_name'])->toBe('Peralatan & Perkakas');

    $k3Result = $service->suggestCategory('Helm Safety Proyek Kuning');
    expect($k3Result['category_name'])->toBe('Perlengkapan K3');

    $kabelResult = $service->suggestCategory('Kabel Tembaga NYM 3x2.5mm');
    expect($kabelResult['category_name'])->toBe('Elektronik & Kelistrikan');
});

test('auto category service detects vehicle from uploaded image filename even without product name', function () {
    Category::firstOrCreate(['name' => 'Kendaraan & Otomotif'], ['description' => 'Sparepart kendaraan']);

    $service = new AutoCategoryService;
    $fakeImage = UploadedFile::fake()->create('motor-honda-vario.jpg', 100, 'image/jpeg');

    $result = $service->suggestCategory('', $fakeImage);
    expect($result['category_name'])->toBe('Kendaraan & Otomotif');
    expect($result['score'])->toBeGreaterThanOrEqual(75);
});

test('authenticated admin can request category suggestion via endpoint', function () {
    Category::firstOrCreate(['name' => 'Perlengkapan K3'], ['description' => 'Safety tools']);

    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this
        ->actingAs($admin)
        ->postJson(route('products.suggest-category'), [
            'name' => 'Sarung Tangan Safety K3 Anti Sobek',
        ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'data' => [
                'category_name' => 'Perlengkapan K3',
                'source' => 'text_keyword',
            ],
        ]);
});

test('unauthenticated users cannot access category suggestion endpoint', function () {
    $response = $this->postJson(route('products.suggest-category'), [
        'name' => 'Baut M8',
    ]);

    $response->assertUnauthorized();
});

test('auto category service provides top 3 options matching the object', function () {
    Category::firstOrCreate(['name' => 'Kendaraan & Otomotif'], ['description' => 'Sparepart kendaraan']);
    Category::firstOrCreate(['name' => 'Peralatan & Perkakas'], ['description' => 'Peralatan mesin']);
    Category::firstOrCreate(['name' => 'Perkakas & Baut'], ['description' => 'Baut dan perkakas']);
    Category::firstOrCreate(['name' => 'Bahan Baku & Material'], ['description' => 'Material mentah']);

    $service = new AutoCategoryService;
    $result = $service->suggestCategory('Sepeda Motor Honda Vario 160');

    expect($result)->toHaveKey('options');
    expect($result['options'])->toHaveCount(3);
    expect($result['options'][0]['category_name'])->toBe('Kendaraan & Otomotif');
    expect($result['options'][0]['is_top'])->toBeTrue();
});

test('auto category service correctly classifies wortel and produce without falling into automotive', function () {
    Category::firstOrCreate(['name' => 'Kendaraan & Otomotif'], ['description' => 'Sparepart kendaraan']);
    Category::firstOrCreate(['name' => 'Sayur & Bahan Pangan'], ['description' => 'Sayuran dan bahan pangan']);

    $service = new AutoCategoryService;

    $wortelResult = $service->suggestCategory('Wortel');
    expect($wortelResult['category_name'])->toBe('Sayur & Bahan Pangan');

    $brokoliResult = $service->suggestCategory('Brokoli');
    expect($brokoliResult['category_name'])->toBe('Sayur & Bahan Pangan');
});

