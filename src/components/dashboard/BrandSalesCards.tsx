'use client';

import { useState } from "react";
import Image from "next/image";
import SalesListModal, { SaleItem } from "./modals/SalesListModal";

interface BrandSalesCardsProps {
    brandASales: number;
    brandBSales: number;
    brandASalesData: SaleItem[];
    brandBSalesData: SaleItem[];
}

export default function BrandSalesCards({
                                            brandASales,
                                            brandBSales,
                                            brandASalesData,
                                            brandBSalesData,
                                        }: BrandSalesCardsProps) {
    const [selectedBrand, setSelectedBrand] = useState<{
        name: string;
        logo: string;
        total: number;
        sales: SaleItem[];
    } | null>(null);

    return (
        <>
            <section className="grid grid-cols-2 gap-4">
                <BrandCard
                    logo="/bee-trendya.png"
                    alt="Bee Trendy Collection"
                    amount={brandASales}
                    priority
                    onClick={() =>
                        setSelectedBrand({
                            name: "Bee Trendy Collection",
                            logo: "/bee-trendya.png",
                            total: brandASales,
                            sales: brandASalesData,
                        })
                    }
                />

                <BrandCard
                    logo="/baddyOnABudgetb.png"
                    alt="Baddie On A Budget Closet"
                    amount={brandBSales}
                    onClick={() =>
                        setSelectedBrand({
                            name: "Baddie On A Budget Closet",
                            logo: "/baddyOnABudgetb.png",
                            total: brandBSales,
                            sales: brandBSalesData,
                        })
                    }
                />
            </section>

            <SalesListModal
                isOpen={!!selectedBrand}
                onClose={() => setSelectedBrand(null)}
                brandName={selectedBrand?.name ?? ""}
                logoUrl={selectedBrand?.logo ?? ""}
                totalSales={selectedBrand?.total ?? 0}
                sales={selectedBrand?.sales ?? []}
            />
        </>
    );
}

interface BrandCardProps {
    logo: string;
    alt: string;
    amount: number;
    priority?: boolean;
    onClick: () => void;
}

function BrandCard({
                       logo,
                       alt,
                       amount,
                       priority = false,
                       onClick,
                   }: BrandCardProps) {
    return (
        <div
            onClick={onClick}
            className="cursor-pointer rounded-2xl border border-neutral-800/80 bg-neutral-900 p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/40"
        >
            <div className="flex justify-center">
                <Image
                    src={logo}
                    alt={alt}
                    width={120}
                    height={50}
                    priority={priority}
                    className="h-8 w-auto object-contain opacity-90 transition-opacity hover:opacity-100"
                />
            </div>

            <div className="mt-4 text-center">
                <p className="font-mono text-xl font-medium tracking-tight text-neutral-100">
                    <span className="mr-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        KES
                    </span>
                    {amount.toLocaleString()}
                </p>

                <p className="mt-1 text-[11px] font-medium text-neutral-500">
                    Click to view sales
                </p>
            </div>
        </div>
    );
}