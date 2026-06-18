import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../features/auth/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Learn, Build, Print, Power - Platform',
  description: 'One platform integrating Programming Academy, Software Agency, App Maintenance, Graphic & Printing, and Solar Installation services.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  );
}
