<?php

namespace Database\Seeders;

use App\Actions\Teams\CreateTeam;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StockifySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Akun Pengguna Demo untuk tiap Role
        $admin = User::firstOrCreate(
            ['email' => 'admin@stockify.test'],
            [
                'name' => 'Admin Utama',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $manajer = User::firstOrCreate(
            ['email' => 'manajer@stockify.test'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('password'),
                'role' => 'manajer_gudang',
                'email_verified_at' => now(),
            ]
        );

        // Alias email untuk manajer
        $managerAlias = User::firstOrCreate(
            ['email' => 'manager@stockify.test'],
            [
                'name' => 'Budi Santoso (Manager)',
                'password' => Hash::make('password'),
                'role' => 'manajer_gudang',
                'email_verified_at' => now(),
            ]
        );

        $staff = User::firstOrCreate(
            ['email' => 'staff@stockify.test'],
            [
                'name' => 'Ahmad Fauzi',
                'password' => Hash::make('password'),
                'role' => 'staff_gudang',
                'email_verified_at' => now(),
            ]
        );

        // Buat tim personal untuk setiap user demo jika belum memiliki
        $createTeam = app(CreateTeam::class);
        foreach ([$admin, $manajer, $managerAlias, $staff] as $u) {
            if (! $u->current_team_id) {
                $team = $createTeam->handle($u, $u->name."'s Team", isPersonal: true);
                $u->update(['current_team_id' => $team->id]);
            }
        }

        // 2. Kategori Produk Awal
        $cat1 = Category::firstOrCreate(['name' => 'Bahan Baku & Material'], ['description' => 'Logam, besi, plat, kayu, dan material mentah pabrik']);
        $cat2 = Category::firstOrCreate(['name' => 'Peralatan & Perkakas'], ['description' => 'Peralatan teknik, pertukangan, mesin, dan baut']);
        $cat3 = Category::firstOrCreate(['name' => 'Elektronik & Kelistrikan'], ['description' => 'Kabel, trafo, breaker, dan komponen panel']);
        $cat4 = Category::firstOrCreate(['name' => 'Perlengkapan K3'], ['description' => 'Helm, sarung tangan, kacamata pelindung']);
        $cat5 = Category::firstOrCreate(['name' => 'Kendaraan & Otomotif'], ['description' => 'Kendaraan, spare part, ban, oli mesin, dan onderdil motor/mobil']);
        $cat6 = Category::firstOrCreate(['name' => 'Sayur & Bahan Pangan'], ['description' => 'Sayuran segar, sayur mayur, buah, dan komoditas pangan gudang']);

        // 3. Supplier Awal (Dilengkapi spesialisasi kategori komoditas)
        $sup1 = Supplier::firstOrCreate(['name' => 'PT Sinar Abadi Logam'], [
            'category_id' => $cat1->id,
            'address' => 'Jl. Industri Baja No. 45, Cikarang',
            'phone' => '021-8976543',
            'email' => 'sales@sinarabadi.test',
        ]);
        if (! $sup1->category_id) {
            $sup1->update(['category_id' => $cat1->id]);
        }

        $sup2 = Supplier::firstOrCreate(['name' => 'CV Mitra Perkakas Jaya'], [
            'category_id' => $cat2->id,
            'address' => 'Kawasan Pergudangan Margomulyo Blok C-12, Surabaya',
            'phone' => '031-7654321',
            'email' => 'order@mitraperkakas.test',
        ]);
        if (! $sup2->category_id) {
            $sup2->update(['category_id' => $cat2->id]);
        }

        $sup3 = Supplier::firstOrCreate(['name' => 'PT Surya Elektrik Nusantara'], [
            'category_id' => $cat3->id,
            'address' => 'Jl. Soekarno Hatta No. 88, Bandung',
            'phone' => '022-7312345',
            'email' => 'info@suryaelektrik.test',
        ]);
        if (! $sup3->category_id) {
            $sup3->update(['category_id' => $cat3->id]);
        }

        // Supplier khusus Kendaraan & Otomotif (Honda hanya menerima/menyediakan motor & onderdil otomotif)
        $supHonda = Supplier::firstOrCreate(['name' => 'PT Astra Honda Motor'], [
            'category_id' => $cat5->id,
            'address' => 'Jl. Laksda Yos Sudarso, Sunter 1, Jakarta Utara',
            'phone' => '021-6518080',
            'email' => 'corporate@ahm.honda.test',
        ]);
        if (! $supHonda->category_id) {
            $supHonda->update(['category_id' => $cat5->id]);
        }

        // 4. Produk Awal
        $prd1 = Product::firstOrCreate(['sku' => 'PRD-BAUT-001'], [
            'category_id' => $cat2->id,
            'supplier_id' => $sup2->id,
            'name' => 'Baut Hexagonal M8 x 25mm',
            'description' => 'Baut baja karbon grade 8.8 anti karat',
            'purchase_price' => 1500,
            'selling_price' => 2500,
            'minimum_stock' => 50,
        ]);

        $prd2 = Product::firstOrCreate(['sku' => 'PRD-PLAT-002'], [
            'category_id' => $cat1->id,
            'supplier_id' => $sup1->id,
            'name' => 'Plat Besi Galvanis 2mm',
            'description' => 'Plat lembaran 120cm x 240cm ketebalan 2mm',
            'purchase_price' => 180000,
            'selling_price' => 235000,
            'minimum_stock' => 10,
        ]);

        $prd3 = Product::firstOrCreate(['sku' => 'PRD-KBL-003'], [
            'category_id' => $cat3->id,
            'supplier_id' => $sup3->id,
            'name' => 'Kabel Tembaga NYM 3x2.5mm',
            'description' => 'Roll 50 meter isolasi ganda standar SNI',
            'purchase_price' => 450000,
            'selling_price' => 560000,
            'minimum_stock' => 8,
        ]);

        $prd4 = Product::firstOrCreate(['sku' => 'PRD-K3-004'], [
            'category_id' => $cat4->id,
            'supplier_id' => $sup2->id,
            'name' => 'Sarung Tangan Safety Nitrile',
            'description' => 'Tahan gesek dan minyak industri per pasang',
            'purchase_price' => 20000,
            'selling_price' => 32000,
            'minimum_stock' => 30,
        ]);

        // 5. Transaksi Stok Masuk (Initial Inventory)
        if (StockTransaction::count() === 0) {
            StockTransaction::create([
                'product_id' => $prd1->id,
                'user_id' => $staff->id,
                'type' => 'in',
                'quantity' => 250,
                'date' => now()->subDays(5)->toDateString(),
                'status' => 'completed',
                'notes' => 'Penerimaan stok awal dari CV Mitra Perkakas Jaya',
            ]);

            StockTransaction::create([
                'product_id' => $prd2->id,
                'user_id' => $manajer->id,
                'type' => 'in',
                'quantity' => 25,
                'date' => now()->subDays(3)->toDateString(),
                'status' => 'completed',
                'notes' => 'Penerimaan plat lembaran dari PT Sinar Abadi',
            ]);

            StockTransaction::create([
                'product_id' => $prd3->id,
                'user_id' => $staff->id,
                'type' => 'in',
                'quantity' => 15,
                'date' => now()->subDays(2)->toDateString(),
                'status' => 'completed',
                'notes' => 'Pengiriman kabel roll dari PT Surya Elektrik',
            ]);

            StockTransaction::create([
                'product_id' => $prd4->id,
                'user_id' => $staff->id,
                'type' => 'in',
                'quantity' => 40,
                'date' => now()->subDay()->toDateString(),
                'status' => 'completed',
                'notes' => 'Restock perlengkapan K3',
            ]);

            // Transaksi Keluar
            StockTransaction::create([
                'product_id' => $prd1->id,
                'user_id' => $staff->id,
                'type' => 'out',
                'quantity' => 30,
                'date' => now()->toDateString(),
                'status' => 'completed',
                'notes' => 'Pengeluaran proyek divisi bengkel',
            ]);
        }

        // 6. 50 Produk Berbagai Kategori dan 10 Supplier Baru
        $this->call(FiftyProductsAndTenSuppliersSeeder::class);
    }
}
