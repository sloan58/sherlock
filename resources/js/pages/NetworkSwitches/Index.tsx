import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { Ziggy } from '@/ziggy';
import { Plus, Network, Edit, Server, Activity, Database, Clock } from 'lucide-react';

interface NetworkSwitch {
    id: number;
    host: string;
    hostname: string | null;
    device_type: string;
    interfaces_count: number;
    mac_addresses_count: number;
    last_sync_completed: string | null;
}

interface Props extends PageProps {
    switches: {
        data: NetworkSwitch[];
        links: any[];
    };
}

export default function Index({ switches, ...props }: Props) {
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
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                        <Link href={route('network-switches.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Switch
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-4 sm:grid-cols-2">
                    <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Switches</CardTitle>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{switches.data.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Active network devices
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Interfaces</CardTitle>
                            <Network className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {switches.data.reduce((sum, switch_) => sum + switch_.interfaces_count, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Across all devices
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">MAC Addresses</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {switches.data.reduce((sum, switch_) => sum + switch_.mac_addresses_count, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Discovered addresses
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {switches.data.filter(s => s.last_sync_completed).length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Devices synced recently
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Table */}
                <Card className="border-0 bg-gradient-to-br from-blue-600/5 to-blue-700/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-mono">
                            <Network className="h-5 w-5" />
                            Network Devices
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Host</TableHead>
                                    <TableHead>Hostname</TableHead>
                                    <TableHead>Device Type</TableHead>
                                    <TableHead>Interfaces</TableHead>
                                    <TableHead>MAC Addresses</TableHead>
                                    <TableHead>Last Sync</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                                <TableBody>
                                    {switches.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Network className="h-8 w-8 text-muted-foreground/50" />
                                                    <div className="space-y-1">
                                                        <p className="font-medium">No network switches found</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Get started by adding your first network device
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        switches.data.map((switch_) => (
                                            <TableRow key={switch_.id}>
                                                <TableCell className="font-mono text-sm font-medium">
                                                    {switch_.host}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {switch_.hostname ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400">
                                                        {switch_.device_type}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Network className="h-3 w-3 text-muted-foreground" />
                                                        <span className="font-medium">{switch_.interfaces_count}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Database className="h-3 w-3 text-muted-foreground" />
                                                        <span className="font-medium">{switch_.mac_addresses_count}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {switch_.last_sync_completed ? (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-3 w-3 text-green-500" />
                                                            <span className="text-sm">
                                                                {new Date(switch_.last_sync_completed).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm text-muted-foreground">Never</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                        className="hover:bg-blue-600/10 hover:text-blue-600"
                                                    >
                                                        <Link href={route('network-switches.edit', switch_.id)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 