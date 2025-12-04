import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { 
    FuturisticTable, 
    FuturisticTableHeader, 
    FuturisticTableBody, 
    FuturisticTableRow, 
    FuturisticTableHead, 
    FuturisticTableCell 
} from '@/components/ui/futuristic-table';
import { 
    Plus, 
    MapPin, 
    Edit, 
    Trash2,
    Search,
    MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';

interface Site {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
    network_switches_count: number;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    sites: {
        data: Site[];
        links: any[];
    };
}

export default function Index({ sites, ...props }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSites = useMemo(() => {
        let filtered = sites.data;

        if (searchTerm) {
            filtered = filtered.filter(site => 
                site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (site.code && site.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (site.city && site.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (site.state && site.state.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        return filtered;
    }, [sites.data, searchTerm]);

    const deleteSite = (siteId: number) => {
        if (confirm('Are you sure you want to delete this site?')) {
            router.delete(route('sites.destroy', { site: siteId }));
        }
    };

    return (
        <AppLayout>
            <Head title="Sites" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight font-mono">Sites</h1>
                            <p className="text-muted-foreground">Manage your network sites</p>
                        </div>
                        <Button asChild>
                            <Link href={route('sites.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Site
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-mono">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                Sites
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search sites..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            <FuturisticTable>
                                <FuturisticTableHeader>
                                    <FuturisticTableRow>
                                        <FuturisticTableHead className="font-mono text-sm font-medium">Name</FuturisticTableHead>
                                        <FuturisticTableHead className="font-mono text-sm">Code</FuturisticTableHead>
                                        <FuturisticTableHead className="font-mono text-sm">Location</FuturisticTableHead>
                                        <FuturisticTableHead className="font-mono text-sm">Switches</FuturisticTableHead>
                                        <FuturisticTableHead className="text-right">Actions</FuturisticTableHead>
                                    </FuturisticTableRow>
                                </FuturisticTableHeader>
                                <FuturisticTableBody>
                                    {filteredSites.length === 0 ? (
                                        <FuturisticTableRow>
                                            <FuturisticTableCell colSpan={5} className="text-center text-muted-foreground py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <MapPin className="h-8 w-8 text-muted-foreground/50" />
                                                    <div className="space-y-1">
                                                        <p className="font-medium">No sites found</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {searchTerm 
                                                                ? 'Try adjusting your search'
                                                                : 'Get started by creating a new site'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </FuturisticTableCell>
                                        </FuturisticTableRow>
                                    ) : (
                                        filteredSites.map((site) => (
                                            <FuturisticTableRow key={site.id}>
                                                <FuturisticTableCell className="font-mono text-sm font-medium">
                                                    <Link 
                                                        href={route('sites.edit', { site: site.id })}
                                                        className="text-primary hover:text-primary/80 hover:underline transition-colors"
                                                    >
                                                        {site.name}
                                                    </Link>
                                                </FuturisticTableCell>
                                                <FuturisticTableCell className="font-mono text-sm">
                                                    {site.code || '-'}
                                                </FuturisticTableCell>
                                                <FuturisticTableCell className="font-mono text-sm">
                                                    {[site.city, site.state].filter(Boolean).join(', ') || '-'}
                                                </FuturisticTableCell>
                                                <FuturisticTableCell className="font-mono text-sm">
                                                    {site.network_switches_count}
                                                </FuturisticTableCell>
                                                <FuturisticTableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('sites.edit', { site: site.id })}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => deleteSite(site.id)}
                                                                className="text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </FuturisticTableCell>
                                            </FuturisticTableRow>
                                        ))
                                    )}
                                </FuturisticTableBody>
                            </FuturisticTable>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}


