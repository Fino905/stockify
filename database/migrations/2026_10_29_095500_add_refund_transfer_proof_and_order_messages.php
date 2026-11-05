<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('order_refunds') && ! Schema::hasColumn('order_refunds', 'refund_transfer_proof')) {
            Schema::table('order_refunds', function (Blueprint $table) {
                $table->string('refund_transfer_proof', 1000)->nullable()->after('damage_image');
            });
        }

        if (! Schema::hasTable('order_messages')) {
            Schema::create('order_messages', function (Blueprint $table) {
                $table->increments('id');
                $table->unsignedInteger('order_id')->index();
                $table->unsignedInteger('sender_id')->index();
                $table->text('message');
                $table->string('attachment', 1000)->nullable();
                $table->timestamps();

                $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
                $table->foreign('sender_id')->references('id')->on('users')->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('order_messages');

        if (Schema::hasTable('order_refunds') && Schema::hasColumn('order_refunds', 'refund_transfer_proof')) {
            Schema::table('order_refunds', function (Blueprint $table) {
                $table->dropColumn('refund_transfer_proof');
            });
        }
    }
};
