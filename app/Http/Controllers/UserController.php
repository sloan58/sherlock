<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Users/Index', [
            'users' => User::latest()
                ->paginate(10)
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Users/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => 'required_if:auth_source,local|nullable|string|min:8|confirmed',
            'auth_source' => 'required|in:local,ldap',
        ]);

        // Only hash password for local users
        if ($validated['auth_source'] === 'local' && isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            $validated['password'] = null;
        }

        User::create($validated);

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user): Response
    {
        return Inertia::render('Users/Show', [
            'user' => $user
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('Users/Edit', [
            'user' => $user
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        // If switching from LDAP to local, password is required
        $passwordRequired = $request->input('auth_source') === 'local' && $user->auth_source === 'ldap';
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'password' => $passwordRequired ? 'required|string|min:8|confirmed' : 'nullable|string|min:8|confirmed',
            'auth_source' => 'required|in:local,ldap',
        ]);

        // Handle password based on auth_source
        if ($validated['auth_source'] === 'ldap') {
            // LDAP users don't have passwords
            $validated['password'] = null;
        } elseif ($validated['auth_source'] === 'local') {
            // For local users, hash password if provided
            if (isset($validated['password']) && !empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                // If no password provided and user was already local, keep existing password
                if ($user->auth_source === 'local') {
                    unset($validated['password']);
                }
            }
        }

        $user->update($validated);

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }
}
