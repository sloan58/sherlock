<?php

namespace App\Http\Controllers;

use App\Models\MacAddressDiscovery;
use App\Models\NetworkInterface;
use App\Models\NetworkSwitch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MacAddressDiscoveryController extends Controller
{
    /**
     * Display a listing of MAC address discoveries with search/filter capabilities.
     */
    public function index(Request $request): Response
    {
        $query = MacAddressDiscovery::with([
            'macAddress',
            'networkSwitch.site',
            'networkInterface.networkSwitch',
            'deviceSyncHistory'
        ])
            ->latest('discovered_at');

        // Filter by MAC address
        if ($request->filled('mac_address')) {
            $query->whereHas('macAddress', function ($q) use ($request) {
                $q->where('mac_address', 'like', '%' . $request->mac_address . '%');
            });
        }

        // Filter by network switch
        if ($request->filled('network_switch_id')) {
            $query->where('network_switch_id', $request->network_switch_id);
        }

        // Filter by network interface
        if ($request->filled('network_interface_id')) {
            $query->where('network_interface_id', $request->network_interface_id);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('discovered_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('discovered_at', '<=', $request->date_to);
        }

        // Filter out port channels if hide_port_channels is enabled (default: true)
        $hidePortChannels = $request->boolean('hide_port_channels', true);
        if ($hidePortChannels) {
            $query->where(function ($q) {
                // Include discoveries with no interface OR interfaces that are not port channels
                $q->whereNull('network_interface_id')
                    ->orWhereHas('networkInterface', function ($subQuery) {
                        // Exclude interfaces that match port channel patterns (case-insensitive)
                        $subQuery->whereRaw('LOWER(interface) NOT LIKE ?', ['po%'])
                            ->whereRaw('LOWER(interface) NOT LIKE ?', ['port-channel%'])
                            ->whereRaw('LOWER(interface) NOT LIKE ?', ['portchannel%']);
                    });
            });
        }

        $discoveries = $query->paginate(25)->withQueryString();

        // Get filter options for dropdowns
        $switches = NetworkSwitch::with('site')
            ->orderBy('hostname')
            ->orderBy('host')
            ->get();

        $interfaces = NetworkInterface::with('networkSwitch')
            ->orderBy('interface')
            ->get();

        return Inertia::render('MacAddressDiscoveries/Index', [
            'discoveries' => $discoveries,
            'switches' => $switches,
            'interfaces' => $interfaces,
            'filters' => $request->only([
                'mac_address',
                'network_switch_id',
                'network_interface_id',
                'date_from',
                'date_to',
                'hide_port_channels',
            ]),
        ]);
    }
}
