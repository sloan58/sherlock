import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import React from 'react';
import { ChartContainer } from '@/components/ui/chart/ChartContainer';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart/ChartTooltip';
import { TrendingUp } from 'lucide-react';
import { ChartLegend, ChartLegendContent } from '@/components/ui/chart/ChartLegend';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
    'var(--chart-6)',
    'var(--chart-7)',
    'var(--chart-8)',
    'var(--chart-9)',
    'var(--chart-10)',
];

function getTopManufacturers(data: any[], topN = 8) {
    if (!data) return [];
    const sorted = [...data].sort((a, b) => b.count - a.count);
    const top = sorted.slice(0, topN);
    const rest = sorted.slice(topN);
    if (rest.length > 0) {
        const otherCount = rest.reduce((sum, item) => sum + item.count, 0);
        top.push({ manufacturer: 'Other', count: otherCount });
    }
    return top;
}

export default function Dashboard() {
    const { totalDevices, totalInterfaces, totalMacs, macsByManufacturer, interfacesPerDevice } = usePage().props as any;
    const topManufacturers = getTopManufacturers(macsByManufacturer, 8).map((item, idx) => ({
        ...item,
        fill: COLORS[idx % COLORS.length] || "#8884d8",
    }));

    // Bar chart config
    const barChartConfig = {
        interfaces_count: {
            label: 'Interfaces',
            color: 'var(--chart-1)',
        },
    };

    // Limit to top 5 devices by interfaces_count
    const topDevices = [...interfacesPerDevice]
        .sort((a, b) => b.interfaces_count - a.interfaces_count)
        .slice(0, 5);

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
                {/* Stat Cards Row */}
                <div className="grid gap-6 md:grid-cols-3 sm:grid-cols-1">
                    <Card>
                        <CardHeader><CardTitle>Total Devices</CardTitle></CardHeader>
                        <CardContent><div className="text-3xl font-bold">{totalDevices}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Total Interfaces</CardTitle></CardHeader>
                        <CardContent><div className="text-3xl font-bold">{totalInterfaces}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Total MAC Addresses</CardTitle></CardHeader>
                        <CardContent><div className="text-3xl font-bold">{totalMacs}</div></CardContent>
                    </Card>
                </div>
                {/* Charts Row */}
                <div className="grid gap-8 md:grid-cols-2 sm:grid-cols-1">
                    {/* Pie/Donut Chart with Legend */}
                    <Card>
                        <CardHeader className="items-center pb-0">
                            <CardTitle>MACs by Manufacturer</CardTitle>
                            <CardDescription>Top 8 manufacturers by MAC count</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center pb-0">
                            <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[300px]">
                                <PieChart width={250} height={250}>
                                    <Tooltip />
                                    <Pie
                                        data={topManufacturers}
                                        dataKey="count"
                                        nameKey="manufacturer"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        fill="var(--chart-1)"
                                        label={false}
                                        stroke="0"
                                    >
                                        {topManufacturers.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                                <ChartLegend
                                    content={<ChartLegendContent data={topManufacturers} nameKey="manufacturer" />}
                                    className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                                />
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    {/* Bar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Interfaces per Device</CardTitle>
                            <CardDescription>Number of interfaces for each device</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={barChartConfig}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={topDevices} margin={{ left: 10, right: 10, top: 10, bottom: 40 }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <XAxis dataKey="hostname" angle={-30} textAnchor="end" interval={0} height={60} tickLine={false} tickMargin={10} axisLine={false} />
                                        <Tooltip content={ChartTooltipContent} cursor={false} />
                                        <Bar dataKey="interfaces_count" fill="var(--chart-1)" radius={8} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 text-sm">
                            <div className="text-muted-foreground leading-none">
                                Showing total interfaces for the top 5 devices.
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
