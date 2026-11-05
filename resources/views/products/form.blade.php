@extends('layouts.stockify')

@section('title', ($product ? 'Ubah produk' : 'Tambah produk') . ' - Stockify')

@section('content')
<div class="mx-auto max-w-4xl">
    <a href="{{ route('products.index') }}" class="text-sm font-semibold text-teal-800 hover:text-teal-950">&larr; Kembali ke produk</a>
    <h1 class="mt-3 text-2xl font-semibold text-slate-900">{{ $product ? 'Ubah produk' : 'Tambah produk' }}</h1>
    <p class="mt-1 text-sm text-slate-500">Kelola informasi, stok minimum, dan atribut spesifik produk.</p>

    @if ($errors->any())
        <div class="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">{{ $errors->first() }}</div>
    @endif
    <form action="{{ $product ? route('products.update', $product) : route('products.store') }}" method="POST" enctype="multipart/form-data" class="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        @csrf
        @if ($product) @method('PUT') @endif
        <div class="grid gap-5 sm:grid-cols-2">
            <label class="text-sm font-medium text-slate-700">Nama produk
                <input name="name" value="{{ old('name', $product?->name) }}" required class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100">
            </label>
            <label class="text-sm font-medium text-slate-700">SKU / kode produk
                <input name="sku" value="{{ old('sku', $product?->sku) }}" required class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100">
            </label>
            <label class="text-sm font-medium text-slate-700">Kategori
                <select name="category_id" required class="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100">
                    <option value="">Pilih kategori</option>
                    @foreach ($categories as $category)
                        <option value="{{ $category->id }}" @selected(old('category_id', $product?->category_id) == $category->id)>{{ $category->name }}</option>
                    @endforeach
                </select>
            </label>
            <label class="text-sm font-medium text-slate-700">Supplier
                <select name="supplier_id" required class="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100">
                    <option value="">Pilih supplier</option>
                    @foreach ($suppliers as $supplier)
                        <option value="{{ $supplier->id }}" @selected(old('supplier_id', $product?->supplier_id) == $supplier->id)>{{ $supplier->name }}</option>
                    @endforeach
                </select>
            </label>
            <label class="text-sm font-medium text-slate-700">Harga beli (Rp)
                <input type="number" min="0" step="0.01" name="purchase_price" value="{{ old('purchase_price', $product?->purchase_price) }}" required class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100">
            </label>
            <label class="text-sm font-medium text-slate-700">Harga jual (Rp)
                <input type="number" min="0" step="0.01" name="selling_price" value="{{ old('selling_price', $product?->selling_price) }}" required class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100">
            </label>
            <label class="text-sm font-medium text-slate-700">Stok minimum
                <input type="number" min="0" name="minimum_stock" value="{{ old('minimum_stock', $product?->minimum_stock ?? 0) }}" required class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100">
            </label>
            @unless ($product)
                <label class="text-sm font-medium text-slate-700">Stok awal
                    <input type="number" min="0" name="initial_stock" value="{{ old('initial_stock', 0) }}" required class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100">
                    <span class="mt-1 block text-xs font-normal text-slate-500">Dicatat sebagai transaksi barang masuk terkonfirmasi.</span>
                </label>
            @endunless
        </div>
        <label class="block text-sm font-medium text-slate-700">Deskripsi
            <textarea name="description" rows="3" class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100">{{ old('description', $product?->description) }}</textarea>
        </label>
        <label class="block text-sm font-medium text-slate-700">Gambar produk (opsional)
            <span class="mt-1 block text-xs font-normal text-slate-500">Unggah foto produk untuk ditampilkan di katalog. Format JPG, PNG, atau WebP; maksimal 2 MB.</span>
            <input type="file" name="image" accept="image/jpeg,image/png,image/webp" class="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
            @if ($product?->image)
                <img src="{{ \Illuminate\Support\Facades\Storage::disk('public')->url($product->image) }}" alt="Gambar {{ $product->name }}" class="mt-3 h-28 w-28 rounded-xl border border-slate-200 object-cover">
            @endif
        </label>
        <section>
            <div class="flex items-center justify-between gap-3">
                <div><h2 class="text-sm font-semibold text-slate-900">Atribut produk</h2><p class="mt-1 text-xs text-slate-500">Pilih atribut yang sudah ditetapkan Admin, lalu isi nilainya.</p></div>
                <button type="button" data-add-attribute class="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Tambah atribut</button>
            </div>
            <div data-attribute-list class="mt-3 space-y-2">
                @php
                    $attributeRows = old('attributes', $product?->attributes->map(fn ($attribute) => ['definition_id' => $attribute->definition_id, 'value' => $attribute->value])->all() ?? []);
                    $attributeRows = array_pad($attributeRows, 1, ['definition_id' => '', 'value' => '']);
                @endphp
                @foreach ($attributeRows as $index => $attribute)
                    <div class="grid grid-cols-[1fr_1fr_auto] gap-2">
                        <select name="attributes[{{ $index }}][definition_id]" class="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100">
                            <option value="">Pilih atribut</option>
                            @foreach ($attributeDefinitions as $definition)
                                <option value="{{ $definition->id }}" @selected(($attribute['definition_id'] ?? '') == $definition->id)>{{ $definition->name }}</option>
                            @endforeach
                        </select>
                        <input name="attributes[{{ $index }}][value]" value="{{ $attribute['value'] ?? '' }}" placeholder="Nilai" class="min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100">
                        <button type="button" data-remove-attribute class="rounded-lg px-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700" aria-label="Hapus atribut">×</button>
                    </div>
                @endforeach
            </div>
            <template data-attribute-row-template>
                <div class="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <select name="attributes[__INDEX__][definition_id]" class="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100">
                        <option value="">Pilih atribut</option>
                        @foreach ($attributeDefinitions as $definition)
                            <option value="{{ $definition->id }}">{{ $definition->name }}</option>
                        @endforeach
                    </select>
                    <input name="attributes[__INDEX__][value]" placeholder="Nilai" class="min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100">
                    <button type="button" data-remove-attribute class="rounded-lg px-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700" aria-label="Hapus atribut">×</button>
                </div>
            </template>
        </section>
        <div class="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <a href="{{ route('products.index') }}" class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</a>
            <button class="rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900">{{ $product ? 'Simpan perubahan' : 'Tambah produk' }}</button>
        </div>
    </form>
</div>
@endsection
