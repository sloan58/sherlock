<?php

use App\Models\MacAddress;
use Illuminate\Support\Facades\Schema;
use App\Models\NetworkSwitch;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mac_address_network_switch', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(MacAddress::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(NetworkSwitch::class)->constrained()->cascadeOnDelete();
            $table->string('vlan_id')->nullable();
            $table->string('type')->nullable();
            $table->string('age')->nullable();
            $table->string('secure')->nullable();
            $table->string('ntfy')->nullable();
            $table->string('ports')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('comment')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mac_address_network_switch');
    }
};
