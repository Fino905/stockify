<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    /**
     * Tampilkan halaman pengaturan aplikasi.
     */
    public function index(Request $request)
    {
        $settings = collect(Setting::allKeyed());

        if ($request->wantsJson()) {
            return response()->json(Setting::getAppSettings());
        }

        if (view()->exists('settings.index')) {
            return view('settings.index', compact('settings'));
        }

        return redirect()->route('dashboard');
    }

    /**
     * Simpan pembaruan pengaturan aplikasi.
     */
    public function update(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'app_name' => 'nullable|string|max:80',
            'appName' => 'nullable|string|max:80',
            'warehouse_name' => 'nullable|string|max:150',
            'warehouseName' => 'nullable|string|max:150',
            'contact' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150',
            'address' => 'nullable|string|max:500',
            'app_info' => 'nullable|string|max:1000',
            'appInfo' => 'nullable|string|max:1000',
            'logo' => $request->hasFile('logo')
                ? 'required|image|mimes:jpeg,png,jpg,webp,svg|max:2048'
                : 'nullable|string|max:1000',
            'logo_url' => 'nullable|string|max:1000',
            'remove_logo' => 'nullable|boolean',
        ]);

        $appName = $validated['app_name'] ?? $validated['appName'] ?? null;
        if ($appName !== null) {
            Setting::set('app_name', $appName);
        }

        $warehouseName = $validated['warehouse_name'] ?? $validated['warehouseName'] ?? null;
        if ($warehouseName !== null) {
            Setting::set('warehouse_name', $warehouseName);
        }

        if (isset($validated['contact'])) {
            Setting::set('contact', $validated['contact']);
        }

        if (isset($validated['email'])) {
            Setting::set('email', $validated['email']);
        }

        if (isset($validated['address'])) {
            Setting::set('address', $validated['address']);
        }

        $appInfo = $validated['app_info'] ?? $validated['appInfo'] ?? null;
        if ($appInfo !== null) {
            Setting::set('app_info', $appInfo);
        }

        if ($request->boolean('remove_logo')) {
            $oldLogo = Setting::valueFor('logo');
            if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
                Storage::disk('public')->delete($oldLogo);
            }
            Setting::set('logo', null);
        } elseif ($request->hasFile('logo')) {
            $oldLogo = Setting::valueFor('logo');
            if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
                Storage::disk('public')->delete($oldLogo);
            }
            $path = $request->file('logo')->store('settings', 'public');
            Setting::set('logo', $path);
        } elseif ($request->filled('logo_url')) {
            $oldLogo = Setting::valueFor('logo');
            if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
                Storage::disk('public')->delete($oldLogo);
            }
            Setting::set('logo', $request->input('logo_url'));
        } elseif ($request->filled('logo') && is_string($request->input('logo'))) {
            $oldLogo = Setting::valueFor('logo');
            if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
                Storage::disk('public')->delete($oldLogo);
            }
            Setting::set('logo', $request->input('logo'));
        }

        $resolvedLogo = Setting::getLogoUrl();
        $appSettings = Setting::getAppSettings();

        $msg = 'Pengaturan aplikasi dan logo berhasil disimpan!';

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $msg,
                'logo' => $resolvedLogo,
                'appSettings' => $appSettings,
                'settings' => Setting::allKeyed(),
            ]);
        }

        return back()->with('status', $msg)->with('success', $msg);
    }
}
