import DashboardLayout from '../dashboard/layout';
import type { ReactNode } from 'react';

export default function PrintingPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
