import ActivityItem from "./ActivityItem";

interface Transaction {
    id: number;
    type: "sale" | "stock" | "expense";
    item: string;
    amount: number;
    brand: "A" | "B";
    timestamp: string;
}

interface ActivityFeedProps {
    transactions: Transaction[];
}

export default function ActivityFeed({
                                         transactions,
                                     }: ActivityFeedProps) {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    Recent Activity
                </h2>

                <button className="text-sm text-gray-500 hover:text-black">
                    View All
                </button>
            </div>

            <div className="space-y-3">
                {transactions.map((transaction) => (
                    <ActivityItem
                        key={transaction.id}
                        {...transaction}
                    />
                ))}
            </div>
        </section>
    );
}