<?php

namespace App\Http\Controllers;

use App\Models\GovernmentSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GovernmentApiController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $idempotencyKey = $request->header(
            'Idempotency-Key'
        );

        if (!$idempotencyKey) {
            return response()->json([
                'message' => 'Idempotency-Key is required.',
            ], 400);
        }

        /*
         * If the government system already processed
         * this request, return the original result.
         */
        $existing = GovernmentSubmission::where(
            'idempotency_key',
            $idempotencyKey
        )->first();

        if ($existing) {
            return response()->json([
                'message' => 'Invoice already submitted.',
                'reference' => $existing->reference,
                'duplicate' => true,
            ], 200);
        }

        $scenario = $request->header(
            'X-Government-Scenario',
            'success'
        );

        if ($scenario === 'invalid_invoice') {
            return response()->json([
                'message' => 'Invoice is invalid.',
            ], 400);
        }

        if ($scenario === 'temporary_failure') {
            return response()->json([
                'message' => 'Government service is temporarily unavailable.',
            ], 503);
        }

        if ($scenario === 'timeout') {
            sleep(10);

            return response()->json([
                'message' => 'Government API timeout.',
            ], 504);
        }

        $reference = 'GOV-' .
            strtoupper(Str::random(8));

        GovernmentSubmission::create([
            'idempotency_key' => $idempotencyKey,
            'invoice_number' => $request->input(
                'invoice_number'
            ),
            'reference' => $reference,
        ]);

        return response()->json([
            'message' => 'Invoice accepted by government API.',
            'reference' => $reference,
        ], 200);
    }
}