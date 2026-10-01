<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GovernmentSubmission extends Model
{
    protected $fillable = [
        'idempotency_key',
        'invoice_number',
        'reference',
    ];
}