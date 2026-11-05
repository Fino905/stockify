<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('products:trim-to-ten {--keep=10 : Jumlah produk yang disisakan}')]
#[Description('Hapus produk berlebih dan sisakan 10 produk pertama')]
class TrimProductsCommand extends Command
{
    public function handle(ProductService $productService): int
    {
        $keepCount = max(1, (int) $this->option('keep'));
        $totalProducts = Product::count();

        $this->info("Total produk saat ini: {$totalProducts}");

        if ($totalProducts <= $keepCount) {
            $this->info("Jumlah produk sudah {$totalProducts} (kurang dari atau sama dengan {$keepCount}). Tidak ada produk yang dihapus.");
            return self::SUCCESS;
        }

        // Ambil 10 produk pertama (berdasarkan ID) untuk dipertahankan
        $keptProducts = Product::orderBy('id', 'asc')->limit($keepCount)->get();
        $keptIds = $keptProducts->pluck('id')->toArray();

        $this->info("10 Produk yang dipertahankan:");
        foreach ($keptProducts as $idx => $p) {
            $this->line(($idx + 1) . ". [ID: {$p->id}] [SKU: {$p->sku}] {$p->name}");
        }

        // Ambil produk yang akan dihapus
        $productsToDelete = Product::whereNotIn('id', $keptIds)->orderBy('id', 'asc')->get();
        $deleteCount = $productsToDelete->count();

        $this->warn("\nMenghapus {$deleteCount} produk lainnya...");

        $deletedNames = [];
        foreach ($productsToDelete as $product) {
            $deletedNames[] = "[ID: {$product->id}] {$product->name}";
            $productService->deleteProduct($product);
        }

        $this->info("Berhasil menghapus {$deleteCount} produk. Sisa produk sekarang: " . Product::count());

        return self::SUCCESS;
    }
}

