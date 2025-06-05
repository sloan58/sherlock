import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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

interface Props extends PageProps {
    switch: NetworkSwitch;
}

export default function Show({ switch: networkSwitch, ...props }: Props) {
    return (
        <AppLayout>
            <Head title="Network Switch Details" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Network Switch Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label>Host</Label>
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
                                        <p className="text-sm">{networkSwitch.host}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Username</Label>
                                        <p className="text-sm">{networkSwitch.username}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <p className="text-sm">••••••••</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Device Type</Label>
                                        <p className="text-sm">
                                            {deviceTypes[networkSwitch.device_type]}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Port</Label>
                                        <p className="text-sm">{networkSwitch.port}</p>
                                    </div>

                                    {networkSwitch.hostname && (
                                        <div className="space-y-2">
                                            <Label>Hostname</Label>
                                            <p className="text-sm">{networkSwitch.hostname}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Button
                                        variant="outline"
                                        asChild
                                    >
                                        <Link href={route('network-switches.index')}>
                                            Back
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                    >
                                        <Link href={route('network-switches.edit', networkSwitch.id)}>
                                            Edit
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 