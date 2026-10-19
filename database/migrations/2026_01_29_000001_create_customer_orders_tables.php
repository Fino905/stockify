<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tambahkan 'customer' ke ENUM role pada tabel users
        DB::statement("ALTER TABLE `users` MODIFY COLUMN `role` ENUM('admin', 'manajer_gudang', 'staff_gudang', 'customer') NOT NULL DEFAULT 'staff_gudang'");

        // 2. Tabel orders
        if (! Schema::hasTable('orders')) {
            Schema::create('orders', function (Blueprint $table) {
                $table->increments('id');
                $table->string('order_number', 50)->unique();
                $table->unsignedInteger('user_id')->index();
                $table->unsignedInteger('product_id')->index();
                $table->unsignedInteger('staff_id')->nullable()->index();
                $table->unsignedInteger('quantity')->default(1);
                $table->decimal('unit_price', 15, 2)->default(0.00);
                $table->decimal('total_price', 15, 2)->default(0.00);
                $table->string('payment_method', 50)->default('qris');
                $table->enum('payment_status', ['paid', 'unpaid'])->default('paid');
                $table->string('payment_reference', 100)->nullable();
                $table->enum('order_status', ['completed', 'refund_pending', 'refund_approved', 'refund_rejected'])->default('completed')->index();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
                $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
                $table->foreign('staff_id')->references('id')->on('users')->nullOnDelete();
            });
        }

        // 3. Tabel ulasan / feedback pelanggan
        if (! Schema::hasTable('order_feedbacks')) {
            Schema::create('order_feedbacks', function (Blueprint $table) {
                $table->increments('id');
                $table->unsignedInteger('order_id')->unique()->index();
                $table->unsignedInteger('product_id')->index();
                $table->unsignedInteger('user_id')->index();
                $table->unsignedTinyInteger('rating')->default(5);
                $table->text('comment');
                $table->timestamps();

                $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
                $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            });
        }

        // 4. Tabel pengajuan refund / retur
        if (! Schema::hasTable('order_refunds')) {
            Schema::create('order_refunds', function (Blueprint $table) {
                $table->increments('id');
                $table->unsignedInteger('order_id')->unique()->index();
                $table->unsignedInteger('user_id')->index();
                $table->string('reason', 150);
                $table->text('description')->nullable();
                $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();
                $table->text('admin_notes')->nullable();
                $table->unsignedInteger('processed_by')->nullable()->index();
                $table->timestamp('processed_at')->nullable();
                $table->timestamps();

                $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
                $table->foreign('processed_by')->references('id')->on('users')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('order_refunds');
        Schema::dropIfExists('order_feedbacks');
        Schema::dropIfExists('orders');

        DB::statement("ALTER TABLE `users` MODIFY COLUMN `role` ENUM('admin', 'manajer_gudang', 'staff_gudang') NOT NULL DEFAULT 'staff_gudang'");
    }
};
