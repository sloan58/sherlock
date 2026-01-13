import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Settings,
    Database,
    Network,
    Terminal,
    Clock,
    ArrowLeft,
    Save,
    Play,
    Loader2
} from 'lucide-react';
import { Link, useForm, router } from '@inertiajs/react';

import { EnhancedMacAddressTable } from './EnhancedMacAddressTable';
import { EnhancedInterfacesTable } from './EnhancedInterfacesTable';
import { SyncHistoryTable } from './SyncHistoryTable';
import SSHTerminalComponent from '@/components/SSHTerminal';
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
import { HelpCircle } from 'lucide-react';

const deviceTypes = {
    cisco_ios: 'Cisco IOS',
    cisco_xe: 'Cisco IOS-XE',
    cisco_nxos: 'Cisco NXOS',
} as const;

interface NetworkSwitch {
    id: number;
    site_id: number | null;
    host: string;
    hostname: string | null;
    username: string;
    password: string;
    device_type: keyof typeof deviceTypes;
    port: string;
    syncing: boolean;
    interfaces?: never[];
    site?: {
        id: number;
        name: string;
        code: string | null;
    } | null;
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
    interface?: {
        mode?: string;
        neighbor_chassis_id?: string;
        neighbor_name?: string;
        neighbor_mgmt_address?: string;
        neighbor_platform?: string;
        neighbor_interface?: string;
        neighbor_description?: string;
        neighbor_interface_ip?: string;
        neighbor_capabilities?: string;
    };
}

interface Site {
    id: number;
    name: string;
    code: string | null;
}

interface Props {
    switch: NetworkSwitch;
    macAddresses: MacAddress[];
    allMacAddresses?: MacAddress[];
    totalMacAddressesCount?: number;
    visibleMacAddressesCount?: number;
    sites?: Site[];
    errors: any;
}

export function ResponsiveEditLayout({ switch: networkSwitch, macAddresses, allMacAddresses, totalMacAddressesCount, visibleMacAddressesCount, sites = [], errors }: Props) {
    const [activeTab, setActiveTab] = useState("device");
    const { data, setData, processing, submit } = useForm({
        site_id: networkSwitch.site_id ? String(networkSwitch.site_id) : '',
        host: networkSwitch.host,
        hostname: networkSwitch.hostname || '',
        username: networkSwitch.username,
        password: networkSwitch.password,
        device_type: networkSwitch.device_type,
        port: networkSwitch.port,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        //  @ts-ignore
        submit('put', route('network-switches.update', { network_switch: networkSwitch.id }));
    };

    const walkDevice = () => {
        router.post(
            //  @ts-ignore
            route('network-switches.walk', { networkSwitch: networkSwitch.id }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const getStatusBadge = () => {
        if (networkSwitch.syncing) {
            return (
                <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30 shadow-sm">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Syncing
                </Badge>
            );
        }
        return (
            <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30 shadow-sm">
                <Clock className="w-3 h-3 mr-1" />
                Ready
            </Badge>
        );
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        {/* @ts-ignore */}
                        <Link href={route('network-switches.index')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <Network className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight font-mono">
                                Edit Network Switch
                            </h1>
                            <p className="text-muted-foreground">Configure device settings and monitor data collection</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge()}
                </div>
            </div>

            {/* Main Content with Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="mb-6">
                    <TabsList className="flex flex-col sm:flex-row gap-2 p-1 h-auto">
                        <TabsTrigger
                            value="device"
                            className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-accent rounded-lg px-4 py-2.5 text-muted-foreground"
                        >
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline font-medium">Device</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="macs"
                            className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-accent rounded-lg px-4 py-2.5 text-muted-foreground"
                        >
                            <Database className="h-4 w-4" />
                            <span className="hidden sm:inline font-medium">MAC Addresses</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="interfaces"
                            className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-accent rounded-lg px-4 py-2.5 text-muted-foreground"
                        >
                            <Network className="h-4 w-4" />
                            <span className="hidden sm:inline font-medium">Interfaces</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-accent rounded-lg px-4 py-2.5 text-muted-foreground"
                        >
                            <Clock className="h-4 w-4" />
                            <span className="hidden sm:inline font-medium">History</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="terminal"
                            className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-accent rounded-lg px-4 py-2.5 text-muted-foreground"
                        >
                            <Terminal className="h-4 w-4" />
                            <span className="hidden sm:inline font-medium">Terminal</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                    <TabsContent value="device" className="h-full">
                        <Card className="h-full">
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-2 font-mono text-lg">
                                    <div className="p-2 bg-primary/20 rounded-lg">
                                        <Settings className="h-5 w-5 text-primary" />
                                    </div>
                                    Device Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="site_id" className="text-sm font-medium">Site</Label>
                                            <Select
                                                value={data.site_id}
                                                onValueChange={(value) =>
                                                    setData('site_id', value === 'none' ? '' : value)
                                                }
                                            >
                                                <SelectTrigger className="focus:border-ring">
                                                    <SelectValue placeholder="Select a site (optional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {sites.map((site) => (
                                                        <SelectItem key={site.id} value={String(site.id)}>
                                                            {site.name} {site.code && `(${site.code})`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.site_id && <p className="text-sm text-red-500">{errors.site_id}</p>}
                                        </div>

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
                                                className="focus:border-ring"
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
                                                className="focus:border-ring"
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
                                                className="focus:border-ring"
                                            />
                                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="device_type" className="text-sm font-medium">Device Type</Label>
                                            <Select
                                                value={data.device_type}
                                                onValueChange={(value: keyof typeof deviceTypes) => setData('device_type', value)}
                                            >
                                                <SelectTrigger className="focus:border-ring">
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
                                                className="focus:border-ring"
                                            />
                                            {errors.port && <p className="text-sm text-red-500">{errors.port}</p>}
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-4 pt-4">
                                        <Button variant="outline" asChild>
                                            {/* @ts-ignore */}
                                            <Link href={route('network-switches.index')}>Cancel</Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={walkDevice}
                                            disabled={networkSwitch.syncing}
                                            className="hover:bg-accent"
                                        >
                                            {networkSwitch.syncing ? (
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
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            Update Switch
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="macs" className="h-full">
                        <div className="h-full overflow-hidden">
                            <EnhancedMacAddressTable
                                macAddresses={macAddresses}
                                allMacAddresses={allMacAddresses}
                                totalMacAddressesCount={totalMacAddressesCount}
                                visibleMacAddressesCount={visibleMacAddressesCount}
                                className="h-full"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="interfaces" className="h-full">
                        <div className="h-full overflow-hidden">
                            <EnhancedInterfacesTable
                                interfaces={networkSwitch.interfaces || []}
                                className="h-full"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="h-full">
                        <Card className="h-full">
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-2 font-mono text-lg">
                                    <div className="p-2 bg-primary/20 rounded-lg">
                                        <Clock className="h-5 w-5 text-primary" />
                                    </div>
                                    Device Data Collection History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <SyncHistoryTable networkSwitchId={networkSwitch.id} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="terminal" className="h-full">
                        <div className="h-full overflow-hidden">
                            <SSHTerminalComponent
                                networkSwitchId={networkSwitch.id}
                                networkSwitchHost={networkSwitch.host}
                                networkSwitchUsername={networkSwitch.username}
                                networkSwitchPassword={networkSwitch.password}
                                networkSwitchPort={parseInt(networkSwitch.port)}
                            />
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
