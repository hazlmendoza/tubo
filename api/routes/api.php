<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProcessingLogController;
use App\Http\Controllers\GovernmentApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::post('/auth/register', [AuthController::class, 'register']);

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/auth/user', [AuthController::class, 'user']);

    Route::post('/auth/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | Invoices
    |--------------------------------------------------------------------------
    */

    Route::get('/invoices', [InvoiceController::class, 'index']);

    Route::post('/invoices', [InvoiceController::class, 'store']);

    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);

    /*
    |--------------------------------------------------------------------------
    | Processing Logs
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/invoices/{invoice}/processing-logs',
        [ProcessingLogController::class, 'index']
    );
});

/*
|--------------------------------------------------------------------------
| Mock Government API
|--------------------------------------------------------------------------
*/

Route::post(
    '/government-api/invoices',
    [GovernmentApiController::class, 'submit']
);