<?php

namespace App\Http\Controllers;

use App\Models\ProductAttribute;
use App\Services\ProductAttributeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProductAttributeController extends Controller
{
    public function __construct(
        protected ProductAttributeService $attributeService
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string|max:100',
            'value' => 'required|string|max:255',
        ]);

        $attribute = $this->attributeService->addAttribute($validated);

        return back()->with('success', "Atribut {$attribute->name} ({$attribute->value}) berhasil ditambahkan!");
    }

    public function destroy(ProductAttribute $attribute): RedirectResponse
    {
        $this->attributeService->deleteAttribute($attribute);

        return back()->with('success', 'Atribut produk berhasil dihapus!');
    }
}
