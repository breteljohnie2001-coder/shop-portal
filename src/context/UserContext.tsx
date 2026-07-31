'use client';

import React, { createContext, useContext, ReactNode } from 'react';

export interface AppUser {
    id: string;
    email?: string;
    name: string;
    role: 'boss' | 'employee' | string;
    assignedBrand: 'brand_a' | 'brand_b' | null;
    isBrandLocked: boolean;
}

interface UserContextType {
    user: AppUser | null;
}

const UserContext = createContext<UserContextType>({ user: null });

export function UserProvider({
                                 user,
                                 children,
                             }: {
    user: AppUser | null;
    children: ReactNode;
}) {
    return (
        <UserContext.Provider value={{ user }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}