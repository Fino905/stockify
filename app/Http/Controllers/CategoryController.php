<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Services\AutoCategoryService;
use App\Services\CategoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService,
        protected AutoCategoryService $autoCategoryService
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:categories,name',
            'description' => 'nullable|string',
        ]);

        $this->categoryService->createCategory($validated);

        // Langsung sinkronisasikan kategori baru ke model/engine Machine Learning
        $this->autoCategoryService->syncCategoriesToMl();

        return back()->with('success', 'Kategori produk berhasil ditambahkan dan langsung terbaca oleh AI Machine Learning!');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:categories,name,'.$category->id,
            'description' => 'nullable|string',
        ]);

        $this->categoryService->updateCategory($category, $validated);

        // Sinkronisasi pembaruan ke ML
        $this->autoCategoryService->syncCategoriesToMl();

        return back()->with('success', 'Kategori produk berhasil diperbarui!');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $this->categoryService->deleteCategory($category);

        // Sinkronisasi penghapusan ke ML
        $this->autoCategoryService->syncCategoriesToMl();

        return back()->with('success', 'Kategori produk berhasil dihapus!');
    }
}
