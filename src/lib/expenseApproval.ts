import { createClient } from '@/lib/supabase/client';

export async function requestExpenseFix(
    expenseId: string,
    requesterName: string,
    reason?: string
) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in.');
    }

    const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .select('id, description, amount, brand_id, created_by')
        .eq('id', expenseId)
        .single();

    if (expenseError || !expense) {
        throw new Error('Expense could not be found.');
    }

    const { error: updateError } = await supabase
        .from('expenses')
        .update({
            fix_requested: true,
            boss_approved_fix: false,
            updated_at: new Date().toISOString(),
        })
        .eq('id', expenseId);

    if (updateError) {
        throw updateError;
    }

    await supabase.rpc('log_activity', {
        p_action: 'REQUEST_FIX_EXPENSE',
        p_entity_type: 'expenses',
        p_entity_id: expenseId,
        p_brand_id: expense.brand_id,
        p_notes: `Fix requested: ${reason || 'No reason provided'}`,
    });

    const { data: bosses, error: bossError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'boss');

    if (bossError) {
        console.error('Boss lookup error:', bossError);
        return true;
    }

    if (bosses?.length) {
        const notifications = bosses.map((boss) => ({
            recipient_id: boss.id,
            sender_id: user.id,
            type: 'FIX_REQUEST_EXPENSE',
            title: 'Expense Approval Required',
            message: `${requesterName} requested a fix for "${expense.description}" (KES ${Number(expense.amount).toLocaleString()}).`,
            expense_id: expenseId,
            is_read: false,
        }));

        const { error: notificationError } = await supabase
            .from('notifications')
            .insert(notifications);

        if (notificationError) {
            console.error(
                'Expense notification error:',
                notificationError
            );
        }
    }

    return true;
}

export async function approveExpenseFix(expenseId: string) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in.');
    }

    const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .select('id, description, amount, brand_id, created_by')
        .eq('id', expenseId)
        .single();

    if (expenseError || !expense) {
        throw new Error('Expense could not be found.');
    }

    const { error: updateError } = await supabase
        .from('expenses')
        .update({
            fix_requested: false,
            boss_approved_fix: true,
            updated_at: new Date().toISOString(),
        })
        .eq('id', expenseId);

    if (updateError) {
        throw updateError;
    }

    await supabase.rpc('log_activity', {
        p_action: 'APPROVE_FIX_EXPENSE',
        p_entity_type: 'expenses',
        p_entity_id: expenseId,
        p_brand_id: expense.brand_id,
        p_old_values: null,
        p_new_values: {
            boss_approved_fix: true,
        },
        p_notes: `Boss approved fix for: ${expense.description}`,
    });

    if (expense.created_by) {
        const { error: notificationError } =
            await supabase
                .from('notifications')
                .insert({
                    recipient_id: expense.created_by,
                    sender_id: user.id,
                    type: 'FIX_APPROVED_EXPENSE',
                    title: 'Expense Fix Approved',
                    message: `Your request to fix "${expense.description}" (KES ${Number(expense.amount).toLocaleString()}) has been approved.`,
                    expense_id: expenseId,
                    is_read: false,
                });

        if (notificationError) {
            console.error(
                'Expense approval notification error:',
                notificationError
            );
        }
    }

    return true;
}