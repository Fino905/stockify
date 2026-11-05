@extends('layouts.guest')

@section('title', 'Kontak Kami - Stockify')

@section('content')
@php($dataGudang = $inGudang ?? $infoGudang ?? [])
<div class="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6">
    <div class="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xs border border-gray-200">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
            Hubungi {{ $dataGudang['nama'] ?? 'Gudang Stockify' }}
        </h1>
        <p class="text-gray-500 text-sm mb-6">
            Ada pertanyaan seputar pengiriman atau mutasi barang? Hubungi layanan operasional kami di bawah:
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6 text-sm">
            <div class="p-4 bg-gray-50 rounded-xl">
                <span class="text-xs font-semibold text-gray-400 block mb-1">Alamat Gudang</span>
                <p class="font-medium text-gray-800">{{ $dataGudang['alamat'] ?? '-' }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-xl">
                <span class="text-xs font-semibold text-gray-400 block mb-1">Kontak Langsung</span>
                <p class="font-medium text-gray-800">Telp: {{ $dataGudang['telepon'] ?? '-' }}</p>
                <p class="font-medium text-gray-800">Email: {{ $dataGudang['email'] ?? '-' }}</p>
            </div>
        </div>

        <div class="mt-8 border-t border-gray-100 pt-6">
            <a href="{{ route('home') }}" class="text-xs font-semibold text-[#321E48] hover:underline">
                &larr; Kembali ke Beranda
            </a>
        </div>
    </div>
</div>
@endsection
