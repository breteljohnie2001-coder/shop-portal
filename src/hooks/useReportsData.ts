'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';
import { resolveBrand } from '@/lib/brands';
import {
    ChangeLogItem,
    FastMovingItem,
    NewStockReviewItem,
    RestockAlertItem,
    SlowMovingItem,
    WeeklyBrandPerformance,
} from '@/types/types';

export function useReportsData(
    selectedDateStr: string = new Date().toISOString().split('T')[0]
) {
    const supabase = createClient();
    const { user } = useUser();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['reports-data', selectedDateStr, user?.id],
        queryFn: async () => {
            if (!user) return null;

            // ─── Date ranges (Mon → Sun of the selected week) ───────────────────
            const targetDate = new Date(selectedDateStr);
            const dayOfWeek = targetDate.getDay();
            const distanceToMonday = (dayOfWeek + 6) % 7;

            const startOfWeek = new Date(targetDate);
            startOfWeek.setDate(targetDate.getDate() - distanceToMonday);
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            const startOfDay = new Date(`${selectedDateStr}T00:00:00`).toISOString();
            const endOfDay = new Date(`${selectedDateStr}T23:59:59.999`).toISOString();

            // ─── A. Weekly Brand Performance ────────────────────────────────────
            const { data: weeklySales, error: weeklyErr } = await supabase
                .from('sales')
                .select('brand_id, total_amount, created_at')
                .eq('is_voided', false)
                .gte('created_at', startOfWeek.toISOString())
                .lte('created_at', endOfWeek.toISOString());

            if (weeklyErr) console.error('Weekly Sales Fetch Error:', weeklyErr.message);

            const daysMap: Record<string, { beeTrendy: number; baddie: number }> = {
                Mon: { beeTrendy: 0, baddie: 0 },
                Tue: { beeTrendy: 0, baddie: 0 },
                Wed: { beeTrendy: 0, baddie: 0 },
                Thu: { beeTrendy: 0, baddie: 0 },
                Fri: { beeTrendy: 0, baddie: 0 },
                Sat: { beeTrendy: 0, baddie: 0 },
                Sun: { beeTrendy: 0, baddie: 0 },
            };

            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            (weeklySales || []).forEach((sale) => {
                const sDate = new Date(sale.created_at);
                const dayName = dayNames[sDate.getDay()];
                const brand = resolveBrand(sale.brand_id);
                const amount = Number(sale.total_amount || 0);

                if (daysMap[dayName]) {
                    if (brand === 'bee_trendy') {
                        daysMap[dayName].beeTrendy += amount;
                    } else {
                        daysMap[dayName].baddie += amount;
                    }
                }
            });

            const weeklyPerformance: WeeklyBrandPerformance[] = [
                'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
            ].map((day) => ({
                day,
                beeTrendy: daysMap[day].beeTrendy,
                baddie: daysMap[day].baddie,
            }));

            // ─── B. Daily Fast-Moving Items (Top 3) ─────────────────────────────
            const { data: dailyItems, error: dailyErr } = await supabase
                .from('sale_items')
                .select(`
          id,
          item_name,
          quantity,
          subtotal,
          sales!inner (
            is_voided,
            brand_id,
            created_at
          )
        `)
                .eq('sales.is_voided', false)
                .gte('sales.created_at', startOfDay)
                .lte('sales.created_at', endOfDay);

            if (dailyErr) console.error('Daily Fast Moving Fetch Error:', dailyErr.message);

            const itemAggMap: Record<
                string,
                { name: string; brandId: string; qtySold: number; revenue: number }
            > = {};

            (dailyItems || []).forEach((item: any) => {
                const key = item.item_name;
                if (!itemAggMap[key]) {
                    itemAggMap[key] = {
                        name: item.item_name,
                        brandId: item.sales?.brand_id || '',
                        qtySold: 0,
                        revenue: 0,
                    };
                }
                itemAggMap[key].qtySold += Number(item.quantity || 1);
                itemAggMap[key].revenue += Number(item.subtotal || 0);
            });

            const top3FastMoving: FastMovingItem[] = Object.values(itemAggMap)
                .sort((a, b) => b.qtySold - a.qtySold)
                .slice(0, 3)
                .map((item, idx) => ({ id: `fast-${idx}`, ...item }));

            // ─── C. Inventory (New Stock + Restock + Slow movers) ───────────────
            const { data: stockItems, error: stockErr } = await supabase
                .from('inventory')
                .select(`
          id,
          name,
          brand_id,
          quantity,
          price,
          image,
          created_at,
          sale_items (
            id,
            quantity,
            sales!inner (
              created_at,
              is_voided
            )
          )
        `)
                .eq('is_voided', false)
                .order('created_at', { ascending: false });

            if (stockErr) console.error('Stock Review Fetch Error:', stockErr.message);

            const newStockReview: NewStockReviewItem[] = [];
            const restockingItems: RestockAlertItem[] = [];
            const weeklyItemSalesMap: Record<
                string,
                { name: string; brandId: string; qtySold: number }
            > = {};

            (stockItems || []).forEach((item: any) => {
                // Only count non-voided sales inside the current week
                const weeklySold = (item.sale_items || []).reduce((acc: number, s: any) => {
                    if (s.sales?.is_voided) return acc;
                    const saleDate = new Date(s.sales?.created_at);
                    if (saleDate >= startOfWeek && saleDate <= endOfWeek) {
                        return acc + Number(s.quantity || 1);
                    }
                    return acc;
                }, 0);

                const totalSoldAllTime = (item.sale_items || []).reduce(
                    (acc: number, s: any) => acc + Number(s.quantity || 1),
                    0
                );

                // 1. New stock with low/zero movement (added this week)
                const createdDate = new Date(item.created_at);
                const isRecent = createdDate >= startOfWeek;
                if (isRecent && totalSoldAllTime <= 1) {
                    newStockReview.push({
                        id: item.id,
                        name: item.name,
                        brandId: String(item.brand_id).toLowerCase(),
                        addedDate: createdDate.toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                        }),
                        qtySold: totalSoldAllTime,
                        currentStock: item.quantity,
                        imageUrl: item.image || undefined,
                    });
                }

                // 2. Restock alerts
                const threshold = 3;
                if (item.quantity <= threshold) {
                    restockingItems.push({
                        id: item.id,
                        name: item.name,
                        brandId: String(item.brand_id).toLowerCase(),
                        currentStock: item.quantity,
                        threshold,
                    });
                }

                // 3. Slow-movers (weekly)
                weeklyItemSalesMap[item.id] = {
                    name: item.name,
                    brandId: String(item.brand_id).toLowerCase(),
                    qtySold: weeklySold,
                };
            });

            const slowest3Items: SlowMovingItem[] = Object.entries(weeklyItemSalesMap)
                .map(([id, val]) => ({ id, ...val }))
                .sort((a, b) => a.qtySold - b.qtySold)
                .slice(0, 3);

            // ─── D. Activity Logs ───────────────────────────────────────────────
            const { data: logs, error: logsErr } = await supabase
                .from('activity_logs')
                .select(`
          id,
          created_at,
          action,
          notes,
          new_values,
          profiles!activity_logs_user_id_fkey (
            email
          )
        `)
                .order('created_at', { ascending: false })
                .limit(10);

            if (logsErr) console.error('Activity Logs Fetch Error:', logsErr.message);

            const changeLogs: ChangeLogItem[] = (logs || []).map((log: any) => {
                const rawEmail = log.profiles?.email || 'System';
                const displayName = rawEmail.includes('@')
                    ? rawEmail.split('@')[0]
                    : rawEmail;

                return {
                    id: log.id,
                    time: new Date(log.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    user: displayName,
                    action: log.action.replace('_', ' '),
                    details: log.notes || (log.new_values ? JSON.stringify(log.new_values) : ''),
                };
            });

            return {
                weeklyPerformance,
                top3FastMoving,
                newStockReview,
                restockingItems,
                slowest3Items,
                changeLogs,
            };
        },
        enabled: !!user,
    });

    return {
        reportsData: data,
        loading: isLoading,
        refetchReports: refetch,
    };
}