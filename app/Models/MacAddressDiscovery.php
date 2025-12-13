<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MacAddressDiscovery extends Model
{
    protected $fillable = [
        'device_sync_history_id',
        'mac_address_id',
        'network_switch_id',
        'network_interface_id',
        'discovered_at',
        'vlan_id',
        'type',
        'age',
        'secure',
        'ntfy',
        'ports',
        'manufacturer',
    ];

    protected $casts = [
        'discovered_at' => 'datetime',
    ];

    public function deviceSyncHistory(): BelongsTo
    {
        return $this->belongsTo(DeviceSyncHistory::class);
    }

    public function macAddress(): BelongsTo
    {
        return $this->belongsTo(MacAddress::class);
    }

    public function networkSwitch(): BelongsTo
    {
        return $this->belongsTo(NetworkSwitch::class);
    }

    public function networkInterface(): BelongsTo
    {
        return $this->belongsTo(NetworkInterface::class);
    }
}
