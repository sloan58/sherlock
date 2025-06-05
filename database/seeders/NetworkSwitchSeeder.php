<?php

namespace Database\Seeders;

use App\Models\NetworkSwitch;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class NetworkSwitchSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('data/network_switches.json');

        if (!File::exists($jsonPath)) {
            $this->command->info('Network switches JSON file not found. Skipping seeder.');
            return;
        }

        $switches = json_decode(File::get($jsonPath), true);

        if (!is_array($switches)) {
            $this->command->error('Invalid JSON format in network_switches.json');
            return;
        }

        foreach ($switches as $switch) {
            NetworkSwitch::create([
                'host' => $switch['host'],
                'username' => $switch['username'],
                'password' => $switch['password'],
                'device_type' => $switch['type'],
                'port' => $switch['port'] ?? '22',
            ]);
        }

        $this->command->info('Network switches seeded successfully.');
    }
} 