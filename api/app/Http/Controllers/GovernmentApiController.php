<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class GovernmentApiController extends Controller
{
    public function submit(Request $request)
    {
        $request->validate([
            'invoice_number' => ['required', 'string'],
            'idempotency_key' => ['required', 'string'],
        ]);

        /*
         * Temporary mock behavior.
         *
         * We'll replace this with a proper
         * idempotent mock service later.
         */

        return response()->json([
            'message' => 'Invoice accepted by government API.',
            'government_reference' => 'GOV-' . strtoupper(
                \Illuminate\Support\Str::random(10)
            ),
        ], 200);
    }
}