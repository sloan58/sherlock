<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MacAddress extends Model
{
    protected $fillable = [
        'mac_address',
    ];

    public function device(): BelongsToMany
    {
        return $this->belongsToMany(NetworkSwitch::class)
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

    public function interfaces(): BelongsToMany
    {
        return $this->belongsToMany(NetworkInterface::class)->withTimestamps();
    }

    public function discoveries(): HasMany
    {
        return $this->hasMany(MacAddressDiscovery::class);
    }
}
