<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Foundation\Application;
use App\Http\Controllers\NetworkSwitchController;
use App\Http\Controllers\MacAddressDiscoveryController;
use App\Http\Controllers\TerminalController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Site Routes
    Route::resource('sites', \App\Http\Controllers\SiteController::class);

    // Network Switch Routes
    Route::resource('network-switches', NetworkSwitchController::class);
    Route::post('network-switches/{networkSwitch}/walk', [NetworkSwitchController::class, 'walk'])->name('network-switches.walk');
    Route::get('/network-switches/{networkSwitch}/sync-history', [NetworkSwitchController::class, 'getSyncHistory'])
        ->name('network-switches.sync-history');

    // MAC Address Discovery Routes
    Route::get('/mac-address-discoveries', [MacAddressDiscoveryController::class, 'index'])->name('mac-address-discoveries.index');



    // Bare Terminal Test Route
    Route::get('/terminal-bare-test', function () {
        return Inertia::render('TerminalBareTest');
    })->name('terminal.bare.test');

    // Simple XTerm Test Route
    Route::get('/simple-xterm-test', function () {
        return Inertia::render('SimpleXTermTestPage');
    })->name('simple.xterm.test');

    // REMOVE: Terminal Routes
    // Route::prefix('terminal')->group(function () {
    //     Route::post('{networkSwitch}/execute', [TerminalController::class, 'executeCommand'])->name('terminal.execute');
    //     Route::post('{networkSwitch}/test', [TerminalController::class, 'testConnection'])->name('terminal.test');
    //     Route::post('{networkSwitch}/close', [TerminalController::class, 'closeConnection'])->name('terminal.close');
    // });
    // Route::post('terminal/authorize', [TerminalController::class, 'authorize'])->name('terminal.authorize');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
