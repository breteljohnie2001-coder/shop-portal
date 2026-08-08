import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Ignored if called from Server Component middleware
                        }
                    },
                },
            }
        );

        // 1. Exchange OAuth code for a session
        const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (!exchangeError && session?.user?.email) {
            const userEmail = session.user.email;

            // 2. Query public.profiles using maybeSingle() so missing records return null instead of throwing an error
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, email')
                .ilike('email', userEmail)
                .maybeSingle();

            // 3. Rejection: If an error occurred or no matching profile exists in public.profiles
            if (profileError || !profile) {
                // Immediately destroy the newly created OAuth session
                await supabase.auth.signOut();

                // Optional: Delete unauthorized auth.users record if using admin API
                return NextResponse.redirect(`${origin}/login?error=unauthorized`);
            }

            // 4. Authorized user -> Proceed to target destination
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Return user to login page on authentication or exchange error
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}