import DashboardLayout from '../dashboard/layout';
import type { ReactNode } from 'react';

export default function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
