<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyContext extends Model
{
    protected $fillable = ['date', 'description', 'waka_status', 'guru_piket', 'prestasi'];

    // TAMBAHKAN INI: Otomatis handle array ke JSON string
    protected $casts = [
        'waka_status' => 'array',
        'guru_piket' => 'array',
        'prestasi' => 'array',
    ];
}
