<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agenda extends Model
{
    protected $fillable = ['date', 'start_time', 'end_time', 'audience', 'location', 'officer'];

    // Relasi ke tabel agenda_items (Satu agenda punya banyak poin kegiatan)
    public function items()
    {
        return $this->hasMany(AgendaItem::class);
    }
}
