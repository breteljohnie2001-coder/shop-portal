import { useState } from "react";
import Image from "next/image";
import SalesListModal, { SaleItem } from "./SalesListModal";

interface BrandSalesCardsProps {
    brandASales: number;
    brandBSales: number;
}

// Sample mock sales data
const brandASalesData: SaleItem[] = [
    {
        id: '1',
        customerName: 'Amina Mohamed',
        amount: 4500,
        date: '10 mins ago',
        items: [
            { id: 'p1', name: 'Floral Maxi Dress', quantity: 1, price: 3000 },
            { id: 'p2', name: 'Gold Layered Necklace', quantity: 1, price: 1500 },
        ],
    },
    {
        id: '2',
        customerName: 'Kevin Otieno',
        amount: 2800,
        date: '1 hour ago',
        items: [
            { id: 'p3', name: 'Oversized Silk Shirt', quantity: 1, price: 2800 },
        ],
    },
    {
        id: '3',
        customerName: 'Grace Wanjiku',
        amount: 8900,
        date: '3 hours ago',
        items: [
            { id: 'p4', name: 'Pleated Midi Skirt', quantity: 1, price: 3400 },
            { id: 'p5', name: 'Leather Shoulder Bag', quantity: 1, price: 4500 },
            { id: 'p6', name: 'Cat-Eye Sunglasses', quantity: 1, price: 1000 },
        ],
    },
    {
        id: '4',
        customerName: 'Brian Kiprop',
        amount: 1500,
        date: 'Yesterday',
        items: [
            { id: 'p7', name: 'Minimalist Hoop Earrings', quantity: 1, price: 1500 },
        ],
    },
];

const brandBSalesData: SaleItem[] = [
    {
        id: '5',
        customerName: 'Stacy Njeri',
        amount: 3200,
        date: '25 mins ago',
        items: [
            { id: 'p8', name: 'Ribbed Crop Top', quantity: 2, price: 1600 },
        ],
    },
    {
        id: '6',
        customerName: 'David Omondi',
        amount: 11200,
        date: '2 hours ago',
        items: [
            { id: 'p9', name: 'High-Waist Cargo Pants', quantity: 2, price: 7000 },
            { id: 'p10', name: 'Chunky Platform Sneakers', quantity: 1, price: 3200 },
            { id: 'p11', name: 'Graphic Tote Bag', quantity: 1, price: 1000 },
        ],
    },
    {
        id: '7',
        customerName: 'Faith Chebet',
        amount: 2100,
        date: '5 hours ago',
        items: [
            { id: 'p12', name: 'Seamless Bodycon Dress', quantity: 1, price: 2100 },
        ],
    },
];

export default function BrandSalesCards({
                                            brandASales,
                                            brandBSales,
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
                    alt="Bee_Trendy Collection"
                    amount={brandASales}
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
                    alt="Baddie on a Budget Closet"
                    amount={brandBSales}
                    onClick={() =>
                        setSelectedBrand({
                            name: "Baddie on a Budget",
                            logo: "/baddyOnABudgetb.png",
                            total: brandBSales,
                            sales: brandBSalesData,
                        })
                    }
                />
            </section>
            {/* Sales List Modal */}
            <SalesListModal
                isOpen={!!selectedBrand}
                onClose={() => setSelectedBrand(null)}
                brandName={selectedBrand?.name || ''}
                logoUrl={selectedBrand?.logo || ''}
                totalSales={selectedBrand?.total || 0}
                sales={selectedBrand?.sales || []}
            />
        </>
    );
}

interface BrandCardProps {
    logo: string;
    alt: string;
    amount: number;
    onClick: () => void;
}

function BrandCard({ logo, alt, amount, onClick }: BrandCardProps) {
    return (
        /* Dark background, subtle border, smooth hover elevation glow */
        <div onClick={onClick} className="rounded-2xl border border-neutral-800/80 bg-neutral-900 p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/40">
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
                <p className="mt-0.5 text-[11px] font-medium text-neutral-500">
                   click to view sales
                </p>
            </div>
        </div>
    );
}