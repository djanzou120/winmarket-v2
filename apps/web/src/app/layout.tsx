import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloWrapper } from '@/lib/apollo-wrapper';
import { AuthProvider } from '@/lib/auth-provider';
import { SkipToContent } from '@/components/ui/SkipToContent';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WinMarket V2 - Multi-Model Marketplace',
  description: 'Buy and sell products on our B2B/B2C/C2C marketplace platform',
  keywords: 'marketplace, e-commerce, buy, sell, products, B2B, B2C, C2C',
  authors: [{ name: 'WinMarket Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'WinMarket V2 - Multi-Model Marketplace',
    description: 'Buy and sell products on our B2B/B2C/C2C marketplace platform',
    url: 'https://winmarket.com',
    siteName: 'WinMarket',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WinMarket V2 - Multi-Model Marketplace',
    description: 'Buy and sell products on our B2B/B2C/C2C marketplace platform',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={inter.className}>
        <SkipToContent />
        <ApolloWrapper>
          <AuthProvider>
            <div id="root" className="min-h-screen bg-gray-50">
              {children}
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#10B981',
                    color: '#fff',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#10B981',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: '#EF4444',
                    color: '#fff',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#EF4444',
                  },
                },
              }}
              aria-live="polite"
              aria-atomic="true"
            />
          </AuthProvider>
        </ApolloWrapper>

        {/* Screen reader announcements region */}
        <div
          id="announcements"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </body>
    </html>
  );
}