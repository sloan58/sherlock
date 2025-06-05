<?php

use App\Models\MacAddress;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Models\NetworkInterface as NetworkInterfaceAlias;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mac_address_network_interface', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(MacAddress::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(NetworkInterfaceAlias::class)->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mac_address_network_interface');
    }
};
