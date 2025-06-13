<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceSyncHistory extends Model
{
    protected $fillable = [
        'network_switch_id',
        'result',
        'error_message',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function networkSwitch(): BelongsTo
    {
        return $this->belongsTo(NetworkSwitch::class);
    }
}
