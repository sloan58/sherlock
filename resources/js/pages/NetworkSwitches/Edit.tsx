import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Loader2, Settings, Network, Database, ArrowLeft, Save, Play, Search, Terminal } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { SyncHistoryTable } from '@/components/NetworkSwitches/SyncHistoryTable';
import TerminalComponent from '@/components/Terminal';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Ziggy } from '@/ziggy';
import { route } from 'ziggy-js';

const deviceTypes = {
    cisco_ios: 'Cisco IOS',
    cisco_nxos: 'Cisco NXOS',
} as const;

interface NetworkSwitch {
    id: number;
    host: string;
    hostname: string | null;
    username: string;
    password: string;
    device_type: keyof typeof deviceTypes;
    port: string;
    syncing: boolean;
    interfaces?: never[];
}

interface MacAddress {
    id: number;
    mac_address: string;
    vendor?: string;
    pivot: {
        vlan_id?: string;
        type?: string;
        age?: string;
        secure?: string;
        ntfy?: string;
        ports?: string;
        manufacturer?: string;
        comment?: string;
        created_at?: string;
        updated_at?: string;
    };
}

interface Props extends PageProps {
    switch: NetworkSwitch;
    macAddresses: MacAddress[];
}

export default function Edit({ switch: networkSwitch, macAddresses }: Props) {
    const [switchData, setSwitchData] = useState(networkSwitch);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("device");

    const filtered = useMemo(() => {
        const trimmedSearch = search.trim().toLowerCase();
        if (!trimmedSearch) return macAddresses;
        
        const results = macAddresses.filter(mac => {
            const fields = [
                mac.mac_address,
                mac.pivot?.ports,
                mac.pivot?.vlan_id,
                mac.pivot?.type,
                mac.pivot?.manufacturer,
            ];

            const hasMatch = fields.some(field => {
                if (!field) return false;
                return field.toLowerCase().includes(trimmedSearch);
            });

            return hasMatch;
        });

        return results;
    }, [macAddresses, search]);

    useEffect(() => {
        // Only poll if the switch is syncing
        if (switchData.syncing) {
            const interval = setInterval(() => {
                router.reload({
                    only: ['switch'],
                });
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [switchData.syncing]);

    // Update switchData when networkSwitch changes
    useEffect(() => {
        setSwitchData(networkSwitch);
    }, [networkSwitch]);

    const { data, setData, put, processing, errors } = useForm({
        host: switchData.host,
        username: switchData.username,
        password: switchData.password,
        device_type: switchData.device_type,
        port: switchData.port,
    });

    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('network-switches.update', switchData.id));
    };

    const walkDevice = () => {
        router.post(
            route('network-switches.walk', switchData.id),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Edit Network Switch" />

            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-4">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                            <Link href={route('network-switches.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight font-mono">Edit Network Switch</h1>
                            <p className="text-muted-foreground">Configure device settings and monitor data collection</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col space-y-6">
                    <div className="flex gap-6">
                        {/* Left Sidebar Navigation */}
                        <div className="w-64 space-y-2">
                            <nav className="space-y-1">
                                <button
                                    onClick={() => setActiveTab("device")}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all font-mono ${
                                        activeTab === "device"
                                            ? "bg-gradient-to-br from-blue-500/10 to-blue-600/10 text-blue-600 border border-blue-600/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                                >
                                    <Settings className="h-4 w-4" />
                                    Device Details
                                </button>
                                <button
                                    onClick={() => setActiveTab("macs")}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all font-mono ${
                                        activeTab === "macs"
                                            ? "bg-gradient-to-br from-blue-500/10 to-blue-600/10 text-blue-600 border border-blue-600/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                                >
                                    <Database className="h-4 w-4" />
                                    MAC Addresses
                                </button>
                                <button
                                    onClick={() => setActiveTab("interfaces")}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all font-mono ${
                                        activeTab === "interfaces"
                                            ? "bg-gradient-to-br from-blue-500/10 to-blue-600/10 text-blue-600 border border-blue-600/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                                >
                                    <Network className="h-4 w-4" />
                                    Interfaces
                                </button>
                                <button
                                    onClick={() => setActiveTab("history")}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all font-mono ${
                                        activeTab === "history"
                                            ? "bg-gradient-to-br from-blue-500/10 to-blue-600/10 text-blue-600 border border-blue-600/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                                >
                                    <Database className="h-4 w-4" />
                                    History
                                </button>
                                <button
                                    onClick={() => setActiveTab("terminal")}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all font-mono ${
                                        activeTab === "terminal"
                                            ? "bg-gradient-to-br from-blue-500/10 to-blue-600/10 text-blue-600 border border-blue-600/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                                >
                                    <Terminal className="h-4 w-4" />
                                    Terminal
                                </button>
                            </nav>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1">
                            {activeTab === "device" && (
                                <Card className="border-0 bg-gradient-to-br from-blue-600/5 to-blue-700/5">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 font-mono">
                                            <Settings className="h-5 w-5" />
                                            Device Configuration
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={submit} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor="host" className="text-sm font-medium">Host</Label>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <HelpCircle className="text-muted-foreground h-4 w-4" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>The FQDN or IP address of the device</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                    <Input
                                                        id="host"
                                                        type="text"
                                                        value={data.host}
                                                        onChange={(e) => setData('host', e.target.value)}
                                                        required
                                                        className="border-border/50 focus:border-primary"
                                                    />
                                                    {errors.host && <p className="text-sm text-red-500">{errors.host}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                                                    <Input
                                                        id="username"
                                                        type="text"
                                                        value={data.username}
                                                        onChange={(e) => setData('username', e.target.value)}
                                                        required
                                                        className="border-border/50 focus:border-primary"
                                                    />
                                                    {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        required
                                                        className="border-border/50 focus:border-primary"
                                                    />
                                                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="device_type" className="text-sm font-medium">Device Type</Label>
                                                    <Select
                                                        value={data.device_type}
                                                        onValueChange={(value: keyof typeof deviceTypes) => setData('device_type', value)}
                                                    >
                                                        <SelectTrigger className="border-border/50 focus:border-primary">
                                                            <SelectValue placeholder="Select device type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(deviceTypes).map(([value, label]) => (
                                                                <SelectItem key={value} value={value}>
                                                                    {label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.device_type && <p className="text-sm text-red-500">{errors.device_type}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="port" className="text-sm font-medium">Port</Label>
                                                    <Input 
                                                        id="port" 
                                                        type="number" 
                                                        value={data.port} 
                                                        onChange={(e) => setData('port', e.target.value)}
                                                        className="border-border/50 focus:border-primary"
                                                    />
                                                    {errors.port && <p className="text-sm text-red-500">{errors.port}</p>}
                                                </div>
                                            </div>

                                            <div className="flex justify-end space-x-4 pt-4">
                                                <Button variant="outline" asChild>
                                                    <Link href={route('network-switches.index')}>Cancel</Link>
                                                </Button>
                                                <Button 
                                                    type="button" 
                                                    variant="outline"
                                                    onClick={walkDevice} 
                                                    disabled={switchData.syncing}
                                                    className="border-blue-600/30 text-blue-600 hover:bg-blue-600/10 hover:border-blue-600/50"
                                                >
                                                    {switchData.syncing ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Walking Device...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="mr-2 h-4 w-4" />
                                                            Walk Device
                                                        </>
                                                    )}
                                                </Button>
                                                <Button 
                                                    type="submit" 
                                                    disabled={processing}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                                >
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Update Switch
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "macs" && (
                                <Card className="border-0 bg-gradient-to-br from-blue-600/5 to-blue-700/5">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 font-mono">
                                            <Database className="h-5 w-5" />
                                            MAC Addresses
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {/* Search Section */}
                                            <div className="relative mt-4">
                                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search MAC addresses, vendor, port, VLAN, etc."
                                                    value={search}
                                                    onChange={e => setSearch(e.target.value)}
                                                    className="pl-10 border border-border/50 focus:ring-1 focus:ring-blue-600/50 bg-background/50"
                                                />
                                            </div>

                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>MAC Address</TableHead>
                                                        <TableHead>Ports</TableHead>
                                                        <TableHead>VLAN ID</TableHead>
                                                        <TableHead>Type</TableHead>
                                                        <TableHead>Manufacturer</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filtered.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <Database className="h-8 w-8 text-muted-foreground/50" />
                                                                    <p>No MAC addresses found.</p>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        filtered.map((mac, idx) => (
                                                            <TableRow key={`${mac.id}-${mac.pivot?.ports ?? ''}-${mac.pivot?.vlan_id ?? ''}-${idx}`}>
                                                                <TableCell className="font-mono text-sm">{mac.mac_address}</TableCell>
                                                                <TableCell className="font-mono text-sm">{mac.pivot?.ports ?? '-'}</TableCell>
                                                                <TableCell className="font-mono text-sm">{mac.pivot?.vlan_id ?? '-'}</TableCell>
                                                                <TableCell>
                                                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                                        mac.pivot?.type === 'dynamic' 
                                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                                                            : mac.pivot?.type === 'static'
                                                                            ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400'
                                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                                    }`}>
                                                                        {mac.pivot?.type ?? '-'}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="font-mono text-sm">{mac.pivot?.manufacturer ?? '-'}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "interfaces" && (
                                <Card className="border-0 bg-gradient-to-br from-blue-600/5 to-blue-700/5">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 font-mono">
                                            <Network className="h-5 w-5" />
                                            Network Interfaces
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Interface</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>VLAN</TableHead>
                                                    <TableHead>MAC Address</TableHead>
                                                    <TableHead>IP Address</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {((switchData.interfaces ?? []).length === 0) ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Network className="h-8 w-8 text-muted-foreground/50" />
                                                                <p>No interfaces found.</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    (switchData.interfaces ?? []).map((interface_, idx) => (
                                                        <TableRow key={`${interface_.interface}-${interface_.description}-${idx}`}>
                                                            <TableCell className="font-mono text-sm">{interface_.interface}</TableCell>
                                                            <TableCell className="text-sm">{interface_.description}</TableCell>
                                                            <TableCell>
                                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                                    interface_.link_status === 'up' 
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                                }`}>
                                                                    {interface_.link_status}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-sm">{interface_.vlan_id}</TableCell>
                                                            <TableCell className="font-mono text-sm">{interface_.mac_address}</TableCell>
                                                            <TableCell className="font-mono text-sm">{interface_.ip_address}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "history" && (
                                <Card className="border-0 bg-gradient-to-br from-blue-600/5 to-blue-700/5">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 font-mono">
                                            <Database className="h-5 w-5" />
                                            Device Data Collection History
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <SyncHistoryTable networkSwitchId={switchData.id} />
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "terminal" && (
                                <TerminalComponent 
                                    networkSwitchId={switchData.id} 
                                    networkSwitchHost={switchData.host}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
