<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tambahkan category_id ke tabel suppliers (untuk spesialisasi komoditas supplier, misal: Honda hanya motor)
        if (Schema::hasTable('suppliers') && ! Schema::hasColumn('suppliers', 'category_id')) {
            Schema::table('suppliers', function (Blueprint $table) {
                $table->unsignedInteger('category_id')->nullable()->after('name')->index();
                $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
            });
        }

        // 2. Modifikasi kolom order_status & payment_status di tabel orders agar fleksibel mendukung status konfirmasi
        if (Schema::hasTable('orders')) {
            if (DB::getDriverName() === 'mysql') {
                DB::statement("ALTER TABLE `orders` MODIFY COLUMN `order_status` VARCHAR(50) NOT NULL DEFAULT 'pending_confirmation'");
                DB::statement("ALTER TABLE `orders` MODIFY COLUMN `payment_status` VARCHAR(50) NOT NULL DEFAULT 'waiting_confirmation'");
            } else {
                Schema::table('orders', function (Blueprint $table) {
                    $table->string('order_status', 50)->default('pending_confirmation')->change();
                    $table->string('payment_status', 50)->default('waiting_confirmation')->change();
                });
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('suppliers') && Schema::hasColumn('suppliers', 'category_id')) {
            Schema::table('suppliers', function (Blueprint $table) {
                $table->dropForeign(['category_id']);
                $table->dropColumn('category_id');
            });
        }
    }
};

