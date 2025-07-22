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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Network Switches</CardTitle>
                            <Button asChild>
                                <Link href={route('network-switches.create')}>
                                    Add Switch
                                </Link>
                            </Button>
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
                                    {switches.data.map((switch_) => (
                                        <TableRow key={switch_.id}>
                                            <TableCell>{switch_.host}</TableCell>
                                            <TableCell>{switch_.hostname}</TableCell>
                                            <TableCell>{switch_.device_type}</TableCell>
                                            <TableCell>{switch_.interfaces_count}</TableCell>
                                            <TableCell>{switch_.mac_addresses_count}</TableCell>
                                            <TableCell>
                                                {switch_.last_sync_completed
                                                    ? new Date(switch_.last_sync_completed).toLocaleString()
                                                    : 'Never'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    asChild
                                                    className="mr-2"
                                                >
                                                    <Link
                                                        href={route('network-switches.edit', switch_.id)}
                                                    >
                                                        Edit
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 