'use client';

import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
    const supabase = createClient();

    const handleOAuthLogin = async (provider: 'google' | 'apple') => {
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
                {/* Brand Logos Header */}
                <div className="mb-8 flex items-center justify-around border-b pb-6">
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-emerald-600">BRAND A</span>
                        <span className="text-xs text-gray-400">Inventory Portal</span>
                    </div>
                    <div className="h-8 w-[1px] bg-gray-200" />
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-rose-500">BRAND B</span>
                        <span className="text-xs text-gray-400">Inventory Portal</span>
                    </div>
                </div>

                <h2 className="mb-2 text-center text-2xl font-bold text-gray-800">
                    Sign In
                </h2>
                <p className="mb-8 text-center text-sm text-gray-500">
                    Access your unified shop management workspace
                </p>

                {/* OAuth Buttons */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => handleOAuthLogin('google')}
                        className="flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    <button
                        onClick={() => handleOAuthLogin('apple')}
                        className="flex items-center justify-center gap-3 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-900 transition"
                    >
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.12-1 .04-2.22.67-2.92 1.49-.62.72-1.16 1.88-1.01 3.01 1.12.09 2.27-.56 2.94-1.38z" />
                        </svg>
                        Continue with Apple
                    </button>
                </div>
            </div>
        </div>
    );
}