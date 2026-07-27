'use client';

import {
    ArrowUpRight,
    Package,
    Receipt,
} from "lucide-react";

interface ActivityItemProps {
    type: "sale" | "stock" | "expense";
    item: string;
    amount: number;
    brand: string;
    timestamp: string;
}

export default function ActivityItem({
                                         type,
                                         item,
                                         amount,
                                         brand,
                                         timestamp,
                                     }: ActivityItemProps) {
    // Config per transaction type: icon, colors, and prefix operator
    const typeConfig = {
        sale: {
            icon: <ArrowUpRight className="h-4 w-4 text-emerald-400" />,
            bg: "bg-emerald-500/10 border-emerald-500/20",
            amountColor: "text-emerald-400",
            prefix: "+",
            label: "Sale",
        },
        stock: {
            icon: <Package className="h-4 w-4 text-amber-400" />,
            bg: "bg-amber-500/10 border-amber-500/20",
            amountColor: "text-amber-400",
            prefix: "",
            label: "Stock Added",
        },
        expense: {
            icon: <Receipt className="h-4 w-4 text-rose-400" />,
            bg: "bg-rose-500/10 border-rose-500/20",
            amountColor: "text-rose-400",
            prefix: "-",
            label: "Expense",
        },
    }[type];

    // Normalize brand check
    const normalizedBrand = String(brand || '').toLowerCase().trim();
    const isBeeTrendy =
        normalizedBrand === 'a' ||
        normalizedBrand === 'brand_a' ||
        normalizedBrand.includes('bee');

    // Format timestamp
    const formattedTime = (() => {
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return timestamp;
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return timestamp;
        }
    })();

    return (
        <div className="group flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-900/80 p-3 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900 shadow-sm gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Icon Container */}
                <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${typeConfig.bg}`}
                >
                    {typeConfig.icon}
                </div>

                {/* Item Details */}
                <div className="min-w-0 flex-1 space-y-1">
                    {/* Item Title */}
                    <p className="text-sm font-medium text-neutral-100 truncate group-hover:text-white transition-colors">
                        {item}
                    </p>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                        {/* Brand Badge - Single Line Fixed */}
                        <span
                            className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold tracking-tight uppercase leading-tight ${
                                isBeeTrendy
                                    ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                                    : 'bg-purple-400/10 text-purple-400 border border-purple-400/20'
                            }`}
                        >
                            {isBeeTrendy ? 'BEE TRENDY' : 'BADDIE'}
                        </span>

                        <span className="text-neutral-600">•</span>

                        <span className="capitalize text-neutral-400 whitespace-nowrap">{typeConfig.label}</span>

                        <span className="text-neutral-600">•</span>

                        {/* Timestamp - Single Line Fixed */}
                        <span className="text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                            {formattedTime}
                        </span>
                    </div>
                </div>
            </div>

            {/* Amount - Single Line Fixed */}
            <div className="text-right shrink-0">
                <p className={`font-mono text-sm font-semibold tracking-tight whitespace-nowrap ${typeConfig.amountColor}`}>
                    {typeConfig.prefix}KES {Math.abs(amount).toLocaleString()}
                </p>
            </div>
        </div>
    );
}