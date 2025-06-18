<?php

namespace App\Http\Controllers;

use App\Models\NetworkSwitch;
use App\Models\NetworkInterface;
use App\Models\MacAddress;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalDevices = NetworkSwitch::count();
        $totalInterfaces = NetworkInterface::count();
        $totalMacs = MacAddress::count();

        $macsByManufacturer = DB::table('mac_address_network_switch')
            ->select('manufacturer', DB::raw('count(*) as count'))
            ->groupBy('manufacturer')
            ->get();

        $interfacesPerDevice = NetworkSwitch::withCount('interfaces')
            ->get(['id', 'host', 'hostname', 'interfaces_count']);

        return Inertia::render('dashboard', [
            'totalDevices' => $totalDevices,
            'totalInterfaces' => $totalInterfaces,
            'totalMacs' => $totalMacs,
            'macsByManufacturer' => $macsByManufacturer,
            'interfacesPerDevice' => $interfacesPerDevice,
        ]);
    }
} 