<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use App\Models\NetworkSwitch;
use Illuminate\Bus\Batchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Contracts\Queue\ShouldQueue;

class ProcessNetworkInterfaceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, Batchable;

    protected NetworkSwitch $networkSwitch;
    protected array $interfaceData;

    public function __construct(NetworkSwitch $networkSwitch, array $interfaceData)
    {
        $this->networkSwitch = $networkSwitch;
        $this->interfaceData = $interfaceData;
    }

    public function handle(): void
    {
        $networkInterface = $this->networkSwitch->interfaces()
            ->updateOrCreate(
                ['interface' => $this->interfaceData['interface']],
                $this->interfaceData
            );

        $mac = $this->networkSwitch->macAddresses()
            ->wherePivot('ports', $this->interfaceData['interface_short'])
            ->first();

        if ($mac) {
            $networkInterface->macAddresses()->syncWithoutDetaching($mac->id);
        }
    }
}
