import DashboardLayout from '../dashboard/layout';
import type { ReactNode } from 'react';

export default function ProjectsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
