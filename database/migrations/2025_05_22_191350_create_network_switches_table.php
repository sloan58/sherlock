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
        Schema::create('network_switches', function (Blueprint $table) {
            $table->id();
            $table->string('host');
            $table->string('device_type');
            $table->string('port')->default(22);
            $table->string('username');
            $table->string('password');
            $table->string('hostname')->nullable();
            $table->string('uptime')->nullable();
            $table->string('last_reboot_reason')->nullable();
            $table->string('bios')->nullable();
            $table->string('os')->nullable();
            $table->string('boot_image')->nullable();
            $table->string('platform')->nullable();
            $table->string('serial')->nullable();
            $table->boolean('syncing')->default(false);
            $table->timestamp('last_sync_completed')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('network_switches');
    }
};
