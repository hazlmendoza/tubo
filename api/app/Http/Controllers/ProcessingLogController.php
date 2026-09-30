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

        return response()->json(
            $invoice->processingLogs()
                ->orderBy('attempt_number')
                ->get()
        );
    }
}
