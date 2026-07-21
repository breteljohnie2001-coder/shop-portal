'use client';

import {
    DollarSign,
    Package,
    Receipt,
} from "lucide-react";

interface QuickActionsProps {
    onSale?: () => void;
    onStock?: () => void;
    onExpense?: () => void;
}

export default function QuickActions({
                                         onSale,
                                         onStock,
                                         onExpense,
                                     }: QuickActionsProps) {
    return (
        <section>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Quick Actions
            </h3>

            <div className="grid grid-cols-3 gap-4">
                <ActionCard
                    icon={<DollarSign size={22} />}
                    title="Sale"
                    onClick={onSale}
                />

                <ActionCard
                    icon={<Package size={22} />}
                    title="Stock"
                    onClick={onStock}
                />

                <ActionCard
                    icon={<Receipt size={22} />}
                    title="Expense"
                    onClick={onExpense}
                />
            </div>
        </section>
    );
}

interface ActionCardProps {
    icon: React.ReactNode;
    title: string;
    onClick?: () => void;
}

function ActionCard({
                        icon,
                        title,
                        onClick,
                    }: ActionCardProps) {
    return (
        <button
            onClick={onClick}
            className="
        group
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-5
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "
        >
            <div className="flex flex-col items-center gap-3">
                <div className="text-gray-800 group-hover:scale-110 transition-transform">
                    {icon}
                </div>

                <span className="text-sm font-medium text-gray-700">
          {title}
        </span>
            </div>
        </button>
    );
}