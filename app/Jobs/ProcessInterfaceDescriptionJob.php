<?php

namespace App\Jobs;

use App\Models\NetworkSwitch;
use Illuminate\Bus\Queueable;
use Illuminate\Bus\Batchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Contracts\Queue\ShouldQueue;

class ProcessInterfaceDescriptionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, Batchable;

    protected NetworkSwitch $networkSwitch;
    protected array $descData;

    public function __construct(NetworkSwitch $networkSwitch, array $descData)
    {
        $this->networkSwitch = $networkSwitch;
        $this->descData = $descData;
    }

    public function handle(): void
    {
        if (!isset($this->descData['port']) || !isset($this->descData['description'])) {
            return;
        }
        $interface = $this->networkSwitch->interfaces()
            ->where('interface', $this->descData['port'])
            ->first();
        if ($interface) {
            $interface->update(['description' => $this->descData['description']]);
        }
    }
}
