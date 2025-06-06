<?php

namespace App\Jobs;

use Throwable;
use Illuminate\Bus\Queueable;
use App\Models\NetworkSwitch;
use Illuminate\Queue\SerializesModels;
use App\Services\NetworkDeviceService;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class WalkDeviceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected NetworkSwitch $networkSwitch;

    /**
     * Create a new job instance.
     */
    public function __construct(NetworkSwitch $networkSwitch)
    {
        $this->networkSwitch = $networkSwitch;
    }

    /**
     * Execute the job.
     * @throws Throwable
     */
    public function handle(NetworkDeviceService $networkService): void
    {
        try {
            $networkService->getSwitchVersionInfo($this->networkSwitch);
            $networkService->getInterfaceInfo($this->networkSwitch);
            $networkService->getCdpNeighbors($this->networkSwitch);
            $networkService->getMacAddressTable($this->networkSwitch);
        } catch (Throwable $e) {
            $this->networkSwitch->syncing = false;
            $this->networkSwitch->save();
            throw $e; // Let the job be marked as failed
        }
    }
}
