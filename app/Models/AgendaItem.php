<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgendaItem extends Model
{
    protected $fillable = ['agenda_id', 'description'];

    // Relasi balik ke tabel agenda
    public function agenda()
    {
        return $this->belongsTo(Agenda::class);
    }
}
