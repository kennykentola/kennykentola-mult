import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../features/auth/AuthContext';
import { Toaster } from 'react-hot-toast';

import { SocketProvider } from '../features/chat/SocketContext';
import Script from 'next/script';
import { PwaRegistration } from '../components/PwaRegistration';

export const metadata: Metadata = {
  title: 'KennyKentola — Software, Academy, Printing & Solar',
  description: 'KennyKentola is a leading multi-company platform offering Programming Academy courses, custom Software Agency services, IT Maintenance, Graphic & Printing, and Solar Installation in Nigeria and worldwide.',
  keywords: 'KennyKentola, Kenny Kentola,kennykentola-digital, digital-kentola, kenny-kentola-digital, digital, software agency, programming academy, web development, app development, solar installation, printing press, Ibadan, Lagos, Nigeria',
  applicationName: 'KennyKentola',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'KennyKentola',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/favicon.png' },
      { url: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/pwa-icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
  openGraph: {
    title: 'KennyKentola',
    description: 'Learn, Build, Print, Power with KennyKentola',
    url: 'https://kennykentola.dpdns.org',
    siteName: 'KennyKentola',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CR4LWR93DK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          
            gtag('config', 'G-CR4LWR93DK');
          `}
        </Script>

        {/* Google AdSense Script - Only renders if NEXT_PUBLIC_ADSENSE_ID is set in .env */}
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <PwaRegistration />
        <AuthProvider>
          <SocketProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: '#0f172a', // slate-900
                  color: '#fff',
                  border: '1px solid #1e293b', // slate-800
                },
                success: {
                  iconTheme: {
                    primary: '#10b981', // emerald-500
                    secondary: '#fff',
                  },
                },
              }}
            />
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
