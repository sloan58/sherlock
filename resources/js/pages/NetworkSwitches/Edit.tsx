import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
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
import { HelpCircle } from 'lucide-react';
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

export default function Edit({ switch: networkSwitch, macAddresses, ...props }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        host: networkSwitch.host,
        username: networkSwitch.username,
        password: networkSwitch.password,
        device_type: networkSwitch.device_type,
        port: networkSwitch.port,
    });

    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('network-switches.update', networkSwitch.id));
    };

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Edit Network Switch" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Tabs defaultValue="device" className="w-full">
                        <TabsList>
                            <TabsTrigger
                                value="device"
                            >
                                Device Details
                            </TabsTrigger>
                            <TabsTrigger
                                value="macs"
                            >
                                MAC Addresses
                            </TabsTrigger>
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
                                                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
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
                                                    onChange={(e) =>
                                                        setData('host', e.target.value)
                                                    }
                                                    required
                                                />
                                                {errors.host && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.host}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="username">Username</Label>
                                                <Input
                                                    id="username"
                                                    type="text"
                                                    value={data.username}
                                                    onChange={(e) =>
                                                        setData('username', e.target.value)
                                                    }
                                                    required
                                                />
                                                {errors.username && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.username}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password">Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={data.password}
                                                    onChange={(e) =>
                                                        setData('password', e.target.value)
                                                    }
                                                    required
                                                />
                                                {errors.password && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.password}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="device_type">
                                                    Device Type
                                                </Label>
                                                <Select
                                                    value={data.device_type}
                                                    onValueChange={(value: keyof typeof deviceTypes) =>
                                                        setData('device_type', value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select device type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(deviceTypes).map(
                                                            ([value, label]) => (
                                                                <SelectItem
                                                                    key={value}
                                                                    value={value}
                                                                >
                                                                    {label}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {errors.device_type && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.device_type}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="port">Port</Label>
                                                <Input
                                                    id="port"
                                                    type="number"
                                                    value={data.port}
                                                    onChange={(e) =>
                                                        setData('port', e.target.value)
                                                    }
                                                />
                                                {errors.port && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.port}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-4">
                                            <Button
                                                variant="outline"
                                                asChild
                                            >
                                                <Link href={route('network-switches.index')}>
                                                    Cancel
                                                </Link>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => {
                                                    router.post(route('network-switches.walk', networkSwitch.id), { replace: true });
                                                }}
                                            >
                                                Walk Device
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                Update Switch
                                            </Button>
                                        </div>
                                    </form>
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
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
