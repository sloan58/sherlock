import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { ResponsiveEditLayout } from '@/components/NetworkSwitches/ResponsiveEditLayout';

const deviceTypes = {
    cisco_ios: 'Cisco IOS',
    cisco_nxos: 'Cisco NXOS',
} as const;

interface NetworkSwitch {
    id: number;
    host: string;
    hostname: string | null;
    username: string;
    password: string;
    device_type: keyof typeof deviceTypes;
    port: string;
    syncing: boolean;
    interfaces?: never[];
}

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

interface Props extends PageProps {
    switch: NetworkSwitch;
    macAddresses: MacAddress[];
    allMacAddresses?: MacAddress[];
    totalMacAddressesCount?: number;
    visibleMacAddressesCount?: number;
}

export default function Edit({ switch: networkSwitch, macAddresses, allMacAddresses, totalMacAddressesCount, visibleMacAddressesCount }: Props) {
    const [switchData, setSwitchData] = useState(networkSwitch);

    useEffect(() => {
        // Only poll if the switch is syncing
        if (switchData.syncing) {
            const interval = setInterval(() => {
                router.reload({
                    only: ['switch'],
                });
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [switchData.syncing]);

    // Update switchData when networkSwitch changes
    useEffect(() => {
        setSwitchData(networkSwitch);
    }, [networkSwitch]);

    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Edit Network Switch" />
            <ResponsiveEditLayout 
                switch={switchData} 
                macAddresses={macAddresses}
                allMacAddresses={allMacAddresses}
                totalMacAddressesCount={totalMacAddressesCount}
                visibleMacAddressesCount={visibleMacAddressesCount}
                errors={{}}
            />
        </AppLayout>
    );
}
