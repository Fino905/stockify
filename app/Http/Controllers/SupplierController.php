<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Services\SupplierService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function __construct(
        protected SupplierService $supplierService
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
        ]);

        $this->supplierService->createSupplier($validated);

        return back()->with('success', 'Supplier baru berhasil ditambahkan!');
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
        ]);

        $this->supplierService->updateSupplier($supplier, $validated);

        return back()->with('success', 'Data supplier berhasil diperbarui!');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        $this->supplierService->deleteSupplier($supplier);

        return back()->with('success', 'Supplier berhasil dihapus!');
    }
}
