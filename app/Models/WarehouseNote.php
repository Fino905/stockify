<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WarehouseNote extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'content',
        'category',
        'priority',
        'is_pinned',
        'code',
        'type',
        'notes',
        'notes_staff',
        'notes_production',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function noteItems()
    {
        return $this->hasMany(WarehouseNoteItem::class);
    }
}
