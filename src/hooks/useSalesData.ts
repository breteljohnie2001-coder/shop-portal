'use client';

import { useState, useEffect, useCallback } from 'react';

import { EditableSaleItem } from '@/components/dashboard/modals/EditSaleModal';
import { createClient } from "@/lib/supabase/client";
import { PastSale, UserRole } from "@/types/types";

export function useSalesData(selectedDate: string) {
    const supabase = createClient();

    const [userRole, setUserRole] = useState<UserRole>('employee');
    const [assignedBrand, setAssignedBrand] = useState<string | null>(null);
    const [salesList, setSalesList] = useState<PastSale[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch User Profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('role, assigned_brand')
                .eq('id', user.id)
                .single();

            if (profile) {
                setUserRole(profile.role === 'owner' || profile.role === 'boss' ? 'boss' : 'employee');
                setAssignedBrand(profile.assigned_brand ? String(profile.assigned_brand).toLowerCase().trim() : null);
            }
        };

        fetchUserProfile();
    }, [supabase]);

    // 2. Fetch Sales and Nested Sale Items
    const fetchSales = useCallback(async () => {
        setLoading(true);

        // ✅ FIX 1: Construct local EAT boundaries without forcing UTC zero offset
        const startOfDay = new Date(`${selectedDate}T00:00:00`).toISOString();
        const endOfDay = new Date(`${selectedDate}T23:59:59.999`).toISOString();

        let query = supabase
            .from('sales')
            .select(`
                id,
                brand_id,
                total_amount,
                is_voided,
                created_by,
                created_at,
                customer_name,
                payment_method,
                receipt_no,
                fix_requested,
                boss_approved_fix,
                updated_at,
                sale_items (
                    id,
                    item_name,
                    quantity,
                    unit_price,
                    subtotal
                )
            `)
            .eq('is_voided', false)
            .gte('created_at', startOfDay)
            .lte('created_at', endOfDay)
            .order('created_at', { ascending: false });

        // ✅ FIX 2: Apply brand restriction safely if employee
        if (userRole === 'employee' && assignedBrand) {
            // Check lowercase string match or direct match
            query = query.ilike('brand_id', `%${assignedBrand}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase Sales Fetch Error:', error.message);
        } else if (data) {
            const formatted: PastSale[] = data.map((s) => {
                const createdDate = new Date(s.created_at);
                const totalAmount = Number(s.total_amount || 0);

                // Safe line items mapping
                const lineItems = (s.sale_items && s.sale_items.length > 0)
                    ? s.sale_items.map((item: any) => ({
                        id: item.id,
                        name: item.item_name,
                        quantity: Number(item.quantity || 1),
                        price: Number(item.unit_price || (totalAmount / (item.quantity || 1))),
                    }))
                    : [{
                        id: s.id,
                        name: s.receipt_no ? `Receipt #${s.receipt_no}` : 'General Sale Item',
                        quantity: 1,
                        price: totalAmount,
                    }];

                return {
                    id: s.id,
                    receiptNo: s.receipt_no || `REC-${s.id.slice(0, 4).toUpperCase()}`,
                    customerName: s.customer_name || 'Walk-in Customer',
                    brandId: String(s.brand_id || '').toLowerCase().trim(),
                    amount: totalAmount,
                    date: createdDate.toISOString().split('T')[0],
                    time: createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    createdAt: createdDate,
                    paymentMethod: s.payment_method === 'Cash' ? 'Cash' : 'M-Pesa',
                    fixRequested: s.fix_requested || false,
                    bossApprovedFix: s.boss_approved_fix || false,
                    items: lineItems,
                };
            });

            setSalesList(formatted);
        }
        setLoading(false);
    }, [supabase, selectedDate, userRole, assignedBrand]);

    // 3. Real-time Subscription (Sales + Sale Items)
    useEffect(() => {
        fetchSales();

        const channel = supabase
            .channel('realtime_sales_updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'sales' },
                () => fetchSales()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'sale_items' },
                () => fetchSales()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchSales, supabase]);

    // 4. Handle Edit Save
    const handleSaveEdit = async (updatedSale: EditableSaleItem) => {
        const newAmount = updatedSale.quantity * updatedSale.unitPrice;
        const paymentConverted = updatedSale.paymentMethod === 'Cash' ? 'Cash' : 'M-Pesa';

        // Update Master Sale
        const { error: saleError } = await supabase
            .from('sales')
            .update({
                customer_name: updatedSale.clientName,
                payment_method: paymentConverted,
                total_amount: newAmount,
                boss_approved_fix: false,
                updated_at: new Date().toISOString(),
            })
            .eq('id', updatedSale.id);

        if (saleError) {
            console.error('Supabase Sale Update Error:', saleError.message);
            alert(`Failed to update sale details: ${saleError.message}`);
            return false;
        }

        // Update Primary Line Item
        const targetSale = salesList.find((s) => s.id === updatedSale.id);
        if (targetSale && targetSale.items.length > 0) {
            const { error: itemError } = await supabase
                .from('sale_items')
                .update({
                    item_name: updatedSale.itemName,
                    quantity: updatedSale.quantity,
                    unit_price: updatedSale.unitPrice,
                    subtotal: newAmount,
                })
                .eq('id', targetSale.items[0].id);

            if (itemError) {
                console.error('Supabase Sale Item Update Error:', itemError.message);
            }
        }

        await fetchSales();
        return true;
    };

    // 5. Soft Delete (Void)
    const handleConfirmVoid = async (saleId: string) => {
        const { error } = await supabase
            .from('sales')
            .update({ is_voided: true, updated_at: new Date().toISOString() })
            .eq('id', saleId);

        if (error) {
            alert('Failed to void sale');
            return false;
        }

        setSalesList((prev) => prev.filter((s) => s.id !== saleId));
        return true;
    };

    // 6. Request Fix
    const handleRequestFix = async (saleId: string) => {
        const { error } = await supabase
            .from('sales')
            .update({
                fix_requested: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', saleId);

        if (error) {
            console.error('Request Fix Error:', error.message);
            alert(`Failed to submit fix request: ${error.message}`);
            return;
        }

        setSalesList((prev) =>
            prev.map((s) => (s.id === saleId ? { ...s, fixRequested: true } : s))
        );
    };

    // 7. Approve Fix
    const handleApproveFix = async (saleId: string) => {
        const { error } = await supabase
            .from('sales')
            .update({
                fix_requested: false,
                boss_approved_fix: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', saleId);

        if (error) {
            console.error('Approve Fix Error:', error.message);
            alert(`Failed to approve fix: ${error.message}`);
            return;
        }

        setSalesList((prev) =>
            prev.map((s) => (s.id === saleId ? { ...s, fixRequested: false, bossApprovedFix: true } : s))
        );
    };

    return {
        userRole,
        assignedBrand,
        salesList,
        loading,
        handleSaveEdit,
        handleConfirmVoid,
        handleRequestFix,
        handleApproveFix,
    };
}