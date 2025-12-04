import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin } from 'lucide-react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';

export default function Create({ ...props }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        description: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('sites.store'));
    };

    return (
        <AppLayout>
            <Head title="Add Site" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-mono">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                Add Site
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
                                        <Label htmlFor="code">Code</Label>
                                        <Input
                                            id="code"
                                            type="text"
                                            value={data.code}
                                            onChange={(e) =>
                                                setData('code', e.target.value)
                                            }
                                        />
                                        {errors.code && (
                                            <p className="text-sm text-destructive">
                                                {errors.code}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) =>
                                                setData('description', e.target.value)
                                            }
                                            rows={3}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-destructive">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            type="text"
                                            value={data.address}
                                            onChange={(e) =>
                                                setData('address', e.target.value)
                                            }
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-destructive">
                                                {errors.address}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            value={data.city}
                                            onChange={(e) =>
                                                setData('city', e.target.value)
                                            }
                                        />
                                        {errors.city && (
                                            <p className="text-sm text-destructive">
                                                {errors.city}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            id="state"
                                            type="text"
                                            value={data.state}
                                            onChange={(e) =>
                                                setData('state', e.target.value)
                                            }
                                        />
                                        {errors.state && (
                                            <p className="text-sm text-destructive">
                                                {errors.state}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="zip">ZIP Code</Label>
                                        <Input
                                            id="zip"
                                            type="text"
                                            value={data.zip}
                                            onChange={(e) =>
                                                setData('zip', e.target.value)
                                            }
                                        />
                                        {errors.zip && (
                                            <p className="text-sm text-destructive">
                                                {errors.zip}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            id="country"
                                            type="text"
                                            value={data.country}
                                            onChange={(e) =>
                                                setData('country', e.target.value)
                                            }
                                        />
                                        {errors.country && (
                                            <p className="text-sm text-destructive">
                                                {errors.country}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Button
                                        variant="outline"
                                        asChild
                                    >
                                        <Link href={route('sites.index')}>
                                            Cancel
                                        </Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        Create Site
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}


