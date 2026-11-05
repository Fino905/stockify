<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('order_refunds', function (Blueprint $table) {
            if (! Schema::hasColumn('order_refunds', 'is_restocked')) {
                $table->boolean('is_restocked')->default(true)->after('goods_condition_notes');
            }
            if (! Schema::hasColumn('order_refunds', 'goods_condition_status')) {
                $table->string('goods_condition_status', 50)->default('good_restock')->after('goods_condition_notes');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_refunds', function (Blueprint $table) {
            $table->dropColumn(['is_restocked', 'goods_condition_status']);
        });
    }
};

