import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

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
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm mt-8">
            <div className="p-4">
                <Input
                    placeholder="Search MAC addresses, vendor, port, VLAN, etc."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>MAC Address</TableHead>
                        <TableHead>Ports</TableHead>
                        <TableHead>VLAN ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Manufacturer</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No MAC addresses found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filtered.map((mac, idx) => (
                            <TableRow key={`${mac.id}-${mac.pivot?.ports ?? ''}-${mac.pivot?.vlan_id ?? ''}-${idx}`}>
                                <TableCell>{mac.mac_address}</TableCell>
                                <TableCell>{mac.pivot?.ports ?? "-"}</TableCell>
                                <TableCell>{mac.pivot?.vlan_id ?? "-"}</TableCell>
                                <TableCell>{mac.pivot?.type ?? "-"}</TableCell>
                                <TableCell>{mac.pivot?.manufacturer ?? "-"}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
