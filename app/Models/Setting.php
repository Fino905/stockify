<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Dapatkan nilai pengaturan berdasarkan key.
     */
    public static function valueFor(string $key, mixed $default = null): mixed
    {
        return Cache::remember("setting_{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();

            return $setting ? $setting->value : $default;
        });
    }

    /**
     * Simpan atau perbarui nilai pengaturan.
     */
    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );

        Cache::forget("setting_{$key}");
        Cache::forget('all_app_settings');
    }

    /**
     * Dapatkan semua pengaturan dalam bentuk array key => value.
     *
     * @return array<string, mixed>
     */
    public static function allKeyed(): array
    {
        return Cache::remember('all_app_settings', 3600, function () {
            return static::pluck('value', 'key')->toArray();
        });
    }

    /**
     * Dapatkan URL atau representasi logo aplikasi yang siap ditampilkan di UI.
     */
    public static function getLogoUrl(): ?string
    {
        $raw = static::valueFor('logo');
        if (! $raw) {
            return null;
        }

        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://') || str_starts_with($raw, 'data:') || str_starts_with($raw, 'emoji:')) {
            return $raw;
        }

        if (str_starts_with($raw, '/storage/')) {
            return $raw;
        }

        if (str_starts_with($raw, 'storage/')) {
            return '/'.$raw;
        }

        return Storage::disk('public')->url($raw);
    }

    /**
     * Dapatkan konfigurasi identitas aplikasi lengkap untuk frontend & backend.
     *
     * @return array<string, mixed>
     */
    public static function getAppSettings(): array
    {
        $groqKey = static::valueFor('groq_api_key') ?: config('services.groq.api_key') ?: env('GROQ_API_KEY');

        return [
            'appName' => (string) static::valueFor('app_name', 'Stockify'),
            'warehouseName' => (string) static::valueFor('warehouse_name', 'Gudang Pusat Logistik Cikarang'),
            'contact' => (string) static::valueFor('contact', static::valueFor('contact_phone', '021-8976500')),
            'email' => (string) static::valueFor('email', static::valueFor('contact_email', 'admin@stockify.test')),
            'address' => (string) static::valueFor('address', static::valueFor('warehouse_address', 'Kawasan Industri GIIC Blok AA No. 1, Cikarang Pusat')),
            'appInfo' => (string) static::valueFor('app_info', 'Kelola produk, pantau stok, dan bantu tim gudang bekerja lebih kompak—semuanya dalam satu tempat yang nyaman dipakai.'),
            'logo' => static::getLogoUrl(),
            'hasGroqKey' => ! empty($groqKey),
            'groqVisionModel' => (string) (config('services.groq.vision_model') ?: env('GROQ_VISION_MODEL', 'qwen/qwen3.8-27b')),
        ];
    }
}
