'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SaleItem } from "@/components/dashboard/modals/SalesListModal";
import TotalSalesCard from '@/components/dashboard/TotalSalesCard';
import BrandSalesCards from '@/components/dashboard/BrandSalesCards';
import QuickActions from '@/components/dashboard/QuickActions';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import AddStockModal from '@/components/dashboard/modals/AddStockModal';
import AddSaleModal from '@/components/dashboard/modals/AddSaleModal';
import { PurchasedProduct } from "@/types/types";

const supabase = createClient();

interface Transaction {
    id: string;
    type: 'sale' | 'stock' | 'expense';
    item: string;
    amount: number;
    brand: string;
    timestamp: string;
}

/** Normalize brand_id (text or enum) into a consistent key */
function normalizeBrand(brandId: unknown): string {
    const raw = String(brandId ?? '').toLowerCase().trim();
    if (raw === 'brand_a' || raw.includes('bee') || raw === 'a') return 'brand_a';
    if (raw === 'brand_b' || raw.includes('baddie') || raw === 'b') return 'brand_b';
    return raw || 'unknown';
}

export default function DashboardPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [brandASalesData, setBrandASalesData] = useState<SaleItem[]>([]);
    const [brandBSalesData, setBrandBSalesData] = useState<SaleItem[]>([]);
    const [totalSales, setTotalSales] = useState(0);
    const [brandASales, setBrandASales] = useState(0);
    const [brandBSales, setBrandBSales] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [sparklineData, setSparklineData] = useState<{ value: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);

    const loadDashboard = useCallback(async () => {
        setLoading(true);

        try {
            // Midnight local time → ISO
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayIso = todayStart.toISOString();

            // ── Parallel Execution: Fetch all 3 endpoints concurrently ───────────
            const [expensesRes, salesRes, stockRes] = await Promise.all([
                supabase
                    .from('expenses')
                    .select('id, brand_id, description, amount, created_at')
                    .gte('created_at', todayIso)
                    .order('created_at', { ascending: false }),

                supabase
                    .from('sales')
                    .select(`
                        id,
                        brand_id,
                        customer_name,
                        payment_method,
                        total_amount,
                        receipt_no,
                        created_at,
                        sale_items (
                            id,
                            item_name,
                            quantity,
                            unit_price,
                            subtotal
                        )
                    `)
                    .eq('is_voided', false)
                    .gte('created_at', todayIso)
                    .order('created_at', { ascending: false }),

                supabase
                    .from('inventory')
                    .select('id, brand_id, name, price, quantity, created_at')
                    .eq('is_voided', false)
                    .gte('created_at', todayIso)
                    .order('created_at', { ascending: false }),
            ]);

            if (expensesRes.error) throw expensesRes.error;
            if (salesRes.error) throw salesRes.error;
            if (stockRes.error) throw stockRes.error;

            const expensesData = expensesRes.data ?? [];
            const sales = salesRes.data ?? [];
            const stockData = stockRes.data ?? [];

            // ── 1. Calculate Expenses ───────────────────────────────────────────
            const calculatedExpenses = expensesData.reduce(
                (acc, curr) => acc + Number(curr.amount ?? 0),
                0
            );

            // ── 2. Process Sales, Expenses & Stock in Memory ────────────────────
            const brandA: SaleItem[] = [];
            const brandB: SaleItem[] = [];
            const transactionsList: Transaction[] = [];
            let sumTotal = 0;
            let sumBrandA = 0;
            let sumBrandB = 0;
            const hourlySales: Record<number, number> = {};

            // Process Sales
            sales.forEach((sale: any) => {
                const amount = Number(sale.total_amount ?? 0);
                sumTotal += amount;

                const saleHour = new Date(sale.created_at).getHours();
                hourlySales[saleHour] = (hourlySales[saleHour] || 0) + amount;

                let items: PurchasedProduct[] = [];
                if (sale.sale_items?.length > 0) {
                    items = sale.sale_items.map((item: any) => ({
                        id: item.id,
                        name: item.item_name,
                        quantity: Number(item.quantity || 1),
                        price: Number(item.unit_price || amount / (item.quantity || 1)),
                    }));
                } else {
                    items = [
                        {
                            id: sale.id,
                            name: sale.receipt_no ? `Receipt #${sale.receipt_no}` : 'General Sale',
                            quantity: 1,
                            price: amount,
                        },
                    ];
                }

                const mappedSale: SaleItem = {
                    id: sale.id,
                    customerName: sale.customer_name ?? 'Walk-in Customer',
                    amount,
                    date: new Date(sale.created_at).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    paymentMethod: sale.payment_method ?? 'Cash',
                    items,
                };

                const brandKey = normalizeBrand(sale.brand_id);

                if (brandKey === 'brand_a') {
                    brandA.push(mappedSale);
                    sumBrandA += amount;
                } else if (brandKey === 'brand_b') {
                    brandB.push(mappedSale);
                    sumBrandB += amount;
                }

                const primaryItemName = items[0]?.name ?? 'Sale Item';
                const displayItem =
                    items.length > 1
                        ? `${primaryItemName} (+${items.length - 1} more)`
                        : primaryItemName;

                transactionsList.push({
                    id: sale.id,
                    type: 'sale',
                    item: displayItem,
                    amount,
                    brand: String(sale.brand_id ?? ''),
                    timestamp: sale.created_at,
                });
            });

            // Process Expenses -> activity feed
            expensesData.forEach((exp: any) => {
                transactionsList.push({
                    id: exp.id,
                    type: 'expense',
                    item: exp.description || 'Expense',
                    amount: Number(exp.amount ?? 0),
                    brand: String(exp.brand_id ?? ''),
                    timestamp: exp.created_at,
                });
            });

            // Process Stock -> activity feed
            stockData.forEach((stock: any) => {
                transactionsList.push({
                    id: stock.id,
                    type: 'stock',
                    item: stock.name || 'Stock item',
                    amount: Number(stock.price ?? 0) * Number(stock.quantity ?? 0),
                    brand: String(stock.brand_id ?? ''),
                    timestamp: stock.created_at,
                });
            });

            // Sort transactions: Newest first
            transactionsList.sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );

            // ── 3. Generate Sparkline Data ───────────────────────────────────────
            const currentHour = new Date().getHours();
            const generatedSparkline: { value: number }[] = [];
            for (let i = Math.max(0, currentHour - 11); i <= currentHour; i++) {
                generatedSparkline.push({ value: hourlySales[i] || 0 });
            }

            // Batch React state updates together
            setTotalExpenses(calculatedExpenses);
            setTotalSales(sumTotal);
            setBrandASales(sumBrandA);
            setBrandBSales(sumBrandB);
            setBrandASalesData(brandA);
            setBrandBSalesData(brandB);
            setTransactions(transactionsList);
            setSparklineData(generatedSparkline.length > 0 ? generatedSparkline : [{ value: 0 }]);
        } catch (err) {
            console.error('Dashboard Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    return (
        <div className="space-y-5">
            <TotalSalesCard
                totalSales={totalSales}
                brandASales={brandASales}
                brandBSales={brandBSales}
                expenses={totalExpenses}
                sparklineData={sparklineData}
            />

            <BrandSalesCards
                brandASales={brandASales}
                brandBSales={brandBSales}
                brandASalesData={brandASalesData}
                brandBSalesData={brandBSalesData}
            />

            <QuickActions
                onOpenSaleModal={() => setIsSaleModalOpen(true)}
                onOpenStockModal={() => setIsStockModalOpen(true)}
            />

            <ActivityFeed transactions={transactions} />

            <AddSaleModal
                isOpen={isSaleModalOpen}
                onClose={() => setIsSaleModalOpen(false)}
                onSaveSuccess={loadDashboard}
            />

            <AddStockModal
                isOpen={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                onSaveSuccess={loadDashboard}
            />
        </div>
    );
}