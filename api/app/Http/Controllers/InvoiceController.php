<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessInvoiceJob;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $company = $request->user()->company;

        $query = $company->invoices()
            ->with('items')
            ->latest('invoice_date')
            ->latest('id');

        if ($request->filled('status')) {
            $query->where(
                'status',
                strtoupper($request->string('status'))
            );
        }

        if ($request->filled('invoice_date')) {
            $query->whereDate(
                'invoice_date',
                $request->string('invoice_date')
            );
        }

        if ($request->filled('invoice_number')) {
            $query->where(
                'invoice_number',
                'like',
                '%' . $request->string('invoice_number') . '%'
            );
        }

        return response()->json([
            'invoices' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_date' => ['required', 'date'],

            'seller_name' => [
                'required',
                'string',
                'max:255',
            ],

            'customer_name' => [
                'required',
                'string',
                'max:255',
            ],

            'customer_tax_id' => [
                'required',
                'string',
                'max:255',
            ],

            'customer_email' => [
                'required',
                'email',
            ],

            'currency' => [
                'required',
                'string',
                'size:3',
            ],

            'items' => [
                'required',
                'array',
                'min:1',
            ],

            'items.*.description' => [
                'required',
                'string',
                'max:255',
            ],

            'items.*.quantity' => [
                'required',
                'numeric',
                'gt:0',
            ],

            'items.*.unit_price' => [
                'required',
                'numeric',
                'gte:0',
            ],

            'items.*.tax_rate' => [
                'required',
                'numeric',
                'gte:0',
                'lte:100',
            ],
        ]);

        $company = $request->user()->company;

        /*
         * Idempotency key for requests coming into Tubo.
         *
         * If the client sends the same key again, we return
         * the existing invoice instead of creating another one.
         */
        $idempotencyKey = $request->header(
            'Idempotency-Key'
        ) ?? (string) Str::uuid();

        $existingInvoice = $company->invoices()
            ->where('idempotency_key', $idempotencyKey)
            ->first();

        if ($existingInvoice) {
            return response()->json([
                'message' => 'Duplicate invoice request.',
                'invoice' => $existingInvoice->load([
                    'items',
                    'processingLogs',
                ]),
            ], 200);
        }

        $invoice = DB::transaction(function () use (
            $company,
            $validated,
            $idempotencyKey
        ) {
            $subtotal = 0;
            $taxAmount = 0;

            foreach ($validated['items'] as $item) {
                $lineSubtotal =
                    $item['quantity'] * $item['unit_price'];

                $lineTax =
                    $lineSubtotal * ($item['tax_rate'] / 100);

                $subtotal += $lineSubtotal;
                $taxAmount += $lineTax;
            }

            $totalAmount = $subtotal + $taxAmount;

            $invoiceNumber =
                'INV-' .
                now()->format('YmdHis') .
                '-' .
                strtoupper(Str::random(4));

            /*
             * This key is separate from the incoming
             * request idempotency key.
             *
             * It stays the same for every attempt to submit
             * this invoice to the government API.
             */
            $externalIdempotencyKey = (string) Str::uuid();

            $invoice = $company->invoices()->create([
                'invoice_number' => $invoiceNumber,

                'invoice_date' => $validated['invoice_date'],

                'seller_name' => $validated['seller_name'],

                'customer_name' => $validated['customer_name'],

                'customer_tax_id' => $validated['customer_tax_id'],

                'customer_email' => $validated['customer_email'],

                'currency' => strtoupper(
                    $validated['currency']
                ),

                'subtotal' => $subtotal,

                'tax_amount' => $taxAmount,

                'total_amount' => $totalAmount,

                /*
                 * Invoice has been accepted by Tubo,
                 * but has not been submitted externally yet.
                 */
                'status' => 'PENDING',

                /*
                 * Idempotency for the request coming into Tubo.
                 */
                'idempotency_key' => $idempotencyKey,

                /*
                 * Idempotency for the external government API.
                 */
                'external_idempotency_key' =>
                $externalIdempotencyKey,
            ]);

            foreach ($validated['items'] as $item) {
                $lineSubtotal =
                    $item['quantity'] * $item['unit_price'];

                $lineTax =
                    $lineSubtotal * ($item['tax_rate'] / 100);

                $lineTotal =
                    $lineSubtotal + $lineTax;

                $invoice->items()->create([
                    'description' => $item['description'],

                    'quantity' => $item['quantity'],

                    'unit_price' => $item['unit_price'],

                    'tax_rate' => $item['tax_rate'],

                    'tax_amount' => $lineTax,

                    'line_total' => $lineTotal,
                ]);
            }

            return $invoice;
        });

        /*
         * Dispatch the job only after the transaction commits.
         *
         * This prevents the worker from trying to process
         * an invoice before its database transaction is complete.
         */
        ProcessInvoiceJob::dispatch($invoice->id)
            ->afterCommit();

        $invoice->load([
            'items',
            'processingLogs',
        ]);

        return response()->json([
            'message' => 'Invoice accepted for processing.',
            'invoice' => $invoice,
        ], 202);
    }

    public function show(
        Request $request,
        Invoice $invoice
    ) {
        $this->authorizeInvoice($request, $invoice);

        return response()->json(
            $invoice->load([
                'items',
                'processingLogs',
            ])
        );
    }

    public function update(
        Request $request,
        Invoice $invoice
    ) {
        $this->authorizeInvoice($request, $invoice);

        /*
     * Do not allow invoices that are currently being
     * processed or already submitted to be edited.
     *
     * PROCESSING could be submitted while we are editing.
     * SUBMITTED has already been accepted externally.
     */
        if (!in_array($invoice->status, [
            'PENDING',
            'FAILED',
        ], true)) {
            return response()->json([
                'message' =>
                'Invoice cannot be edited in its current status.',

                'current_status' => $invoice->status,
            ], 409);
        }

        $validated = $request->validate([
            'invoice_date' => ['required', 'date'],

            'seller_name' => [
                'required',
                'string',
                'max:255',
            ],

            'customer_name' => [
                'required',
                'string',
                'max:255',
            ],

            'customer_tax_id' => [
                'required',
                'string',
                'max:255',
            ],

            'customer_email' => [
                'required',
                'email',
            ],

            'currency' => [
                'required',
                'string',
                'size:3',
            ],

            'items' => [
                'required',
                'array',
                'min:1',
            ],

            'items.*.description' => [
                'required',
                'string',
                'max:255',
            ],

            'items.*.quantity' => [
                'required',
                'numeric',
                'gt:0',
            ],

            'items.*.unit_price' => [
                'required',
                'numeric',
                'gte:0',
            ],

            'items.*.tax_rate' => [
                'required',
                'numeric',
                'gte:0',
                'lte:100',
            ],
        ]);

        DB::transaction(function () use (
            $invoice,
            $validated
        ) {
            $subtotal = 0;
            $taxAmount = 0;

            /*
         * Recalculate all financial values on the server.
         */
            foreach ($validated['items'] as $item) {
                $lineSubtotal =
                    $item['quantity'] * $item['unit_price'];

                $lineTax =
                    $lineSubtotal * ($item['tax_rate'] / 100);

                $subtotal += $lineSubtotal;
                $taxAmount += $lineTax;
            }

            $totalAmount = $subtotal + $taxAmount;

            /*
         * Update invoice header and calculated totals.
         */
            $invoice->update([
                'invoice_date' => $validated['invoice_date'],

                'seller_name' => $validated['seller_name'],

                'customer_name' => $validated['customer_name'],

                'customer_tax_id' => $validated['customer_tax_id'],

                'customer_email' => $validated['customer_email'],

                'currency' => strtoupper(
                    $validated['currency']
                ),

                'subtotal' => $subtotal,

                'tax_amount' => $taxAmount,

                'total_amount' => $totalAmount,

                /*
             * Editing means the invoice needs to be processed
             * again if it was previously FAILED.
             */
                'status' => 'PENDING',
            ]);

            /*
         * Replace the existing items with the edited items.
         *
         * The invoice's external_idempotency_key is intentionally
         * NOT changed.
         */
            $invoice->items()->delete();

            foreach ($validated['items'] as $item) {
                $lineSubtotal =
                    $item['quantity'] * $item['unit_price'];

                $lineTax =
                    $lineSubtotal * ($item['tax_rate'] / 100);

                $lineTotal =
                    $lineSubtotal + $lineTax;

                $invoice->items()->create([
                    'description' => $item['description'],

                    'quantity' => $item['quantity'],

                    'unit_price' => $item['unit_price'],

                    'tax_rate' => $item['tax_rate'],

                    'tax_amount' => $lineTax,

                    'line_total' => $lineTotal,
                ]);
            }
        });

        /*
     * Process the updated invoice asynchronously.
     */
        ProcessInvoiceJob::dispatch($invoice->id)
            ->afterCommit();

        return response()->json([
            'message' => 'Invoice updated successfully.',

            'invoice' => $invoice->fresh([
                'items',
                'processingLogs',
            ]),
        ], 202);
    }

    public function retry(
        Request $request,
        Invoice $invoice
    ) {
        $this->authorizeInvoice($request, $invoice);

        /*
         * Only FAILED invoices can be manually retried.
         */
        if ($invoice->status !== 'FAILED') {
            return response()->json([
                'message' =>
                'Invoice is not eligible for retry.',

                'current_status' => $invoice->status,
            ], 409);
        }

        /*
         * Find the latest failure.
         */
        $latestFailedLog = $invoice->processingLogs()
            ->where('status', 'FAILED')
            ->latest()
            ->first();

        /*
         * Do not retry permanent failures such as
         * an invalid invoice (HTTP 400).
         */
        if (!$latestFailedLog?->retryable) {
            return response()->json([
                'message' =>
                'This invoice failure is not retryable.',
            ], 409);
        }

        /*
         * Put the invoice back into PENDING while it waits
         * for the queue worker.
         */
        $invoice->update([
            'status' => 'PENDING',
        ]);

        /*
         * Reuse the SAME external_idempotency_key.
         *
         * This is critical for preventing duplicate
         * government submissions.
         */
        ProcessInvoiceJob::dispatch($invoice->id)
            ->afterCommit();

        return response()->json([
            'message' =>
            'Invoice retry accepted for processing.',

            'invoice' => $invoice->fresh([
                'items',
                'processingLogs',
            ]),
        ], 202);
    }

    public function destroy(
        Request $request,
        Invoice $invoice
    ) {
        $this->authorizeInvoice($request, $invoice);

        DB::transaction(function () use ($invoice) {
            $invoice->items()->delete();

            $invoice->processingLogs()->delete();

            $invoice->delete();
        });

        return response()->json([
            'message' => 'Invoice deleted successfully.',
        ]);
    }

    private function authorizeInvoice(
        Request $request,
        Invoice $invoice
    ): void {
        if (
            $invoice->company_id !==
            $request->user()->company_id
        ) {
            abort(404);
        }
    }
}
