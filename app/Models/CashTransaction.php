<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashTransaction extends Model
{
    use HasFactory;

    protected $table = 'cash_transactions';

    protected $fillable = [
        'transaction_number',
        'type',
        'category',
        'amount',
        'date',
        'description',
        'proof_image',
        'user_id',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

