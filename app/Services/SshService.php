<?php

namespace App\Services;

use phpseclib3\Net\SSH2;
use phpseclib3\Crypt\PublicKeyLoader;
use App\Models\NetworkSwitch;
use Illuminate\Support\Facades\Log;

class SshService
{
    protected $connections = [];

    /**
     * Get or create an SSH connection for a network switch
     */
    public function getConnection(NetworkSwitch $networkSwitch): ?SSH2
    {
        $connectionKey = $networkSwitch->id;

        if (isset($this->connections[$connectionKey])) {
            return $this->connections[$connectionKey];
        }

        try {
            $ssh = new SSH2($networkSwitch->host, $networkSwitch->port ?? 22);
            
            if (!$ssh->login($networkSwitch->username, $networkSwitch->password)) {
                Log::error("SSH login failed for switch {$networkSwitch->id} at {$networkSwitch->host}");
                return null;
            }

            $this->connections[$connectionKey] = $ssh;
            return $ssh;

        } catch (\Exception $e) {
            Log::error("SSH connection failed for switch {$networkSwitch->id}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Execute a command on the network switch
     */
    public function executeCommand(NetworkSwitch $networkSwitch, string $command): array
    {
        $ssh = $this->getConnection($networkSwitch);
        
        if (!$ssh) {
            return [
                'success' => false,
                'output' => 'Failed to establish SSH connection',
                'error' => 'Connection failed'
            ];
        }

        try {
            $output = $ssh->exec($command);
            $error = $ssh->getStdError();
            
            return [
                'success' => true,
                'output' => $output,
                'error' => $error,
                'command' => $command
            ];

        } catch (\Exception $e) {
            Log::error("SSH command execution failed: " . $e->getMessage());
            return [
                'success' => false,
                'output' => '',
                'error' => $e->getMessage(),
                'command' => $command
            ];
        }
    }

    /**
     * Close SSH connection for a network switch
     */
    public function closeConnection(NetworkSwitch $networkSwitch): void
    {
        $connectionKey = $networkSwitch->id;
        
        if (isset($this->connections[$connectionKey])) {
            $this->connections[$connectionKey]->disconnect();
            unset($this->connections[$connectionKey]);
        }
    }

    /**
     * Close all SSH connections
     */
    public function closeAllConnections(): void
    {
        foreach ($this->connections as $ssh) {
            $ssh->disconnect();
        }
        $this->connections = [];
    }

    /**
     * Test SSH connection
     */
    public function testConnection(NetworkSwitch $networkSwitch): bool
    {
        $ssh = $this->getConnection($networkSwitch);
        return $ssh !== null;
    }
} 