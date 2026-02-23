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
        Schema::create('daily_contexts', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique(); // 1 hari hanya ada 1 konteks
            $table->string('description'); // Contoh: "Proses KBM hari ke- 30 smt genap Ta 2025/2026"
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_contexts');
    }
};
