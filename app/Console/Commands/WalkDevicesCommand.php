<?php

namespace App\Console\Commands;

use App\Jobs\WalkDevicesJob;
use Illuminate\Console\Command;

class WalkDevicesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:walk-devices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Walk network devices to discover hosts';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        WalkDevicesJob::dispatch();
    }
}
