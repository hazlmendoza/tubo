<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('government_submissions', function (Blueprint $table) {
            $table->id();

            $table->string('idempotency_key')->unique();

            $table->string('invoice_number');

            $table->string('reference');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('government_submissions');
    }
};