import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { router } from '@inertiajs/react';

interface SyncHistory {
    id: number;
    result: 'completed' | 'failed';
    error_message: string | null;
    completed_at: string;
    created_at: string;
}

interface Props {
    networkSwitchId: number;
}

export function SyncHistoryTable({ networkSwitchId }: Props) {
    const [history, setHistory] = useState<SyncHistory[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            const response = await fetch(
                `/network-switches/${networkSwitchId}/sync-history`
            );
            const data = await response.json();
            setHistory(data);
        };

        fetchHistory();

        // Set up polling for updates
        const interval = setInterval(fetchHistory, 2000);
        return () => clearInterval(interval);
    }, [networkSwitchId]);

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Error Message</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell>
                                {format(new Date(record.completed_at), 'PPpp')}
                            </TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                    record.result === 'completed'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                    {record.result}
                                </span>
                            </TableCell>
                            <TableCell>{record.error_message}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
