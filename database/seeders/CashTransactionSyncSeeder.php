<?php

namespace Database\Seeders;

use App\Models\CashTransaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class CashTransactionSyncSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first() ?? User::first();
        $adminId = $admin ? $admin->id : 1;
        $yearMonth = date('Ym');

        $sampleTransactions = [
            [
                'transaction_number' => "CSH-{$yearMonth}-MOD0001",
                'type' => 'in',
                'category' => 'modal_awal',
                'amount' => 15000000,
                'date' => now()->subDays(10)->toDateString(),
                'description' => 'Injeksi Saldo Kas Operasional Awal Gudang',
                'notes' => 'Alokasi dana kas kecil dan operasional logistik',
                'user_id' => $adminId,
            ],
            [
                'transaction_number' => "CSH-{$yearMonth}-SUP0001",
                'type' => 'out',
                'category' => 'pembelian_supplier',
                'amount' => 4200000,
                'date' => now()->subDays(7)->toDateString(),
                'description' => 'Pembayaran Pengadaan Stok Masuk Supplier Mitra Perkakas',
                'notes' => 'Invoice PO-2026-004 - Transfer Bank',
                'user_id' => $adminId,
            ],
            [
                'transaction_number' => "CSH-{$yearMonth}-OPS0001",
                'type' => 'out',
                'category' => 'operasional',
                'amount' => 450000,
                'date' => now()->subDays(4)->toDateString(),
                'description' => 'Pembelian Perlengkapan Gudang: Bubble Wrap Roll 50m, Lakban Fragile & Kardus Packing',
                'notes' => 'Toko Sumber Plastik Logistik - Pembayaran Tunai',
                'user_id' => $adminId,
            ],
            [
                'transaction_number' => "CSH-{$yearMonth}-OPS0002",
                'type' => 'out',
                'category' => 'operasional',
                'amount' => 380000,
                'date' => now()->subDays(2)->toDateString(),
                'description' => 'Tagihan Listrik & WiFi Operasional Gudang Stockify Bulan Berjalan',
                'notes' => 'Autodebet Rekening Operasional Gudang',
                'user_id' => $adminId,
            ],
            [
                'transaction_number' => "CSH-{$yearMonth}-DLS0001",
                'type' => 'in',
                'category' => 'penjualan',
                'amount' => 6850000,
                'date' => now()->subDays(1)->toDateString(),
                'description' => 'Penjualan Grosir / Distribusi Stok Barang Keluar ke Mitra Regional',
                'notes' => 'Surat Jalan DO-2026-0012 - Transfer Bank',
                'user_id' => $adminId,
            ],
        ];

        foreach ($sampleTransactions as $data) {
            CashTransaction::firstOrCreate(
                ['transaction_number' => $data['transaction_number']],
                $data
            );
        }
    }
}
