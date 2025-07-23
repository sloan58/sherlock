<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TerminalOutput implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $switchId;
    public $output;
    public $type; // 'output', 'error', 'command'
    public $timestamp;

    /**
     * Create a new event instance.
     */
    public function __construct(int $switchId, string $output, string $type = 'output')
    {
        $this->switchId = $switchId;
        $this->output = $output;
        $this->type = $type;
        $this->timestamp = now();
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("terminal.{$this->switchId}"),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'switchId' => $this->switchId,
            'output' => $this->output,
            'type' => $this->type,
            'timestamp' => $this->timestamp->toISOString(),
        ];
    }
} 