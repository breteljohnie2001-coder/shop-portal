import { createClient } from '@/lib/supabase/client';

interface SaleInfo {
    id: string;
    receipt_no: string | null;
    created_by: string | null;
    brand_id: string | null;
}

export async function requestSaleFix(saleId: string) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in.');
    }

    // Get sale information
    const { data: sale, error: saleError } = await supabase
        .from('sales')
        .select('id, receipt_no, created_by, brand_id')
        .eq('id', saleId)
        .single();

    if (saleError || !sale) {
        throw new Error('Sale could not be found.');
    }

    // Mark sale as requiring approval
    const { error: updateError } = await supabase
        .from('sales')
        .update({
            fix_requested: true,
            boss_approved_fix: false,
            updated_at: new Date().toISOString(),
        })
        .eq('id', saleId);

    if (updateError) throw updateError;

    // Log activity
    const { error: activityError } = await supabase.rpc(
        'log_activity',
        {
            p_action: 'REQUEST_FIX_SALE',
            p_entity_type: 'sales',
            p_entity_id: saleId,
            p_brand_id: sale.brand_id,
            p_notes: `Fix requested for sale #${
                sale.receipt_no || saleId
            }`,
        }
    );

    if (activityError) {
        console.error(
            'Activity log error:',
            activityError
        );
    }

    // Find all bosses
    const { data: bosses, error: bossError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'boss');

    if (bossError) {
        console.error(
            'Boss lookup error:',
            bossError
        );
        return;
    }

    // Notify bosses
    if (bosses && bosses.length > 0) {
        const notifications = bosses.map((boss) => ({
            recipient_id: boss.id,
            sender_id: user.id,
            type: 'FIX_REQUEST',
            title: 'Approval Required',
            message: `${user.user_metadata?.name || 'An employee'} requested approval to fix Sale #${
                sale.receipt_no || saleId
            }.`,
            sale_id: saleId,
            is_read: false,
        }));

        const { error: notificationError } =
            await supabase
                .from('notifications')
                .insert(notifications);

        if (notificationError) {
            console.error(
                'Notification Error:',
                notificationError
            );
        }
    }
}


export async function approveSaleFix(saleId: string) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in.');
    }

    // Get sale information
    const { data: sale, error: saleError } = await supabase
        .from('sales')
        .select('id, receipt_no, created_by, brand_id')
        .eq('id', saleId)
        .single();

    if (saleError || !sale) {
        throw new Error('Sale could not be found.');
    }

    // Approve the fix
    const { error: updateError } = await supabase
        .from('sales')
        .update({
            fix_requested: false,
            boss_approved_fix: true,
            updated_at: new Date().toISOString(),
        })
        .eq('id', saleId);

    if (updateError) throw updateError;

    // Log activity
    const { error: activityError } = await supabase.rpc(
        'log_activity',
        {
            p_action: 'APPROVE_FIX_SALE',
            p_entity_type: 'sales',
            p_entity_id: saleId,
            p_brand_id: sale.brand_id,
            p_notes: `Fix approved for sale #${
                sale.receipt_no || saleId
            }`,
        }
    );

    if (activityError) {
        console.error(
            'Activity log error:',
            activityError
        );
    }

    // Notify employee who created the sale
    if (sale.created_by) {
        const { error: notificationError } =
            await supabase
                .from('notifications')
                .insert({
                    recipient_id: sale.created_by,
                    sender_id: user.id,
                    type: 'FIX_APPROVED',
                    title: 'Fix Approved',
                    message: `Your request to fix Sale #${
                        sale.receipt_no || saleId
                    } has been approved.`,
                    sale_id: saleId,
                    is_read: false,
                });

        if (notificationError) {
            console.error(
                'Approval notification error:',
                notificationError
            );
        }
    }

    return true;
}