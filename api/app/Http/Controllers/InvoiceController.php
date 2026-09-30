<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    /**
     * List invoices belonging to authenticated user's company.
     */
    public function index(Request $request)
    {
        $company = $request->user()->company;

        $invoices = $company->invoices()
            ->with('items')
            ->latest()
            ->paginate(20);

        return response()->json($invoices);
    }

    /**
     * Create invoice.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_number' => [
                'required',
                'string',
                'max:255',
            ],

            'invoice_date' => [
                'required',
                'date',
            ],

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

            'items.*.tax' => [
                'required',
                'numeric',
                'gte:0',
            ],
        ]);

        $company = $request->user()->company;

        $invoice = DB::transaction(function () use ($company, $validated) {

            $subtotal = 0;
            $taxAmount = 0;

            foreach ($validated['items'] as $item) {
                $lineTotal =
                    ($item['quantity'] * $item['unit_price'])
                    + $item['tax'];

                $subtotal +=
                    $item['quantity'] * $item['unit_price'];

                $taxAmount += $item['tax'];
            }

            $totalAmount = $subtotal + $taxAmount;

            $invoice = $company->invoices()->create([
                'invoice_number' => $validated['invoice_number'],
                'invoice_date' => $validated['invoice_date'],
                'seller_name' => $validated['seller_name'],
                'customer_name' => $validated['customer_name'],
                'customer_tax_id' => $validated['customer_tax_id'],
                'customer_email' => $validated['customer_email'],
                'currency' => strtoupper($validated['currency']),
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'status' => 'PENDING',
                'idempotency_key' => (string) \Illuminate\Support\Str::uuid(),
            ]);

            foreach ($validated['items'] as $item) {
                $lineTotal =
                    ($item['quantity'] * $item['unit_price'])
                    + $item['tax'];

                $invoice->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'tax' => $item['tax'],
                    'line_total' => $lineTotal,
                ]);
            }

            return $invoice;
        });

        return response()->json([
            'message' => 'Invoice created successfully.',
            'invoice' => $invoice->load('items'),
        ], 201);
    }

    /**
     * Show one invoice belonging to authenticated user's company.
     */
    public function show(Request $request, Invoice $invoice)
    {
        if ($invoice->company_id !== $request->user()->company_id) {
            abort(404);
        }

        return response()->json(
            $invoice->load([
                'items',
                'processingLogs',
            ])
        );
    }
}
