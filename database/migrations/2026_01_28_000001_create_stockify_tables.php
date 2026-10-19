<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name', 100)->unique();
                $table->text('description')->nullable();
            });
        }

        if (! Schema::hasTable('suppliers')) {
            Schema::create('suppliers', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name', 150);
                $table->text('address')->nullable();
                $table->string('phone', 20)->nullable();
                $table->string('email', 150)->nullable();
            });
        }

        if (! Schema::hasTable('products')) {
            Schema::create('products', function (Blueprint $table) {
                $table->increments('id');
                $table->unsignedInteger('category_id')->index();
                $table->unsignedInteger('supplier_id')->nullable()->index();
                $table->string('name', 150);
                $table->string('sku', 50)->unique();
                $table->text('description')->nullable();
                $table->decimal('purchase_price', 15, 2)->default(0.00);
                $table->decimal('selling_price', 15, 2)->default(0.00);
                $table->string('image')->nullable();
                $table->unsignedInteger('minimum_stock')->default(0);

                $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();
                $table->foreign('supplier_id')->references('id')->on('suppliers')->nullOnDelete();
            });
        }

        if (! Schema::hasTable('product_attributes')) {
            Schema::create('product_attributes', function (Blueprint $table) {
                $table->increments('id');
                $table->unsignedInteger('product_id')->index();
                $table->string('name', 100);
                $table->string('value', 255);

                $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            });
        }

        if (! Schema::hasTable('stock_transactions')) {
            Schema::create('stock_transactions', function (Blueprint $table) {
                $table->increments('id');
                $table->unsignedInteger('product_id')->index();
                $table->unsignedInteger('user_id')->index();
                $table->enum('type', ['in', 'out']);
                $table->unsignedInteger('quantity');
                $table->date('date')->index();
                $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending')->index();
                $table->text('notes')->nullable();

                $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_transactions');
        Schema::dropIfExists('product_attributes');
        Schema::dropIfExists('products');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('categories');
    }
};
