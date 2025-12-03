<?php

namespace App\Http\Controllers;

use Exception;
use Inertia\Inertia;
use App\Jobs\WalkDeviceJob;
use Illuminate\Http\Request;
use App\Models\NetworkSwitch;
use Illuminate\Http\RedirectResponse;

class NetworkSwitchController extends Controller
{
    public function index()
    {
        return Inertia::render('NetworkSwitches/Index', [
            'switches' => NetworkSwitch::withCount(['interfaces', 'macAddresses'])
                ->with('lastSyncHistory')
                ->latest()
                ->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('NetworkSwitches/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'host' => 'required|string|max:255',
            'hostname' => 'nullable|string|max:255',
            'username' => 'required|string|max:255',
            'password' => 'required|string|max:255',
            'device_type' => 'required|string|max:255',
            'port' => 'nullable|integer|min:1|max:65535',
        ]);

        $switch = NetworkSwitch::create($validated);

        WalkDeviceJob::dispatch($switch);

        return redirect()->route('network-switches.index')
            ->with('success', 'Network switch created successfully.');
    }

    public function edit(NetworkSwitch $networkSwitch)
    {
        $networkSwitch->load([
            'visibleMacAddresses' => function ($q) {
                $q->withPivot([
                    'vlan_id',
                    'type',
                    'age',
                    'secure',
                    'ntfy',
                    'ports',
                    'manufacturer',
                    'comment',
                    'created_at',
                    'updated_at',
                ]);
            },
            'macAddresses' => function ($q) {
                $q->withPivot([
                    'vlan_id',
                    'type',
                    'age',
                    'secure',
                    'ntfy',
                    'ports',
                    'manufacturer',
                    'comment',
                    'created_at',
                    'updated_at',
                ]);
            },
            'interfaces' => function ($q) {
                $q->select([
                    'id',
                    'network_switch_id',
                    'interface',
                    'interface_short',
                    'link_status',
                    'admin_state',
                    'description',
                    'mode',
                    'vlan_id',
                    'mac_address',
                    'ip_address',
                    'speed',
                    'duplex',
                    'neighbor_chassis_id',
                    'neighbor_name',
                    'neighbor_mgmt_address',
                    'neighbor_platform',
                    'neighbor_interface',
                    'neighbor_description',
                    'neighbor_interface_ip',
                    'neighbor_capabilities',
                ]);
            },
        ]);

        $switchArray = $networkSwitch->toArray();
        // Map interfaces and add admin_status alias for frontend compatibility
        $switchArray['interfaces'] = $networkSwitch->interfaces->map(function ($interface) {
            $interfaceArray = $interface->toArray();
            $interfaceArray['admin_status'] = $interface->admin_state;
            return $interfaceArray;
        })->toArray();

        // Helper function to attach interface/CDP data to MAC addresses
        $attachInterfaceData = function ($macAddress) use ($networkSwitch) {
            $macArray = $macAddress->toArray();
            $port = $macAddress->pivot->ports;
            
            // Find matching interface by port
            if ($port) {
                $interface = $networkSwitch->interfaces->firstWhere('interface_short', $port);
                if ($interface) {
                    $macArray['interface'] = [
                        'mode' => $interface->mode,
                        'neighbor_chassis_id' => $interface->neighbor_chassis_id,
                        'neighbor_name' => $interface->neighbor_name,
                        'neighbor_mgmt_address' => $interface->neighbor_mgmt_address,
                        'neighbor_platform' => $interface->neighbor_platform,
                        'neighbor_interface' => $interface->neighbor_interface,
                        'neighbor_description' => $interface->neighbor_description,
                        'neighbor_interface_ip' => $interface->neighbor_interface_ip,
                        'neighbor_capabilities' => $interface->neighbor_capabilities,
                    ];
                }
            }
            
            return $macArray;
        };

        // Get all MAC addresses (excluding only CPU, but including trunk)
        $allMacAddresses = $networkSwitch->macAddresses()
            ->wherePivot("ports", "!=", "CPU")
            ->get()
            ->map($attachInterfaceData);
        
        // Filter out trunk addresses for the visible/filtered list
        $macAddresses = collect($allMacAddresses)->filter(function ($mac) {
            // Exclude if the interface mode is 'trunk'
            return !isset($mac['interface']['mode']) || strtolower($mac['interface']['mode']) !== 'trunk';
        })->values()->all();

        return Inertia::render('NetworkSwitches/Edit', [
            'switch' => $switchArray,
            'macAddresses' => $macAddresses,
            'allMacAddresses' => $allMacAddresses,
            'totalMacAddressesCount' => count($allMacAddresses),
            'visibleMacAddressesCount' => count($macAddresses),
        ]);
    }

    public function update(Request $request, NetworkSwitch $networkSwitch)
    {
        $validated = $request->validate([
            'host' => 'required|string|max:255',
            'hostname' => 'nullable|string|max:255',
            'username' => 'required|string|max:255',
            'password' => 'required|string|max:255',
            'device_type' => 'required|string|max:255',
            'port' => 'nullable|integer|min:1|max:65535',
        ]);

        $networkSwitch->update($validated);

        return redirect()->route('network-switches.edit', $networkSwitch)
            ->with('success', 'Network switch updated successfully.');
    }

    public function destroy(NetworkSwitch $networkSwitch)
    {
        $networkSwitch->delete();

        return redirect()->route('network-switches.index')
            ->with('success', 'Network switch deleted successfully.');
    }

    public function walk(NetworkSwitch $networkSwitch): RedirectResponse
    {
        if ($networkSwitch->syncing) {
            \Log::info('Switch is already syncing, returning error message');
            return back()->with('error', 'This switch is currently being walked. Please wait for the current operation to complete.');
        }

        \Log::info('Starting walk for switch', ['host' => $networkSwitch->host]);
        $networkSwitch->update(['syncing' => true]);

        try {
            WalkDeviceJob::dispatch($networkSwitch);
            return back()->with('success', "Started walking switch {$networkSwitch->host}. This may take a few minutes to complete.");
        } catch (Exception $e) {
            $networkSwitch->syncing = false;
            $networkSwitch->save();
            return back()->with('error', 'Device sync failed: ' . $e->getMessage());
        }
    }

    public function walkDevice(NetworkSwitch $networkSwitch)
    {
        try {
            $networkSwitch->update(['syncing' => true]);
            WalkDeviceJob::dispatch($networkSwitch);
            
            return response()->json([
                'message' => 'Device walk started successfully',
            ]);
        } catch (\Exception $e) {
            $networkSwitch->update(['syncing' => false]);
            
            $networkSwitch->syncHistory()->create([
                'result' => 'failed',
                'error_message' => $e->getMessage(),
                'completed_at' => now(),
            ]);

            return response()->json([
                'message' => 'Failed to start device walk: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getSyncHistory(NetworkSwitch $networkSwitch)
    {
        return response()->json(
            $networkSwitch->syncHistory()
                ->orderBy('completed_at', 'desc')
                ->get()
        );
    }
}
