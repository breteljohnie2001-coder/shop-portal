import { UserProfile } from '@/types/database';

// Configure the three authorized emails
export const AUTHORIZED_USERS: Record<string, UserProfile> = {
    'boss@email.com': {
        email: 'alexkitheka24@gmail.com',
        role: 'boss',
    },
    'employeeA@email.com': {
        email: 'breteljohnie2001@gmail.com',
        role: 'employee_a',
        assignedBrand: 'Baddie On A Budget Closet',
    },
    'employeeB@email.com': {
        email: 'oulxxtg@gmail.com',
        role: 'employee_b',
        assignedBrand: 'brand_b',
    },
};

export function getUserProfile(email: string): UserProfile | null {
    return AUTHORIZED_USERS[email] || null;
}