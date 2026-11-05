<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderRefund extends Model
{
    use HasFactory;

    protected $table = 'order_refunds';

    protected $fillable = [
        'order_id',
        'user_id',
        'reason',
        'description',
        'damage_image',
        'refund_transfer_proof',
        'status',
        'return_tracking_number',
        'goods_received_by',
        'goods_received_at',
        'goods_condition_notes',
        'goods_condition_status',
        'is_restocked',
        'quarantine_disposition',
        'quarantine_reference',
        'quarantine_notes',
        'quarantine_processed_by',
        'quarantine_processed_at',
        'admin_notes',
        'processed_by',
        'processed_at',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
        'goods_received_at' => 'datetime',
        'quarantine_processed_at' => 'datetime',
        'is_restocked' => 'boolean',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function goodsReceiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'goods_received_by');
    }

    public function quarantineProcessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'quarantine_processed_by');
    }
}
