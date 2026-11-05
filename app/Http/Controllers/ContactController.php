<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

class ContactController extends Controller
{
    public function index(): View
    {
        $infoGudang = [
            'nama' => 'Gudang Logistik Stockify Pusat',
            'alamat' => 'Kawasan Industri Brantas Jl. Lolaras',
            'telepon' => '085857308470',
            'email' => 'finofebriantohabibal@gmail.com',
        ];

        return view('kontak.kontak', compact('infoGudang'));
    }
}
