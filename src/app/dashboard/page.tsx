'use client';

import { useEffect, useState } from 'react';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import TotalSalesCard from '@/components/dashboard/TotalSalesCard';
import BrandSalesCards from '@/components/dashboard/BrandSalesCards';
import QuickActions from '@/components/dashboard/QuickActions';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import ProfileDrawer from '@/components/ProfileDrawer';

interface User {
    name: string;
    role: string;
}

interface Transaction {
    id: number;
    type: 'sale' | 'stock' | 'expense';
    item: string;
    amount: number;
    brand: 'A' | 'B';
    timestamp: string;
}

export default function DashboardPage() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [user, setUser] = useState<User | null>(null);

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [totalSales, setTotalSales] = useState(42500);
    const [brandASales, setBrandASales] = useState(28000);
    const [brandBSales, setBrandBSales] = useState(14500);

    useEffect(() => {
        setUser({
            name: 'Alex',
            role: 'Owner',
        });

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
        <main className="min-h-screen bg-gray-50">
            <DashboardHeader
                user={user}
                onProfileClick={() => setIsProfileOpen(true)}
            />

            <div className="mx-auto max-w-5xl space-y-5 px-6 py-6">
                <TotalSalesCard totalSales={totalSales} />

                <BrandSalesCards
                    brandASales={brandASales}
                    brandBSales={brandBSales}
                />

                <QuickActions />

                <ActivityFeed transactions={transactions} />
            </div>

            <ProfileDrawer
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
            />
        </main>
    );
}