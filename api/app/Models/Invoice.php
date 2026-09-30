<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    protected $fillable = [
        'company_id',
        'invoice_number',
        'invoice_date',
        'seller_name',
        'customer_name',
        'customer_tax_id',
        'customer_email',
        'currency',
        'subtotal',
        'tax_amount',
        'total_amount',
        'status',
        'idempotency_key',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function processingLogs(): HasMany
    {
        return $this->hasMany(ProcessingLog::class);
    }
}