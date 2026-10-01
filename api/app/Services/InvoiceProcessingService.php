<?php

namespace App\Services;

use App\Models\Invoice;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

class InvoiceProcessingService
{
    public function __construct(
        private GovernmentApiService $governmentApi
    ) {}

    public function process(Invoice $invoice): Invoice
    {
        /*
         * Do not process an invoice that has already
         * been successfully submitted.
         */
        if ($invoice->status === 'SUBMITTED') {
            return $invoice->fresh([
                'items',
                'processingLogs',
            ]);
        }

        /*
         * Mark the invoice as currently being processed.
         */
        $invoice->update([
            'status' => 'PROCESSING',
        ]);

        $invoice->processingLogs()->create([
            'status' => 'PROCESSING',
            'message' => 'Submitting invoice to government API.',
            'http_status' => null,
            'retryable' => false,
        ]);

        try {
            /*
             * Build the payload sent to the government API.
             *
             * The external_idempotency_key MUST remain the same
             * for every retry of this invoice.
             */
            $payload = [
                'invoice_number' => $invoice->invoice_number,

                'external_idempotency_key' =>
                $invoice->external_idempotency_key,

                'invoice_date' =>
                $invoice->invoice_date?->format('Y-m-d'),

                'seller' => [
                    'name' => $invoice->seller_name,
                ],

                'customer' => [
                    'name' => $invoice->customer_name,
                    'tax_id' => $invoice->customer_tax_id,
                    'email' => $invoice->customer_email,
                ],

                'currency' => $invoice->currency,

                'subtotal' => $invoice->subtotal,
                'tax_amount' => $invoice->tax_amount,
                'total_amount' => $invoice->total_amount,

                'items' => $invoice->items
                    ->map(function ($item) {
                        return [
                            'description' => $item->description,
                            'quantity' => $item->quantity,
                            'unit_price' => $item->unit_price,
                            'tax_rate' => $item->tax_rate,
                            'tax_amount' => $item->tax_amount,
                            'line_total' => $item->line_total,
                        ];
                    })
                    ->values()
                    ->all(),
            ];

            /*
             * Send the invoice to the external government API.
             */
            $response = $this->governmentApi->submit($payload);

            $status = $response['http_status'];
            $body = $response['body'] ?? [];

            /*
             * =========================================================
             * 200 - SUCCESS
             * =========================================================
             */
            if ($status === 200) {
                $invoice->update([
                    'status' => 'SUBMITTED',
                ]);

                $invoice->processingLogs()->create([
                    'status' => 'SUBMITTED',
                    'message' => $body['message']
                        ?? 'Invoice accepted by government API.',
                    'http_status' => 200,
                    'retryable' => false,
                    'external_reference' =>
                    $body['reference'] ?? null,
                ]);

                return $invoice->fresh([
                    'items',
                    'processingLogs',
                ]);
            }

            /*
             * =========================================================
             * 400 - INVALID INVOICE
             * =========================================================
             *
             * This is a permanent failure.
             * Retrying the same invoice will not fix the problem.
             */
            if ($status === 400) {
                $message = $body['message']
                    ?? 'Government API rejected the invoice.';

                $invoice->update([
                    'status' => 'FAILED',
                ]);

                $invoice->processingLogs()->create([
                    'status' => 'FAILED',
                    'message' => $message,
                    'http_status' => 400,
                    'retryable' => false,
                ]);

                throw new RuntimeException($message);
            }

            /*
             * =========================================================
             * 503 - TEMPORARY GOVERNMENT API FAILURE
             * =========================================================
             *
             * This is retryable.
             */
            if ($status === 503) {
                $message = $body['message']
                    ?? 'Government API is temporarily unavailable.';

                $invoice->update([
                    'status' => 'FAILED',
                ]);

                $invoice->processingLogs()->create([
                    'status' => 'FAILED',
                    'message' => $message,
                    'http_status' => 503,
                    'retryable' => true,
                ]);

                throw new RuntimeException($message);
            }

            /*
             * =========================================================
             * OTHER HTTP ERRORS
             * =========================================================
             *
             * 5xx errors are considered retryable.
             * Other 4xx errors are considered permanent failures.
             */
            $message = $body['message']
                ?? 'Government API returned an unexpected response.';

            $retryable = $status >= 500;

            $invoice->update([
                'status' => 'FAILED',
            ]);

            $invoice->processingLogs()->create([
                'status' => 'FAILED',
                'message' => $message,
                'http_status' => $status,
                'retryable' => $retryable,
            ]);

            throw new RuntimeException($message);
        } catch (Throwable $e) {
            /*
             * =========================================================
             * TIMEOUT / NETWORK FAILURE / UNEXPECTED EXCEPTION
             * =========================================================
             *
             * If the government API did not respond, we cannot know
             * whether it processed the invoice.
             *
             * Therefore the failure is retryable.
             *
             * The SAME external_idempotency_key will be used when
             * the invoice is retried.
             */
            $freshInvoice = $invoice->fresh();

            if ($freshInvoice?->status !== 'FAILED') {
                $invoice->update([
                    'status' => 'FAILED',
                ]);

                $invoice->processingLogs()->create([
                    'status' => 'FAILED',
                    'message' => $e->getMessage()
                        ?: 'Government API request failed.',
                    'http_status' => null,
                    'retryable' => true,
                ]);
            }

            throw $e;
        }
    }
}
