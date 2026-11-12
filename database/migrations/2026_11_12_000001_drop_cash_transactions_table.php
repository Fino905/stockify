<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('cash_transactions');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Fitur buku kas telah dihapus permanen.
    }
};

