<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('agendas', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time')->nullable(); // Nullable karena kadang hanya ditulis "selesai"
            $table->string('audience')->nullable(); // Contoh: "Kls XII :"
            $table->string('location')->nullable(); // Contoh: "Mushola Ulul Albab"
            $table->string('officer')->nullable(); // Contoh: "Pembina osis sekbid 1..."
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agendas');
    }
};
