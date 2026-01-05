<?php

namespace App\Http\Controllers;

use App\Models\NetworkSwitch;
use App\Models\NetworkInterface;
use App\Models\MacAddress;
use App\Models\DeviceSyncHistory;
use App\Models\MacAddressDiscovery;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalDevices = NetworkSwitch::count();
        $totalInterfaces = NetworkInterface::count();
        $totalMacs = MacAddress::count();

        // MAC addresses by manufacturer
        $macsByManufacturer = DB::table('mac_address_network_switch')
            ->select('manufacturer', DB::raw('count(*) as count'))
            ->whereNotNull('manufacturer')
            ->where('manufacturer', '!=', '')
            ->groupBy('manufacturer')
            ->orderByDesc('count')
            ->get();

        // Device types breakdown
        $devicesByType = NetworkSwitch::select('device_type', DB::raw('count(*) as count'))
            ->groupBy('device_type')
            ->orderByDesc('count')
            ->get();

        // Sync statuses
        $syncStatuses = DeviceSyncHistory::select('result', DB::raw('count(*) as count'))
            ->groupBy('result')
            ->get()
            ->pluck('count', 'result');

        // Recent sync activity (last 30 days)
        $syncActivity = DeviceSyncHistory::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN result = "completed" THEN 1 ELSE 0 END) as completed'),
                DB::raw('SUM(CASE WHEN result = "failed" THEN 1 ELSE 0 END) as failed'),
                DB::raw('SUM(CASE WHEN result = "in_progress" THEN 1 ELSE 0 END) as in_progress')
            )
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Recent sync histories (last 10)
        $recentSyncs = DeviceSyncHistory::with('networkSwitch.site')
            ->latest()
            ->limit(10)
            ->get();

        // Top switches by MAC count
        $topSwitchesByMacs = NetworkSwitch::withCount('macAddresses')
            ->orderByDesc('mac_addresses_count')
            ->limit(5)
            ->get(['id', 'host', 'hostname', 'device_type', 'mac_addresses_count']);

        // Recent discoveries count (last 7 days)
        $recentDiscoveries = MacAddressDiscovery::where('discovered_at', '>=', Carbon::now()->subDays(7))
            ->count();

        // Total discoveries
        $totalDiscoveries = MacAddressDiscovery::count();

        return Inertia::render('dashboard', [
            'totalDevices' => $totalDevices,
            'totalInterfaces' => $totalInterfaces,
            'totalMacs' => $totalMacs,
            'totalDiscoveries' => $totalDiscoveries,
            'recentDiscoveries' => $recentDiscoveries,
            'macsByManufacturer' => $macsByManufacturer,
            'devicesByType' => $devicesByType,
            'syncStatuses' => $syncStatuses,
            'syncActivity' => $syncActivity,
            'recentSyncs' => $recentSyncs,
            'topSwitchesByMacs' => $topSwitchesByMacs,
        ]);
    }
} 