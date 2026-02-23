<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\AgendaController; // Pastikan ini pakai \Api

// Rute untuk Publik (Tanpa Login)
// Pastikan namanya 'today' sesuai dengan fungsi di AgendaController Anda
Route::get('/today', [AgendaController::class, 'today']); 
Route::get('/public/today', [AgendaController::class, 'today']);

// Rute Login
Route::post('/login', [AuthController::class, 'login']);

// Rute Admin (Perlu Login)
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/context', [AgendaController::class, 'updateContext']);
    Route::post('/agendas', [AgendaController::class, 'store']);
    Route::get('/agendas', [AgendaController::class, 'index']); // Tambahkan ini agar daftar agenda admin muncul
    Route::put('/agendas/{id}', [AgendaController::class, 'update']);
    Route::delete('/agendas/{id}', [AgendaController::class, 'destroy']);
});