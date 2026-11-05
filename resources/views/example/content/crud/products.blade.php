
@extends('layouts.stockify')

@section('content')

<div class="p-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
    <nav class="flex mb-5" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-2 text-sm font-medium">
            <li>
                <a href="/" class="text-gray-700 hover:text-primary-600 dark:text-gray-300">
                    Home
                </a>
            </li>
            <li class="text-gray-400">/</li>
            <li class="text-gray-500 dark:text-gray-400">Stockify</li>
            <li class="text-gray-400">/</li>
            <li class="text-gray-500 dark:text-gray-400">Products</li>
        </ol>
    </nav>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                Data Produk Stockify
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Daftar produk yang tersimpan di database.
            </p>
        </div>

        <span class="text-sm text-gray-500 dark:text-gray-400">
            Total produk: {{ $products->count() }}
        </span>
    </div>
</div>

<div class="p-4">
    @if (session('success'))
        <div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400">
            {{ session('success') }}
        </div>
    @endif

    <div class="mb-4">
        <label for="products-search" class="sr-only">Cari produk</label>
        <input
            type="search"
            id="products-search"
            class="block w-full p-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Cari nama produk, SKU, kategori, atau supplier..."
        >
    </div>

    <div class="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-100 dark:bg-gray-700">
                <tr>
                    <th class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">
                        No.
                    </th>
                    <th class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">
                        Nama Produk / SKU
                    </th>
                    <th class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">
                        Kategori
                    </th>
                    <th class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">
                        Supplier
                    </th>
                    <th class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">
                        Harga Jual
                    </th>
                    <th class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">
                        Stok Minimum
                    </th>
                    <th class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">
                        Deskripsi
                    </th>
                    <th class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">
                        Aksi
                    </th>
                </tr>
            </thead>

            <tbody id="products-table-body" class="divide-y divide-gray-200 dark:divide-gray-700">
                @forelse ($products as $product)
                    <tr class="product-row hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                            {{ $loop->iteration }}
                        </td>

                        <td class="p-4">
                            <div class="text-sm font-semibold text-gray-900 dark:text-white">
                                {{ $product->name }}
                            </div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                                {{ $product->sku }}
                            </div>
                        </td>

                        <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                            {{ $product->category->name ?? '-' }}
                        </td>

                        <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                            {{ $product->supplier->name ?? '-' }}
                        </td>

                        <td class="p-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            Rp {{ number_format((float) $product->selling_price, 0, ',', '.') }}
                        </td>

                        <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                            {{ $product->minimum_stock }}
                        </td>

                        <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                            {{ $product->description ?: '-' }}
                        </td>

                        <td class="p-4 text-sm whitespace-nowrap">
                            <span class="text-gray-400">Belum tersedia</span>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                            Belum ada data produk. Tambahkan produk untuk mulai menggunakan Stockify.
                        </td>
                    </tr>
                @endforelse

                <tr id="products-no-search-results" style="display: none;">
                    <td colspan="8" class="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Produk yang dicari tidak ditemukan.
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('products-search');
    const rows = document.querySelectorAll('.product-row');
    const noResults = document.getElementById('products-no-search-results');

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener('input', function () {
        const keyword = this.value.toLowerCase().trim();
        let visibleRows = 0;

        rows.forEach(function (row) {
            const matches = row.textContent.toLowerCase().includes(keyword);

            row.style.display = matches ? '' : 'none';

            if (matches) {
                visibleRows++;
            }
        });

        if (noResults) {
            noResults.style.display =
                rows.length > 0 && visibleRows === 0 ? '' : 'none';
        }
    });
});
</script>

@endsection
