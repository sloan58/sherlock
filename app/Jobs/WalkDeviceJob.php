<?php

namespace App\Jobs;

use App\Models\NetworkSwitch;
use App\Services\NetworkDeviceService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class WalkDeviceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public NetworkSwitch $networkSwitch;

    public function __construct(NetworkSwitch $networkSwitch) {
        $this->networkSwitch = $networkSwitch;
    }

    /**
     * @throws Throwable
     */
    public function handle(NetworkDeviceService $networkService): void
    {
        try {
            $networkService->getSwitchVersionInfo($this->networkSwitch);
            $networkService->getInterfaceInfo($this->networkSwitch);
            $networkService->getMacAddressTable($this->networkSwitch);
            $networkService->getCdpNeighbors($this->networkSwitch);

            $this->networkSwitch->syncHistory()->create([
                'result' => 'completed',
                'completed_at' => now(),
            ]);

            $this->networkSwitch->update(['syncing' => false]);
        } catch (Throwable $e) {
            $this->networkSwitch->syncHistory()->create([
                'result' => 'failed',
                'error_message' => $e->getMessage(),
                'completed_at' => now(),
            ]);

            $this->networkSwitch->update(['syncing' => false]);
            throw $e; // Let the job be marked as failed
        }
    }
}
