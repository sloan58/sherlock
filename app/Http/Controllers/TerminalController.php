<?php

namespace App\Http\Controllers;

use App\Models\NetworkSwitch;
use App\Services\SshService;
use App\Events\TerminalOutput;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TerminalController extends Controller
{
    protected SshService $sshService;

    public function __construct(SshService $sshService)
    {
        $this->sshService = $sshService;
    }

    /**
     * Execute a command on the network switch
     */
    public function executeCommand(Request $request, NetworkSwitch $networkSwitch): JsonResponse
    {
        $request->validate([
            'command' => 'required|string|max:1000',
        ]);

        $command = $request->input('command');

        // Broadcast the command being executed
        broadcast(new TerminalOutput($networkSwitch->id, $command, 'command'));

        // Execute the command
        $result = $this->sshService->executeCommand($networkSwitch, $command);

        if ($result['success']) {
            // Broadcast the output
            if (!empty($result['output'])) {
                broadcast(new TerminalOutput($networkSwitch->id, $result['output'], 'output'));
            }
            
            if (!empty($result['error'])) {
                broadcast(new TerminalOutput($networkSwitch->id, $result['error'], 'error'));
            }

            return response()->json([
                'success' => true,
                'output' => $result['output'],
                'error' => $result['error'],
            ]);
        } else {
            broadcast(new TerminalOutput($networkSwitch->id, $result['error'], 'error'));
            
            return response()->json([
                'success' => false,
                'error' => $result['error'],
            ], 500);
        }
    }

    /**
     * Test SSH connection to the network switch
     */
    public function testConnection(NetworkSwitch $networkSwitch): JsonResponse
    {
        $isConnected = $this->sshService->testConnection($networkSwitch);

        return response()->json([
            'success' => $isConnected,
            'message' => $isConnected ? 'Connection successful' : 'Connection failed',
        ]);
    }

    /**
     * Close SSH connection
     */
    public function closeConnection(NetworkSwitch $networkSwitch): JsonResponse
    {
        $this->sshService->closeConnection($networkSwitch);

        broadcast(new TerminalOutput($networkSwitch->id, "Connection closed", 'system'));

        return response()->json([
            'success' => true,
            'message' => 'Connection closed',
        ]);
    }

    /**
     * Get terminal authorization channels
     */
    public function authorize(Request $request): JsonResponse
    {
        $request->validate([
            'channel_name' => 'required|string',
        ]);

        $channelName = $request->input('channel_name');
        
        // Extract switch ID from channel name (terminal.{switchId})
        if (preg_match('/^terminal\.(\d+)$/', $channelName, $matches)) {
            $switchId = (int) $matches[1];
            
            // Check if user has access to this switch
            $networkSwitch = NetworkSwitch::find($switchId);
            
            if ($networkSwitch && Auth::check()) {
                return response()->json([
                    'success' => true,
                ]);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized',
        ], 403);
    }
} 