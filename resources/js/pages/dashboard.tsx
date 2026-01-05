import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import React, { useMemo } from 'react';
import { ChartContainer } from '@/components/ui/chart/ChartContainer';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart/ChartTooltip';
import { Server, Network, Database, Activity, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    FuturisticTable,
    FuturisticTableHeader,
    FuturisticTableBody,
    FuturisticTableRow,
    FuturisticTableHead,
    FuturisticTableCell
} from '@/components/ui/futuristic-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Color palette
const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
    'var(--chart-6)',
    'var(--chart-7)',
    'var(--chart-8)',
];

interface DashboardProps {
    totalDevices: number;
    totalInterfaces: number;
    totalMacs: number;
    totalDiscoveries: number;
    recentDiscoveries: number;
    macsByManufacturer: Array<{ manufacturer: string; count: number }>;
    devicesByType: Array<{ device_type: string; count: number }>;
    syncStatuses: Record<string, number>;
    syncActivity: Array<{ date: string; total: number; completed: number; failed: number; in_progress: number }>;
    recentSyncs: Array<{
        id: number;
        result: string;
        error_message: string | null;
        completed_at: string | null;
        created_at: string;
        network_switch: {
            id: number;
            host: string;
            hostname: string;
            site?: { name: string } | null;
        };
    }>;
    topSwitchesByMacs: Array<{
        id: number;
        host: string;
        hostname: string;
        device_type: string;
        mac_addresses_count: number;
    }>;
}

export default function Dashboard() {
    // @ts-ignore
    const props = usePage().props as DashboardProps;
    const {
        totalDevices,
        totalInterfaces,
        totalMacs,
        totalDiscoveries,
        recentDiscoveries,
        macsByManufacturer = [],
        devicesByType = [],
        syncStatuses = {},
        syncActivity = [],
        recentSyncs = [],
        topSwitchesByMacs = [],
    } = props;

    // Format sync activity data for chart
    const formattedSyncActivity = useMemo(() => {
        return syncActivity.map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            completed: item.completed || 0,
            failed: item.failed || 0,
            in_progress: item.in_progress || 0,
        }));
    }, [syncActivity]);

    // Format manufacturers for pie chart
    const topManufacturers = useMemo(() => {
        if (!macsByManufacturer || macsByManufacturer.length === 0) {
            return [];
        }
        const sorted = [...macsByManufacturer].sort((a, b) => b.count - a.count);
        const top = sorted.slice(0, 6);
        const rest = sorted.slice(6);
    if (rest.length > 0) {
        const otherCount = rest.reduce((sum, item) => sum + item.count, 0);
        top.push({ manufacturer: 'Other', count: otherCount });
    }
    return top.map((item, idx) => ({
        ...item,
        fill: COLORS[idx % COLORS.length],
    }));
    }, [macsByManufacturer]);

    // Format device types for bar chart
    const formattedDeviceTypes = useMemo(() => {
        return devicesByType.map((item, idx) => ({
            type: item.device_type || 'Unknown',
            count: item.count,
            fill: COLORS[idx % COLORS.length],
        }));
    }, [devicesByType]);

    // Sync activity chart config
    const syncActivityChartConfig = {
        completed: { label: 'Completed', color: 'var(--chart-1)' },
        failed: { label: 'Failed', color: 'var(--chart-2)' },
        in_progress: { label: 'In Progress', color: 'var(--chart-3)' },
    };

    // Manufacturer pie chart config
    const manufacturerChartConfig = useMemo(() => {
        const config: Record<string, { label: string; color: string }> = {};
        topManufacturers.forEach((item, idx) => {
            config[item.manufacturer] = {
                label: item.manufacturer,
                color: COLORS[idx % COLORS.length],
            };
        });
        return config;
    }, [topManufacturers]);

    const getSyncStatusBadge = (result: string) => {
        switch (result) {
            case 'completed':
                return <Badge variant="default" className="bg-green-600">Completed</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            case 'in_progress':
                return <Badge variant="secondary">In Progress</Badge>;
            default:
                return <Badge variant="outline">{result}</Badge>;
        }
    };

    const completedSyncs = syncStatuses.completed || 0;
    const failedSyncs = syncStatuses.failed || 0;
    const inProgressSyncs = syncStatuses.in_progress || 0;
    const totalSyncs = completedSyncs + failedSyncs + inProgressSyncs;
    const successRate = totalSyncs > 0 ? ((completedSyncs / totalSyncs) * 100).toFixed(1) : '0';

    // @ts-ignore
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-4">
                {/* Header */}
                <div>
                    <h1 className="font-mono text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Monitor your network infrastructure</p>
                </div>

                {/* Stat Cards Row */}
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="font-mono text-sm font-medium">Network Switches</CardTitle>
                            <Server className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalDevices}</div>
                            <p className="text-muted-foreground mt-1 text-xs">{devicesByType.length} different device types</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="font-mono text-sm font-medium">Interfaces</CardTitle>
                            <Network className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalInterfaces}</div>
                            <p className="text-muted-foreground mt-1 text-xs">Across all switches</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="font-mono text-sm font-medium">MAC Addresses</CardTitle>
                            <Database className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalMacs}</div>
                            <p className="text-muted-foreground mt-1 text-xs">{recentDiscoveries} discovered in last 7 days</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="font-mono text-sm font-medium">Total Discoveries</CardTitle>
                            <Activity className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalDiscoveries}</div>
                            <p className="text-muted-foreground mt-1 text-xs">Historical MAC discoveries</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sync Status Cards */}
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="font-mono text-sm font-medium">Sync Success Rate</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{successRate}%</div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {completedSyncs} of {totalSyncs} successful
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="font-mono text-sm font-medium">Completed</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{completedSyncs}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="font-mono text-sm font-medium">Failed</CardTitle>
                            <XCircle className="text-destructive h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-destructive text-2xl font-bold">{failedSyncs}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="font-mono text-sm font-medium">In Progress</CardTitle>
                            <Clock className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inProgressSyncs}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
                    {/* Sync Activity Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sync Activity (Last 30 Days)</CardTitle>
                            <CardDescription>Device synchronization activity over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {formattedSyncActivity.length > 0 ? (
                                <ChartContainer config={syncActivityChartConfig}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={formattedSyncActivity} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                            <defs>
                                                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="inProgressGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                            <Tooltip content={ChartTooltipContent} />
                                            <Area
                                                type="monotone"
                                                dataKey="completed"
                                                stackId="1"
                                                stroke="var(--chart-1)"
                                                fill="url(#completedGradient)"
                                                strokeWidth={2}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="failed"
                                                stackId="1"
                                                stroke="var(--chart-2)"
                                                fill="url(#failedGradient)"
                                                strokeWidth={2}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="in_progress"
                                                stackId="1"
                                                stroke="var(--chart-3)"
                                                fill="url(#inProgressGradient)"
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            ) : (
                                <div className="text-muted-foreground flex h-[300px] items-center justify-center">
                                    No sync activity data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Device Types Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Device Types</CardTitle>
                            <CardDescription>Distribution of network switches by type</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {formattedDeviceTypes.length > 0 ? (
                                <ChartContainer config={{}}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={formattedDeviceTypes} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                            <XAxis
                                                dataKey="type"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                            <Tooltip content={ChartTooltipContent} />
                                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                                {formattedDeviceTypes.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            ) : (
                                <div className="text-muted-foreground flex h-[300px] items-center justify-center">No device type data available</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Manufacturers and Top Switches Row */}
                <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
                    {/* Manufacturers Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Manufacturers</CardTitle>
                            <CardDescription>MAC addresses by manufacturer</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topManufacturers.length > 0 ? (
                                <ChartContainer config={manufacturerChartConfig}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={topManufacturers}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ manufacturer, percent }) => `${manufacturer}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="count"
                                            >
                                                {topManufacturers.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={ChartTooltipContent} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            ) : (
                                <div className="text-muted-foreground flex h-[300px] items-center justify-center">No manufacturer data available</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Switches by MAC Count */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Switches by MAC Count</CardTitle>
                            <CardDescription>Switches with the most discovered MAC addresses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topSwitchesByMacs.length > 0 ? (
                                <div className="space-y-4">
                                    {topSwitchesByMacs.map((switch_, index) => (
                                        <div key={switch_.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <Link
                                                        // @ts-ignore
                                                        href={route('network-switches.edit', { network_switch: switch_.id })}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {switch_.hostname || switch_.host}
                                                    </Link>
                                                    <p className="text-muted-foreground text-sm">{switch_.device_type}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold">{switch_.mac_addresses_count}</div>
                                                <p className="text-muted-foreground text-xs">MAC addresses</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-muted-foreground flex h-[300px] items-center justify-center">No switch data available</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Syncs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Sync History</CardTitle>
                        <CardDescription>Latest device synchronization attempts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentSyncs.length > 0 ? (
                            <FuturisticTable>
                                <FuturisticTableHeader>
                                    <FuturisticTableRow>
                                        <FuturisticTableHead className="font-mono text-sm font-medium">Switch</FuturisticTableHead>
                                        <FuturisticTableHead className="font-mono text-sm">Site</FuturisticTableHead>
                                        <FuturisticTableHead className="font-mono text-sm">Status</FuturisticTableHead>
                                        <FuturisticTableHead className="font-mono text-sm">Completed At</FuturisticTableHead>
                                        <FuturisticTableHead className="font-mono text-sm">Error</FuturisticTableHead>
                                    </FuturisticTableRow>
                                </FuturisticTableHeader>
                                <FuturisticTableBody>
                                    {recentSyncs.map((sync) => (
                                        <FuturisticTableRow key={sync.id}>
                                            <FuturisticTableCell className="font-mono text-sm">
                                                <Link
                                                    // @ts-ignore
                                                    href={route('network-switches.edit', { network_switch: sync.network_switch.id })}
                                                    className="text-primary hover:underline"
                                                >
                                                    {sync.network_switch.hostname || sync.network_switch.host}
                                                </Link>
                                            </FuturisticTableCell>
                                            <FuturisticTableCell className="font-mono text-sm">
                                                {sync.network_switch.site?.name || 'N/A'}
                                            </FuturisticTableCell>
                                            <FuturisticTableCell>{getSyncStatusBadge(sync.result)}</FuturisticTableCell>
                                            <FuturisticTableCell className="font-mono text-sm">
                                                {sync.completed_at ? new Date(sync.completed_at).toLocaleString() : 'N/A'}
                                            </FuturisticTableCell>
                                            <FuturisticTableCell className="text-destructive max-w-xs truncate font-mono text-sm">
                                                {sync.error_message || '-'}
                                            </FuturisticTableCell>
                                        </FuturisticTableRow>
                                    ))}
                                </FuturisticTableBody>
                            </FuturisticTable>
                        ) : (
                            <div className="text-muted-foreground flex h-[200px] items-center justify-center">No sync history available</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
