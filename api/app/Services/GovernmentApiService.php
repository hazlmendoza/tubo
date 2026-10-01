<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GovernmentApiService
{
    public function submit(array $invoice): array
    {
        $url = rtrim(
            config('services.government_api.url'),
            '/'
        ) . '/invoices';

        try {
            $response = Http::timeout(5)
                ->connectTimeout(2)
                ->acceptJson()
                ->asJson()
                ->withHeaders([
                    'Idempotency-Key' =>
                        $invoice['external_idempotency_key'],

                    'X-Government-Scenario' =>
                        config(
                            'services.government_api.scenario',
                            'success'
                        ),
                ])
                ->post($url, $invoice);

            return [
                'http_status' => $response->status(),
                'body' => $response->json(),
            ];
        } catch (ConnectionException $e) {
            throw new RuntimeException(
                'Government API request timed out or could not be reached.',
                0,
                $e
            );
        }
    }
}