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
        Schema::create('device_sync_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('network_switch_id')->constrained()->cascadeOnDelete();
            $table->enum('result', ['completed', 'failed']);
            $table->text('error_message')->nullable();
            $table->timestamp('completed_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_sync_histories');
    }
};
