'use client';

import Image from "next/image";

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
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Quick Actions
            </h3>

            <div className="grid grid-cols-3 gap-4">
                <ActionCard
                    iconSrc="/salesIcon.png"
                    alt="Sale Icon"
                    title="+Sale"
                    onClick={onSale}
                />

                <ActionCard
                    iconSrc="/stockIcon.png"
                    alt="Stock Icon"
                    title="+Stock"
                    onClick={onStock}
                />

                <ActionCard
                    iconSrc="/expensesIcon.png"
                    alt="Expense Icon"
                    title="+Expense"
                    onClick={onExpense}
                />
            </div>
        </section>
    );
}

interface ActionCardProps {
    iconSrc: string;
    alt: string;
    title: string;
    onClick?: () => void;
}

function ActionCard({
                        iconSrc,
                        alt,
                        title,
                        onClick,
                    }: ActionCardProps) {
    return (
        <button
            onClick={onClick}
            className="
                group
                flex
                w-full
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-neutral-800/80
                bg-neutral-900
                p-5
                shadow-md
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-neutral-700
                hover:shadow-xl
                hover:shadow-black/40
                active:scale-95
            "
        >
            <div className="flex flex-col items-center gap-3">
                {/* Fixed dimensions for crisp icon rendering */}
                <div className="transition-transform duration-300 group-hover:scale-110">
                    <Image
                        src={iconSrc}
                        alt={alt}
                        width={28}
                        height={28}
                        className="h-7 w-7 object-contain"
                    />
                </div>

                <span className="text-sm font-medium text-neutral-300 transition-colors group-hover:text-white">
                    {title}
                </span>
            </div>
        </button>
    );
}