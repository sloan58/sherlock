<?php

namespace App\Http\Controllers;

use App\Models\NetworkSwitch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Jobs\WalkDeviceJob;

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

    public function show(NetworkSwitch $networkSwitch)
    {
        return Inertia::render('NetworkSwitches/Show', [
            'switch' => $networkSwitch->load(['interfaces', 'macAddresses'])
        ]);
    }

    public function edit(NetworkSwitch $networkSwitch)
    {
        return Inertia::render('NetworkSwitches/Edit', [
            'switch' => $networkSwitch
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

        return redirect()->route('network-switches.show', $networkSwitch)
            ->with('success', 'Network switch updated successfully.');
    }

    public function destroy(NetworkSwitch $networkSwitch)
    {
        $networkSwitch->delete();

        return redirect()->route('network-switches.index')
            ->with('success', 'Network switch deleted successfully.');
    }

    public function walk(NetworkSwitch $networkSwitch)
    {
        WalkDeviceJob::dispatch($networkSwitch);

        return back()->with('success', 'Network switch walk job has been queued.');
    }
}
