<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Foundation\Application;
use App\Http\Controllers\NetworkSwitchController;
use App\Http\Controllers\Settings\ProfileController;

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
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Network Switch Routes
        Route::resource('network-switches', NetworkSwitchController::class);
    Route::post('network-switches/{networkSwitch}/walk', [NetworkSwitchController::class, 'walk'])->name('network-switches.walk');
    Route::get('/network-switches/{networkSwitch}/sync-history', [NetworkSwitchController::class, 'getSyncHistory'])
        ->name('network-switches.sync-history');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
