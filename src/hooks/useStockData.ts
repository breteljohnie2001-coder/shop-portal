'use client';

import { useState, useEffect, useCallback } from 'react';

import { EditableItem } from '@/components/dashboard/modals/EditStockModal';
import {createClient} from "@/lib/supabase/client";
import {StockItem, UserRole} from "@/types/types";

export function useStockData() {
    const supabase = createClient();

    const [userRole, setUserRole] = useState<UserRole>('employee');
    const [assignedBrand, setAssignedBrand] = useState<string | null>(null);
    const [inventory, setInventory] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch user profile, role, and assigned brand
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
                setAssignedBrand(profile.assigned_brand ? String(profile.assigned_brand).toLowerCase() : null);
            }
        };

        fetchUserProfile();
    }, [supabase]);

    // Fetch inventory list
    const fetchInventory = useCallback(async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .eq('is_voided', false) // Exclude voided stock
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Inventory Error:', error.message);
        } else if (data) {
            const formattedItems: StockItem[] = data.map((item) => ({
                id: item.id,
                name: item.name,
                brandId: String(item.brand_id).toLowerCase(),
                quantity: item.quantity,
                price: item.price,
                imageUrl: item.image || undefined, // Reads the 'image' column from Supabase
                createdAt: new Date(item.created_at),
                fixRequested: item.fix_requested,
                bossApprovedFix: item.boss_approved_fix,
            }));
            setInventory(formattedItems);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const handleSaveEdit = async (updatedItem: EditableItem) => {
        const { error } = await supabase
            .from('inventory')
            .update({
                name: updatedItem.name,
                price: updatedItem.price,
                quantity: updatedItem.quantity,
                boss_approved_fix: false,
                updated_at: new Date().toISOString(),
            })
            .eq('id', updatedItem.id);

        if (error) {
            alert('Failed to update stock item');
            return false;
        }

        setInventory((prev) =>
            prev.map((i) =>
                i.id === updatedItem.id
                    ? { ...i, name: updatedItem.name, price: updatedItem.price, quantity: updatedItem.quantity, bossApprovedFix: false }
                    : i
            )
        );
        return true;
    };

    const handleConfirmVoid = async (itemId: string) => {
        // Perform a soft delete instead of hard delete
        const { error } = await supabase
            .from('inventory')
            .update({ is_voided: true })
            .eq('id', itemId);

        if (error) {
            console.error('Void Error:', error.message);
            alert(`Failed to void stock item: ${error.message}`);
            return false;
        }

        // Remove from UI state
        setInventory((prev) => prev.filter((i) => i.id !== itemId));
        return true;
    };

    const handleRequestFix = async (id: string) => {
        const { error } = await supabase.from('inventory').update({ fix_requested: true }).eq('id', id);
        if (error) {
            alert('Failed to submit fix request');
            return;
        }
        setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, fixRequested: true } : i)));
    };

    const handleApproveFix = async (id: string) => {
        const { error } = await supabase
            .from('inventory')
            .update({ fix_requested: false, boss_approved_fix: true })
            .eq('id', id);

        if (error) {
            alert('Failed to approve fix request');
            return;
        }
        setInventory((prev) =>
            prev.map((i) => (i.id === id ? { ...i, fixRequested: false, bossApprovedFix: true } : i))
        );
    };

    return {
        userRole,
        assignedBrand,
        inventory,
        loading,
        handleSaveEdit,
        handleConfirmVoid,
        handleRequestFix,
        handleApproveFix,
    };
}