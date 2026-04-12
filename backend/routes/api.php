<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ExpenseTemplateController;
use App\Http\Controllers\Api\HouseController;
use App\Http\Controllers\Api\HouseResidentHistoryController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentTypeController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ResidentController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('houses', HouseController::class);
    Route::apiResource('residents', ResidentController::class);
    Route::post('expenses/generate', [ExpenseController::class, 'generate']);
    Route::apiResource('expenses', ExpenseController::class);
    Route::apiResource('expense-templates', ExpenseTemplateController::class);
    Route::apiResource('payment-types', PaymentTypeController::class);

    Route::get('house-resident-histories/house/{houseId}', [HouseResidentHistoryController::class, 'byHouse']);
    Route::post('house-resident-histories/change', [HouseResidentHistoryController::class, 'changeResident']);
    Route::apiResource('house-resident-histories', HouseResidentHistoryController::class)->only(['index', 'store', 'destroy']);

    Route::get('bills/house/{houseId}', [BillController::class, 'byHouse']);
    Route::get('bills/resident/{residentId}', [BillController::class, 'byResident']);
    Route::post('bills/generate', [BillController::class, 'store']);
    Route::post('bills/manual', [BillController::class, 'manualStore']);
    Route::apiResource('bills', BillController::class)->only(['index', 'show', 'store', 'destroy']);

    Route::apiResource('payments', PaymentController::class);

    Route::get('reports/summary', [ReportController::class, 'summary']);
    Route::get('reports/detail', [ReportController::class, 'detail']);
});
