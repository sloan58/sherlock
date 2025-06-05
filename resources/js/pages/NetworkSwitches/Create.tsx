import { Head, useForm } from '@inertiajs/react';
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
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';

const deviceTypes = {
    cisco_ios: 'Cisco IOS',
    cisco_nxos: 'Cisco NXOS',
} as const;

export default function Create({ ...props }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        host: '',
        username: '',
        password: '',
        device_type: 'cisco_nxos',
        port: '22',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('network-switches.store'));
    };

    return (
        <AppLayout>
            <Head title="Add Network Switch" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Network Switch</CardTitle>
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
                                            onValueChange={(value) =>
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
                                        type="submit"
                                        disabled={processing}
                                    >
                                        Add Switch
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 