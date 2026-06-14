import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../features/auth/AuthContext';

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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
