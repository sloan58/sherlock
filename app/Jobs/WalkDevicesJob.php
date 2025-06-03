<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use App\Models\NetworkSwitch;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class WalkDevicesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        NetworkSwitch::each(function ($device) {
            $device->update([
                'syncing' => true
            ]);
            WalkDeviceJob::dispatch($device);
        });
    }
}
