import './globals.css';
import React from 'react';
import { ThemeProvider } from 'next-themes';
import { ThemeScript } from '@/components/theme/ThemeScript';

export const metadata = {
  title: 'ContriSonics',
  description: '3D GitHub contributions → music',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        <ThemeScript />
        <ThemeProvider defaultTheme="system">{children}</ThemeProvider>
      </body>
    </html>
  );
}
