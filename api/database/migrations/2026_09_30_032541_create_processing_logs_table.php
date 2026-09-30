<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('processing_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('invoice_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->unsignedInteger('attempt_number');

            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();

            $table->unsignedSmallInteger('http_status')->nullable();

            $table->string('status');

            $table->text('error_message')->nullable();

            $table->timestamps();

            $table->index([
                'invoice_id',
                'attempt_number',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('processing_logs');
    }
};