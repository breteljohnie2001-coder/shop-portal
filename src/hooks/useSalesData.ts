'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PastSale } from '@/types/types';
import { useUser } from '@/context/UserContext';
import { EditableSaleItem } from '@/components/dashboard/modals/EditSaleModal';

export function useSalesData(selectedDate: string) {
    const supabase = createClient();
    const queryClient = useQueryClient();
    const { user } = useUser();

    const userRole = user?.role === 'boss' ? 'boss' : 'employee';
    const assignedBrand = user?.assignedBrand || null;
    const isBrandLocked = user?.isBrandLocked ?? false;

    // ─── 1. Query: Fetch Sales ───────────────────────────────────────────────
    const { data: salesList = [], isLoading: loading } = useQuery<PastSale[]>({
        queryKey: ['sales', selectedDate, user?.id, isBrandLocked, assignedBrand],
        queryFn: async () => {
            if (!user) return [];

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
                        subtotal,
                        size,
                        color,
                        variant_id
                    )
                `)
                .eq('is_voided', false)
                .gte('created_at', startOfDay)
                .lte('created_at', endOfDay)
                .order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) {
                console.error('Supabase Sales Fetch Error:', error.message);
                throw error;
            }

            return (data || []).map((s: any): PastSale => {
                const createdDate = new Date(s.created_at);
                const totalAmount = Number(s.total_amount || 0);

                const lineItems = s.sale_items && s.sale_items.length > 0
                    ? s.sale_items.map((item: any) => ({
                        id: item.id,
                        name: item.item_name,
                        quantity: Number(item.quantity || 1),
                        price: Number(item.unit_price || totalAmount / (item.quantity || 1)),
                        size: item.size || null,
                        color: item.color || null,
                        variantId: item.variant_id || null,
                    }))
                    : [{
                        id: s.id,
                        name: s.receipt_no ? `Receipt #${s.receipt_no}` : 'General Sale Item',
                        quantity: 1,
                        price: totalAmount,
                        size: null,
                        color: null,
                        variantId: null,
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
        },
        enabled: !!user && !!selectedDate,
    });

    // Helper to invalidate cache across date views
    const invalidateSales = () => queryClient.invalidateQueries({ queryKey: ['sales'] });

    // ─── 2. Mutations ────────────────────────────────────────────────────────
    const editMutation = useMutation({
        mutationFn: async (updatedSale: EditableSaleItem) => {
            // 1. Find the target sale FIRST so it's available throughout the mutation
            const targetSale = salesList.find((s) => s.id === updatedSale.id);

            const newAmount = updatedSale.quantity * updatedSale.unitPrice;
            const paymentConverted = updatedSale.paymentMethod === 'Cash' ? 'Cash' : 'M-Pesa';

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

            if (saleError) throw saleError;

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

                if (itemError) console.error('Sale Item Update Error:', itemError.message);
            }

            // 2. Log activity using targetSale
            await supabase.rpc('log_activity', {
                p_action: 'EDIT_SALE',
                p_entity_type: 'sales',
                p_entity_id: updatedSale.id,
                p_brand_id: targetSale?.brandId || assignedBrand || null,
                p_notes: `Updated sale #${targetSale?.receiptNo || updatedSale.id}: ${updatedSale.itemName} (${updatedSale.quantity}x @ KES ${updatedSale.unitPrice})`,
            });
        },
        onSuccess: invalidateSales,
    });

    const voidMutation = useMutation({
        mutationFn: async (saleId: string) => {
            // Find targetSale at the top of the function scope
            const targetSale = salesList.find((s) => s.id === saleId);

            const { error } = await supabase
                .from('sales')
                .update({ is_voided: true, updated_at: new Date().toISOString() })
                .eq('id', saleId);

            if (error) throw error;

            await supabase.rpc('log_activity', {
                p_action: 'VOID_SALE',
                p_entity_type: 'sales',
                p_entity_id: saleId,
                p_brand_id: targetSale?.brandId || assignedBrand || null,
                p_notes: `Voided sale #${targetSale?.receiptNo || saleId} (KES ${targetSale?.amount || 0})`,
            });
        },
        onSuccess: invalidateSales,
    });

    const fixMutation = useMutation({
        mutationFn: async ({ saleId, fixRequested, bossApprovedFix }: { saleId: string; fixRequested: boolean; bossApprovedFix: boolean }) => {
            // 1. Find the target sale
            const targetSale = salesList.find((s) => s.id === saleId);

            // 2. Compute actionName in the top-level scope of mutationFn
            const actionName = fixRequested
                ? 'REQUEST_FIX_SALE'
                : bossApprovedFix
                    ? 'APPROVE_FIX_SALE'
                    : 'UPDATE_SALE_FIX';

            // 3. Update database
            const { error } = await supabase
                .from('sales')
                .update({
                    fix_requested: fixRequested,
                    boss_approved_fix: bossApprovedFix,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', saleId);

            if (error) throw error;

            // 4. Log activity using actionName
            await supabase.rpc('log_activity', {
                p_action: actionName,
                p_entity_type: 'sales',
                p_entity_id: saleId,
                p_brand_id: targetSale?.brandId || assignedBrand || null,
                p_notes: `${fixRequested ? 'Fix requested' : 'Fix approved'} for sale #${targetSale?.receiptNo || saleId}`,
            });
        },
        onSuccess: invalidateSales,
    });

    return {
        userRole,
        assignedBrand,
        salesList,
        loading,
        handleSaveEdit: async (updatedSale: EditableSaleItem) => {
            try {
                await editMutation.mutateAsync(updatedSale);
                return true;
            } catch (err) {
                return false;
            }
        },
        handleConfirmVoid: async (saleId: string) => {
            try {
                await voidMutation.mutateAsync(saleId);
                return true;
            } catch (err) {
                return false;
            }
        },
        handleRequestFix: (saleId: string) => fixMutation.mutate({ saleId, fixRequested: true, bossApprovedFix: false }),
        handleApproveFix: (saleId: string) => fixMutation.mutate({ saleId, fixRequested: false, bossApprovedFix: true }),
    };
}