<?php

use App\Models\DeviceSyncHistory;
use App\Models\MacAddress;
use App\Models\NetworkInterface;
use App\Models\NetworkSwitch;
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
        Schema::create('mac_address_discoveries', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(DeviceSyncHistory::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(MacAddress::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(NetworkSwitch::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(NetworkInterface::class)->nullable()->constrained()->nullOnDelete();
            $table->timestamp('discovered_at');
            $table->string('vlan_id')->nullable();
            $table->string('type')->nullable();
            $table->string('age')->nullable();
            $table->string('secure')->nullable();
            $table->string('ntfy')->nullable();
            $table->string('ports')->nullable();
            $table->string('manufacturer')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mac_address_discoveries');
    }
};
