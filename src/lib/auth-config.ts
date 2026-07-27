import { UserProfile } from '@/types/database';

// Configure the three authorized emails
export const AUTHORIZED_USERS: Record<string, UserProfile> = {
    'boss@email.com': {
        email: 'alexkitheka24@gmail.com',
        role: 'boss',
    },
    'breteljohnie2001@gmail.com': {
        email: 'breteljohnie2001@gmail.com',
        role: 'employee_a',
        assignedBrand: 'brand_b', // Fixed: mapped to 'brand_b' instead of display name
    },
    'oulxxtg@gmail.com': {
        email: 'oulxxtg@gmail.com',
        role: 'employee_b',
        assignedBrand: 'brand_a',
    },
};

export function getUserProfile(email: string): UserProfile | null {
    return AUTHORIZED_USERS[email] || null;
}