import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Your login page is the root "/"
    const isLoginPage = pathname === '/';

    // 1. Not logged in and trying to access anything except the login page
    if (!user && !isLoginPage) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/';
        return NextResponse.redirect(redirectUrl);
    }

    // 2. User is logged in → check if they exist in profiles
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id) // recommended (better than matching by email)
            .maybeSingle();

        // Not pre-registered → sign out and send back to login
        if (!profile) {
            await supabase.auth.signOut();
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = '/';
            redirectUrl.searchParams.set('error', 'unauthorized');
            return NextResponse.redirect(redirectUrl);
        }

        // Logged-in user is on the login page → send them to dashboard
        if (isLoginPage) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = '/dashboard';
            return NextResponse.redirect(redirectUrl);
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};