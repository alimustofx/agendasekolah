<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

// Rute untuk menangani tampilan depan (React)
Route::get('/{any}', function () {
    // Membaca file index.html hasil build React yang tadi dipindahkan ke public
    return view('admin');
})->where('any', '^(?!api).*$'); 
// (?!api) artinya: abaikan rute yang diawali /api agar rute API Laravel tetap jalan