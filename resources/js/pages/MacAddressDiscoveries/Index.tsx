import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    FuturisticTable,
    FuturisticTableBody,
    FuturisticTableCell,
    FuturisticTableHead,
    FuturisticTableHeader,
    FuturisticTableRow,
} from '@/components/ui/futuristic-table';
import {
    Search,
    Filter,
    Clock,
    Network,
    Database,
    Copy,
    X,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { format } from 'date-fns';

interface MacAddress {
    id: number;
    mac_address: string;
}

interface NetworkSwitch {
    id: number;
    host: string;
    hostname: string | null;
    site?: {
        id: number;
        name: string;
        code: string | null;
    } | null;
}

interface NetworkInterface {
    id: number;
    interface: string;
    interface_short: string | null;
    network_switch?: NetworkSwitch;
}

interface DeviceSyncHistory {
    id: number;
    result: string;
    completed_at: string | null;
}

interface MacAddressDiscovery {
    id: number;
    discovered_at: string;
    vlan_id: string | null;
    type: string | null;
    age: string | null;
    secure: string | null;
    ntfy: string | null;
    ports: string | null;
    manufacturer: string | null;
    mac_address: MacAddress;
    network_switch: NetworkSwitch;
    network_interface: NetworkInterface | null;
    device_sync_history: DeviceSyncHistory;
}

interface Props extends PageProps {
    discoveries: {
        data: MacAddressDiscovery[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    switches: NetworkSwitch[];
    interfaces: NetworkInterface[];
    filters: {
        mac_address?: string;
        network_switch_id?: string;
        network_interface_id?: string;
        date_from?: string;
        date_to?: string;
        hide_port_channels?: string;
    };
}

export default function Index({ discoveries, switches, interfaces, filters }: Props) {
    // Initialize hidePortChannels from filters, defaulting to true
    const hidePortChannelsFromFilter = filters.hide_port_channels !== undefined 
        ? filters.hide_port_channels === '1' || filters.hide_port_channels === 'true'
        : true;
    const [hidePortChannels, setHidePortChannels] = useState(hidePortChannelsFromFilter);
    
    const { data, setData, get, processing } = useForm({
        mac_address: filters.mac_address || '',
        network_switch_id: filters.network_switch_id || '',
        network_interface_id: filters.network_interface_id || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        hide_port_channels: hidePortChannelsFromFilter,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Update form data with current hidePortChannels state
        setData('hide_port_channels', hidePortChannels);
        get(route('mac-address-discoveries.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClear = () => {
        setData({
            mac_address: '',
            network_switch_id: '',
            network_interface_id: '',
            date_from: '',
            date_to: '',
            hide_port_channels: true, // Keep hidePortChannels enabled by default
        });
        setHidePortChannels(true);
        router.get(route('mac-address-discoveries.index'), { hide_port_channels: '1' });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const hasActiveFilters = useMemo(() => {
        return !!(
            data.mac_address ||
            data.network_switch_id ||
            data.network_interface_id ||
            data.date_from ||
            data.date_to
        );
    }, [data]);

    // Update form data when hidePortChannels changes and trigger search
    const handlePortChannelToggle = (checked: boolean) => {
        setHidePortChannels(checked);
        setData('hide_port_channels', checked);
        // Automatically trigger search when toggle changes
        router.get(route('mac-address-discoveries.index'), {
            ...data,
            hide_port_channels: checked ? '1' : '0',
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="MAC Address Discovery History" />

            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-4">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-mono">MAC Address Discovery History</h1>
                        <p className="text-muted-foreground">Search and view historical MAC address discoveries</p>
                    </div>
                </div>

                {/* Search/Filter Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Search & Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* MAC Address Search */}
                                <div className="space-y-2">
                                    <Label htmlFor="mac_address">MAC Address</Label>
                                    <Input
                                        id="mac_address"
                                        placeholder="e.g., aa:bb:cc:dd:ee:ff"
                                        value={data.mac_address}
                                        onChange={(e) => setData('mac_address', e.target.value)}
                                        className="font-mono"
                                    />
                                </div>

                                {/* Network Switch Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="network_switch_id">Network Switch</Label>
                                    <Select
                                        value={data.network_switch_id || 'all'}
                                        onValueChange={(value) => setData('network_switch_id', value === 'all' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All switches" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All switches</SelectItem>
                                            {switches.map((switch_) => (
                                                <SelectItem key={switch_.id} value={String(switch_.id)}>
                                                    {switch_.hostname || switch_.host}
                                                    {switch_.site && ` (${switch_.site.name})`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Network Interface Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="network_interface_id">Interface</Label>
                                    <Select
                                        value={data.network_interface_id || 'all'}
                                        onValueChange={(value) => setData('network_interface_id', value === 'all' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All interfaces" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All interfaces</SelectItem>
                                            {interfaces.map((iface) => (
                                                <SelectItem key={iface.id} value={String(iface.id)}>
                                                    {iface.interface}
                                                    {iface.network_switch && ` - ${iface.network_switch.hostname || iface.network_switch.host}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date From */}
                                <div className="space-y-2">
                                    <Label htmlFor="date_from">Date From</Label>
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={data.date_from}
                                        onChange={(e) => setData('date_from', e.target.value)}
                                    />
                                </div>

                                {/* Date To */}
                                <div className="space-y-2">
                                    <Label htmlFor="date_to">Date To</Label>
                                    <Input
                                        id="date_to"
                                        type="date"
                                        value={data.date_to}
                                        onChange={(e) => setData('date_to', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Hide Port Channels Toggle */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="hide_port_channels"
                                    checked={hidePortChannels}
                                    onCheckedChange={(checked) => handlePortChannelToggle(checked === true)}
                                />
                                <Label
                                    htmlFor="hide_port_channels"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    Hide Port Channels
                                </Label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <Button type="submit" disabled={processing}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                                {hasActiveFilters && (
                                    <Button type="button" variant="outline" onClick={handleClear}>
                                        <X className="mr-2 h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Results Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Discovery Results
                            {discoveries.data.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {discoveries.data.length} {discoveries.data.length === 1 ? 'discovery' : 'discoveries'}
                                    {hidePortChannels && discoveries.total !== discoveries.data.length && (
                                        <span className="ml-1 text-xs opacity-75">
                                            (filtered from {discoveries.total})
                                        </span>
                                    )}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {discoveries.data.length === 0 ? (
                            <div className="text-center py-12">
                                <Database className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                <p className="text-muted-foreground">No discoveries found.</p>
                                {hasActiveFilters && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Try adjusting your search filters.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="rounded-lg border">
                                    <FuturisticTable>
                                        <FuturisticTableHeader>
                                            <FuturisticTableRow>
                                                <FuturisticTableHead>MAC Address</FuturisticTableHead>
                                                <FuturisticTableHead>Switch</FuturisticTableHead>
                                                <FuturisticTableHead>Interface</FuturisticTableHead>
                                                <FuturisticTableHead>Port</FuturisticTableHead>
                                                <FuturisticTableHead>VLAN</FuturisticTableHead>
                                                <FuturisticTableHead>Type</FuturisticTableHead>
                                                <FuturisticTableHead>Manufacturer</FuturisticTableHead>
                                                <FuturisticTableHead>Discovered At</FuturisticTableHead>
                                            </FuturisticTableRow>
                                        </FuturisticTableHeader>
                                        <FuturisticTableBody>
                                            {discoveries.data.map((discovery) => (
                                                <FuturisticTableRow key={discovery.id}>
                                                    <FuturisticTableCell className="font-mono text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span>{discovery.mac_address.mac_address}</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => copyToClipboard(discovery.mac_address.mac_address)}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </FuturisticTableCell>
                                                    <FuturisticTableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {discovery.network_switch.hostname || discovery.network_switch.host}
                                                            </span>
                                                            {discovery.network_switch.site && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {discovery.network_switch.site.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </FuturisticTableCell>
                                                    <FuturisticTableCell className="font-mono text-sm">
                                                        {discovery.network_interface?.interface || '-'}
                                                    </FuturisticTableCell>
                                                    <FuturisticTableCell className="font-mono text-sm">
                                                        {discovery.ports || '-'}
                                                    </FuturisticTableCell>
                                                    <FuturisticTableCell className="font-mono text-sm">
                                                        {discovery.vlan_id || '-'}
                                                    </FuturisticTableCell>
                                                    <FuturisticTableCell>
                                                        {discovery.type && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {discovery.type}
                                                            </Badge>
                                                        )}
                                                        {!discovery.type && '-'}
                                                    </FuturisticTableCell>
                                                    <FuturisticTableCell>
                                                        {discovery.manufacturer || '-'}
                                                    </FuturisticTableCell>
                                                    <FuturisticTableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">
                                                                {format(new Date(discovery.discovered_at), 'MMM d, yyyy HH:mm:ss')}
                                                            </span>
                                                        </div>
                                                    </FuturisticTableCell>
                                                </FuturisticTableRow>
                                            ))}
                                        </FuturisticTableBody>
                                    </FuturisticTable>
                                </div>

                                {/* Pagination */}
                                {discoveries.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {((discoveries.current_page - 1) * discoveries.per_page) + 1} to{' '}
                                            {Math.min(discoveries.current_page * discoveries.per_page, discoveries.total)} of{' '}
                                            {discoveries.total} results
                                            {hidePortChannels && discoveries.data.length < discoveries.total && (
                                                <span className="ml-1">
                                                    ({discoveries.data.length} shown after filtering)
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {discoveries.links.map((link, index) => {
                                                if (link.url === null) {
                                                    return (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 text-sm text-muted-foreground"
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    );
                                                }

                                                const isActive = link.active;
                                                return (
                                                    <Button
                                                        key={index}
                                                        variant={isActive ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => {
                                                            router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                                                        }}
                                                        disabled={isActive}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

