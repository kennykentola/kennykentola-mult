import { redirect } from 'next/navigation';

export default function LegacyDashboardCoursesPage() {
  redirect('/student/courses');
}
