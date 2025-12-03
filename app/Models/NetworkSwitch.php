<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;

class NetworkSwitch extends Model
{
    protected $fillable = [
        'host',
        'hostname',
        'username',
        'password',
        'device_type',
        'port',
        'uptime',
        'last_reboot_reason',
        'bios',
        'os',
        'boot_image',
        'platform',
        'serial',
        'syncing',
        'last_sync_completed',
    ];

    protected $casts = [
        'password' => 'encrypted',
        'last_sync_completed' => 'datetime',
    ];

    public function macAddresses(): BelongsToMany
    {
        return $this->belongsToMany(MacAddress::class)
            ->withPivot([
                'vlan_id',
                'type',
                'age',
                'secure',
                'ntfy',
                'ports',
                'manufacturer',
            ])
            ->withTimestamps();
    }

    public function visibleMacAddresses(): BelongsToMany
    {
        return $this->macAddresses()
            ->wherePivot("ports", "!=", "CPU")
            ->whereNotExists(function ($query) {
                // Exclude MAC addresses on trunk interfaces
                // Check both the mac_address_network_interface relationship and direct port matching
                $query->select(\DB::raw(1))
                    ->from('network_interfaces')
                    ->where('network_interfaces.network_switch_id', $this->getAttribute('id'))
                    ->where('network_interfaces.mode', 'trunk')
                    ->where(function ($q) {
                        // Match via mac_address_network_interface relationship
                        $q->whereExists(function ($subQuery) {
                            $subQuery->select(\DB::raw(1))
                                ->from('mac_address_network_interface')
                                ->whereColumn('mac_address_network_interface.network_interface_id', 'network_interfaces.id')
                                ->whereColumn('mac_address_network_interface.mac_address_id', 'mac_addresses.id');
                        })
                        // OR match by interface_short from the ports pivot field
                        ->orWhereColumn('network_interfaces.interface_short', 'mac_address_network_switch.ports');
                    });
            });
    }


    public function interfaces(): HasMany
    {
        return $this->hasMany(NetworkInterface::class);
    }

    public function syncHistory(): HasMany
    {
        return $this->hasMany(DeviceSyncHistory::class);
    }

    public function lastSyncHistory()
    {
        return $this->hasOne(DeviceSyncHistory::class)->latest();
    }
}
