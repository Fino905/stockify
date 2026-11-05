<?php

namespace Database\Seeders;

use App\Models\CashTransaction;
use App\Models\Order;
use App\Models\OrderRefund;
use Illuminate\Database\Seeder;

class CashTransactionSyncSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Sync completed orders as Cash In
        $completed = Order::where('order_status', 'completed')->get();
        foreach ($completed as $ord) {
            $date = $ord->created_at ? $ord->created_at->toDateString() : now()->toDateString();
            $yearMonth = date('Ym', strtotime($date));
            CashTransaction::updateOrCreate(
                ['order_id' => $ord->id, 'type' => 'in'],
                [
                    'transaction_number' => "CSH-{$yearMonth}-ORD" . str_pad($ord->id, 4, '0', STR_PAD_LEFT),
                    'category' => 'penjualan',
                    'amount' => $ord->total_price,
                    'date' => $date,
                    'description' => "Penjualan Produk: Pesanan #{$ord->order_number} (" . ($ord->product?->name ?? 'Produk') . ") - {$ord->quantity} unit",
                    'proof_image' => $ord->payment_proof,
                    'user_id' => $ord->staff_id ?? $ord->user_id,
                    'notes' => 'Metode: ' . strtoupper(str_replace('_', ' ', $ord->payment_method)) . ' | Pembeli: ' . ($ord->user?->name ?? 'Pelanggan'),
                ]
            );
        }

        // 2. Sync approved refunds as Cash Out
        $approvedRefunds = OrderRefund::where('status', 'approved')->with('order.product', 'order.user')->get();
        foreach ($approvedRefunds as $ref) {
            $ord = $ref->order;
            if ($ord) {
                $date = $ref->updated_at ? $ref->updated_at->toDateString() : now()->toDateString();
                $yearMonth = date('Ym', strtotime($date));
                CashTransaction::updateOrCreate(
                    ['order_id' => $ord->id, 'type' => 'out'],
                    [
                        'transaction_number' => "CSH-{$yearMonth}-REF" . str_pad($ord->id, 4, '0', STR_PAD_LEFT),
                        'category' => 'refund',
                        'amount' => $ord->total_price,
                        'date' => $date,
                        'description' => "Pengembalian Dana (Refund): Pesanan #{$ord->order_number} (" . ($ord->product?->name ?? 'Produk') . ") - Alasan: {$ref->reason}",
                        'proof_image' => $ref->refund_transfer_proof,
                        'user_id' => $ref->processed_by,
                        'notes' => 'Persetujuan Refund | Pembeli: ' . ($ord->user?->name ?? 'Pelanggan'),
                    ]
                );
            }
        }

        // 3. Tambahkan contoh beberapa pengeluaran operasional & pembayaran supplier riil jika kas masih sedikit
        if (CashTransaction::count() < 3) {
            CashTransaction::firstOrCreate(
                ['transaction_number' => 'CSH-' . date('Ym') . '-OPS0001'],
                [
                    'type' => 'out',
                    'category' => 'operasional',
                    'amount' => 450000,
                    'date' => now()->subDays(2)->toDateString(),
                    'description' => 'Pembelian Perlengkapan Gudang: Bubble Wrap Roll 50m, Lakban Fragile & Kardus Packing',
                    'notes' => 'Toko Sumber Plastik Logistik - Pembayaran Tunai',
                    'user_id' => 1,
                ]
            );
            CashTransaction::firstOrCreate(
                ['transaction_number' => 'CSH-' . date('Ym') . '-OPS0002'],
                [
                    'type' => 'out',
                    'category' => 'operasional',
                    'amount' => 380000,
                    'date' => now()->subDays(5)->toDateString(),
                    'description' => 'Tagihan Listrik & WiFi Operasional Gudang Stockify Bulan Berjalan',
                    'notes' => 'Autodebet Rekening Operasional Gudang',
                    'user_id' => 1,
                ]
            );
        }
    }
}

