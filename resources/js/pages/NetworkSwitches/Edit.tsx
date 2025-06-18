import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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
import { HelpCircle, Loader2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import MacAddressTable from '@/components/MacAddressTable';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { SyncHistoryTable } from '@/components/NetworkSwitches/SyncHistoryTable';
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

const customZiggy = { ...Ziggy, url: window.location.origin };

export default function Edit({ switch: networkSwitch, macAddresses }: Props) {
    const [switchData, setSwitchData] = useState(networkSwitch);

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
        put(route('network-switches.update', switchData.id, undefined, customZiggy));
    };

    const walkDevice = () => {
        router.post(
            route('network-switches.walk', switchData.id, undefined, customZiggy),
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

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Tabs defaultValue="device" className="w-full">
                        <TabsList>
                            <TabsTrigger value="device">Device Details</TabsTrigger>
                            <TabsTrigger value="macs">MAC Addresses</TabsTrigger>
                            <TabsTrigger value="interfaces">Interfaces</TabsTrigger>
                        </TabsList>
                        <TabsContent value="device">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Edit Network Switch</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={submit} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor="host">Host</Label>
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
                                                />
                                                {errors.host && <p className="text-sm text-red-500">{errors.host}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="username">Username</Label>
                                                <Input
                                                    id="username"
                                                    type="text"
                                                    value={data.username}
                                                    onChange={(e) => setData('username', e.target.value)}
                                                    required
                                                />
                                                {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password">Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    required
                                                />
                                                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="device_type">Device Type</Label>
                                                <Select
                                                    value={data.device_type}
                                                    onValueChange={(value: keyof typeof deviceTypes) => setData('device_type', value)}
                                                >
                                                    <SelectTrigger>
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
                                                <Label htmlFor="port">Port</Label>
                                                <Input id="port" type="number" value={data.port} onChange={(e) => setData('port', e.target.value)} />
                                                {errors.port && <p className="text-sm text-red-500">{errors.port}</p>}
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-4">
                                            <Button variant="outline" asChild>
                                                <Link href={route('network-switches.index', undefined, undefined, customZiggy)}>Cancel</Link>
                                            </Button>
                                            <Button type="button" variant="secondary" onClick={walkDevice} disabled={switchData.syncing}>
                                                {switchData.syncing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Walking Device...
                                                    </>
                                                ) : (
                                                    'Walk Device'
                                                )}
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                Update Switch
                                            </Button>
                                        </div>
                                    </form>
                                    <div className="mt-6">
                                        <h3 className="mb-4 text-lg font-semibold">Device Data Collection History</h3>
                                        <SyncHistoryTable networkSwitchId={switchData.id} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="macs">
                            <Card>
                                <CardHeader>
                                    <CardTitle>MAC Addresses</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MacAddressTable macAddresses={macAddresses ?? []} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="interfaces">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Interfaces</CardTitle>
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
                                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                        No interfaces found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                (switchData.interfaces ?? []).map((iface: any) => (
                                                    <TableRow key={iface.id}>
                                                        <TableCell>{iface.interface}</TableCell>
                                                        <TableCell>{iface.description ?? '-'}</TableCell>
                                                        <TableCell>{iface.link_status ?? '-'}</TableCell>
                                                        <TableCell>{iface.vlan_id ?? '-'}</TableCell>
                                                        <TableCell>{iface.mac_address ?? '-'}</TableCell>
                                                        <TableCell>{iface.ip_address ?? '-'}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
