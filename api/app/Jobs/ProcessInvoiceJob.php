<?php

namespace App\Jobs;

use App\Models\Invoice;
use App\Services\InvoiceProcessingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Throwable;

class ProcessInvoiceJob implements ShouldQueue
{
    use Queueable;

    /*
     * Maximum number of attempts for temporary failures.
     */
    public int $tries = 5;

    public function __construct(
        public int $invoiceId
    ) {
    }

    /*
     * Retry delays:
     *
     * Attempt 1 → immediately
     * Attempt 2 → after 1 minute
     * Attempt 3 → after 5 minutes
     * Attempt 4 → after 15 minutes
     * Attempt 5 → after 30 minutes
     */
    public function backoff(): array
    {
        return [
            60,
            300,
            900,
            1800,
        ];
    }

    /*
     * Prevent two workers from processing the same invoice
     * at the same time.
     */
    public function middleware(): array
    {
        return [
            (new WithoutOverlapping(
                "invoice:{$this->invoiceId}"
            ))->expireAfter(300),
        ];
    }

    public function handle(
        InvoiceProcessingService $processingService
    ): void {
        /*
         * Load the invoice together with its items because
         * the processing service needs the invoice data to
         * build the government API payload.
         */
        $invoice = Invoice::with('items')
            ->find($this->invoiceId);

        /*
         * The invoice may have been deleted before the worker
         * picked up the job.
         */
        if (!$invoice) {
            return;
        }

        /*
         * If the invoice has already been submitted,
         * there is nothing left to process.
         */
        if ($invoice->status === 'SUBMITTED') {
            return;
        }

        /*
         * Only these states are allowed to enter processing.
         */
        if (!in_array($invoice->status, [
            'PENDING',
            'FAILED',
            'PROCESSING',
        ], true)) {
            return;
        }

        /*
         * This is where PENDING should become PROCESSING.
         *
         * If your database remains PENDING after this job runs,
         * the problem is either before this point or inside the
         * processing service.
         */
        $processingService->process($invoice);
    }

    /**
     * Runs when Laravel permanently gives up on the job.
     */
    public function failed(Throwable $exception): void
    {
        $invoice = Invoice::find($this->invoiceId);

        if (!$invoice) {
            return;
        }

        /*
         * The job has exhausted its allowed attempts.
         */
        $invoice->update([
            'status' => 'FAILED',
        ]);

        $invoice->processingLogs()->create([
            'status' => 'FAILED',
            'message' =>
                'Invoice processing job failed after '
                . 'maximum retry attempts: '
                . $exception->getMessage(),
            'retryable' => true,
        ]);
    }
}