<!doctype html>
<html lang="id" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#2563EB">
    @php
        $guestAppSettings = \App\Models\Setting::getAppSettings();
        $applicationName = $guestAppSettings['appName'];
        $applicationLogo = $guestAppSettings['logo'];
    @endphp
    <title>@yield('title', $applicationName . ' - Sistem Manajemen Gudang & Inventaris')</title>
    @if ($applicationLogo && !str_starts_with($applicationLogo, 'emoji:'))
        <link rel="icon" href="{{ $applicationLogo }}">
    @endif
    @vite(['resources/css/app.css'])
</head>
<body class="min-h-full m-0 p-0 bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
    @yield('content')
</body>
</html>
