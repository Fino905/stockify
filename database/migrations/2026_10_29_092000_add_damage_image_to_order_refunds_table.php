<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('order_refunds') && ! Schema::hasColumn('order_refunds', 'damage_image')) {
            Schema::table('order_refunds', function (Blueprint $table) {
                $table->string('damage_image', 1000)->nullable()->after('description');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('order_refunds') && Schema::hasColumn('order_refunds', 'damage_image')) {
            Schema::table('order_refunds', function (Blueprint $table) {
                $table->dropColumn('damage_image');
            });
        }
    }
};
