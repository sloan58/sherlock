import { useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    ChevronDown, 
    Database, 
    Network, 
    Shield, 
    Clock,
    Copy,
    ExternalLink,
    Info
} from 'lucide-react';
import { DeviceStatusIndicator } from '@/components/ui/status-indicator';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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

interface EnhancedMacAddressTableProps {
    macAddresses: MacAddress[];
    allMacAddresses?: MacAddress[];
    totalMacAddressesCount?: number;
    visibleMacAddressesCount?: number;
    className?: string;
}

export function EnhancedMacAddressTable({ macAddresses, allMacAddresses, totalMacAddressesCount, visibleMacAddressesCount, className }: EnhancedMacAddressTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'dynamic' | 'static' | 'secure'>('all');
    const [vlanFilter, setVlanFilter] = useState<string>('');
    const [showTrunkAddresses, setShowTrunkAddresses] = useState(false);
    
    // Check if there are trunk addresses to show (for toggle visibility)
    const hasTrunkAddresses = useMemo(() => {
        // If we have counts, use them for comparison
        if (totalMacAddressesCount !== undefined && visibleMacAddressesCount !== undefined) {
            return totalMacAddressesCount > visibleMacAddressesCount;
        }
        // Otherwise check array lengths
        if (!allMacAddresses || allMacAddresses.length === 0) return false;
        return allMacAddresses.length > macAddresses.length;
    }, [macAddresses, allMacAddresses, totalMacAddressesCount, visibleMacAddressesCount]);
    
    // Use allMacAddresses when toggle is on, otherwise use filtered macAddresses
    const displayMacAddresses = useMemo(() => {
        return showTrunkAddresses && allMacAddresses ? allMacAddresses : macAddresses;
    }, [showTrunkAddresses, allMacAddresses, macAddresses]);
    
    const [visibleColumns, setVisibleColumns] = useState({
        mac: true,
        ports: true,
        portMode: true,
        vlan: true,
        type: true,
        manufacturer: true,
        deviceType: true,
        vlanSegment: true,
        cdpInfo: true,
        age: true,
        secure: true,
        comment: true
    });

    const getDeviceType = useCallback((mac: MacAddress): string => {
        const manufacturer = mac.pivot?.manufacturer;
        if (!manufacturer) return '-';
        
        const manufacturerUpper = manufacturer.toUpperCase();
        
        // Check for Cisco - use CDP neighbor data if available
        if (manufacturerUpper.includes('CISCO')) {
            const cdpData = mac.interface;
            if (cdpData && cdpData.neighbor_platform) {
                // Return the neighbor platform when CDP information is available
                return cdpData.neighbor_platform;
            }
            // If Cisco but no CDP data, return generic
            return 'Network Device';
        }
        
        // Non-Cisco manufacturers
        if (manufacturerUpper.includes('PALOALTO')) {
            return 'FireWall';
        }
        if (manufacturerUpper.includes('VMWARE')) {
            return 'Server';
        }
        if (manufacturerUpper.includes('HEWLETTP')) {
            return 'Printer';
        }
        
        return '-';
    }, []);

    const filteredMacAddresses = useMemo(() => {
        let filtered = displayMacAddresses;

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(mac => 
                mac.mac_address.toLowerCase().includes(searchLower) ||
                mac.pivot?.ports?.toLowerCase().includes(searchLower) ||
                mac.pivot?.vlan_id?.toLowerCase().includes(searchLower) ||
                mac.pivot?.manufacturer?.toLowerCase().includes(searchLower) ||
                getDeviceType(mac).toLowerCase().includes(searchLower) ||
                mac.pivot?.comment?.toLowerCase().includes(searchLower)
            );
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(mac => mac.pivot?.type === typeFilter);
        }

        // VLAN filter
        if (vlanFilter) {
            filtered = filtered.filter(mac => mac.pivot?.vlan_id === vlanFilter);
        }

        return filtered;
    }, [displayMacAddresses, searchTerm, typeFilter, vlanFilter, getDeviceType]);

    const uniqueVlans = useMemo(() => {
        const vlans = new Set(displayMacAddresses.map(mac => mac.pivot?.vlan_id).filter((vlan): vlan is string => Boolean(vlan)));
        return Array.from(vlans).sort();
    }, [displayMacAddresses]);

    const getTypeBadge = (type?: string) => {
        if (!type) return <Badge variant="outline">Unknown</Badge>;
        
        const typeConfig = {
            dynamic: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: Clock },
            static: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: Shield },
            secure: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', icon: Shield }
        };

        const config = typeConfig[type as keyof typeof typeConfig] || { color: 'bg-gray-100 text-gray-800', icon: Network };
        const Icon = config.icon;

        return (
            <Badge variant="secondary" className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {type}
            </Badge>
        );
    };

    const getSecureBadge = (secure?: string) => {
        if (!secure) return null;
        
        return (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                <Shield className="w-3 h-3 mr-1" />
                Secure
            </Badge>
        );
    };

    const getVlanSegment = (manufacturer?: string): string => {
        if (!manufacturer) return '-';
        
        const manufacturerUpper = manufacturer.toUpperCase();
        
        if (manufacturerUpper.includes('CISCO')) {
            return '100';
        }
        if (manufacturerUpper.includes('PALOALTO')) {
            return '200';
        }
        if (manufacturerUpper.includes('HEWLETTP')) {
            return '300';
        }
        
        return '-';
    };

    const hasCdpInfo = (mac: MacAddress): boolean => {
        const cdpData = mac.interface;
        return !!(
            cdpData &&
            (cdpData.neighbor_chassis_id ||
                cdpData.neighbor_name ||
                cdpData.neighbor_mgmt_address ||
                cdpData.neighbor_platform ||
                cdpData.neighbor_interface ||
                cdpData.neighbor_description ||
                cdpData.neighbor_interface_ip ||
                cdpData.neighbor_capabilities)
        );
    };

    const renderCdpInfo = (mac: MacAddress) => {
        if (!hasCdpInfo(mac)) {
            return <span className="text-muted-foreground">-</span>;
        }

        const cdpData = mac.interface!;
        const cdpFields = [
            { label: 'Chassis ID', value: cdpData.neighbor_chassis_id },
            { label: 'Name', value: cdpData.neighbor_name },
            { label: 'Platform', value: cdpData.neighbor_platform },
            { label: 'Interface', value: cdpData.neighbor_interface },
            { label: 'Description', value: cdpData.neighbor_description },
            { label: 'Management Address', value: cdpData.neighbor_mgmt_address },
            { label: 'Interface IP', value: cdpData.neighbor_interface_ip },
            { label: 'Capabilities', value: cdpData.neighbor_capabilities },
        ].filter(field => field.value);

        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-primary/10"
                    >
                        <Info className="h-4 w-4 text-primary" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                    <div className="space-y-3">
                        <div className="font-semibold text-sm">CDP Neighbor Information</div>
                        <div className="space-y-2">
                            {cdpFields.map((field, index) => (
                                <div key={index} className="text-sm">
                                    <div className="font-medium text-muted-foreground mb-0.5">
                                        {field.label}
                                    </div>
                                    <div className="font-mono text-xs break-all">
                                        {field.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        );
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 font-mono">
                        <Database className="h-5 w-5" />
                        MAC Addresses ({filteredMacAddresses.length} of {displayMacAddresses.length})
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Columns
                                <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {Object.entries(visibleColumns).map(([key, visible]) => (
                                <DropdownMenuCheckboxItem
                                    key={key}
                                    checked={visible}
                                    onCheckedChange={(checked) => 
                                        setVisibleColumns(prev => ({ ...prev, [key]: checked }))
                                    }
                                >
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Enhanced Search and Filters */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search MAC addresses, ports, VLAN, manufacturer, device type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        <div className="flex gap-2 flex-wrap items-center">
                            {/* Show Trunk Addresses Toggle */}
                            {(hasTrunkAddresses || (allMacAddresses && allMacAddresses.length > 0 && totalMacAddressesCount !== undefined && visibleMacAddressesCount !== undefined && totalMacAddressesCount > visibleMacAddressesCount)) && (
                                <div className="flex items-center gap-2 px-3 py-1.5 border rounded-md bg-background">
                                    <Checkbox
                                        id="show-trunk-addresses"
                                        checked={showTrunkAddresses}
                                        onCheckedChange={(checked) => {
                                            setShowTrunkAddresses(!!checked);
                                        }}
                                    />
                                    <Label
                                        htmlFor="show-trunk-addresses"
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        Show trunk addresses
                                    </Label>
                                </div>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Type: {typeFilter === 'all' ? 'All' : typeFilter}
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuCheckboxItem
                                        checked={typeFilter === 'all'}
                                        onCheckedChange={() => setTypeFilter('all')}
                                    >
                                        All Types
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={typeFilter === 'dynamic'}
                                        onCheckedChange={() => setTypeFilter('dynamic')}
                                    >
                                        Dynamic
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={typeFilter === 'static'}
                                        onCheckedChange={() => setTypeFilter('static')}
                                    >
                                        Static
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={typeFilter === 'secure'}
                                        onCheckedChange={() => setTypeFilter('secure')}
                                    >
                                        Secure
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        VLAN: {vlanFilter || 'All'}
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuCheckboxItem
                                        checked={!vlanFilter}
                                        onCheckedChange={() => setVlanFilter('')}
                                    >
                                        All VLANs
                                    </DropdownMenuCheckboxItem>
                                    {uniqueVlans.map(vlan => (
                                        <DropdownMenuCheckboxItem
                                            key={vlan}
                                            checked={vlanFilter === vlan}
                                            onCheckedChange={() => setVlanFilter(vlan)}
                                        >
                                            VLAN {vlan}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Enhanced Table */}
                    <div className="rounded-md border overflow-x-auto">
                                        <FuturisticTable>
                    <FuturisticTableHeader>
                        <FuturisticTableRow>
                                    {visibleColumns.mac && <FuturisticTableHead className="min-w-32">MAC Address</FuturisticTableHead>}
                                    {visibleColumns.ports && <FuturisticTableHead className="min-w-24">Ports</FuturisticTableHead>}
                                    {visibleColumns.portMode && <FuturisticTableHead className="min-w-20">Port Mode</FuturisticTableHead>}
                                    {visibleColumns.vlan && <FuturisticTableHead className="min-w-20">VLAN ID</FuturisticTableHead>}
                                    {visibleColumns.type && <FuturisticTableHead className="min-w-24">Type</FuturisticTableHead>}
                                    {visibleColumns.manufacturer && <FuturisticTableHead className="min-w-32">Manufacturer</FuturisticTableHead>}
                                    {visibleColumns.deviceType && <FuturisticTableHead className="min-w-24">Device Type</FuturisticTableHead>}
                                    {visibleColumns.vlanSegment && <FuturisticTableHead className="min-w-24">VLAN Segment</FuturisticTableHead>}
                                    {visibleColumns.cdpInfo && <FuturisticTableHead className="min-w-20">CDP Info</FuturisticTableHead>}
                                    {visibleColumns.age && <FuturisticTableHead className="min-w-20">Age</FuturisticTableHead>}
                                    {visibleColumns.secure && <FuturisticTableHead className="min-w-24">Security</FuturisticTableHead>}
                                    {visibleColumns.comment && <FuturisticTableHead className="min-w-32">Comment</FuturisticTableHead>}
                                    <FuturisticTableHead className="text-right min-w-16">Actions</FuturisticTableHead>
                                </FuturisticTableRow>
                            </FuturisticTableHeader>
                            <FuturisticTableBody>
                                {filteredMacAddresses.length === 0 ? (
                                    <FuturisticTableRow>
                                        <FuturisticTableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center text-muted-foreground py-12">
                                            <div className="flex flex-col items-center gap-3">
                                                <Database className="h-8 w-8 text-muted-foreground/50" />
                                                <div className="space-y-1">
                                                    <p className="font-medium">No MAC addresses found</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {searchTerm || typeFilter !== 'all' || vlanFilter 
                                                            ? 'Try adjusting your search or filters'
                                                            : 'No MAC addresses discovered yet'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </FuturisticTableCell>
                                    </FuturisticTableRow>
                                ) : (
                                    filteredMacAddresses.map((mac, idx) => (
                                        <FuturisticTableRow key={`${showTrunkAddresses ? 'all' : 'filtered'}-${mac.id}-${mac.pivot?.ports ?? ''}-${mac.pivot?.vlan_id ?? ''}-${idx}`} className="hover:bg-muted/50">
                                            {visibleColumns.mac && (
                                                <FuturisticTableCell className="font-mono text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate">{mac.mac_address}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(mac.mac_address)}
                                                            className="h-6 w-6 p-0 flex-shrink-0"
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </FuturisticTableCell>
                                            )}
                                            {visibleColumns.ports && (
                                                <FuturisticTableCell className="font-mono text-sm max-w-24 truncate">{mac.pivot?.ports ?? '-'}</FuturisticTableCell>
                                            )}
                                            {visibleColumns.portMode && (
                                                <FuturisticTableCell>
                                                    {mac.interface?.mode ? (
                                                        <Badge 
                                                            variant={mac.interface.mode.toLowerCase() === 'trunk' ? 'secondary' : 'outline'}
                                                            className={
                                                                mac.interface.mode.toLowerCase() === 'trunk' 
                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                            }
                                                        >
                                                            {mac.interface.mode}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </FuturisticTableCell>
                                            )}
                                            {visibleColumns.vlan && (
                                                <FuturisticTableCell className="font-mono text-sm">{mac.pivot?.vlan_id ?? '-'}</FuturisticTableCell>
                                            )}
                                            {visibleColumns.type && (
                                                <FuturisticTableCell>{getTypeBadge(mac.pivot?.type)}</FuturisticTableCell>
                                            )}
                                            {visibleColumns.manufacturer && (
                                                <FuturisticTableCell className="font-mono text-sm max-w-32 truncate">{mac.pivot?.manufacturer ?? '-'}</FuturisticTableCell>
                                            )}
                                            {visibleColumns.deviceType && (
                                                <FuturisticTableCell className="text-sm">{getDeviceType(mac)}</FuturisticTableCell>
                                            )}
                                            {visibleColumns.vlanSegment && (
                                                <FuturisticTableCell className="text-sm font-mono">{getVlanSegment(mac.pivot?.manufacturer)}</FuturisticTableCell>
                                            )}
                                            {visibleColumns.cdpInfo && (
                                                <FuturisticTableCell>
                                                    {renderCdpInfo(mac)}
                                                </FuturisticTableCell>
                                            )}
                                            {visibleColumns.age && (
                                                <FuturisticTableCell className="text-sm">{mac.pivot?.age ?? '-'}</FuturisticTableCell>
                                            )}
                                            {visibleColumns.secure && (
                                                <FuturisticTableCell>{getSecureBadge(mac.pivot?.secure)}</FuturisticTableCell>
                                            )}
                                            {visibleColumns.comment && (
                                                <FuturisticTableCell className="text-sm max-w-32 truncate">{mac.pivot?.comment ?? '-'}</FuturisticTableCell>
                                            )}
                                            <FuturisticTableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuCheckboxItem onClick={() => copyToClipboard(mac.mac_address)}>
                                                            Copy MAC Address
                                                        </DropdownMenuCheckboxItem>
                                                        <DropdownMenuCheckboxItem onClick={() => copyToClipboard(mac.pivot?.ports || '')}>
                                                            Copy Port
                                                        </DropdownMenuCheckboxItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </FuturisticTableCell>
                                        </FuturisticTableRow>
                                    ))
                                )}
                            </FuturisticTableBody>
                        </FuturisticTable>
                    </div>

                    {/* Results Summary */}
                    {filteredMacAddresses.length > 0 && (
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                                Showing {filteredMacAddresses.length} of {displayMacAddresses.length} MAC addresses
                            </span>
                            {(searchTerm || typeFilter !== 'all' || vlanFilter) && (
                                <span>
                                    Filtered by {[
                                        searchTerm && 'search',
                                        typeFilter !== 'all' && `type: ${typeFilter}`,
                                        vlanFilter && `VLAN: ${vlanFilter}`
                                    ].filter(Boolean).join(', ')}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 