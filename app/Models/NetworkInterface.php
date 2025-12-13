<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NetworkInterface extends Model
{
    protected $fillable = [
        'network_switch_id',
        'interface',
        'interface_short',
        'link_status',
        'admin_state',
        'hardware_type',
        'mac_address',
        'bia',
        'description',
        'ip_address',
        'prefix_length',
        'mtu',
        'mode',
        'duplex',
        'speed',
        'input_packets',
        'output_packets',
        'input_errors',
        'output_errors',
        'bandwidth',
        'delay',
        'encapsulation',
        'last_link_flapped',
        'vlan_id',
        'packet_input_rate',
        'packet_output_rate',
        'bandwidth_input_rate',
        'bandwidth_output_rate',
        'media_type',
        'neighbor_chassis_id',
        'neighbor_name',
        'neighbor_mgmt_address',
        'neighbor_platform',
        'neighbor_interface',
        'neighbor_description',
        'neighbor_interface_ip',
        'neighbor_capabilities',
    ];

    public function networkSwitch(): BelongsTo
    {
        return $this->belongsTo(NetworkSwitch::class);
    }

    public function macAddresses(): BelongsToMany
    {
        return $this->belongsToMany(MacAddress::class)->withTimestamps();
    }

    public function discoveries(): HasMany
    {
        return $this->hasMany(MacAddressDiscovery::class);
    }
}
