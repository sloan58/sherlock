<?php

namespace App\Services;

use Exception;
use Throwable;
use App\Jobs\MacLookupJob;
use Illuminate\Bus\Batch;
use App\Models\MacAddress;
use App\Models\NetworkSwitch;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Bus;
use App\Jobs\ProcessNetworkInterfaceJob;
use Illuminate\Support\Facades\Process;
use App\Jobs\ProcessInterfaceDescriptionJob;
use Symfony\Component\Process\Exception\ProcessFailedException;

class NetworkDeviceService
{

    /**
     * Walk a network device using Netmiko
     *
     * @param NetworkSwitch $networkSwitch
     * @return array
     * @throws Exception
     * @throws Throwable
     */
    public function getMacAddressTable(NetworkSwitch $networkSwitch): array
    {
        // Prepare device details for Netmiko
        $device = [
            'device_type' => $networkSwitch->device_type ?? 'cisco_nxos',
            'host' => $networkSwitch->host,
            'username' => $networkSwitch->username,
            'password' => $networkSwitch->password,
            'port' => $networkSwitch->port ?? 22,
        ];

        $jsonInput = json_encode([
            'device' => $device,
            'command' => 'show mac address-table | exclude Po',
            'use_textfsm' => true,
        ]);

        // Execute generalized Python script
        $process = [
            base_path('lib/.venv/bin/python'),
            base_path('lib/netmiko_command.py')
        ];

        $response = $this->runCommand($process, $jsonInput);

        if (!is_array($response)) {
            Log::error('Unexpected response from netmiko_command.py', ['response' => $response]);
            return [];
        }

        $jobs = [];
        foreach ($response as $device) {
            if (!isset($device['mac_address'])) continue;
            $macAddress = MacAddress::firstOrCreate(['mac_address' => $device['mac_address']]);
            unset($device['mac_address']);
            $jobs[] = new MacLookupJob($macAddress, $networkSwitch, $device);
        }

        if (!empty($jobs)) {
            Bus::batch($jobs)
                ->then(function (Batch $batch) use ($networkSwitch) {
                    // All jobs completed successfully, now process interfaces
                    $this->getInterfaceInfo($networkSwitch);
                })
                ->catch(function (Batch $batch, Throwable $e) {
                    // First job failure detected...
                })
                ->finally(function (Batch $batch) use ($networkSwitch) {
                    // The batch has finished executing...
                    $networkSwitch->syncing = false;
                    $networkSwitch->last_sync_completed = now();
                    $networkSwitch->save();
                })
                ->dispatch();
        }

        return $response;
    }

    /**
     * Look up a MAC address manufacturer
     *
     * @param string $macAddress The MAC address to look up
     * @return array
     * @throws Exception
     */
    public function lookupMacManufacturer(string $macAddress): array
    {
        // Prepare input data
        $inputData = [
            'mac_address' => $macAddress
        ];

        // Convert PHP array to JSON for Python consumption
        $jsonInput = json_encode($inputData);

        // Execute Python script with JSON input
        $process = [
            base_path('lib/.venv/bin/python'),
            base_path('lib/lookup_mac.py'),
        ];

        return $this->runCommand($process, $jsonInput);
    }

    /**
     * Get high-level version info from a network switch using Netmiko
     *
     * @param NetworkSwitch $networkSwitch
     * @return array
     * @throws Exception
     */
    public function getSwitchVersionInfo(NetworkSwitch $networkSwitch): array
    {
        // Prepare device details for Netmiko
        $device = [
            'device_type' => $networkSwitch->device_type ?? 'cisco_nxos',
            'host' => $networkSwitch->host,
            'username' => $networkSwitch->username,
            'password' => $networkSwitch->password,
            'port' => $networkSwitch->port ?? 22,
        ];

        $jsonInput = json_encode([
            'device' => $device,
            'command' => 'show version',
            'use_textfsm' => true,
        ]);

        // Execute generalized Python script
        $process = [
            base_path('lib/.venv/bin/python'),
            base_path('lib/netmiko_command.py')
        ];

        $response = $this->runCommand($process, $jsonInput);

        $networkSwitch->update(...$response);

        return $response;
    }

    /**
     * Get interface info from a network switch using Netmiko
     *
     * @param NetworkSwitch $networkSwitch
     * @return array
     * @throws Throwable
     */
    public function getInterfaceInfo(NetworkSwitch $networkSwitch): array
    {
        // Prepare device details for Netmiko
        $device = [
            'device_type' => $networkSwitch->device_type ?? 'cisco_nxos',
            'host' => $networkSwitch->host,
            'username' => $networkSwitch->username,
            'password' => $networkSwitch->password,
            'port' => $networkSwitch->port ?? 22,
        ];

        $jsonInput = json_encode([
            'device' => $device,
            'command' => 'show interface',
            'use_textfsm' => true,
        ]);

        // Execute generalized Python script
        $process = [
            base_path('lib/.venv/bin/python'),
            base_path('lib/netmiko_command.py')
        ];

        $response = $this->runCommand($process, $jsonInput);

        // Dispatch a batch of jobs to process each interface
        $jobs = [];
        if (is_array($response)) {
            foreach ($response as $interfaceData) {
                $jobs[] = new ProcessNetworkInterfaceJob($networkSwitch, $interfaceData);
            }
        }
        if (!empty($jobs)) {
            Bus::batch($jobs)
                ->then(function (Batch $batch) use ($networkSwitch) {
                    // All interface jobs completed, now process interface descriptions
                    $this->getInterfaceDescriptions($networkSwitch);
                })
                ->catch(function (Batch $batch, Throwable $e) {
                    // Handle error
                })
                ->finally(function (Batch $batch) {
                    // Batch finished
                })
                ->dispatch();
        }

        return $response;
    }

    /**
     * Get interface descriptions from a network switch using Netmiko
     *
     * @param NetworkSwitch $networkSwitch
     * @return array
     * @throws Throwable
     */
    public function getInterfaceDescriptions(NetworkSwitch $networkSwitch): array
    {
        $device = [
            'device_type' => $networkSwitch->device_type ?? 'cisco_nxos',
            'host' => $networkSwitch->host,
            'username' => $networkSwitch->username,
            'password' => $networkSwitch->password,
            'port' => $networkSwitch->port ?? 22,
        ];

        $jsonInput = json_encode([
            'device' => $device,
            'command' => 'show interface description',
            'use_textfsm' => true,
        ]);

        $process = [
            base_path('lib/.venv/bin/python'),
            base_path('lib/netmiko_command.py')
        ];

        $response = $this->runCommand($process, $jsonInput);

        // Dispatch a batch of jobs to process each interface description
        $jobs = [];
        if (is_array($response)) {
            foreach ($response as $descData) {
                $jobs[] = new ProcessInterfaceDescriptionJob($networkSwitch, $descData);
            }
        }
        if (!empty($jobs)) {
            Bus::batch($jobs)
                ->then(function (Batch $batch) {
                    // All interface description jobs completed
                })
                ->catch(function (Batch $batch, Throwable $e) {
                    // Handle error
                })
                ->finally(function (Batch $batch) {
                    // Batch finished
                })
                ->dispatch();
        }

        return $response;
    }

    /**
     * Get CDP neighbors from a network switch using Netmiko
     *
     * @param NetworkSwitch $networkSwitch
     * @return void
     * @throws Throwable
     */
    public function getCdpNeighbors(NetworkSwitch $networkSwitch): void
    {
        $device = [
            'device_type' => $networkSwitch->device_type ?? 'cisco_nxos',
            'host' => $networkSwitch->host,
            'username' => $networkSwitch->username,
            'password' => $networkSwitch->password,
            'port' => $networkSwitch->port ?? 22,
        ];

        $jsonInput = json_encode([
            'device' => $device,
            'command' => 'show cdp neighbors detail',
            'use_textfsm' => true,
        ]);

        $process = [
            base_path('lib/.venv/bin/python'),
            base_path('lib/netmiko_command.py')
        ];

        $response = $this->runCommand($process, $jsonInput);

        // Store CDP neighbor data in the corresponding NetworkInterface
        if (is_array($response)) {
            foreach ($response as $cdpData) {
                info('cdp entry', [$cdpData]);
                if (!isset($cdpData['local_interface'])) continue;
                $networkSwitch->interfaces()->where('interface', $cdpData['local_interface'])->first()?->update([
                    'neighbor_chassis_id' => $cdpData['chassis_id'] ?? null,
                    'neighbor_name' => $cdpData['neighbor_name'] ?? null,
                    'neighbor_mgmt_address' => $cdpData['mgmt_address'] ?? null,
                    'neighbor_platform' => $cdpData['platform'] ?? null,
                    'neighbor_interface' => $cdpData['neighbor_interface'] ?? null,
                    'neighbor_description' => $cdpData['neighbor_description'] ?? null,
                    'neighbor_interface_ip' => $cdpData['interface_ip'] ?? null,
                    'neighbor_capabilities' => $cdpData['capabilities'] ?? null,
                ]);
            }
        }
    }

    /**
     * @throws Exception
     */
    private function runCommand(array $command, ?string $input)
    {
        try {
            // Execute Python script with JSON input
            $process = Process::timeout(60);

            if ($input) {
                $process->input($input);
            }

            $result = $process->run($command);

            if (!$result->successful()) {
                throw new ProcessFailedException($result);
            }

            // Decode the JSON response from Python
            $response = json_decode($result->output(), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \RuntimeException("Failed to decode Python response: " . json_last_error_msg());
            }

            return $response;
        } catch (Exception $e) {
            Log::error('Error looking up MAC address: ' . $e->getMessage());
            throw $e;
        }
    }
}
