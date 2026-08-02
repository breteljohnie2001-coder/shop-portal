'use client';

import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useReportsData } from '@/hooks/useReportsData';
import {ReportsHeader} from "@/app/dashboard/reports/ReportsHeader";
import {WeeklyBrandChart} from "@/app/dashboard/reports/WeeklyBrandChart";
import {StockAuditSection} from "@/app/dashboard/reports/StockAuditSection";
import {ChangeLogsTable} from "@/app/dashboard/reports/ChangeLogsTable";
import {NewStockReview} from "@/app/dashboard/reports/NewStockReview";
import {FastMovingItems} from "@/app/dashboard/reports/FastMovingItems";
import {BrandKey, resolveBrand} from "@/lib/brands";


export default function ReportsPage() {
    const [selectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [brandFilter, setBrandFilter] = useState<BrandKey>('bee_trendy');

    const { reportsData, loading } = useReportsData(selectedDate);

    // Filter the four sections by selected brand
    const filtered = useMemo(() => {
        if (!reportsData) return null;

        const match = (brandId: string) => resolveBrand(brandId) === brandFilter;

        return {
            top3FastMoving: reportsData.top3FastMoving.filter((i) => match(i.brandId)),
            newStockReview: reportsData.newStockReview.filter((i) => match(i.brandId)),
            restockingItems: reportsData.restockingItems.filter((i) => match(i.brandId)),
            slowest3Items: reportsData.slowest3Items.filter((i) => match(i.brandId)),
            // Change logs currently have no brand_id.
            // We keep them unfiltered for now (or you can later add brand to the query).
            changeLogs: reportsData.changeLogs,
        };
    }, [reportsData, brandFilter]);

    if (loading || !reportsData || !filtered) {
        return (
            <div className="flex h-96 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <ReportsHeader
                selectedDate={selectedDate}
                brandFilter={brandFilter}
                onBrandChange={setBrandFilter}
            />

            {/* Always shows both brands */}
            <WeeklyBrandChart data={reportsData.weeklyPerformance} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FastMovingItems items={filtered.top3FastMoving} />
                <NewStockReview items={filtered.newStockReview} />
            </div>

            <StockAuditSection
                restocking={filtered.restockingItems}
                slowest={filtered.slowest3Items}
            />

            <ChangeLogsTable logs={filtered.changeLogs} />
        </div>
    );
}