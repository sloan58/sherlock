<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Site extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'address',
        'city',
        'state',
        'zip',
        'country',
    ];

    public function networkSwitches(): HasMany
    {
        return $this->hasMany(NetworkSwitch::class);
    }
}
