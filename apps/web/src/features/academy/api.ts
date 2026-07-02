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
  isLocked?: boolean;
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
  enrollment?: any;
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
  return academyFetch<AcademyCourseDetailResponse>(`/courses/${courseId}`, undefined, true);
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



export function fetchWorkspaceCode(courseId: string, lessonId: string) {
  return academyFetch<{ workspace: { code: string; language: string } | null }>(
    `/courses/${courseId}/lessons/${lessonId}/workspace`,
    {},
    true
  );
}

export function saveWorkspaceCode(courseId: string, lessonId: string, code: string, language: string) {
  return academyFetch<{ message: string }>(
    `/courses/${courseId}/lessons/${lessonId}/workspace`,
    {
      method: 'POST',
      body: JSON.stringify({ code, language })
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
    },
    true
  );
}

export async function submitCoursePayment(courseId: string, base64Image: string, amount: number) {
  const token = await getSessionJwt();
  if (!token) throw new Error('Not authenticated');

  const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/payments/upload-receipt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ file: base64Image, filename: `course-receipt-${Date.now()}.jpg` })
  });
  if (!uploadRes.ok) {
    const errorData = await uploadRes.json();
    throw new Error(errorData?.error || 'Failed to upload receipt');
  }
  const { url } = await uploadRes.json();

  const submitRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/payments/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      type: 'course',
      referenceId: courseId,
      amount: amount,
      receiptImage: url,
      referenceNumber: `TRX-${Date.now()}`,
      bankAccountId: 'default'
    })
  });

  if (!submitRes.ok) {
    const errorData = await submitRes.json();
    throw new Error(errorData?.error || 'Failed to submit payment');
  }
  
  return await submitRes.json();
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
  isPublished: boolean;
};

export interface QuizAttemptDto {
  $id: string;
  quizId: string;
  studentId: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  createdAt: string;
}

export type QuizQuestionDto = {
  $id?: string;
  quizId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC?: string;
  optionD?: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  points?: number;
  order?: number;
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

export function fetchQuizQuestions(quizId: string) {
  return academyFetch<{ questions: QuizQuestionDto[] }>(`/quizzes/${quizId}/questions`, undefined, true);
}

export function addQuizQuestion(quizId: string, payload: Partial<QuizQuestionDto>) {
  return academyFetch<{ question: QuizQuestionDto }>(`/quizzes/${quizId}/questions`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }, true);
}

export function updateQuizQuestion(questionId: string, payload: Partial<QuizQuestionDto>) {
  return academyFetch<{ question: QuizQuestionDto }>(`/quiz_questions/${questionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  }, true);
}

export function deleteQuizQuestion(questionId: string) {
  return academyFetch<{ message: string }>(`/quiz_questions/${questionId}`, {
    method: 'DELETE'
  }, true);
}

export function submitQuizAttempt(quizId: string, payload: Partial<QuizAttemptDto>) {
  return academyFetch<{ message: string; attempt: QuizAttemptDto }>(`/quizzes/${quizId}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }, true);
}

export function fetchQuizAttempt(quizId: string) {
  return academyFetch<{ attempt: QuizAttemptDto | null }>(`/quizzes/${quizId}/attempt`, undefined, true);
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

export function fetchCourseRatingsAggregate() {
  return academyFetch<{ ratings: Record<string, { averageRating: number; ratingCount: number }> }>('/courses/ratings/aggregate');
}

export function submitTestimonial(courseId: string, payload: { content: string; rating: number }) {
  return academyFetch<{ message: string; testimonial: TestimonialDto }>(`/courses/${courseId}/testimonials`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }, true);
}

export type QnaThreadDto = {
  $id: string;
  courseId: string;
  lessonId: string;
  userId: string;
  authorName: string;
  content: string;
  repliesCount: number;
  createdAt: string;
};

export type QnaReplyDto = {
  $id: string;
  qnaId: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export function fetchCourseQna(courseId: string, lessonId?: string) {
  const query = lessonId ? '?lessonId=' + lessonId : '';
  return academyFetch<{ threads: QnaThreadDto[] }>(`/courses/${courseId}/qna${query}`, undefined, true);
}

export function createQnaThread(courseId: string, lessonId: string, content: string) {
  return academyFetch<{ thread: QnaThreadDto }>(`/courses/${courseId}/qna`, {
    method: 'POST',
    body: JSON.stringify({ lessonId, content })
  }, true);
}

export function fetchQnaReplies(qnaId: string) {
  return academyFetch<{ replies: QnaReplyDto[] }>(`/qna/${qnaId}/replies`, undefined, true);
}

export function createQnaReply(qnaId: string, content: string) {
  return academyFetch<{ reply: QnaReplyDto }>(`/qna/${qnaId}/replies`, {
    method: 'POST',
    body: JSON.stringify({ content })
  }, true);
}
