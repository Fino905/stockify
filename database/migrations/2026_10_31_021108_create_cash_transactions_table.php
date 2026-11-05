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
        Schema::dropIfExists('cash_transactions');

        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('transaction_number', 50)->unique()->index();
            $table->enum('type', ['in', 'out'])->index();
            $table->string('category', 50)->index();
            $table->decimal('amount', 15, 2);
            $table->date('date')->index();
            $table->text('description');
            $table->string('proof_image')->nullable();
            $table->unsignedInteger('order_id')->nullable()->index();
            $table->unsignedInteger('user_id')->nullable()->index();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->nullOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_transactions');
    }
};
