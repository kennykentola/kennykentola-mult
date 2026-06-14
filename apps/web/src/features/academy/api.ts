import { getSessionJwt } from '../../lib/sessionJwt';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/academy`;

export type AcademyCourseDto = {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  slug?: string;
  category?: string;
  level?: string;
  summary?: string;
  coverImage?: string;
  price: number;
  isPublished: boolean;
  lessonCount: number;
};

export type AcademyLessonDto = {
  id: string;
  courseId: string;
  title: string;
  content?: string;
  videoUrl?: string;
  order: number;
  durationMinutes?: number;
  isPreview?: boolean;
};

export type AcademySubmissionDto = {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrls: string[];
  studentNote?: string;
  pointsAwarded?: number | null;
  feedback?: string;
  status: string;
  submittedAt?: string;
  updatedAt?: string;
};

export type AcademySubmissionReviewDto = {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  fileUrls: string[];
  studentNote?: string;
  pointsAwarded?: number | null;
  feedback?: string;
  status: string;
  submittedAt?: string;
  updatedAt?: string;
  course: {
    id: string;
    title: string;
    instructorName: string;
  };
  assignment: {
    id: string;
    title: string;
    dueDate: string;
    maxPoints: number;
  };
};

export type AcademyAssignmentDto = {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  dueDate: string;
  maxPoints: number;
  submission?: AcademySubmissionDto | null;
};

export type AcademyLiveClassDto = {
  id: string;
  courseId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl: string;
  status: string;
};

export type AcademyEnrollmentDto = {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedLessons: number;
  lastLessonId?: string;
  status: string;
  enrolledAt?: string;
  updatedAt?: string;
  course: AcademyCourseDto;
  nextLesson: AcademyLessonDto | null;
};

export type AcademyProgressResponse = {
  summary: {
    enrolledCourses: number;
    completedLessons: number;
    activeCatalogCourses: number;
  };
  enrollments: AcademyEnrollmentDto[];
};

export type AcademyCatalogResponse = {
  courses: AcademyCourseDto[];
  total: number;
};

export type AcademyCourseDetailResponse = {
  course: AcademyCourseDto;
  lessons: AcademyLessonDto[];
};

export type AcademyAssignmentsResponse = {
  assignments: AcademyAssignmentDto[];
};

export type AcademyLiveClassesResponse = {
  liveClasses: AcademyLiveClassDto[];
};

export type AcademySubmissionReviewsResponse = {
  submissions: AcademySubmissionReviewDto[];
  total: number;
};

type AcademyResponse<T> = T;

async function getJwt() {
  return getSessionJwt();
}

async function academyFetch<T>(path: string, init?: RequestInit, requireAuth = false): Promise<AcademyResponse<T>> {
  const headers = new Headers(init?.headers || {});
  headers.set('Content-Type', 'application/json');

  if (requireAuth) {
    const jwt = await getJwt();
    headers.set('Authorization', `Bearer ${jwt}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || 'Academy request failed');
  }

  return payload as AcademyResponse<T>;
}

export function fetchAcademyCatalog() {
  return academyFetch<AcademyCatalogResponse>('/courses');
}

export function fetchAcademyCourse(courseId: string) {
  return academyFetch<AcademyCourseDetailResponse>(`/courses/${courseId}`);
}

export function fetchAcademyProgress() {
  return academyFetch<AcademyProgressResponse>('/me/progress', undefined, true);
}

export function fetchAcademyAssignments(courseId: string) {
  return academyFetch<AcademyAssignmentsResponse>(`/courses/${courseId}/assignments`);
}

export function fetchMyAcademyAssignments(courseId: string) {
  return academyFetch<AcademyAssignmentsResponse>(`/courses/${courseId}/assignments/me`, undefined, true);
}

export function fetchAcademyLiveClasses(courseId: string) {
  return academyFetch<AcademyLiveClassesResponse>(`/courses/${courseId}/live-classes`);
}

export function enrollInAcademyCourse(courseId: string) {
  return academyFetch<{ message: string; enrollment: AcademyEnrollmentDto }>('/courses/' + courseId + '/enroll', {
    method: 'POST'
  }, true);
}

export function updateAcademyCourseProgress(
  courseId: string,
  payload: { progress?: number; completedLessons?: number; lastLessonId?: string }
) {
  return academyFetch<{ message: string; enrollment: AcademyEnrollmentDto }>(
    '/courses/' + courseId + '/progress',
    {
      method: 'PATCH',
      body: JSON.stringify(payload)
    },
    true
  );
}

export function submitAcademyAssignment(
  assignmentId: string,
  payload: { fileUrls: string[]; studentNote?: string }
) {
  return academyFetch<{ message: string; submission: AcademySubmissionDto }>(
    `/assignments/${assignmentId}/submissions`,
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    true
  );
}

export function fetchAcademySubmissions(filters?: {
  courseId?: string;
  assignmentId?: string;
  status?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.courseId) params.set('courseId', filters.courseId);
  if (filters?.assignmentId) params.set('assignmentId', filters.assignmentId);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.limit) params.set('limit', String(filters.limit));

  const query = params.toString();
  return academyFetch<AcademySubmissionReviewsResponse>(`/admin/submissions${query ? `?${query}` : ''}`, undefined, true);
}

export function gradeAcademySubmission(
  submissionId: string,
  payload: { pointsAwarded?: number; feedback?: string; status?: 'graded' | 'pending' }
) {
  return academyFetch<{ message: string; submission: AcademySubmissionDto }>(
    `/admin/submissions/${submissionId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload)
    },
    true
  );
}

export type StudentAssignmentDto = {
  id: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  title: string;
  instructions: string;
  dueDate: string;
  maxPoints: number;
  submission: AcademySubmissionDto | null;
};

export type StudentAssignmentsResponse = {
  assignments: StudentAssignmentDto[];
};

export function fetchStudentAssignments() {
  return academyFetch<StudentAssignmentsResponse>('/student/assignments', undefined, true);
}

export type LessonProgressDto = {
  $id?: string;
  studentId: string;
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  lastPosition?: number;
  completedAt?: string;
};

export function fetchLessonProgress(courseId: string) {
  return academyFetch<{ lessonProgress: LessonProgressDto[] }>(`/courses/${courseId}/lesson-progress`, undefined, true);
}

export function updateLessonProgress(
  lessonId: string,
  payload: { courseId: string; isCompleted?: boolean; lastPosition?: number }
) {
  return academyFetch<{ message: string; progress: LessonProgressDto }>(
    `/lessons/${lessonId}/progress`,
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    true
  );
}

export type QuizDto = {
  $id?: string;
  courseId: string;
  moduleId?: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  passingScore: number;
  questions: string;
};

export type QuizAttemptDto = {
  $id?: string;
  quizId: string;
  studentId: string;
  courseId: string;
  score: number;
  passed: boolean;
  startedAt: string;
  completedAt?: string;
  answers: string;
};

export function fetchCourseQuizzes(courseId: string) {
  return academyFetch<{ quizzes: QuizDto[] }>(`/courses/${courseId}/quizzes`, undefined, true);
}

export function createQuiz(courseId: string, payload: Partial<QuizDto>) {
  return academyFetch<{ message: string; quiz: QuizDto }>(`/courses/${courseId}/quizzes`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }, true);
}

export function updateQuiz(quizId: string, payload: Partial<QuizDto>) {
  return academyFetch<{ message: string; quiz: QuizDto }>(`/quizzes/${quizId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  }, true);
}

export function deleteQuiz(quizId: string) {
  return academyFetch<{ message: string }>(`/quizzes/${quizId}`, {
    method: 'DELETE'
  }, true);
}

export function submitQuizAttempt(quizId: string, payload: Partial<QuizAttemptDto>) {
  return academyFetch<{ message: string; attempt: QuizAttemptDto }>(`/quizzes/${quizId}/attempts`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }, true);
}

export function fetchMyQuizAttempts(courseId: string) {
  return academyFetch<{ attempts: QuizAttemptDto[] }>(`/courses/${courseId}/quiz-attempts/me`, undefined, true);
}

// Testimonials
export type TestimonialDto = {
  $id?: string;
  userId: string;
  authorName: string;
  courseId?: string;
  content: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
};

export function fetchCourseTestimonials(courseId: string) {
  return academyFetch<{ testimonials: TestimonialDto[] }>(`/courses/${courseId}/testimonials`);
}

export function submitTestimonial(courseId: string, payload: { content: string; rating: number }) {
  return academyFetch<{ message: string; testimonial: TestimonialDto }>(`/courses/${courseId}/testimonials`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }, true);
}
