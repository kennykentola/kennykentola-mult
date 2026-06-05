import { Router } from 'express';
import { ID, Query } from 'node-appwrite';
import { databases } from '../services/appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const COURSES_COLLECTION = 'courses';
const LESSONS_COLLECTION = 'lessons';
const ENROLLMENTS_COLLECTION = 'course_enrollments';
const PROFILES_COLLECTION = 'users_profile';
const ASSIGNMENTS_COLLECTION = 'assignments';
const SUBMISSIONS_COLLECTION = 'submissions';
const LIVE_CLASSES_COLLECTION = 'live_classes';

type ApiCourse = {
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

type ApiLesson = {
  id: string;
  courseId: string;
  title: string;
  content?: string;
  videoUrl?: string;
  order: number;
  durationMinutes?: number;
  isPreview?: boolean;
};

type EnrollmentDoc = {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedLessons: number;
  lastLessonId?: string;
  status: string;
  enrolledAt?: string;
  updatedAt?: string;
};

type AssignmentDoc = {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  dueDate: string;
  maxPoints: number;
};

type SubmissionDoc = {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrls: string[];
  studentNote?: string;
  pointsAwarded?: number;
  feedback?: string;
  status: string;
  submittedAt?: string;
  updatedAt?: string;
};

type LiveClassDoc = {
  id: string;
  courseId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl: string;
  status: string;
};

type SubmissionReviewDoc = {
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

const mapCourse = (course: any, lessonCount: number): ApiCourse => ({
  id: course.$id,
  title: course.title,
  description: course.description,
  instructorId: course.instructorId,
  instructorName: course.instructorName || 'Kenny Kentola',
  slug: course.slug,
  category: course.category,
  level: course.level,
  summary: course.summary,
  coverImage: course.coverImage,
  price: Number(course.price || 0),
  isPublished: Boolean(course.isPublished),
  lessonCount
});

const mapLesson = (lesson: any): ApiLesson => ({
  id: lesson.$id,
  courseId: lesson.courseId,
  title: lesson.title,
  content: lesson.content,
  videoUrl: lesson.videoUrl,
  order: Number(lesson.order || 0),
  durationMinutes: Number(lesson.durationMinutes || 0),
  isPreview: Boolean(lesson.isPreview)
});

async function getLessonCount(courseId: string, fallbackCount = 0) {
  try {
    const lessons = await databases.listDocuments(DATABASE_ID, LESSONS_COLLECTION, [
      Query.equal('courseId', courseId),
      Query.limit(100)
    ]);
    return lessons.total || fallbackCount;
  } catch {
    return fallbackCount;
  }
}

async function listCourseLessons(courseId: string) {
  const lessons = await databases.listDocuments(DATABASE_ID, LESSONS_COLLECTION, [
    Query.equal('courseId', courseId),
    Query.orderAsc('order'),
    Query.limit(100)
  ]);

  return lessons.documents.map(mapLesson);
}

async function getProfileDoc(userId: string) {
  const profiles = await databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION, [
    Query.equal('userId', userId),
    Query.limit(1)
  ]);

  return profiles.documents[0] || null;
}

async function getEnrollmentDocs(userId: string) {
  const enrollments = await databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION, [
    Query.equal('userId', userId),
    Query.orderDesc('$createdAt'),
    Query.limit(100)
  ]);

  return enrollments.documents as any[];
}

async function listAssignments(courseId: string) {
  const assignments = await databases.listDocuments(DATABASE_ID, ASSIGNMENTS_COLLECTION, [
    Query.equal('courseId', courseId),
    Query.orderAsc('dueDate'),
    Query.limit(100)
  ]);

  return assignments.documents as any[];
}

async function listLiveClasses(courseId: string) {
  const liveClasses = await databases.listDocuments(DATABASE_ID, LIVE_CLASSES_COLLECTION, [
    Query.equal('courseId', courseId),
    Query.orderAsc('scheduledAt'),
    Query.limit(100)
  ]);

  return liveClasses.documents as any[];
}

async function getUserAssignmentSubmission(assignmentId: string, userId: string) {
  const submissions = await databases.listDocuments(DATABASE_ID, SUBMISSIONS_COLLECTION, [
    Query.equal('assignmentId', assignmentId),
    Query.equal('studentId', userId),
    Query.limit(1)
  ]);

  return submissions.documents[0] || null;
}

async function listSubmissionReviews(filters: {
  courseId?: string;
  assignmentId?: string;
  status?: string;
  limit?: number;
}) {
  const queries = [Query.orderDesc('$createdAt'), Query.limit(filters.limit || 100)];

  if (filters.assignmentId) {
    queries.push(Query.equal('assignmentId', filters.assignmentId));
  }

  if (filters.status && filters.status !== 'all') {
    queries.push(Query.equal('status', filters.status));
  }

  const submissions = await databases.listDocuments(DATABASE_ID, SUBMISSIONS_COLLECTION, queries);

    const docs = submissions.documents as any[];
    const mapped = await Promise.all(
      docs.map(async (submissionDoc) => {
        const assignment = (await databases.getDocument(DATABASE_ID, ASSIGNMENTS_COLLECTION, submissionDoc.assignmentId)) as any;
        const course = (await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, submissionDoc.courseId || assignment.courseId)) as any;
        const studentProfile = (await getProfileDoc(submissionDoc.studentId)) as any;

      return {
        id: submissionDoc.$id,
        assignmentId: submissionDoc.assignmentId,
        studentId: submissionDoc.studentId,
        studentName: studentProfile ? `${studentProfile.firstName} ${studentProfile.lastName}` : submissionDoc.studentId,
        fileUrls: submissionDoc.fileUrls || [],
        studentNote: submissionDoc.studentNote || '',
        pointsAwarded: submissionDoc.pointsAwarded ?? null,
        feedback: submissionDoc.feedback || '',
        status: submissionDoc.status,
        submittedAt: submissionDoc.submittedAt || submissionDoc.$createdAt,
        updatedAt: submissionDoc.updatedAt || submissionDoc.$updatedAt,
        course: {
          id: course.$id,
          title: course.title,
          instructorName: course.instructorName || 'Kenny Kentola'
        },
        assignment: {
          id: assignment.$id,
          title: assignment.title,
          dueDate: assignment.dueDate,
          maxPoints: Number(assignment.maxPoints || 100)
        }
      };
    })
  );

  const filtered = filters.courseId
    ? mapped.filter((item) => item.course.id === filters.courseId)
    : mapped;

  return filtered;
}

async function ensureAcademyReviewer(role?: string) {
  return role === 'Admin' || role === 'Instructor';
}

router.get('/courses', async (_req, res) => {
  try {
    const courses = await databases.listDocuments(DATABASE_ID, COURSES_COLLECTION, [
      Query.equal('isPublished', true),
      Query.orderAsc('title'),
      Query.limit(100)
    ]);

    const mapped = await Promise.all(
      courses.documents.map(async (course) => {
        const courseDoc = course as any;
        return mapCourse(courseDoc, await getLessonCount(courseDoc.$id, Number(courseDoc.lessonCount || 0)));
      })
    );

    res.status(200).json({ courses: mapped, total: mapped.length });
  } catch (err: any) {
    console.error('[Academy] Error fetching course catalog:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/courses/:courseId', async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, courseId);
    const lessons = await listCourseLessons(courseId);

    res.status(200).json({
      course: mapCourse(course, lessons.length),
      lessons
    });
  } catch (err: any) {
    console.error('[Academy] Error fetching course detail:', err.message);
    res.status(404).json({ error: 'Course not found.' });
  }
});

router.get('/courses/:courseId/assignments', async (req, res) => {
  const { courseId } = req.params;

  try {
    const assignments = await listAssignments(courseId);
    res.status(200).json({
      assignments: assignments.map((assignment: any) => ({
        id: assignment.$id,
        courseId: assignment.courseId,
        title: assignment.title,
        instructions: assignment.instructions,
        dueDate: assignment.dueDate,
        maxPoints: Number(assignment.maxPoints || 100)
      }))
    });
  } catch (err: any) {
    console.error('[Academy] Error fetching assignments:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/courses/:courseId/assignments/me', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { courseId } = req.params;
  const userId = req.user?.id;

  try {
    const assignments = await listAssignments(courseId);
    const assignmentsWithSubmissions = await Promise.all(
      assignments.map(async (assignment: any) => {
        const submission = (await getUserAssignmentSubmission(assignment.$id, userId || '')) as any;
        return {
          id: assignment.$id,
          courseId: assignment.courseId,
          title: assignment.title,
          instructions: assignment.instructions,
          dueDate: assignment.dueDate,
          maxPoints: Number(assignment.maxPoints || 100),
          submission: submission
            ? {
                id: submission.$id,
                assignmentId: submission.assignmentId,
                studentId: submission.studentId,
                fileUrls: submission.fileUrls || [],
                studentNote: submission.studentNote,
                pointsAwarded: submission.pointsAwarded,
                feedback: submission.feedback,
                status: submission.status,
                submittedAt: submission.submittedAt,
                updatedAt: submission.updatedAt
              }
            : null
        };
      })
    );

    res.status(200).json({ assignments: assignmentsWithSubmissions });
  } catch (err: any) {
    console.error('[Academy] Error fetching user assignments:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/courses/:courseId/live-classes', async (req, res) => {
  const { courseId } = req.params;

  try {
    const liveClasses = await listLiveClasses(courseId);
    res.status(200).json({
      liveClasses: liveClasses.map((liveClass: any) => ({
        id: liveClass.$id,
        courseId: liveClass.courseId,
        title: liveClass.title,
        scheduledAt: liveClass.scheduledAt,
        durationMinutes: Number(liveClass.durationMinutes || 0),
        meetingUrl: liveClass.meetingUrl,
        status: liveClass.status || 'scheduled'
      }))
    });
  } catch (err: any) {
    console.error('[Academy] Error fetching live classes:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/submissions', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (!(await ensureAcademyReviewer(req.user?.role))) {
    return res.status(403).json({ error: 'Academy review access required.' });
  }

  const { courseId, assignmentId, status, limit } = req.query;

  try {
    const submissions = await listSubmissionReviews({
      courseId: typeof courseId === 'string' ? courseId : undefined,
      assignmentId: typeof assignmentId === 'string' ? assignmentId : undefined,
      status: typeof status === 'string' ? status : undefined,
      limit: Number(limit) || 100
    });

    res.status(200).json({
      submissions,
      total: submissions.length
    });
  } catch (err: any) {
    console.error('[Academy] Error fetching admin submissions:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/admin/submissions/:submissionId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (!(await ensureAcademyReviewer(req.user?.role))) {
    return res.status(403).json({ error: 'Academy review access required.' });
  }

  const { submissionId } = req.params;
  const { pointsAwarded, feedback, status } = req.body;

  try {
    const submissionUpdate: Record<string, any> = {
      feedback: typeof feedback === 'string' ? feedback : '',
      status: typeof status === 'string' ? status : 'graded',
      updatedAt: new Date().toISOString()
    };

    if (typeof pointsAwarded === 'number') {
      submissionUpdate.pointsAwarded = pointsAwarded;
    }

    const updated = await databases.updateDocument(DATABASE_ID, SUBMISSIONS_COLLECTION, submissionId, submissionUpdate);

    res.status(200).json({
      message: 'Submission graded successfully',
      submission: updated
    });
  } catch (err: any) {
    console.error('[Academy] Error grading submission:', err.message);
    res.status(400).json({ error: err.message });
  }
});

router.get('/me/progress', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;

  try {
    const enrollmentDocs = await getEnrollmentDocs(userId || '');

    const enrollments = await Promise.all(
      enrollmentDocs.map(async (doc) => {
        const enrollmentDoc = doc as any;
        const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, enrollmentDoc.courseId);
        const lessons = await listCourseLessons(enrollmentDoc.courseId);
        const nextLessonIndex = Math.min(Number(enrollmentDoc.completedLessons || 0), lessons.length - 1);
        const nextLesson = lessons[nextLessonIndex] || null;

        return {
          id: enrollmentDoc.$id,
          userId: enrollmentDoc.userId,
          courseId: enrollmentDoc.courseId,
          progress: Number(enrollmentDoc.progress || 0),
          completedLessons: Number(enrollmentDoc.completedLessons || 0),
          lastLessonId: enrollmentDoc.lastLessonId,
          status: enrollmentDoc.status,
          enrolledAt: enrollmentDoc.enrolledAt,
          updatedAt: enrollmentDoc.updatedAt,
          course: mapCourse(course, lessons.length),
          nextLesson
        };
      })
    );

    const summary = {
      enrolledCourses: enrollments.length,
      completedLessons: enrollments.reduce((total, item) => total + item.completedLessons, 0),
      activeCatalogCourses: (
        await databases.listDocuments(DATABASE_ID, COURSES_COLLECTION, [
          Query.equal('isPublished', true),
          Query.limit(100)
        ])
      ).total
    };

    res.status(200).json({ summary, enrollments });
  } catch (err: any) {
    console.error('[Academy] Error fetching progress:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/courses/:courseId/enroll', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { courseId } = req.params;
  const userId = req.user?.id;

  try {
    const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, courseId);
    const existing = await databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION, [
      Query.equal('userId', userId || ''),
      Query.equal('courseId', courseId),
      Query.limit(1)
    ]);

    if (existing.total > 0) {
      return res.status(200).json({ message: 'Already enrolled', enrollment: existing.documents[0] });
    }

    const enrollment = await databases.createDocument(DATABASE_ID, ENROLLMENTS_COLLECTION, ID.unique(), {
      userId,
      courseId,
      progress: 0,
      completedLessons: 0,
      lastLessonId: '',
      status: 'active',
      enrolledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    try {
      const profile = (await getProfileDoc(userId || '')) as any;
      if (profile) {
        const enrollments = Array.isArray(profile.enrollments) ? profile.enrollments : [];
        if (!enrollments.includes(courseId)) {
          await databases.updateDocument(DATABASE_ID, PROFILES_COLLECTION, profile.$id, {
            enrollments: [...enrollments, courseId]
          });
        }
      }
    } catch (profileErr: any) {
      console.warn('[Academy] Profile enrollment sync skipped:', profileErr.message);
    }

    res.status(201).json({
      message: 'Enrolled successfully',
      course: mapCourse(course as any, await getLessonCount((course as any).$id, Number((course as any).lessonCount || 0))),
      enrollment
    });
  } catch (err: any) {
    console.error('[Academy] Error enrolling in course:', err.message);
    res.status(400).json({ error: err.message });
  }
});

router.patch('/courses/:courseId/progress', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { courseId } = req.params;
  const userId = req.user?.id;
  const { progress, completedLessons, lastLessonId } = req.body;

  try {
    const existing = await databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION, [
      Query.equal('userId', userId || ''),
      Query.equal('courseId', courseId),
      Query.limit(1)
    ]);

    if (existing.total === 0) {
      return res.status(404).json({ error: 'Enrollment not found.' });
    }

    const existingDoc = existing.documents[0] as any;
    const enrollmentId = existingDoc.$id;
    const enrollment = await databases.updateDocument(DATABASE_ID, ENROLLMENTS_COLLECTION, enrollmentId, {
      progress: typeof progress === 'number' ? progress : existingDoc.progress || 0,
      completedLessons: typeof completedLessons === 'number' ? completedLessons : existingDoc.completedLessons || 0,
      lastLessonId: lastLessonId || existingDoc.lastLessonId || '',
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ message: 'Progress updated', enrollment });
  } catch (err: any) {
    console.error('[Academy] Error updating progress:', err.message);
    res.status(400).json({ error: err.message });
  }
});

router.post('/assignments/:assignmentId/submissions', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { assignmentId } = req.params;
  const userId = req.user?.id;
  const { fileUrls = [], studentNote = '' } = req.body;

  if (!Array.isArray(fileUrls) || fileUrls.length === 0) {
    return res.status(400).json({ error: 'At least one file URL is required.' });
  }

  try {
    const existing = await databases.listDocuments(DATABASE_ID, SUBMISSIONS_COLLECTION, [
      Query.equal('assignmentId', assignmentId),
      Query.equal('studentId', userId || ''),
      Query.limit(1)
    ]);

    const payload: Record<string, any> = {
      assignmentId,
      studentId: userId,
      fileUrls,
      studentNote,
      feedback: '',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existing.total > 0) {
      const existingSubmission = existing.documents[0] as any;
      const updated = await databases.updateDocument(
        DATABASE_ID,
        SUBMISSIONS_COLLECTION,
        existingSubmission.$id,
        payload
      );

      return res.status(200).json({ message: 'Submission updated', submission: updated });
    }

    const submission = await databases.createDocument(DATABASE_ID, SUBMISSIONS_COLLECTION, ID.unique(), payload);

    res.status(201).json({ message: 'Submission created', submission });
  } catch (err: any) {
    console.error('[Academy] Error creating submission:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
