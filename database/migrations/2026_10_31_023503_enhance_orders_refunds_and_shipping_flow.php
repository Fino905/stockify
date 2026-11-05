<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Kolom logistik pengiriman pada tabel orders
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'shipping_courier')) {
                $table->string('shipping_courier', 50)->nullable()->after('payment_reference');
            }
            if (! Schema::hasColumn('orders', 'tracking_number')) {
                $table->string('tracking_number', 100)->nullable()->after('shipping_courier');
            }
            if (! Schema::hasColumn('orders', 'shipped_at')) {
                $table->timestamp('shipped_at')->nullable()->after('tracking_number');
            }
            if (! Schema::hasColumn('orders', 'received_at')) {
                $table->timestamp('received_at')->nullable()->after('shipped_at');
            }
        });

        // 2. Modifikasi kolom status & tambah verifikasi fisik pada tabel order_refunds
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `order_refunds` MODIFY COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'pending'");
        }

        Schema::table('order_refunds', function (Blueprint $table) {
            if (! Schema::hasColumn('order_refunds', 'return_tracking_number')) {
                $table->string('return_tracking_number', 100)->nullable()->after('status');
            }
            if (! Schema::hasColumn('order_refunds', 'goods_received_by')) {
                $table->unsignedInteger('goods_received_by')->nullable()->after('return_tracking_number');
                $table->foreign('goods_received_by')->references('id')->on('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('order_refunds', 'goods_received_at')) {
                $table->timestamp('goods_received_at')->nullable()->after('goods_received_by');
            }
            if (! Schema::hasColumn('order_refunds', 'goods_condition_notes')) {
                $table->text('goods_condition_notes')->nullable()->after('goods_received_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_courier', 'tracking_number', 'shipped_at', 'received_at']);
        });

        Schema::table('order_refunds', function (Blueprint $table) {
            $table->dropForeign(['goods_received_by']);
            $table->dropColumn(['return_tracking_number', 'goods_received_by', 'goods_received_at', 'goods_condition_notes']);
        });
    }
};
