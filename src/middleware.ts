import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 1. Skip middleware for OAuth callback so session exchange happens smoothly
    if (pathname.startsWith('/auth/callback')) {
        return NextResponse.next();
    }

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

    // Refresh auth session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isLoginPage = pathname === '/';

    // Helper to retain cookies during redirects
    const redirectWithCookies = (url: URL) => {
        const redirectResponse = NextResponse.redirect(url);
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value);
        });
        return redirectResponse;
    };

    // 2. Unauthenticated user trying to access protected routes -> send to login
    if (!user && !isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return redirectWithCookies(url);
    }

    // 3. Authenticated user on login page -> send to dashboard
    if (user && isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return redirectWithCookies(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};