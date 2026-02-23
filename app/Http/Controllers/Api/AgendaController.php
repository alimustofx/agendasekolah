<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agenda;
use App\Models\DailyContext;
use Illuminate\Http\Request;

class AgendaController extends Controller
{
    // 1. GET ALL AGENDAS (Untuk Admin Panel)
    public function index()
    {
        // Mengambil semua agenda beserta poin kegiatannya (relasi 'items')
        $agendas = Agenda::with('items')->orderBy('date', 'desc')->orderBy('start_time', 'asc')->get();
        return response()->json(['success' => true, 'data' => $agendas]);
    }

    // 2. GET TODAY'S DATA (Khusus untuk Tampilan Publik / TV Sekolah)
    public function today()
    {
        $today = now()->format('Y-m-d');
        
        $context = DailyContext::where('date', $today)->first();
        $agendas = Agenda::with('items')
                        ->where('date', $today)
                        ->orderBy('start_time', 'asc')
                        ->get();

        return response()->json([ 
            'context' => $context,
            'agendas' => $agendas
        ]);
    }

    // 3. CREATE AGENDA BARU
    public function store(Request $request)
    {
        // Hapus 'date' dari validasi karena kita akan set otomatis
        $request->validate([
            'start_time' => 'required',
            'items' => 'required|array',
        ]);

        // Ambil semua data dari input, lalu tambahkan tanggal hari ini secara otomatis
        $data = $request->only(['start_time', 'end_time', 'audience', 'location', 'officer']);
        $data['date'] = now()->format('Y-m-d'); // Set tanggal hari ini

        $agenda = Agenda::create($data);

        foreach ($request->items as $itemDescription) {
            $agenda->items()->create([
                'description' => $itemDescription
            ]);
        }

        return response()->json(['success' => true, 'message' => 'Agenda berhasil dibuat!', 'data' => $agenda->load('items')], 201);
    }

    // 4. UPDATE AGENDA (Fitur Edit)
    public function update(Request $request, $id)
    {
        // 1. Validasi tanpa mewajibkan 'date' dari frontend
        $request->validate([
            'start_time' => 'required',
            'items' => 'required|array',
        ]);

        $agenda = Agenda::find($id);
        if(!$agenda) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        // 2. Ambil data input
        $data = $request->only(['start_time', 'end_time', 'audience', 'location', 'officer']);
        
        // 3. Pastikan tanggal tetap ada (pakai yang lama atau set hari ini jika kosong)
        if (!$agenda->date) {
            $data['date'] = now()->format('Y-m-d');
        }

        // 4. Update data utama
        $agenda->update($data);

        // 5. Update poin kegiatan (Hapus yang lama, masukkan yang baru)
        $agenda->items()->delete();
        foreach ($request->items as $itemDescription) {
            $agenda->items()->create([
                'description' => $itemDescription
            ]);
        }

        return response()->json([
            'success' => true, 
            'message' => 'Agenda berhasil diperbarui!',
            'data' => $agenda->load('items')
        ]);
    }

    // 5. HAPUS AGENDA
    public function destroy($id)
    {
        $agenda = Agenda::find($id);
        if(!$agenda) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $agenda->delete(); // Ini otomatis akan menghapus items-nya juga karena kita pakai 'onDelete cascade' di migration

        return response()->json(['success' => true, 'message' => 'Agenda berhasil dihapus!']);
    }

    public function updateContext(Request $request)
    {
        $request->validate([
            'description' => 'required|string',
        ]);

        $today = now()->format('Y-m-d');

        $context = DailyContext::updateOrCreate(
            ['date' => $today],
            ['description' => $request->description]
        );

        return response()->json([
            'success' => true,
            'message' => 'Informasi hari ini berhasil diperbarui!',
            'data' => $context
        ]);
    }
}