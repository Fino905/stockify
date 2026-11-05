<?php

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ViewErrorBag;
use Inertia\Testing\AssertableInertia as Assert;

test('admin can update application logo and name via app-settings route', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post(route('settings.update'), [
        'appName' => 'Stockify Pro',
        'warehouseName' => 'Gudang Utama Jakarta',
        'logo_url' => 'emoji:🚀',
    ]);

    $response->assertRedirect();
    expect(Setting::valueFor('app_name'))->toBe('Stockify Pro');
    expect(Setting::valueFor('logo'))->toBe('emoji:🚀');
    expect(Setting::getLogoUrl())->toBe('emoji:🚀');
});

test('admin can upload custom image logo via app-settings route', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'admin']);
    $file = UploadedFile::fake()->create('custom_logo.png', 100, 'image/png');

    $response = $this->actingAs($admin)->post(route('settings.update'), [
        'appName' => 'Stockify Warehouse',
        'logo' => $file,
    ]);

    $response->assertRedirect();
    $savedLogo = Setting::valueFor('logo');
    expect($savedLogo)->not->toBeNull();
    Storage::disk('public')->assertExists($savedLogo);
    expect(Setting::getLogoUrl())->toBe(Storage::disk('public')->url($savedLogo));
});

test('landing page reflects dynamic logo and app settings', function () {
    Setting::set('app_name', 'Stockify Express');
    Setting::set('logo', 'emoji:💎');

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('welcome')
        ->where('appSettings.appName', 'Stockify Express')
        ->where('appSettings.logo', 'emoji:💎')
    );
});

test('login page inertia component reflects dynamic logo and app settings', function () {
    Setting::set('app_name', 'Stockify Enterprise');
    Setting::set('logo', 'emoji:⚡');

    $response = $this->get(route('login'));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/login')
        ->where('appSettings.appName', 'Stockify Enterprise')
        ->where('appSettings.logo', 'emoji:⚡')
    );
});

test('login blade view renders dynamic logo and app settings', function () {
    Setting::set('app_name', 'Stockify Super');
    Setting::set('logo', 'emoji:⚡');

    $html = view('auth.login', [
        'canResetPassword' => true,
        'status' => null,
        'teamInvitation' => null,
        'errors' => new ViewErrorBag,
        'appSettings' => Setting::getAppSettings(),
    ])->render();

    expect($html)->toContain('Stockify Super');
    expect($html)->toContain('⚡');
});

test('admin can remove logo and reset to default', function () {
    Setting::set('logo', 'emoji:⚡');
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post(route('settings.update'), [
        'remove_logo' => true,
    ]);

    $response->assertRedirect();
    expect(Setting::valueFor('logo'))->toBeNull();
    expect(Setting::getLogoUrl())->toBeNull();
});
