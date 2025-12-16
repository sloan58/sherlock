import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Users } from 'lucide-react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    auth_source: 'local' | 'ldap';
}

interface Props extends PageProps {
    user: User;
}

export default function Edit({ user, ...props }: Props) {
    const [authSource, setAuthSource] = useState<'local' | 'ldap'>(user.auth_source || 'local');
    
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        auth_source: user.auth_source || 'local',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('users.update', { user: user.id }));
    };

    return (
        <AppLayout>
            <Head title={`Edit User: ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-mono">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            Edit User
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="auth_source">Authentication Source *</Label>
                                    <Select
                                        value={authSource}
                                        onValueChange={(value: 'local' | 'ldap') => {
                                            setAuthSource(value);
                                            setData('auth_source', value);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="local">Local</SelectItem>
                                            <SelectItem value="ldap">LDAP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.auth_source && (
                                        <p className="text-sm text-destructive">
                                            {errors.auth_source}
                                        </p>
                                    )}
                                </div>

                                {authSource === 'local' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">
                                                New Password {user.auth_source === 'ldap' && authSource === 'local' ? '*' : '(leave blank to keep current)'}
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData('password', e.target.value)
                                                }
                                                required={user.auth_source === 'ldap' && authSource === 'local'}
                                                minLength={8}
                                            />
                                            {errors.password && (
                                                <p className="text-sm text-destructive">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">
                                                Confirm New Password {user.auth_source === 'ldap' && authSource === 'local' ? '*' : ''}
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) =>
                                                    setData('password_confirmation', e.target.value)
                                                }
                                                required={user.auth_source === 'ldap' && authSource === 'local'}
                                                minLength={8}
                                            />
                                            {errors.password_confirmation && (
                                                <p className="text-sm text-destructive">
                                                    {errors.password_confirmation}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button
                                    variant="outline"
                                    asChild
                                >
                                    <Link href={route('users.index')}>
                                        Cancel
                                    </Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    Update User
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

