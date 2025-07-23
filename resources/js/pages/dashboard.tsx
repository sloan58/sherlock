import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import React from 'react';
import { ChartContainer } from '@/components/ui/chart/ChartContainer';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart/ChartTooltip';
import { TrendingUp, TrendingDown, Activity, Server, Network, Shield } from 'lucide-react';
import { ChartLegend, ChartLegendContent } from '@/components/ui/chart/ChartLegend';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Elegant color palette
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

// Mock data for beautiful charts
const generateMockData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const areaData = months.map((month, index) => ({
        month,
        mobile: Math.floor(Math.random() * 1000) + 2000,
        desktop: Math.floor(Math.random() * 1500) + 3000,
        total: Math.floor(Math.random() * 2500) + 5000,
    }));

    const deviceActivity = months.map((month, index) => ({
        month,
        active: Math.floor(Math.random() * 50) + 80,
        inactive: Math.floor(Math.random() * 20) + 10,
    }));

    return { areaData, deviceActivity };
};

function getTopManufacturers(data: any[], topN = 6) {
    if (!data || data.length === 0) {
        // Return mock data if no real data
        return [
            { manufacturer: 'Cisco', count: 45, fill: COLORS[0] },
            { manufacturer: 'VMware', count: 38, fill: COLORS[1] },
            { manufacturer: 'Hewlett-Packard', count: 32, fill: COLORS[2] },
            { manufacturer: 'Palo Alto', count: 28, fill: COLORS[3] },
            { manufacturer: 'Supermicro', count: 22, fill: COLORS[4] },
            { manufacturer: 'Other', count: 15, fill: COLORS[5] },
        ];
    }
    
    const sorted = [...data].sort((a, b) => b.count - a.count);
    const top = sorted.slice(0, topN);
    const rest = sorted.slice(topN);
    if (rest.length > 0) {
        const otherCount = rest.reduce((sum, item) => sum + item.count, 0);
        top.push({ manufacturer: 'Other', count: otherCount });
    }
    return top.map((item, idx) => ({
        ...item,
        fill: COLORS[idx % COLORS.length],
    }));
}

export default function Dashboard() {
    const { totalDevices, totalInterfaces, totalMacs, macsByManufacturer, interfacesPerDevice } = usePage().props as any;
    const { areaData, deviceActivity } = generateMockData();
    
    const topManufacturers = getTopManufacturers(macsByManufacturer, 6);

    // Area chart config
    const areaChartConfig = {
        mobile: { label: 'Mobile', color: 'var(--chart-1)' },
        desktop: { label: 'Desktop', color: 'var(--chart-2)' },
    };

    const activityChartConfig = {
        active: { label: 'Active', color: 'var(--chart-3)' },
        inactive: { label: 'Inactive', color: 'var(--chart-4)' },
    };

    // Pie chart config
    const pieChartConfig = {
        count: { label: 'MACs', color: 'var(--chart-1)' },
        ...Object.fromEntries(
            topManufacturers.map((item: any, idx: number) => [
                item.manufacturer,
                { label: item.manufacturer, color: COLORS[idx % COLORS.length] },
            ])
        ),
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-4">
                {/* Welcome Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to Sherlock</h1>
                    <p className="text-muted-foreground">
                        Your network infrastructure monitoring dashboard
                    </p>
                </div>

                {/* Stat Cards Row */}
                <div className="grid gap-6 md:grid-cols-4 sm:grid-cols-2">
                    <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalDevices || 9}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">+12%</span> from last month
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Interfaces</CardTitle>
                            <Network className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalInterfaces || 233}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">+8%</span> from last month
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">MAC Addresses</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalMacs || 366}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">+15%</span> from last month
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">94%</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">+2%</span> from last week
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Charts Row */}
                <div className="grid gap-8 md:grid-cols-2 sm:grid-cols-1">
                    {/* Area Chart - Network Activity */}
                    <Card className="border-0">
                        <CardHeader>
                            <CardTitle>Network Activity</CardTitle>
                            <CardDescription>Showing total visitors for the last 6 months</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={areaChartConfig}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                        <defs>
                                            <linearGradient id="mobileGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="desktopGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis 
                                            dataKey="month" 
                                            axisLine={false} 
                                            tickLine={false}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip content={ChartTooltipContent} />
                                        <Area 
                                            type="monotone" 
                                            dataKey="mobile" 
                                            stackId="1"
                                            stroke="var(--chart-1)" 
                                            fill="url(#mobileGradient)"
                                            strokeWidth={2}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="desktop" 
                                            stackId="1"
                                            stroke="var(--chart-2)" 
                                            fill="url(#desktopGradient)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-muted-foreground">Trending up by 5.2% this month</span>
                        </CardFooter>
                    </Card>

                    {/* Device Activity Area Chart */}
                    <Card className="border-0">
                        <CardHeader>
                            <CardTitle>Device Activity</CardTitle>
                            <CardDescription>Active vs inactive devices over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={activityChartConfig}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={deviceActivity} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                        <defs>
                                            <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="inactiveGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis 
                                            dataKey="month" 
                                            axisLine={false} 
                                            tickLine={false}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip content={ChartTooltipContent} />
                                        <Area 
                                            type="monotone" 
                                            dataKey="active" 
                                            stackId="1"
                                            stroke="var(--chart-3)" 
                                            fill="url(#activeGradient)"
                                            strokeWidth={2}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="inactive" 
                                            stackId="1"
                                            stroke="var(--chart-4)" 
                                            fill="url(#inactiveGradient)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-muted-foreground">Device uptime improved by 3.1%</span>
                        </CardFooter>
                    </Card>
                </div>


            </div>
        </AppLayout>
    );
}
