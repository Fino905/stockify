<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'sku' => 'required|string|max:50|unique:products,sku',
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'minimum_stock' => 'required|integer|min:0',
            'initial_stock' => 'nullable|integer|min:0',
        ]);

        $product = $this->productService->createProduct($validated, $request->user()?->id);

        return back()->with('success', "Produk {$product->name} berhasil ditambahkan!");
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'sku' => 'required|string|max:50|unique:products,sku,'.$product->id,
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'minimum_stock' => 'required|integer|min:0',
        ]);

        $this->productService->updateProduct($product, $validated);

        return back()->with('success', "Produk {$product->name} berhasil diperbarui!");
    }

    public function importCsv(Request $request): RedirectResponse
    {
        $request->validate([
            'csv_content' => 'required|string',
        ]);

        $lines = explode("\n", trim($request->input('csv_content')));
        if (count($lines) < 2) {
            return back()->with('error', 'Format CSV tidak valid atau data kosong.');
        }

        // Skip header
        array_shift($lines);
        $categories = Category::pluck('id', 'name')->toArray();
        $defaultCatId = array_values($categories)[0] ?? 1;

        $records = [];
        foreach ($lines as $line) {
            if (empty(trim($line))) {
                continue;
            }
            $row = str_getcsv($line);
            if (count($row) < 3) {
                continue;
            }

            $name = trim($row[0] ?? '');
            $sku = trim($row[1] ?? '');
            $catName = trim($row[2] ?? '');
            $purchasePrice = isset($row[3]) ? (float) trim($row[3]) : 0;
            $sellingPrice = isset($row[4]) ? (float) trim($row[4]) : 0;
            $stock = isset($row[5]) ? (int) trim($row[5]) : 0;
            $minStock = isset($row[6]) ? (int) trim($row[6]) : 5;

            $catId = $categories[$catName] ?? $defaultCatId;

            $records[] = [
                'name' => $name,
                'sku' => $sku,
                'category_id' => $catId,
                'purchase_price' => $purchasePrice,
                'selling_price' => $sellingPrice,
                'minimum_stock' => $minStock,
                'initial_stock' => $stock,
            ];
        }

        $imported = $this->productService->importProductsFromCsv($records, $request->user()?->id);

        return back()->with('success', "Berhasil mengimpor {$imported} produk dari data CSV!");
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->productService->deleteProduct($product);

        return back()->with('success', 'Produk berhasil dihapus dari inventaris!');
    }
}
