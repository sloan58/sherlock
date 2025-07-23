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
            ->wherePivot("ports", "not like", "Po%")
            ->whereNotExists(function ($query) {
                $query->select(\DB::raw(1))
                    ->from('mac_address_network_interface')
                    ->join('network_interfaces', 'mac_address_network_interface.network_interface_id', '=', 'network_interfaces.id')
                    ->whereColumn('mac_address_network_interface.mac_address_id', 'mac_addresses.id')
                    ->where('network_interfaces.mode', 'trunk');
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
}
