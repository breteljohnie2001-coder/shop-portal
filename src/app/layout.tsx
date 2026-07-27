import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css'; // Correct path for src/app/layout.tsx

export const metadata: Metadata = {
  title: 'Dual Brand Sales Tracker',
  description: 'Unified inventory and sales web application',
};

export default function RootLayout({
                                     children,
                                   }: {
  children: ReactNode;
}) {
  return (
      <html lang="en">
      <body
          className="min-h-full flex flex-col bg-[#0F0F10] text-white"
          suppressHydrationWarning
      >
      {children}
      </body>
      </html>
  );
}
