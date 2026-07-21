import {
    ArrowUpRight,
    Package,
    Receipt,
} from "lucide-react";

interface ActivityItemProps {
    type: "sale" | "stock" | "expense";
    item: string;
    amount: number;
    brand: "A" | "B";
    timestamp: string;
}

export default function ActivityItem({
                                         type,
                                         item,
                                         amount,
                                         brand,
                                         timestamp,
                                     }: ActivityItemProps) {
    const icon =
        type === "sale"
            ? <ArrowUpRight size={18} />
            : type === "stock"
                ? <Package size={18} />
                : <Receipt size={18} />;

    return (
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm">
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                    {icon}
                </div>

                <div>
                    <p className="font-medium text-gray-900">
                        {item}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                        <span className="capitalize">{type}</span>

                        <span>•</span>

                        <span>Brand {brand}</span>

                        <span>•</span>

                        <span>{timestamp}</span>
                    </div>
                </div>
            </div>

            <div
                className={`text-right font-semibold ${
                    type === "expense"
                        ? "text-red-600"
                        : "text-emerald-600"
                }`}
            >
                {type === "expense" ? "-" : "+"}
                KES {Math.abs(amount).toLocaleString()}
            </div>
        </div>
    );
}