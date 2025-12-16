import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    Users, 
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

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    auth_source?: 'local' | 'ldap' | null;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    users: {
        data: User[];
        links: any[];
    };
}

export default function Index({ users, ...props }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        let filtered = users.data;

        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [users.data, searchTerm]);

    const deleteUser = (userId: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('users.destroy', { user: userId }));
        }
    };

    return (
        <AppLayout>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-mono">Users</h1>
                        <p className="text-muted-foreground">Manage system users</p>
                    </div>
                    <Button asChild>
                        <Link href={route('users.create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-mono">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
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
                                        <FuturisticTableHead className="font-mono text-sm">Email</FuturisticTableHead>
                                        <FuturisticTableHead className="font-mono text-sm">Auth Source</FuturisticTableHead>
                                        <FuturisticTableHead className="font-mono text-sm">Verified</FuturisticTableHead>
                                        <FuturisticTableHead className="font-mono text-sm">Created</FuturisticTableHead>
                                        <FuturisticTableHead className="text-right">Actions</FuturisticTableHead>
                                    </FuturisticTableRow>
                                </FuturisticTableHeader>
                            <FuturisticTableBody>
                                    {filteredUsers.length === 0 ? (
                                        <FuturisticTableRow>
                                            <FuturisticTableCell colSpan={6} className="text-center text-muted-foreground py-12">
                                            <div className="flex flex-col items-center gap-3">
                                                <Users className="h-8 w-8 text-muted-foreground/50" />
                                                <div className="space-y-1">
                                                    <p className="font-medium">No users found</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {searchTerm 
                                                            ? 'Try adjusting your search'
                                                            : 'Get started by creating a new user'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </FuturisticTableCell>
                                    </FuturisticTableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <FuturisticTableRow key={user.id}>
                                            <FuturisticTableCell className="font-mono text-sm font-medium">
                                                <Link 
                                                    href={route('users.edit', { user: user.id })}
                                                    className="text-primary hover:text-primary/80 hover:underline transition-colors"
                                                >
                                                    {user.name}
                                                </Link>
                                            </FuturisticTableCell>
                                            <FuturisticTableCell className="font-mono text-sm">
                                                {user.email}
                                            </FuturisticTableCell>
                                            <FuturisticTableCell>
                                                <Badge variant={user.auth_source === 'ldap' ? 'default' : 'secondary'} className="text-xs">
                                                    {(user.auth_source || 'local').toUpperCase()}
                                                </Badge>
                                            </FuturisticTableCell>
                                            <FuturisticTableCell className="font-mono text-sm">
                                                {user.email_verified_at ? (
                                                    <span className="text-green-600">Yes</span>
                                                ) : (
                                                    <span className="text-muted-foreground">No</span>
                                                )}
                                            </FuturisticTableCell>
                                            <FuturisticTableCell className="font-mono text-sm">
                                                {new Date(user.created_at).toLocaleDateString()}
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
                                                            <Link href={route('users.edit', { user: user.id })}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => deleteUser(user.id)}
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
        </AppLayout>
    );
}

