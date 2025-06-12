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
        $networkSwitch->load(['macAddresses' => function ($q) {
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
        }]);

        return Inertia::render('NetworkSwitches/Edit', [
            'switch' => $networkSwitch,
            'macAddresses' => $networkSwitch->macAddresses,
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
}
