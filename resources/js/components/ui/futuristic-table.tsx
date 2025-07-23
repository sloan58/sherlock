import React from 'react';
import { cn } from '@/lib/utils';

interface FuturisticTableProps extends React.HTMLAttributes<HTMLTableElement> {
    children: React.ReactNode;
}

export function FuturisticTable({ className, children, ...props }: FuturisticTableProps) {
    return (
        <div className="rounded-md border border-primary/20 bg-card/30 backdrop-blur-sm">
            <table className={cn("w-full", className)} {...props}>
                {children}
            </table>
        </div>
    );
}

interface FuturisticTableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
    children: React.ReactNode;
}

export function FuturisticTableHeader({ className, children, ...props }: FuturisticTableHeaderProps) {
    return (
        <thead className={cn("", className)} {...props}>
            {children}
        </thead>
    );
}

interface FuturisticTableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
    children: React.ReactNode;
}

export function FuturisticTableBody({ className, children, ...props }: FuturisticTableBodyProps) {
    return (
        <tbody className={cn("", className)} {...props}>
            {children}
        </tbody>
    );
}

interface FuturisticTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    children: React.ReactNode;
}

export function FuturisticTableRow({ className, children, ...props }: FuturisticTableRowProps) {
    return (
        <tr className={cn("border-b border-primary/10 hover:bg-primary/5 transition-colors", className)} {...props}>
            {children}
        </tr>
    );
}

interface FuturisticTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
    children: React.ReactNode;
}

export function FuturisticTableHead({ className, children, ...props }: FuturisticTableHeadProps) {
    return (
        <th className={cn("text-left p-4 font-medium text-primary", className)} {...props}>
            {children}
        </th>
    );
}

interface FuturisticTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    children: React.ReactNode;
}

export function FuturisticTableCell({ className, children, ...props }: FuturisticTableCellProps) {
    return (
        <td className={cn("p-4", className)} {...props}>
            {children}
        </td>
    );
} 