import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navigation } from '@/components/layout/Navigation';
import { MobileNav } from '@/components/layout/MobileNav';
import { PwaInit } from '@/components/PwaInit';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Studer — Focus Cockpit',
  description: 'Minimalist, gamified study tracker for exam periods.',
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/logo.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/logo.svg', type: 'image/svg+xml' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Studer',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#080c14' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <Providers>
          <PwaInit />
          <div className="flex flex-col min-h-screen">
            <Navigation />
            {/* pb-[calc(56px+env(safe-area-inset-bottom))] reserves space for the mobile bottom nav */}
            <main className="flex-1 pb-[72px] sm:pb-0">
              {children}
            </main>
            <MobileNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
