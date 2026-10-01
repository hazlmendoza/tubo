<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;

class ProcessingLogController extends Controller
{
    public function index(Request $request, Invoice $invoice)
    {
        if ($invoice->company_id !== $request->user()->company_id) {
            abort(404);
        }

        return response()->json([
            'processing_logs' => $invoice->processingLogs()
                ->latest()
                ->get(),
        ]);
    }

    public function show(
        Request $request,
        Invoice $invoice,
        int $processingLog
    ) {
        if ($invoice->company_id !== $request->user()->company_id) {
            abort(404);
        }

        $log = $invoice->processingLogs()
            ->findOrFail($processingLog);

        return response()->json($log);
    }
}