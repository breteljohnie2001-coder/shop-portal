import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
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
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        supabaseResponse.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // Only refresh the session (this is required)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isLoginPage = pathname === '/';

    // Helper to keep cookies when redirecting
    const redirectWithCookies = (url: URL) => {
        const redirectResponse = NextResponse.redirect(url);
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value);
        });
        return redirectResponse;
    };

    // 1. Not logged in → force to login page
    if (!user && !isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return redirectWithCookies(url);
    }

    // 2. Logged in + on login page → go to dashboard
    if (user && isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return redirectWithCookies(url);
    }

    // No more profiles query on every navigation
    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};