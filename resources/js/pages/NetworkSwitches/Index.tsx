import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { Ziggy } from '@/ziggy';
import { DeviceStatusIndicator } from '@/components/ui/status-indicator';
import { NetworkMetricsCard } from '@/components/ui/metrics-card';
import { 
    FuturisticTable, 
    FuturisticTableHeader, 
    FuturisticTableBody, 
    FuturisticTableRow, 
    FuturisticTableHead, 
    FuturisticTableCell 
} from '@/components/ui/futuristic-table';
import { 
    Plus, 
    Network, 
    Edit, 
    Server, 
    Activity, 
    Database, 
    Clock, 
    AlertCircle,
    CheckCircle,
    XCircle,
    RefreshCw,
    Search,
    Filter,
    MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';

interface NetworkSwitch {
    id: number;
    host: string;
    hostname: string | null;
    device_type: string;
    interfaces_count: number;
    mac_addresses_count: number;
    last_sync_completed: string | null;
    syncing?: boolean;
    last_sync_history?: {
        id: number;
        result: string;
        error_message?: string;
        completed_at: string;
    } | null;
}

interface Props extends PageProps {
    switches: {
        data: NetworkSwitch[];
        links: any[];
    };
}

export default function Index({ switches, ...props }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'synced' | 'never-synced' | 'syncing'>('all');

    const syncDevice = (switchId: number) => {
        router.post(
            route('network-switches.walk', switchId),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const filteredSwitches = useMemo(() => {
        let filtered = switches.data;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(switch_ => 
                switch_.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (switch_.hostname && switch_.hostname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                switch_.device_type.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(switch_ => {
                switch (statusFilter) {
                    case 'synced':
                        return switch_.last_sync_history !== null && switch_.last_sync_history.result === 'completed';
                    case 'never-synced':
                        return switch_.last_sync_history === null;
                    case 'syncing':
                        return switch_.syncing === true;
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }, [switches.data, searchTerm, statusFilter]);

    const getStatusBadge = (switch_: NetworkSwitch) => {
        return <DeviceStatusIndicator device={switch_} />;
    };

    const getDeviceTypeBadge = (deviceType: string) => {
        return (
            <Badge variant="secondary" className="font-mono text-xs">
                {deviceType}
            </Badge>
        );
    };

    const totalInterfaces = switches.data.reduce((sum, switch_) => sum + switch_.interfaces_count, 0);
    const totalMacAddresses = switches.data.reduce((sum, switch_) => sum + switch_.mac_addresses_count, 0);
    const syncedDevices = switches.data.filter(s => s.last_sync_history && s.last_sync_history.result === 'completed').length;
    const syncingDevices = switches.data.filter(s => s.syncing).length;

    return (
        <AppLayout>
            <Head title="Network Switches" />

            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-4">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-mono">Network Switches</h1>
                        <p className="text-muted-foreground">Manage and monitor your network devices</p>
                    </div>
                    <Button 
                        asChild
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                    >
                        <Link href={route('network-switches.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Switch
                        </Link>
                    </Button>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid gap-6 md:grid-cols-4 sm:grid-cols-2">
                    <NetworkMetricsCard
                        title="Total Switches"
                        value={switches.data.length}
                        description="Active network devices"
                        icon={Server}
                        status="default"
                    />
                    
                    <NetworkMetricsCard
                        title="Total Interfaces"
                        value={totalInterfaces}
                        description="Across all devices"
                        icon={Network}
                        status="success"
                    />
                    
                    <NetworkMetricsCard
                        title="MAC Addresses"
                        value={totalMacAddresses}
                        description="Discovered addresses"
                        icon={Database}
                        status="default"
                    />
                    
                    <NetworkMetricsCard
                        title="Sync Status"
                        value={syncedDevices}
                        description={syncingDevices > 0 ? `${syncingDevices} syncing` : 'All devices synced'}
                        icon={Activity}
                        status={syncingDevices > 0 ? "warning" : "success"}
                    />
                </div>

                {/* Search and Filter Section */}
                <Card className="border border-primary/20 bg-card/50 backdrop-blur-sm shadow-lg shadow-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-mono text-primary">
                            <Network className="h-5 w-5 text-primary" />
                            Network Devices
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search switches..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Status: {statusFilter === 'all' ? 'All' : statusFilter.replace('-', ' ')}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                                        All Devices
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('synced')}>
                                        Synced
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('never-synced')}>
                                        Never Synced
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('syncing')}>
                                        Syncing
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Enhanced Table */}
                        <FuturisticTable>
                            <FuturisticTableHeader>
                                <FuturisticTableRow className="border-b border-primary/20 bg-primary/5">
                                    <FuturisticTableHead>Host</FuturisticTableHead>
                                    <FuturisticTableHead>Hostname</FuturisticTableHead>
                                    <FuturisticTableHead>Device Type</FuturisticTableHead>
                                    <FuturisticTableHead>Status</FuturisticTableHead>
                                    <FuturisticTableHead>Interfaces</FuturisticTableHead>
                                    <FuturisticTableHead>MAC Addresses</FuturisticTableHead>
                                    <FuturisticTableHead>Last Sync</FuturisticTableHead>
                                    <FuturisticTableHead className="text-right">Actions</FuturisticTableHead>
                                </FuturisticTableRow>
                            </FuturisticTableHeader>
                                <FuturisticTableBody>
                                    {filteredSwitches.length === 0 ? (
                                        <FuturisticTableRow>
                                            <FuturisticTableCell colSpan={8} className="text-center text-muted-foreground py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Network className="h-8 w-8 text-muted-foreground/50" />
                                                    <div className="space-y-1">
                                                        <p className="font-medium">No network switches found</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {searchTerm || statusFilter !== 'all' 
                                                                ? 'Try adjusting your search or filters'
                                                                : 'Get started by adding your first network device'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </FuturisticTableCell>
                                        </FuturisticTableRow>
                                    ) : (
                                        filteredSwitches.map((switch_) => (
                                            <FuturisticTableRow key={switch_.id}>
                                                <FuturisticTableCell className="font-mono text-sm font-medium">
                                                    {switch_.host}
                                                </FuturisticTableCell>
                                                <FuturisticTableCell className="font-mono text-sm">
                                                    {switch_.hostname ?? '-'}
                                                </FuturisticTableCell>
                                                <FuturisticTableCell>
                                                    {getDeviceTypeBadge(switch_.device_type)}
                                                </FuturisticTableCell>
                                                <FuturisticTableCell>
                                                    {getStatusBadge(switch_)}
                                                </FuturisticTableCell>
                                                <FuturisticTableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Network className="h-3 w-3 text-muted-foreground" />
                                                        <span className="font-medium">{switch_.interfaces_count}</span>
                                                    </div>
                                                </FuturisticTableCell>
                                                <FuturisticTableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Database className="h-3 w-3 text-muted-foreground" />
                                                        <span className="font-medium">{switch_.mac_addresses_count}</span>
                                                    </div>
                                                </FuturisticTableCell>
                                                <FuturisticTableCell>
                                                    {switch_.syncing ? (
                                                        <span className="text-sm text-muted-foreground">In Progress</span>
                                                    ) : switch_.last_sync_history ? (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm">
                                                                {new Date(switch_.last_sync_history.completed_at).toLocaleString()}
                                                            </span>
                                                            {switch_.last_sync_history.result === 'completed' ? (
                                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                                            ) : (
                                                                <XCircle className="h-3 w-3 text-red-600" />
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm text-muted-foreground">Never</span>
                                                        </div>
                                                    )}
                                                </FuturisticTableCell>
                                                <FuturisticTableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('network-switches.edit', switch_.id)}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => syncDevice(switch_.id)}>
                                                                <Activity className="mr-2 h-4 w-4" />
                                                                Sync Now
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </FuturisticTableCell>
                                            </FuturisticTableRow>
                                        ))
                                    )}
                                </FuturisticTableBody>
                            </FuturisticTable>

                        {/* Results Summary */}
                        {filteredSwitches.length > 0 && (
                            <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                                <span>
                                    Showing {filteredSwitches.length} of {switches.data.length} switches
                                </span>
                                {(searchTerm || statusFilter !== 'all') && (
                                    <span>
                                        Filtered by {searchTerm ? `"${searchTerm}"` : ''} {searchTerm && statusFilter !== 'all' ? 'and' : ''} {statusFilter !== 'all' ? statusFilter.replace('-', ' ') : ''}
                                    </span>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 