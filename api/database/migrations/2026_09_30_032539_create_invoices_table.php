<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();

            $table->foreignId('company_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('invoice_number');
            $table->date('invoice_date');

            $table->string('seller_name');
            $table->string('customer_name');
            $table->string('customer_tax_id');
            $table->string('customer_email');

            $table->string('currency', 3);

            $table->decimal('subtotal', 15, 2);
            $table->decimal('tax_amount', 15, 2);
            $table->decimal('total_amount', 15, 2);

            $table->string('status')->default('PENDING');

            $table->uuid('idempotency_key')->unique();

            $table->timestamps();

            // Prevent duplicate invoice numbers within the same company
            $table->unique([
                'company_id',
                'invoice_number',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};