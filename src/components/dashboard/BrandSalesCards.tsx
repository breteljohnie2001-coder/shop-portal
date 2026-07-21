import Image from "next/image";

interface BrandSalesCardsProps {
    brandASales: number;
    brandBSales: number;
}

export default function BrandSalesCards({
                                            brandASales,
                                            brandBSales,
                                        }: BrandSalesCardsProps) {
    return (
        <section className="grid grid-cols-2 gap-4">
            <BrandCard
                logo="/bee-trendy.png"
                alt="Bee_Trendy Collection"
                amount={brandASales}
            />

            <BrandCard
                logo="/baddyOnABudget.png"
                alt="Baddie on a Budget Closet"
                amount={brandBSales}
            />
        </section>
    );
}

interface BrandCardProps {
    logo: string;
    alt: string;
    amount: number;
}

function BrandCard({ logo, alt, amount }: BrandCardProps) {
    return (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex justify-center">
                <Image
                    src={logo}
                    alt={alt}
                    width={120}
                    height={50}
                    className="h-10 w-auto object-contain"
                />
            </div>

            <div className="mt-6 text-center">
                <p className="text-3xl font-semibold tracking-tight text-gray-900">
                    KES {amount.toLocaleString()}
                </p>
            </div>
        </div>
    );
}