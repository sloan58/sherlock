<?php

use App\Models\NetworkSwitch;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('network_interfaces', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(NetworkSwitch::class)->constrained()->cascadeOnDelete();
            $table->string('interface');
            $table->string('interface_short')->nullable();
            $table->string('link_status')->nullable();
            $table->string('admin_state')->nullable();
            $table->string('hardware_type')->nullable();
            $table->string('mac_address')->nullable();
            $table->string('bia')->nullable();
            $table->string('description')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('prefix_length')->nullable();
            $table->string('mtu')->nullable();
            $table->string('mode')->nullable();
            $table->string('duplex')->nullable();
            $table->string('speed')->nullable();
            $table->string('input_packets')->nullable();
            $table->string('output_packets')->nullable();
            $table->string('input_errors')->nullable();
            $table->string('output_errors')->nullable();
            $table->string('bandwidth')->nullable();
            $table->string('delay')->nullable();
            $table->string('encapsulation')->nullable();
            $table->string('last_link_flapped')->nullable();
            $table->string('vlan_id')->nullable();
            $table->string('packet_input_rate')->nullable();
            $table->string('packet_output_rate')->nullable();
            $table->string('bandwidth_input_rate')->nullable();
            $table->string('bandwidth_output_rate')->nullable();
            $table->string('media_type')->nullable();
            $table->string('neighbor_chassis_id')->nullable();
            $table->string('neighbor_name')->nullable();
            $table->string('neighbor_mgmt_address')->nullable();
            $table->string('neighbor_platform')->nullable();
            $table->string('neighbor_interface')->nullable();
            $table->string('neighbor_description')->nullable();
            $table->string('neighbor_interface_ip')->nullable();
            $table->string('neighbor_capabilities')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('network_interfaces');
    }
};
