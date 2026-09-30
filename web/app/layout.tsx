import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Tubo — Invoice Management',
  description: 'Electronic invoice management for Philippine businesses.',
  authors: [{ name: 'Tubo Technologies Inc.' }],
  icons: { icon: [{ url: '/favicon.ico', type: 'image/x-icon' }] },
  openGraph: { type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}