import './globals.css';
import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
  title: 'ContriSonics',
  description: '3D GitHub contributions → music',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
