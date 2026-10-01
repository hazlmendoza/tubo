<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GovernmentApiController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProcessingLogController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Authentication Routes
|--------------------------------------------------------------------------
*/

Route::post('/auth/register', [
    AuthController::class,
    'register',
])->middleware('throttle:auth');

Route::post('/auth/login', [
    AuthController::class,
    'login',
])->middleware('throttle:auth');

/*
|--------------------------------------------------------------------------
| Mock Government API
|--------------------------------------------------------------------------
|
| Simulates the external government invoice service.
|
*/

Route::post('/government-api/invoices', [
    GovernmentApiController::class,
    'store',
])->middleware('throttle:government-api');

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/auth/logout', [
        AuthController::class,
        'logout',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Invoices
    |--------------------------------------------------------------------------
    */

    Route::get('/invoices', [
        InvoiceController::class,
        'index',
    ])->middleware('throttle:api');

    Route::post('/invoices', [
        InvoiceController::class,
        'store',
    ])->middleware('throttle:invoice-create');

    Route::get('/invoices/{invoice}', [
        InvoiceController::class,
        'show',
    ])->middleware('throttle:api');

    Route::put('/invoices/{invoice}', [
        InvoiceController::class,
        'update',
    ])->middleware('throttle:invoice-create');

    Route::delete('/invoices/{invoice}', [
        InvoiceController::class,
        'destroy',
    ])->middleware('throttle:invoice-create');

    Route::post('/invoices/{invoice}/retry', [
        InvoiceController::class,
        'retry',
    ])->middleware('throttle:invoice-retry');

    /*
    |--------------------------------------------------------------------------
    | Processing Logs
    |--------------------------------------------------------------------------
    */

    Route::get('/invoices/{invoice}/processing-logs', [
        ProcessingLogController::class,
        'index',
    ])->middleware('throttle:api');

    Route::get(
        '/invoices/{invoice}/processing-logs/{processingLog}',
        [
            ProcessingLogController::class,
            'show',
        ]
    )->middleware('throttle:api');
});
