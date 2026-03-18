import './globals.css';
import React from 'react';

export const metadata = {
  title: 'ContriSonics',
  description: '3D GitHub contributions → music',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        {children}
      </body>
    </html>
  );
}
