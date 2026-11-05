<?php

namespace App\Console\Commands;

use App\Services\ProductService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('products:delete-zero-stock {--days=3 : Batas hari stok kosong sebelum produk otomatis dihapus}')]
#[Description('Otomatis menghapus produk yang stoknya 0 selama lebih dari 3 hari')]
class DeleteZeroStockProductsCommand extends Command
{
    /**
     * Menjalankan perintah pembersihan produk stok 0.
     */
    public function handle(ProductService $productService): int
    {
        $days = max(1, (int) $this->option('days'));

        $this->info("Memeriksa produk dengan stok 0 selama lebih dari {$days} hari...");

        $result = $productService->autoDeleteZeroStockProducts($days);
        $count = $result['deleted_count'];

        if ($count > 0) {
            $this->warn("Ditemukan dan berhasil menghapus {$count} produk:");
            foreach ($result['deleted_products'] as $productName) {
                $this->line("- {$productName}");
            }
        } else {
            $this->info('Tidak ada produk dengan stok 0 yang melebihi batas waktu.');
        }

        return self::SUCCESS;
    }
}
