'use client';

import { useEffect, useState } from 'react';

import TotalSalesCard from '@/components/dashboard/TotalSalesCard';
import BrandSalesCards from '@/components/dashboard/BrandSalesCards';
import QuickActions from '@/components/dashboard/QuickActions';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

interface Transaction {
    id: number;
    type: 'sale' | 'stock' | 'expense';
    item: string;
    amount: number;
    brand: 'A' | 'B';
    timestamp: string;
}

export default function DashboardPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        setTransactions([
            {
                id: 1,
                type: 'sale',
                item: 'Product X',
                amount: 1250,
                brand: 'A',
                timestamp: '2 min ago',
            },
            {
                id: 2,
                type: 'stock',
                item: 'Restock',
                amount: 500,
                brand: 'B',
                timestamp: '15 min ago',
            },
        ]);
    }, []);

    return (
        <div className="space-y-5">
            <TotalSalesCard totalSales={42500} />

            <BrandSalesCards
                brandASales={28000}
                brandBSales={14500}
            />

            <QuickActions />

            <ActivityFeed transactions={transactions} />
        </div>
    );
}