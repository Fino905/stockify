<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderFeedback;
use App\Models\OrderRefund;
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

        $staff = User::firstOrCreate(
            ['email' => 'staff@stockify.test'],
            [
                'name' => 'Ahmad Fauzi',
                'password' => Hash::make('password'),
                'role' => 'staff_gudang',
                'email_verified_at' => now(),
            ]
        );

        $customer = User::firstOrCreate(
            ['email' => 'customer@stockify.test'],
            [
                'name' => 'Dewi Pelanggan',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'email_verified_at' => now(),
            ]
        );

        // 2. Kategori Produk Awal
        $cat1 = Category::firstOrCreate(['name' => 'Bahan Baku & Material'], ['description' => 'Logam, besi, plat, dan material mentah pabrik']);
        $cat2 = Category::firstOrCreate(['name' => 'Perkakas & Baut'], ['description' => 'Baut, mur, mata bor, dan perkakas instalasi']);
        $cat3 = Category::firstOrCreate(['name' => 'Elektronik & Kelistrikan'], ['description' => 'Kabel, trafo, breaker, dan komponen panel']);
        $cat4 = Category::firstOrCreate(['name' => 'Perlengkapan K3'], ['description' => 'Helm, sarung tangan, kacamata pelindung']);

        // 3. Supplier Awal
        $sup1 = Supplier::firstOrCreate(['name' => 'PT Sinar Abadi Logam'], [
            'address' => 'Jl. Industri Baja No. 45, Cikarang',
            'phone' => '021-8976543',
            'email' => 'sales@sinarabadi.test',
        ]);

        $sup2 = Supplier::firstOrCreate(['name' => 'CV Mitra Perkakas Jaya'], [
            'address' => 'Kawasan Pergudangan Margomulyo Blok C-12, Surabaya',
            'phone' => '031-7654321',
            'email' => 'order@mitraperkakas.test',
        ]);

        $sup3 = Supplier::firstOrCreate(['name' => 'PT Surya Elektrik Nusantara'], [
            'address' => 'Jl. Soekarno Hatta No. 88, Bandung',
            'phone' => '022-7312345',
            'email' => 'info@suryaelektrik.test',
        ]);

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

        // 6. Transaksi Pembelian Demo oleh Customer
        if (Order::count() === 0) {
            $order1 = Order::create([
                'order_number' => 'ORD-20261019-X892A',
                'user_id' => $customer->id,
                'product_id' => $prd1->id,
                'staff_id' => $staff->id,
                'quantity' => 10,
                'unit_price' => $prd1->selling_price,
                'total_price' => $prd1->selling_price * 10,
                'payment_method' => 'qris',
                'payment_status' => 'paid',
                'payment_reference' => 'SIM-PAY-882910',
                'order_status' => 'completed',
                'notes' => 'Tolong dicek bautnya jangan sampai ada yang karatan.',
            ]);

            OrderFeedback::create([
                'order_id' => $order1->id,
                'product_id' => $prd1->id,
                'user_id' => $customer->id,
                'rating' => 5,
                'comment' => 'Barang sangat bagus, packing kuat dan rapi dari staff gudang Ahmad Fauzi. Mantap!',
            ]);

            $order2 = Order::create([
                'order_number' => 'ORD-20261018-K410Z',
                'user_id' => $customer->id,
                'product_id' => $prd2->id,
                'staff_id' => $staff->id,
                'quantity' => 1,
                'unit_price' => $prd2->selling_price,
                'total_price' => $prd2->selling_price * 1,
                'payment_method' => 'bca_va',
                'payment_status' => 'paid',
                'payment_reference' => 'SIM-PAY-592810',
                'order_status' => 'refund_pending',
                'notes' => 'Pengiriman plat galvanis lembaran',
            ]);

            OrderRefund::create([
                'order_id' => $order2->id,
                'user_id' => $customer->id,
                'reason' => 'Barang Rusak/Cacat saat Diterima',
                'description' => 'Ada goresan dan penyok di sudut lembaran plat saat serah terima barang dari gudang.',
                'status' => 'pending',
            ]);
        }
    }
}
