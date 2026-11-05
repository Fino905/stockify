<?php

namespace App\Http\Controllers;

use App\Models\WarehouseNote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class WarehouseNoteController extends Controller
{
    /**
     * Simpan catatan baru dari form.
     */
    public function store(Request $request): RedirectResponse
    {
        // 1. Validasi data yang dikirim user
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'category' => ['nullable', 'string', 'max:50'],
            'priority' => ['required', 'in:low,medium,high'],
            'is_pinned' => ['boolean'],
        ]);

        // 2. Tempelkan ID user yang sedang login
        $validated['user_id'] = $request->user()->id;

        // 3. Masukkan ke database
        WarehouseNote::create($validated);

        // 4. Balikkan ke dashboard dengan pesan sukses
        return back()->with('success', 'Catatan gudang berhasil ditambahkan!');
    }

    /**
     * Hapus catatan berdasarkan ID.
     */
    public function destroy(Request $request, WarehouseNote $note): RedirectResponse
    {
        $user = $request->user();
        if ($note->user_id !== $user->id && $user->role !== 'admin') {
            abort(403, 'Anda tidak memiliki hak untuk menghapus catatan gudang ini.');
        }

        $note->delete();

        return back()->with('success', 'Catatan gudang berhasil dihapus!');
    }
}
