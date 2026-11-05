<?php

namespace App\Http\Controllers;

use App\Models\CashTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CashTransactionController extends Controller
{
    /**
     * Catat transaksi kas masuk atau kas keluar manual
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (! in_array($user->role, ['admin', 'manajer_gudang', 'staff_gudang'])) {
            abort(403, 'Hanya Manajemen & Staf Gudang yang berhak mencatat transaksi Buku Kas.');
        }

        // Staf gudang hanya berwenang mencatat pengeluaran operasional / kas kecil (petty cash)
        if ($user->role === 'staff_gudang') {
            if ($request->input('type') !== 'out') {
                return back()->withErrors(['type' => 'Staf gudang hanya dapat mencatat pengeluaran operasional (kas kecil / petty cash gudang).']);
            }
            // Batas maksimal plafon pengeluaran kas kecil staf gudang (Rp 500.000 per transaksi)
            $maxPettyCash = 500000;
            if ((float) $request->input('amount') > $maxPettyCash) {
                return back()->withErrors([
                    'amount' => 'Nominal pengeluaran melebihi batas plafon kas kecil staf gudang (Maksimal Rp 500.000 per nota/transaksi). Pengeluaran di atas Rp 500.000 wajib diajukan dan dicatat oleh Manajer Gudang.',
                ]);
            }
        }

        $validated = $request->validate([
            'type' => 'required|in:in,out',
            'category' => 'required|string|max:100',
            'amount' => 'required|numeric|min:1',
            'date' => 'required|date',
            'description' => 'required|string|max:1000',
            'notes' => 'nullable|string|max:500',
            'proof_image' => 'nullable',
        ]);

        $proofImagePath = null;

        // Tangani jika bukti diunggah sebagai file gambar
        if ($request->hasFile('proof_image')) {
            $path = $request->file('proof_image')->store('cash_proofs', 'public');
            $proofImagePath = '/storage/' . $path;
        } elseif (! empty($request->input('proof_image')) && is_string($request->input('proof_image'))) {
            $imageData = $request->input('proof_image');
            if (str_starts_with($imageData, 'data:image')) {
                // Decode foto dari CameraCaptureModal (Base64)
                @list($type, $imageData) = explode(';', $imageData);
                @list(, $imageData) = explode(',', $imageData);
                $decoded = base64_decode($imageData);
                if ($decoded !== false) {
                    $fileName = 'cash_proofs/cam_' . time() . '_' . Str::random(8) . '.jpg';
                    Storage::disk('public')->put($fileName, $decoded);
                    $proofImagePath = '/storage/' . $fileName;
                }
            } elseif (str_starts_with($imageData, '/storage/')) {
                $proofImagePath = $imageData;
            }
        }

        // Generate nomor transaksi kas unik: CSH-YYYYMM-XXXX
        $yearMonth = date('Ym', strtotime($validated['date']));
        $countThisMonth = CashTransaction::where('transaction_number', 'like', "CSH-{$yearMonth}-%")->count();
        $trxNumber = sprintf("CSH-%s-%04d", $yearMonth, $countThisMonth + 1);

        // Pastikan unik
        $suffix = 1;
        while (CashTransaction::where('transaction_number', $trxNumber)->exists()) {
            $trxNumber = sprintf("CSH-%s-%04d", $yearMonth, $countThisMonth + 1 + $suffix);
            $suffix++;
        }

        CashTransaction::create([
            'transaction_number' => $trxNumber,
            'type' => $validated['type'],
            'category' => $validated['category'],
            'amount' => $validated['amount'],
            'date' => $validated['date'],
            'description' => $validated['description'],
            'proof_image' => $proofImagePath,
            'notes' => $validated['notes'] ?? null,
            'user_id' => $user->id,
        ]);

        $typeLabel = $validated['type'] === 'in' ? 'Uang Masuk (+)' : 'Pengeluaran (-)';
        $formattedAmount = 'Rp ' . number_format($validated['amount'], 0, ',', '.');

        return back()->with('success', "Catatan {$typeLabel} sebesar {$formattedAmount} berhasil dibukukan dengan nomor #{$trxNumber}.");
    }

    /**
     * Hapus catatan arus kas
     */
    public function destroy(Request $request, CashTransaction $cashTransaction): RedirectResponse
    {
        $user = $request->user();
        if (! in_array($user->role, ['admin', 'manajer_gudang'])) {
            abort(403, 'Hanya Manajemen (Admin & Manajer Gudang) yang berhak menghapus catatan Buku Kas.');
        }

        // Hapus file bukti jika ada dan disimpan di storage lokal
        if ($cashTransaction->proof_image && str_starts_with($cashTransaction->proof_image, '/storage/cash_proofs/')) {
            $relative = str_replace('/storage/', '', $cashTransaction->proof_image);
            Storage::disk('public')->delete($relative);
        }

        $trxNum = $cashTransaction->transaction_number;
        $cashTransaction->delete();

        return back()->with('success', "Catatan kas #{$trxNum} berhasil dihapus.");
    }
}

