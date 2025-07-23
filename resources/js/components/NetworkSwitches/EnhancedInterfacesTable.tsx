import { useState, useMemo } from 'react';
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
    Network, 
    Wifi, 
    WifiOff,
    Copy,
    ExternalLink,
    Activity,
    Settings
} from 'lucide-react';

interface NetworkInterface {
    interface: string;
    description?: string;
    link_status?: string;
    mode?: string;
    vlan_id?: string;
    mac_address?: string;
    ip_address?: string;
    speed?: string;
    duplex?: string;
    admin_status?: string;
}

interface EnhancedInterfacesTableProps {
    interfaces: NetworkInterface[];
    className?: string;
}

export function EnhancedInterfacesTable({ interfaces, className }: EnhancedInterfacesTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'up' | 'down'>('all');
    const [modeFilter, setModeFilter] = useState<'all' | 'access' | 'trunk' | 'routed'>('all');
    const [visibleColumns, setVisibleColumns] = useState({
        interface: true,
        description: true,
        status: true,
        mode: true,
        vlan: true,
        mac: true,
        ip: true,
        speed: true,
        duplex: true
    });

    const filteredInterfaces = useMemo(() => {
        let filtered = interfaces;

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(iface => 
                iface.interface.toLowerCase().includes(searchLower) ||
                iface.description?.toLowerCase().includes(searchLower) ||
                iface.ip_address?.toLowerCase().includes(searchLower) ||
                iface.mac_address?.toLowerCase().includes(searchLower)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(iface => iface.link_status === statusFilter);
        }

        // Mode filter
        if (modeFilter !== 'all') {
            filtered = filtered.filter(iface => iface.mode === modeFilter);
        }

        return filtered;
    }, [interfaces, searchTerm, statusFilter, modeFilter]);

    const getStatusBadge = (status?: string) => {
        if (!status) return <Badge variant="outline">Unknown</Badge>;
        
        const statusConfig = {
            up: { 
                color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', 
                icon: Wifi 
            },
            down: { 
                color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
                icon: WifiOff 
            }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { 
            color: 'bg-gray-100 text-gray-800', 
            icon: Network 
        };
        const Icon = config.icon;

        return (
            <Badge variant="secondary" className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {status}
            </Badge>
        );
    };

    const getModeBadge = (mode?: string) => {
        if (!mode) return <Badge variant="outline">Unknown</Badge>;
        
        const modeConfig = {
            access: { 
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', 
                icon: Settings 
            },
            trunk: { 
                color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', 
                icon: Network 
            },
            routed: { 
                color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', 
                icon: Activity 
            }
        };

        const config = modeConfig[mode as keyof typeof modeConfig] || { 
            color: 'bg-gray-100 text-gray-800', 
            icon: Network 
        };
        const Icon = config.icon;

        return (
            <Badge variant="secondary" className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {mode}
            </Badge>
        );
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const getSpeedDuplex = (interface_: NetworkInterface) => {
        if (!interface_.speed && !interface_.duplex) return '-';
        
        const speed = interface_.speed || '';
        const duplex = interface_.duplex || '';
        
        if (speed && duplex) {
            return `${speed}/${duplex}`;
        } else if (speed) {
            return speed;
        } else if (duplex) {
            return duplex;
        }
        
        return '-';
    };

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 font-mono">
                        <Network className="h-5 w-5" />
                        Network Interfaces ({filteredInterfaces.length} of {interfaces.length})
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
                                placeholder="Search interfaces, descriptions, IP addresses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Status: {statusFilter === 'all' ? 'All' : statusFilter}
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuCheckboxItem
                                        checked={statusFilter === 'all'}
                                        onCheckedChange={() => setStatusFilter('all')}
                                    >
                                        All Status
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={statusFilter === 'up'}
                                        onCheckedChange={() => setStatusFilter('up')}
                                    >
                                        Up
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={statusFilter === 'down'}
                                        onCheckedChange={() => setStatusFilter('down')}
                                    >
                                        Down
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Mode: {modeFilter === 'all' ? 'All' : modeFilter}
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuCheckboxItem
                                        checked={modeFilter === 'all'}
                                        onCheckedChange={() => setModeFilter('all')}
                                    >
                                        All Modes
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={modeFilter === 'access'}
                                        onCheckedChange={() => setModeFilter('access')}
                                    >
                                        Access
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={modeFilter === 'trunk'}
                                        onCheckedChange={() => setModeFilter('trunk')}
                                    >
                                        Trunk
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={modeFilter === 'routed'}
                                        onCheckedChange={() => setModeFilter('routed')}
                                    >
                                        Routed
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Enhanced Table */}
                    <div className="rounded-md border overflow-x-auto">
                        <FuturisticTable>
                            <FuturisticTableHeader>
                                <FuturisticTableRow>
                                    {visibleColumns.interface && <FuturisticTableHead className="min-w-32">Interface</FuturisticTableHead>}
                                    {visibleColumns.description && <FuturisticTableHead className="min-w-40">Description</FuturisticTableHead>}
                                    {visibleColumns.status && <FuturisticTableHead className="min-w-24">Status</FuturisticTableHead>}
                                    {visibleColumns.mode && <FuturisticTableHead className="min-w-24">Mode</FuturisticTableHead>}
                                    {visibleColumns.vlan && <FuturisticTableHead className="min-w-20">VLAN</FuturisticTableHead>}
                                    {visibleColumns.mac && <FuturisticTableHead className="min-w-32">MAC Address</FuturisticTableHead>}
                                    {visibleColumns.ip && <FuturisticTableHead className="min-w-32">IP Address</FuturisticTableHead>}
                                    {visibleColumns.speed && <FuturisticTableHead className="min-w-28">Speed/Duplex</FuturisticTableHead>}
                                    <FuturisticTableHead className="text-right min-w-16">Actions</FuturisticTableHead>
                                </FuturisticTableRow>
                            </FuturisticTableHeader>
                            <FuturisticTableBody>
                                {filteredInterfaces.length === 0 ? (
                                    <FuturisticTableRow>
                                        <FuturisticTableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center text-muted-foreground py-12">
                                            <div className="flex flex-col items-center gap-3">
                                                <Network className="h-8 w-8 text-muted-foreground/50" />
                                                <div className="space-y-1">
                                                    <p className="font-medium">No interfaces found</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {searchTerm || statusFilter !== 'all' || modeFilter !== 'all'
                                                            ? 'Try adjusting your search or filters'
                                                            : 'No interfaces discovered yet'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </FuturisticTableCell>
                                    </FuturisticTableRow>
                                ) : (
                                    filteredInterfaces.map((interface_, idx) => (
                                        <FuturisticTableRow key={`${interface_.interface}-${interface_.description}-${idx}`} className="hover:bg-muted/50">
                                            {visibleColumns.interface && (
                                                <FuturisticTableCell className="font-mono text-sm font-medium">
                                                    {interface_.interface}
                                                </FuturisticTableCell>
                                            )}
                                            {visibleColumns.description && (
                                                <FuturisticTableCell className="text-sm max-w-xs truncate">
                                                    {interface_.description || '-'}
                                                </FuturisticTableCell>
                                            )}
                                            {visibleColumns.status && (
                                                <FuturisticTableCell>{getStatusBadge(interface_.link_status)}</FuturisticTableCell>
                                            )}
                                            {visibleColumns.mode && (
                                                <FuturisticTableCell>{getModeBadge(interface_.mode)}</FuturisticTableCell>
                                            )}
                                            {visibleColumns.vlan && (
                                                <FuturisticTableCell className="font-mono text-sm">
                                                    {interface_.vlan_id || '-'}
                                                </FuturisticTableCell>
                                            )}
                                            {visibleColumns.mac && (
                                                <FuturisticTableCell className="font-mono text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span>{interface_.mac_address || '-'}</span>
                                                        {interface_.mac_address && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => copyToClipboard(interface_.mac_address!)}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </FuturisticTableCell>
                                            )}
                                            {visibleColumns.ip && (
                                                <FuturisticTableCell className="font-mono text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span>{interface_.ip_address || '-'}</span>
                                                        {interface_.ip_address && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => copyToClipboard(interface_.ip_address!)}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </FuturisticTableCell>
                                            )}
                                            {visibleColumns.speed && (
                                                <FuturisticTableCell className="font-mono text-sm">
                                                    {getSpeedDuplex(interface_)}
                                                </FuturisticTableCell>
                                            )}
                                            <FuturisticTableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {interface_.mac_address && (
                                                            <DropdownMenuCheckboxItem onClick={() => copyToClipboard(interface_.mac_address!)}>
                                                                Copy MAC Address
                                                            </DropdownMenuCheckboxItem>
                                                        )}
                                                        {interface_.ip_address && (
                                                            <DropdownMenuCheckboxItem onClick={() => copyToClipboard(interface_.ip_address!)}>
                                                                Copy IP Address
                                                            </DropdownMenuCheckboxItem>
                                                        )}
                                                        <DropdownMenuCheckboxItem onClick={() => copyToClipboard(interface_.interface)}>
                                                            Copy Interface Name
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
                    {filteredInterfaces.length > 0 && (
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                                Showing {filteredInterfaces.length} of {interfaces.length} interfaces
                            </span>
                            {(searchTerm || statusFilter !== 'all' || modeFilter !== 'all') && (
                                <span>
                                    Filtered by {[
                                        searchTerm && 'search',
                                        statusFilter !== 'all' && `status: ${statusFilter}`,
                                        modeFilter !== 'all' && `mode: ${modeFilter}`
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