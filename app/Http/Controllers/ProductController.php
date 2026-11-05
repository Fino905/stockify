<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use App\Services\AutoCategoryService;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService
    ) {}

    public function suggestCategory(Request $request, AutoCategoryService $autoCategoryService): JsonResponse
    {
        $name = $request->input('name');
        $image = $request->file('image') ?? $request->input('image');

        $result = $autoCategoryService->suggestCategory($name, $image);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // 1. Otomatis generate SKU unik jika kosong atau jika sudah pernah digunakan
        $rawSku = trim((string) $request->input('sku'));
        if (empty($rawSku) || Product::where('sku', $rawSku)->exists()) {
            $catId = $request->input('category_id');
            $cat = $catId ? Category::find($catId) : null;
            $prefix = $cat ? strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $cat->name), 0, 3)) : 'PRD';
            if (strlen($prefix) < 2) {
                $prefix = 'PRD';
            }

            do {
                $autoSku = 'SKU-' . $prefix . '-' . rand(1000, 9999);
            } while (Product::where('sku', $autoSku)->exists());

            $request->merge(['sku' => $autoSku]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'sku' => 'nullable|string|max:50|unique:products,sku',
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'description' => 'nullable|string',
            'image' => $request->hasFile('image')
                ? 'required|image|mimes:jpeg,png,jpg,webp|max:2048'
                : 'nullable|string|max:1000',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'minimum_stock' => 'required|integer|min:0',
            'initial_stock' => 'nullable|integer|min:0',
        ]);

        // 2. Validasi spesialisasi kategori supplier (misal: Honda hanya menerima motor/kendaraan)
        if (! empty($validated['supplier_id'])) {
            $supplier = Supplier::with('category')->find($validated['supplier_id']);
            if ($supplier && $supplier->category_id && (int) $supplier->category_id !== (int) $validated['category_id']) {
                $catName = $supplier->category?->name ?? 'tertentu';
                return back()->withErrors([
                    'supplier_id' => "Supplier '{$supplier->name}' memiliki spesialisasi khusus kategori '{$catName}'. Tidak dapat ditugaskan untuk produk kategori lain.",
                ])->withInput();
            }
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = '/storage/'.$path;
        }

        $product = $this->productService->createProduct($validated, $request->user()?->id);

        return back()->with('success', "Produk {$product->name} berhasil ditambahkan! (SKU: {$product->sku})");
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        // Otomatis generate SKU jika dikosongkan saat update
        if (empty(trim((string) $request->input('sku')))) {
            $request->merge(['sku' => $product->sku]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'sku' => 'required|string|max:50|unique:products,sku,'.$product->id,
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'description' => 'nullable|string',
            'image' => $request->hasFile('image')
                ? 'required|image|mimes:jpeg,png,jpg,webp|max:2048'
                : 'nullable|string|max:1000',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'minimum_stock' => 'required|integer|min:0',
        ]);

        // Validasi spesialisasi kategori supplier saat update
        if (! empty($validated['supplier_id'])) {
            $supplier = Supplier::with('category')->find($validated['supplier_id']);
            if ($supplier && $supplier->category_id && (int) $supplier->category_id !== (int) $validated['category_id']) {
                $catName = $supplier->category?->name ?? 'tertentu';
                return back()->withErrors([
                    'supplier_id' => "Supplier '{$supplier->name}' memiliki spesialisasi khusus kategori '{$catName}'. Tidak dapat ditugaskan untuk produk kategori lain.",
                ])->withInput();
            }
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = '/storage/'.$path;
        }

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

    public function cleanZeroStock(Request $request): RedirectResponse
    {
        $result = $this->productService->autoDeleteZeroStockProducts(3);
        $count = $result['deleted_count'];

        if ($count > 0) {
            $names = implode(', ', $result['deleted_products']);

            return back()->with('success', "Auto-delete selesai: {$count} produk dengan stok 0 lebih dari 3 hari berhasil dihapus ({$names}).");
        }

        return back()->with('info', 'Pemeriksaan selesai: Tidak ada produk dengan stok 0 lebih dari 3 hari.');
    }
}
