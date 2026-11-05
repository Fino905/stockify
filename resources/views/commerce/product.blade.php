@extends('layouts.stockify')

@section('title', $product->name.' - Stockify')

@section('content')
<a href="{{ route('shop.index') }}" class="text-sm font-medium text-teal-800 hover:underline">← Kembali ke katalog</a>
@if ($errors->any())<p class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{{ $errors->first() }}</p>@endif

<section class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
    <article class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        @if ($product->image)
            <img src="{{ \Illuminate\Support\Facades\Storage::disk('public')->url($product->image) }}" alt="{{ $product->name }}" class="h-72 w-full bg-slate-50 object-contain p-6">
        @else
            <div class="flex h-72 items-center justify-center bg-slate-50 text-slate-300"><svg class="h-20 w-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10"/></svg></div>
        @endif
        <div class="p-6">
            <p class="text-xs font-medium text-teal-800">{{ $product->category->name ?? 'Produk' }} · {{ $product->sku }}</p>
            <h1 class="mt-2 text-2xl font-semibold text-slate-900">{{ $product->name }}</h1>
            <p class="mt-3 text-2xl font-bold text-slate-900">Rp{{ number_format((float) $product->selling_price, 0, ',', '.') }}</p>
            <p class="mt-2 text-sm {{ $available > 0 ? 'text-emerald-700' : 'text-rose-700' }}">{{ number_format($available) }} tersedia</p>
            @if ($product->description)<p class="mt-5 whitespace-pre-line text-sm leading-6 text-slate-600">{{ $product->description }}</p>@endif
        </div>
    </article>

    <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 class="text-lg font-semibold text-slate-900">Checkout & metode pembayaran</h2>
        <p class="mt-1 text-sm text-slate-500">Pilih salah satu dari tiga metode berikut.</p>
        @if ($available > 0)
            <form action="{{ route('shop.purchase', $product) }}" method="POST" enctype="multipart/form-data" class="mt-5 space-y-4" data-payment-form>
                @csrf
                <label class="block text-xs font-medium text-slate-600">Jumlah
                    <input type="number" name="quantity" min="1" max="{{ $available }}" value="{{ old('quantity', 1) }}" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
                </label>

                <fieldset>
                    <legend class="text-xs font-medium text-slate-600">Metode pembayaran</legend>
                    <div class="mt-2 grid gap-2">
                        @foreach (['Transfer Bank', 'Tunai di Toko', 'COD'] as $method)
                            <label class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm hover:border-teal-400 has-[:checked]:border-teal-700 has-[:checked]:bg-teal-50">
                                <input type="radio" name="payment_method" value="{{ $method }}" required @checked(old('payment_method', 'Transfer Bank') === $method) class="mt-0.5 border-slate-300 text-teal-800 focus:ring-teal-700" data-payment-method>
                                <span>
                                    <span class="block font-semibold text-slate-800">{{ $method === 'COD' ? 'COD (Bayar di Tempat)' : $method }}</span>
                                    <span class="mt-0.5 block text-xs leading-5 text-slate-500">
                                        @if ($method === 'Transfer Bank')
                                            Transfer manual; pembayaran akan diperiksa Admin.
                                        @elseif ($method === 'Tunai di Toko')
                                            Bayar tunai saat mengambil pesanan di toko.
                                        @else
                                            Bayar tunai saat pesanan diantar ke alamat Anda.
                                        @endif
                                    </span>
                                </span>
                            </label>
                        @endforeach
                    </div>
                </fieldset>

                <div class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900" data-payment-destination>
                    <p class="font-semibold">Nomor tujuan transfer demo (bukan rekening nyata)</p>
                    <p class="mt-1 font-mono text-sm font-bold tracking-wide">12345678901234567890</p>
                    <p class="mt-1">Hanya angka contoh untuk simulasi. Jangan lakukan transfer uang ke nomor ini.</p>
                </div>

                <div>
                    <label for="payment-reference" class="block text-xs font-medium text-slate-600" data-payment-reference-label>Nomor referensi transaksi</label>
                    <input id="payment-reference" name="payment_reference" value="{{ old('payment_reference') }}" maxlength="255" placeholder="Masukkan nomor referensi transaksi" aria-describedby="payment-reference-help" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" data-payment-reference>
                    <p id="payment-reference-help" class="mt-1 text-xs leading-5 text-slate-500" data-payment-reference-help>Isi nomor referensi/ID transaksi dari aplikasi setelah transfer. Angka tujuan di atas hanya contoh, bukan rekening sungguhan.</p>
                </div>

                <div data-delivery-address-container class="hidden">
                    <label for="delivery-address" class="block text-xs font-medium text-slate-600">Alamat pengantaran</label>
                    <textarea id="delivery-address" name="delivery_address" rows="3" maxlength="2000" placeholder="Nama jalan, nomor rumah, kelurahan, kecamatan, kota, dan patokan" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" data-delivery-address>{{ old('delivery_address') }}</textarea>
                    <p class="mt-1 text-xs leading-5 text-slate-500">Wajib diisi untuk COD. Pastikan alamat dan nomor/patokan lokasi cukup jelas.</p>
                </div>

                <div data-payment-proof-container>
                    <span class="block text-xs font-medium text-slate-600">Bukti transfer (opsional)</span>
                    <p class="mt-1 text-xs leading-5 text-slate-500">Unggah screenshot atau foto transaksi berhasil yang menunjukkan tanggal, jumlah, dan referensi. Jangan unggah PIN, OTP, atau saldo. Format JPG, PNG, atau WebP; maksimal 2 MB.</p>
                    <div class="mt-2 flex flex-wrap items-center gap-3">
                        <input id="payment-proof" type="file" name="payment_proof" accept="image/jpeg,image/png,image/webp" class="sr-only" data-file-name>
                        <label for="payment-proof" class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16V4m0 0L7 9m5-5 5 5"/><path stroke-linecap="round" stroke-linejoin="round" d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>
                            Pilih bukti
                        </label>
                        <span class="max-w-full truncate text-xs text-slate-500" data-file-name-display>Belum ada file dipilih</span>
                    </div>
                </div>

                <button class="w-full rounded-xl bg-teal-800 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-900">Buat pesanan</button>
            </form>
        @else
            <p class="mt-5 rounded-xl bg-slate-100 p-4 text-sm font-medium text-slate-500">Stok produk sedang habis.</p>
        @endif
    </article>
</section>
@endsection
