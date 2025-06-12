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
                mac.vendor,
                mac.pivot?.ports,
                mac.pivot?.vlan_id,
                mac.pivot?.type,
                mac.pivot?.age,
                mac.pivot?.secure,
                mac.pivot?.ntfy,
                mac.pivot?.manufacturer,
                mac.pivot?.comment
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
                        <TableHead>Vendor</TableHead>
                        <TableHead>Ports</TableHead>
                        <TableHead>VLAN ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Secure</TableHead>
                        <TableHead>Notify</TableHead>
                        <TableHead>Manufacturer</TableHead>
                        <TableHead>Comment</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10} className="text-center text-muted-foreground">
                                No MAC addresses found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filtered.map(mac => (
                            <TableRow key={`${mac.id}-${mac.pivot?.ports ?? ''}-${mac.pivot?.vlan_id ?? ''}`}>
                                <TableCell>{mac.mac_address}</TableCell>
                                <TableCell>{mac.vendor ?? "-"}</TableCell>
                                <TableCell>{mac.pivot?.ports ?? "-"}</TableCell>
                                <TableCell>{mac.pivot?.vlan_id ?? "-"}</TableCell>
                                <TableCell>{mac.pivot?.type ?? "-"}</TableCell>
                                <TableCell>{mac.pivot?.age ?? "-"}</TableCell>
                                <TableCell>{mac.pivot?.secure ?? "-"}</TableCell>
                                <TableCell>{mac.pivot?.ntfy ?? "-"}</TableCell>
                                <TableCell>{mac.pivot?.manufacturer ?? "-"}</TableCell>
                                <TableCell>{mac.pivot?.comment ?? "-"}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
