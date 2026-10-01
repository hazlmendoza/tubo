<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Authentication
        |--------------------------------------------------------------------------
        |
        | Protect login/register from excessive requests.
        |
        */

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->ip());
        });

        /*
        |--------------------------------------------------------------------------
        | General API
        |--------------------------------------------------------------------------
        */

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)
                ->by(
                    $request->user()?->id
                    ?? $request->ip()
                );
        });

        /*
        |--------------------------------------------------------------------------
        | Invoice Creation / Modification
        |--------------------------------------------------------------------------
        |
        | These operations modify data, so use a stricter limit.
        |
        */

        RateLimiter::for('invoice-create', function (Request $request) {
            return Limit::perMinute(20)
                ->by(
                    $request->user()?->id
                    ?? $request->ip()
                );
        });

        /*
        |--------------------------------------------------------------------------
        | Invoice Retry
        |--------------------------------------------------------------------------
        */

        RateLimiter::for('invoice-retry', function (Request $request) {
            return Limit::perMinute(10)
                ->by(
                    $request->user()?->id
                    ?? $request->ip()
                );
        });

        /*
        |--------------------------------------------------------------------------
        | Mock Government API
        |--------------------------------------------------------------------------
        |
        | Simulates a separate external service with its own
        | protection against excessive submissions.
        |
        */

        RateLimiter::for('government-api', function (Request $request) {
            return Limit::perMinute(30)
                ->by($request->ip());
        });
    }
}