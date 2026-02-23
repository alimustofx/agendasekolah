<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyContext;
use Illuminate\Http\Request;

class DailyContextController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'description' => 'required|string'
        ]);

        // Gunakan updateOrCreate agar 1 hari hanya ada 1 konteks (mencegah duplikat)
        $context = DailyContext::updateOrCreate(
            ['date' => $request->date],
            ['description' => $request->description]
        );

        return response()->json([
            'success' => true,
            'message' => 'Konteks harian berhasil disimpan!',
            'data' => $context
        ], 201);
    }
}