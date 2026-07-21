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
                logo="/bee-trendya.png"
                alt="Bee_Trendy Collection"
                amount={brandASales}
            />

            <BrandCard
                logo="/baddyOnABudgetb.png"
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
        /* Dark background, subtle border, smooth hover elevation glow */
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900 p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/40">
            {/* Logo Wrapper */}
            <div className="flex justify-center">
                <Image
                    src={logo}
                    alt={alt}
                    width={120}
                    height={50}
                    className="h-8 w-auto object-contain opacity-90 transition-opacity hover:opacity-100"
                />
            </div>

            {/* Sales Amount */}
            <div className="mt-4 text-center">
                <p className="text-xl font-medium tracking-tight text-neutral-100 font-mono">
                    <span className="text-xs font-semibold text-neutral-400 mr-1.5 uppercase tracking-wider font-sans">KES</span>
                    {amount.toLocaleString()}
                </p>
            </div>
        </div>
    );
}