interface TotalSalesCardProps {
    totalSales: number;
}

export default function TotalSalesCard({
                                           totalSales,
                                       }: TotalSalesCardProps) {
    return (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                        Total Sales
                    </p>

                    <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
                        KES {totalSales.toLocaleString()}
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Updated just now
                    </p>
                </div>

                <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                    ↑ 12%
                </div>
            </div>
        </section>
    );
}