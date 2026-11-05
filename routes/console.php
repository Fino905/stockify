<?php

use App\Models\TeamInvitation;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    TeamInvitation::query()
        ->whereNotNull('expires_at')
        ->where('expires_at', '<', now())
        ->delete();
})->daily()->description('Delete expired team invitations');

Schedule::command('products:delete-zero-stock --days=3')
    ->daily()
    ->description('Otomatis menghapus produk yang stoknya 0 lebih dari 3 hari');
