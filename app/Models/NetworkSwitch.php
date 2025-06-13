<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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

    #[Scope]
    protected function visibleMacAddresses()
    {
        return $this->macAddresses()
            ->wherePivot("ports", "!=", "CPU")
            ->wherePivot("ports", "not like", "Po%");
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
