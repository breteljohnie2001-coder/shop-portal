'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Loader2, AlertCircle } from 'lucide-react';

function LoginContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);

  const signInWithGoogle = async () => {
    try {
      setLoadingProvider('google');
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setLoadingProvider(null);
    }
  };

  const signInWithApple = async () => {
    try {
      setLoadingProvider('apple');
      await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      setLoadingProvider(null);
    }
  };

  return (
      <main className="flex min-h-screen items-center justify-center bg-[#0F0F10] px-4 text-white">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[250px] w-[250px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-neutral-800/80 bg-neutral-900/90 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="mb-10 flex items-center justify-center gap-5 border-b border-neutral-800/80 pb-8">
            <div className="flex items-center justify-center h-12 w-28 rounded-xl bg-neutral-950/60 p-2 border border-neutral-800/50">
              <Image
                  src="/baddyOnABudget.png"
                  alt="Baddie On A Budget"
                  width={110}
                  height={36}
                  className="h-8 w-auto object-contain"
                  priority
              />
            </div>

            <span className="text-xl font-light text-neutral-700">/</span>

            <div className="flex items-center justify-center h-12 w-28 rounded-xl bg-neutral-950/60 p-2 border border-neutral-800/50">
              <Image
                  src="/bee-trendy.png"
                  alt="Bee-Trendy Collection"
                  width={110}
                  height={36}
                  className="h-8 w-auto object-contain"
                  priority
              />
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-1">
              <Lock className="h-3 w-3" /> Secure Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              Sign in to manage sales, stock, and expenses across both brands.
            </p>
          </div>

          {/* Display Error Message for Unauthorized Users */}
          {errorParam === 'unauthorized' && (
              <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Your email is not authorized. Please contact an admin.</span>
              </div>
          )}

          <div className="mt-8 space-y-3.5">
            <button
                type="button"
                onClick={signInWithGoogle}
                disabled={loadingProvider !== null}
                className="group flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 text-xs font-semibold text-neutral-200 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-800/80 hover:text-white active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loadingProvider === 'google' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
              ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                    />
                    <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                  </svg>
              )}
              <span>Continue with Google</span>
            </button>

            <button
                type="button"
                onClick={signInWithApple}
                disabled={loadingProvider !== null}
                className="group flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-neutral-700/80 bg-white px-4 text-xs font-semibold text-black transition-all duration-200 hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loadingProvider === 'apple' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-800" />
              ) : (
                  <svg className="h-4 w-4 fill-current text-black" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.73-1.95-14.73-6.23-3.26-2.72-7.14-7.39-11.64-14.02-6.3-9.28-11.28-20.02-14.93-32.22-3.65-12.2-5.48-23.82-5.48-34.86 0-14.46 3.65-26.33 10.96-35.6 7.31-9.28 16.58-13.97 27.81-14.08 4.7 0 9.87 1.15 15.52 3.45 5.65 2.3 9.47 3.45 11.45 3.45 1.52 0 5.48-1.22 11.87-3.66 6.39-2.44 11.83-3.56 16.33-3.35 12.18.98 21.82 5.54 28.92 13.68-10.87 6.63-16.19 15.87-15.97 27.72.22 9.35 3.8 17.18 10.75 23.49 6.96 6.31 15.22 10.01 24.79 11.1-2.5 7.5-5.98 15.22-10.44 23.16zM119.22 31.84c0-7.07 2.58-13.92 7.74-20.55 5.16-6.63 11.63-10.65 19.41-12.06.22 1.09.33 2.07.33 2.94 0 6.96-2.61 13.81-7.83 20.55-5.22 6.74-11.85 10.76-19.89 12.06-.11-.98-.17-1.95-.17-2.94z" />
                  </svg>
              )}
              <span>Continue with Apple</span>
            </button>
          </div>

          <div className="mt-8 text-center text-[11px] text-neutral-500">
            Protected by Supabase Auth RLS & Team Access Controls.
          </div>
        </div>
      </main>
  );
}

export default function LoginPage() {
  return (
      <Suspense
          fallback={
            <main className="flex min-h-screen items-center justify-center bg-[#0F0F10] text-white">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </main>
          }
      >
        <LoginContent />
      </Suspense>
  );
}