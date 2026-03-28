import { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, forwardRef } from 'react';

export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
    ({ className = '', ...props }, ref) => (
        <div className="w-full overflow-auto">
            <table ref={ref} className={`w-full caption-bottom text-sm ${className}`} {...props} />
        </div>
    )
);
Table.displayName = 'Table';

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className = '', ...props }, ref) => (
        <thead ref={ref} className={`[&_tr]:border-b border-[rgba(255,255,255,0.06)] ${className}`} {...props} />
    )
);
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className = '', ...props }, ref) => (
        <tbody ref={ref} className={`[&_tr:last-child]:border-0 ${className}`} {...props} />
    )
);
TableBody.displayName = 'TableBody';

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
    ({ className = '', ...props }, ref) => (
        <tr
            ref={ref}
            className={`border-b border-[rgba(255,255,255,0.06)] transition-colors hover:bg-white/[0.02] data-[state=selected]:bg-white/[0.04] ${className}`}
            {...props}
        />
    )
);
TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
    ({ className = '', ...props }, ref) => (
        <th
            ref={ref}
            className={`h-10 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className}`}
            {...props}
        />
    )
);
TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
    ({ className = '', ...props }, ref) => (
        <td
            ref={ref}
            className={`p-4 align-middle text-gray-300 [&:has([role=checkbox])]:pr-0 ${className}`}
            {...props}
        />
    )
);
TableCell.displayName = 'TableCell';
