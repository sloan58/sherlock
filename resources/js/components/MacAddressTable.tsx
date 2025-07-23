import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Database } from "lucide-react";

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

export default function MacAddressTable({ macAddresses }: { macAddresses: MacAddress[] }) {
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const trimmedSearch = search.trim().toLowerCase();
        if (!trimmedSearch) return macAddresses;
        
        const results = macAddresses.filter(mac => {
            const fields = [
                mac.mac_address,
                mac.pivot?.ports,
                mac.pivot?.vlan_id,
                mac.pivot?.type,
                mac.pivot?.manufacturer,
            ];

            const hasMatch = fields.some(field => {
                if (!field) return false;
                return field.toLowerCase().includes(trimmedSearch);
            });

            return hasMatch;
        });

        return results;
    }, [macAddresses, search]);

    return (
        <div className="space-y-4">
            {/* Search Section */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search MAC addresses, vendor, port, VLAN, etc."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 border-border/50 focus:border-blue-500 bg-background/50"
                />
            </div>

            {/* Table Section */}
            <div className="rounded-lg border border-border/50 bg-background/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 border-border/50">
                            <TableHead className="font-medium text-muted-foreground">MAC Address</TableHead>
                            <TableHead className="font-medium text-muted-foreground">Ports</TableHead>
                            <TableHead className="font-medium text-muted-foreground">VLAN ID</TableHead>
                            <TableHead className="font-medium text-muted-foreground">Type</TableHead>
                            <TableHead className="font-medium text-muted-foreground">Manufacturer</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    <div className="flex flex-col items-center gap-2">
                                        <Database className="h-8 w-8 text-muted-foreground/50" />
                                        <p>No MAC addresses found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((mac, idx) => (
                                <TableRow 
                                    key={`${mac.id}-${mac.pivot?.ports ?? ''}-${mac.pivot?.vlan_id ?? ''}-${idx}`}
                                    className="hover:bg-muted/30 transition-colors border-border/50"
                                >
                                    <TableCell className="font-mono text-sm">{mac.mac_address}</TableCell>
                                    <TableCell className="font-mono text-sm">{mac.pivot?.ports ?? '-'}</TableCell>
                                    <TableCell className="font-mono text-sm">{mac.pivot?.vlan_id ?? '-'}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                            mac.pivot?.type === 'dynamic' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                                : mac.pivot?.type === 'static'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                        }`}>
                                            {mac.pivot?.type ?? '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{mac.pivot?.manufacturer ?? '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Results Summary */}
            {filtered.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Showing {filtered.length} of {macAddresses.length} MAC addresses
                    </span>
                    {search && (
                        <span>
                            Filtered by "{search}"
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
