@extends('layouts.stockify')

@section('title', 'Feedback produk - Stockify')

@section('content')
<div><p class="text-sm font-medium text-teal-800">Akun customer</p><h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Feedback produk</h1><p class="mt-1 text-sm text-slate-500">Berikan rating dan masukan untuk produk yang telah dibayar. Feedback dapat diperbarui.</p></div>
@if (session('status'))<p class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{{ session('status') }}</p>@endif
@if ($errors->any())<p class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{{ $errors->first() }}</p>@endif
<section class="mt-6 grid gap-4 md:grid-cols-2">
    @forelse ($items as $item)
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs text-slate-500">Pesanan {{ $item->order->order_number }}</p>
            <h2 class="mt-1 font-semibold text-slate-900">{{ $item->product_name }}</h2>
            <p class="mt-1 text-xs text-slate-500">Dibeli {{ $item->order->paid_at?->format('d M Y') ?? $item->order->created_at->format('d M Y') }}</p>
            <form action="{{ route('feedback.store', $item) }}" method="POST" class="mt-4 space-y-3">@csrf
                <label class="block text-sm font-medium text-slate-700">Rating
                    <select name="rating" required class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                        @foreach (range(5, 1) as $rating)<option value="{{ $rating }}" @selected(($item->feedback?->rating ?? 5) === $rating)>{{ $rating }} / 5</option>@endforeach
                    </select>
                </label>
                <label class="block text-sm font-medium text-slate-700">Komentar
                    <textarea name="comment" rows="3" maxlength="2000" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Ceritakan pengalaman menggunakan produk">{{ old('comment', $item->feedback?->comment) }}</textarea>
                </label>
                <button class="rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white">{{ $item->feedback ? 'Perbarui feedback' : 'Kirim feedback' }}</button>
            </form>
        </article>
    @empty
        <p class="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Feedback tersedia setelah pembayaran pesanan diverifikasi Admin.</p>
    @endforelse
</section>
<div class="mt-5">{{ $items->links() }}</div>
@endsection
