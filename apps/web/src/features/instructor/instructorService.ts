// Instructor Service — Frontend API communication layer

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('session_jwt') : null;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return res.json();
}

/** Get all courses managed/created by this instructor */
export async function getInstructorCourses() {
  const data = await fetchWithAuth(`${API_BASE}/academy/instructor/courses`);
  return data.courses;
}

/** Create a new course */
export async function createCourse(payload: {
  title: string;
  description: string;
  category?: string;
  level?: string;
  summary?: string;
  coverImage?: string;
  price?: number;
  isPublished?: boolean;
}) {
  const data = await fetchWithAuth(`${API_BASE}/academy/courses`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.course;
}

/** Update an existing course */
export async function updateCourse(courseId: string, payload: Partial<{
  title: string;
  description: string;
  category?: string;
  level?: string;
  summary?: string;
  coverImage?: string;
  price?: number;
  isPublished?: boolean;
}>) {
  const data = await fetchWithAuth(`${API_BASE}/academy/courses/${courseId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data.course;
}

/** Create a new lesson under a course */
export async function createLesson(courseId: string, payload: {
  title: string;
  content?: string;
  videoUrl?: string;
  order: number;
  durationMinutes?: number;
  isPreview?: boolean;
}) {
  const data = await fetchWithAuth(`${API_BASE}/academy/courses/${courseId}/lessons`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.lesson;
}

/** Update an existing lesson */
export async function updateLesson(lessonId: string, payload: Partial<{
  title: string;
  content?: string;
  videoUrl?: string;
  order: number;
  durationMinutes?: number;
  isPreview?: boolean;
}>) {
  const data = await fetchWithAuth(`${API_BASE}/academy/lessons/${lessonId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data.lesson;
}

/** Delete a lesson */
export async function deleteLesson(lessonId: string) {
  const data = await fetchWithAuth(`${API_BASE}/academy/lessons/${lessonId}`, {
    method: 'DELETE',
  });
  return data;
}

/** Create a new assignment under a course */
export async function createAssignment(courseId: string, payload: {
  title: string;
  instructions: string;
  dueDate: string;
  maxPoints?: number;
}) {
  const data = await fetchWithAuth(`${API_BASE}/academy/courses/${courseId}/assignments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.assignment;
}

/** Get all student submissions for grading */
export async function getInstructorSubmissions(filters?: {
  courseId?: string;
  assignmentId?: string;
  status?: string;
}) {
  let query = '';
  if (filters) {
    const params = new URLSearchParams();
    if (filters.courseId) params.append('courseId', filters.courseId);
    if (filters.assignmentId) params.append('assignmentId', filters.assignmentId);
    if (filters.status) params.append('status', filters.status);
    query = '?' + params.toString();
  }
  const data = await fetchWithAuth(`${API_BASE}/academy/admin/submissions${query}`);
  return data.submissions;
}

/** Grade a student's submission */
export async function gradeSubmission(submissionId: string, payload: {
  pointsAwarded: number;
  feedback: string;
  status?: string;
}) {
  const data = await fetchWithAuth(`${API_BASE}/academy/admin/submissions/${submissionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data.submission;
}

/** Get students enrolled in instructor's courses */
export async function getInstructorStudents() {
  const data = await fetchWithAuth(`${API_BASE}/academy/instructor/students`);
  return data.enrollments;
}

