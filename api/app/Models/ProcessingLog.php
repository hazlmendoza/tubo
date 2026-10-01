<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcessingLog extends Model
{
    protected $fillable = [
        'invoice_id',
        'status',
        'message',
        'http_status',
        'retryable',
        'external_reference',
    ];

    protected $casts = [
        'retryable' => 'boolean',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}