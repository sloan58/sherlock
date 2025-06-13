<?php

namespace App\Jobs;

use Exception;
use App\Models\MacAddress;
use Illuminate\Bus\Queueable;
use Illuminate\Bus\Batchable;
use App\Models\NetworkSwitch;
use App\Services\NetworkDeviceService;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class MacLookupJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, Batchable;

    protected NetworkSwitch $networkSwitch;
    private MacAddress $macAddress;
    private array $portDetails;

    /**
     * Create a new job instance.
     */
    public function __construct(MacAddress $macAddress, NetworkSwitch $networkSwitch, array $portDetails)
    {
        $this->networkSwitch = $networkSwitch;
        $this->macAddress = $macAddress;
        $this->portDetails = $portDetails;
    }

    /**
     * Execute the job.
     * @throws Exception
     */
    public function handle(NetworkDeviceService $networkService): void
    {
        $manuf = $networkService->lookupMacManufacturer($this->macAddress->mac_address);
        $device = array_merge($this->portDetails, $manuf);
        
        // Ensure mac_address is not included in the pivot data
        if (isset($device['mac_address'])) {
            unset($device['mac_address']);
        }
        
        $this->networkSwitch->macAddresses()->syncWithoutDetaching([
            $this->macAddress->id => $device
        ]);
    }
}
