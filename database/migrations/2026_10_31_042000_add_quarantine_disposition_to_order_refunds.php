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
            if (! Schema::hasColumn('order_refunds', 'quarantine_disposition')) {
                $table->string('quarantine_disposition')->nullable()->after('is_restocked');
            }
            if (! Schema::hasColumn('order_refunds', 'quarantine_reference')) {
                $table->string('quarantine_reference')->nullable()->after('quarantine_disposition');
            }
            if (! Schema::hasColumn('order_refunds', 'quarantine_notes')) {
                $table->text('quarantine_notes')->nullable()->after('quarantine_reference');
            }
            if (! Schema::hasColumn('order_refunds', 'quarantine_processed_by')) {
                $table->unsignedBigInteger('quarantine_processed_by')->nullable()->after('quarantine_notes');
            }
            if (! Schema::hasColumn('order_refunds', 'quarantine_processed_at')) {
                $table->timestamp('quarantine_processed_at')->nullable()->after('quarantine_processed_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_refunds', function (Blueprint $table) {
            $table->dropColumn([
                'quarantine_disposition',
                'quarantine_reference',
                'quarantine_notes',
                'quarantine_processed_by',
                'quarantine_processed_at',
            ]);
        });
    }
};