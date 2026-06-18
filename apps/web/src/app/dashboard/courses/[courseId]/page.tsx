import { redirect } from 'next/navigation';

export default async function LegacyDashboardCoursePage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  redirect(`/student/courses/${courseId}`);
}
