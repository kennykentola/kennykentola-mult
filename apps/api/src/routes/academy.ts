import { Router } from 'express';
import { ID, Query } from 'node-appwrite';
import { databases } from '../services/appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import communityRouter from './community';

const router = Router();
router.use('/community', communityRouter);

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const COURSES_COLLECTION = 'courses';
const LESSONS_COLLECTION = 'lessons';
const ENROLLMENTS_COLLECTION = 'course_enrollments';
const PROFILES_COLLECTION = 'users_profile';
const ASSIGNMENTS_COLLECTION = 'assignments';
const SUBMISSIONS_COLLECTION = 'submissions';
const LIVE_CLASSES_COLLECTION = 'live_classes';
const MODULES_COLLECTION = 'modules';

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

async function canViewCourse(courseId: string, user?: AuthenticatedRequest['user']) {
  const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, courseId);
  const courseDoc = course as any;

  if (courseDoc.isPublished) {
    return courseDoc;
  }

  if (!user) {
    return null;
  }

  if (user.role === 'Admin' || user.role === 'Super Admin') {
    return courseDoc;
  }

  if (user.role === 'Instructor' && courseDoc.instructorId === user.id) {
    return courseDoc;
  }

  const enrollments = await databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION, [
    Query.equal('userId', user.id),
    Query.equal('courseId', courseId),
    Query.limit(1)
  ]);

  return enrollments.total > 0 ? courseDoc : null;
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
  return role === 'Admin' || role === 'Super Admin' || role === 'Instructor';
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
    const course = await canViewCourse(courseId);
    if (!course) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const lessons = await listCourseLessons(courseId);

    // Fetch modules
    const modules = await databases.listDocuments(DATABASE_ID, MODULES_COLLECTION, [
      Query.equal('courseId', courseId),
      Query.orderAsc('order'),
      Query.limit(100)
    ]).catch(() => ({ documents: [] }));

    res.status(200).json({
      course: mapCourse(course, lessons.length),
      lessons,
      modules: modules.documents.map((m: any) => ({
        id: m.$id,
        courseId: m.courseId,
        title: m.title,
        description: m.description,
        order: m.order,
        isPublished: m.isPublished
      }))
    });
  } catch (err: any) {
    console.error('[Academy] Error fetching course detail:', err.message);
    res.status(404).json({ error: 'Course not found.' });
  }
});

router.get('/courses/:courseId/assignments', async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await canViewCourse(courseId);
    if (!course) {
      return res.status(403).json({ error: 'Access denied.' });
    }
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

    const assignmentIds = assignments.map((a: any) => a.$id);
    
    let allSubmissions = { documents: [] };
    if (assignmentIds.length > 0) {
      allSubmissions = await databases.listDocuments(DATABASE_ID, SUBMISSIONS_COLLECTION, [
        Query.equal('studentId', userId || ''),
        Query.equal('assignmentId', assignmentIds),
        Query.limit(assignmentIds.length + 10)
      ]);
    }
    const submissionByAssignment = new Map(
      allSubmissions.documents.map((s: any) => [s.assignmentId, s])
    );

    const assignmentsWithSubmissions = assignments.map((assignment: any) => {
      const submissionDoc = submissionByAssignment.get(assignment.$id) as any;
      return {
        id: assignment.$id,
        courseId: assignment.courseId,
        title: assignment.title,
        instructions: assignment.instructions,
        dueDate: assignment.dueDate,
        maxPoints: Number(assignment.maxPoints || 100),
        submission: submissionDoc
          ? {
              id: submissionDoc.$id,
              assignmentId: submissionDoc.assignmentId,
              studentId: submissionDoc.studentId,
              fileUrls: submissionDoc.fileUrls || [],
              studentNote: submissionDoc.studentNote,
              pointsAwarded: submissionDoc.pointsAwarded,
              feedback: submissionDoc.feedback,
              status: submissionDoc.status,
              submittedAt: submissionDoc.submittedAt,
              updatedAt: submissionDoc.updatedAt
            }
          : null
      };
    });

    res.status(200).json({ assignments: assignmentsWithSubmissions });
  } catch (err: any) {
    console.error('[Academy] Error fetching user assignments:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/courses/:courseId/live-classes', async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await canViewCourse(courseId);
    if (!course) {
      return res.status(403).json({ error: 'Access denied.' });
    }
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

    // Batch fetch all enrolled courses at once instead of N getDocument calls
    const courseIds = enrollmentDocs.map((d: any) => d.courseId).filter(Boolean);
    const courseMap = new Map<string, any>();
    if (courseIds.length > 0) {
      try {
        const courseBatch = await databases.listDocuments(DATABASE_ID, COURSES_COLLECTION, [
          Query.equal('$id', courseIds),
          Query.limit(courseIds.length)
        ]);
        courseBatch.documents.forEach((c: any) => courseMap.set(c.$id, c));
      } catch {}
    }

    // Batch fetch lessons per course in parallel
    const lessonsByCourseid = new Map<string, any[]>();
    await Promise.all(
      courseIds.map(async (cId: string) => {
        const lessons = await listCourseLessons(cId);
        lessonsByCourseid.set(cId, lessons);
      })
    );

    const enrollments = enrollmentDocs.map((doc: any) => {
      const enrollmentDoc = doc as any;
      const course = courseMap.get(enrollmentDoc.courseId);
      const lessons = lessonsByCourseid.get(enrollmentDoc.courseId) || [];
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
        course: course ? mapCourse(course, lessons.length) : null,
        nextLesson
      };
    });

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
    const newProgress = typeof progress === 'number' ? progress : existingDoc.progress || 0;

    const enrollment = await databases.updateDocument(DATABASE_ID, ENROLLMENTS_COLLECTION, enrollmentId, {
      progress: newProgress,
      completedLessons: typeof completedLessons === 'number' ? completedLessons : existingDoc.completedLessons || 0,
      lastLessonId: lastLessonId || existingDoc.lastLessonId || '',
      updatedAt: new Date().toISOString()
    });

    // Automatically queue certificate generation if progress is 100
    if (newProgress >= 100 && (existingDoc.progress || 0) < 100) {
      try {
        const profile = await getProfileDoc(userId || '');
        const studentName = profile ? `${(profile as any).firstName} ${(profile as any).lastName}` : req.user?.name || 'Student';
        const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, courseId);

        // Check if certificate already exists
        const existingCerts = await databases.listDocuments(DATABASE_ID, 'certificates', [
          Query.equal('studentId', userId || ''),
          Query.equal('courseId', courseId),
          Query.limit(1)
        ]);

        if (existingCerts.total === 0) {
          const { queueCertificateGeneration } = require('../services/queue');
          await queueCertificateGeneration(userId, studentName, courseId, (course as any).title);
          console.log(`[Academy] Automatically queued certificate generation for ${studentName} on completing course ${(course as any).title}`);
        }
      } catch (certErr: any) {
        console.error('[Academy] Failed to automatically queue certificate:', certErr.message);
      }
    }

    res.status(200).json({ message: 'Progress updated', enrollment });
  } catch (err: any) {
    console.error('[Academy] Error updating progress:', err.message);
    res.status(400).json({ error: err.message });
  }
});

router.get('/courses/:courseId/lesson-progress', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { courseId } = req.params;
  const userId = req.user?.id;

  try {
    const progressList = await databases.listDocuments(DATABASE_ID, 'lesson_progress', [
      Query.equal('studentId', userId || ''),
      Query.equal('courseId', courseId),
      Query.limit(500)
    ]);

    res.status(200).json({ lessonProgress: progressList.documents });
  } catch (err: any) {
    console.error('[Academy] Error fetching lesson progress:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/lessons/:lessonId/progress', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { lessonId } = req.params;
  const { courseId, isCompleted, lastPosition } = req.body;
  const userId = req.user?.id;

  if (!courseId) {
    return res.status(400).json({ error: 'courseId is required.' });
  }

  try {
    const existing = await databases.listDocuments(DATABASE_ID, 'lesson_progress', [
      Query.equal('studentId', userId || ''),
      Query.equal('lessonId', lessonId),
      Query.limit(1)
    ]);

    let progressDoc;
    if (existing.total > 0) {
      const existingDoc = existing.documents[0] as any;
      const updateData: any = {
        isCompleted: isCompleted ?? existingDoc.isCompleted,
        lastPosition: lastPosition ?? existingDoc.lastPosition
      };
      if (isCompleted && !existingDoc.isCompleted) {
        updateData.completedAt = new Date().toISOString();
      }
      progressDoc = await databases.updateDocument(DATABASE_ID, 'lesson_progress', existingDoc.$id, updateData);
    } else {
      progressDoc = await databases.createDocument(DATABASE_ID, 'lesson_progress', ID.unique(), {
        studentId: userId,
        lessonId,
        courseId,
        isCompleted: isCompleted || false,
        lastPosition: lastPosition || 0,
        completedAt: isCompleted ? new Date().toISOString() : null
      });
    }

    res.status(200).json({ message: 'Lesson progress updated', progress: progressDoc });
  } catch (err: any) {
    console.error('[Academy] Error updating lesson progress:', err.message);
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

// Fetch student assignments across all enrolled courses
router.get('/student/assignments', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;

  try {
    const enrollments = await getEnrollmentDocs(userId || '');
    if (enrollments.length === 0) {
      return res.status(200).json({ assignments: [] });
    }

    const courseIds = enrollments.map((e) => e.courseId);
    
    // Fetch all assignments for these courses
    const allAssignments = [];
    for (const courseId of courseIds) {
      const courseAssignments = await listAssignments(courseId);
      const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, courseId);
      
      for (const assignment of courseAssignments) {
        const submission = await getUserAssignmentSubmission(assignment.$id, userId || '');
        const submissionDoc: any = submission;
        allAssignments.push({
          id: assignment.$id,
          courseId,
          courseTitle: (course as any).title,
          instructorName: (course as any).instructorName || 'Kenny Kentola',
          title: assignment.title,
          instructions: assignment.instructions,
          dueDate: assignment.dueDate,
          maxPoints: Number(assignment.maxPoints || 100),
          submission: submissionDoc ? {
            id: submissionDoc.$id,
            fileUrls: submissionDoc.fileUrls || [],
            studentNote: submissionDoc.studentNote || '',
            pointsAwarded: submissionDoc.pointsAwarded ?? null,
            feedback: submissionDoc.feedback || '',
            status: submissionDoc.status,
            submittedAt: submissionDoc.submittedAt || submissionDoc.$createdAt,
            updatedAt: submissionDoc.updatedAt || submissionDoc.$updatedAt
          } : null
        });
      }
    }

    // Sort assignments by due date (closest first)
    allAssignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    res.status(200).json({ assignments: allAssignments });
  } catch (err: any) {
    console.error('[Academy Student Assignments] Error fetching assignments:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Fetch user certificates
router.get('/certificates', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;

  try {
    const certs = await databases.listDocuments(DATABASE_ID, 'certificates', [
      Query.equal('studentId', userId || ''),
      Query.orderDesc('issuedAt'),
      Query.limit(100)
    ]);
    res.status(200).json({ certificates: certs.documents });
  } catch (err: any) {
    console.error('[Academy Certificates] Error fetching certificates:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Issue test certificate manually
router.post('/courses/:courseId/issue-test-certificate', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { courseId } = req.params;
  const userId = req.user?.id;

  try {
    const profile = await getProfileDoc(userId || '');
    const studentName = profile ? `${(profile as any).firstName} ${(profile as any).lastName}` : req.user?.name || 'Student';
    const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, courseId);

    const { queueCertificateGeneration } = require('../services/queue');
    await queueCertificateGeneration(userId, studentName, courseId, (course as any).title);

    res.status(200).json({ message: 'Certificate generation queued successfully.' });
  } catch (err: any) {
    console.error('[Academy Certificates] Error manually queueing certificate:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ADMIN: Fetch all certificates
router.get('/admin/certificates', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin' && req.user?.role !== 'Instructor') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const certs = await databases.listDocuments(DATABASE_ID, 'certificates', [
      Query.orderDesc('issuedAt'),
      Query.limit(100)
    ]);

    const certDocs = certs.documents as any[];

    // Batch-fetch student profiles and courses
    const uniqueStudentIds = [...new Set(certDocs.map(c => c.studentId))];
    const uniqueCourseIds  = [...new Set(certDocs.map(c => c.courseId))];

    const [profileBatch, courseBatch] = await Promise.all([
      uniqueStudentIds.length > 0
        ? databases.listDocuments(DATABASE_ID, 'users_profile', [
            Query.equal('userId', uniqueStudentIds), Query.limit(uniqueStudentIds.length)
          ]).catch(() => ({ documents: [] }))
        : Promise.resolve({ documents: [] }),
      uniqueCourseIds.length > 0
        ? databases.listDocuments(DATABASE_ID, COURSES_COLLECTION, [
            Query.equal('$id', uniqueCourseIds), Query.limit(uniqueCourseIds.length)
          ]).catch(() => ({ documents: [] }))
        : Promise.resolve({ documents: [] })
    ]);

    const profileMap = new Map(profileBatch.documents.map((p: any) => [p.userId, `${p.firstName} ${p.lastName}`]));
    const courseTitleMap = new Map(courseBatch.documents.map((c: any) => [c.$id, c.title]));

    const enriched = certDocs.map((cert: any) => ({
      id: cert.$id,
      studentId: cert.studentId,
      studentName: profileMap.get(cert.studentId) || cert.studentId,
      courseId: cert.courseId,
      courseTitle: courseTitleMap.get(cert.courseId) || cert.courseId,
      certificateNumber: cert.certificateNumber,
      issuedAt: cert.issuedAt,
      pdfUrl: cert.pdfUrl
    }));

    res.status(200).json({ certificates: enriched });
  } catch (err: any) {
    console.error('[Academy Certificates Admin] Error listing certificates:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// INSTRUCTOR: Get all courses managed/created by instructor
router.get('/instructor/courses', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor access required.' });
  }

  try {
    const userId = req.user?.id;
    // Admins can see all courses; Instructors see their own courses.
    const queries: any[] = [Query.limit(100)];
    if (req.user?.role === 'Instructor') {
      queries.push(Query.equal('instructorId', userId || ''));
    }

    const courses = await databases.listDocuments(DATABASE_ID, COURSES_COLLECTION, queries);

    // Batch-fetch lesson counts in parallel (one query per course, but all courses run at once)
    const mapped = await Promise.all(
      courses.documents.map(async (course) => {
        const courseDoc = course as any;
        return mapCourse(courseDoc, await getLessonCount(courseDoc.$id, Number(courseDoc.lessonCount || 0)));
      })
    );

    res.status(200).json({ courses: mapped, total: mapped.length });
  } catch (err: any) {
    console.error('[Academy Instructor] Error fetching course catalogs:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// INSTRUCTOR: Get students enrolled in instructor's courses
router.get('/instructor/students', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor access required.' });
  }

  const userId = req.user?.id;

  try {
    // 1. Get instructor courses
    const queries = [Query.limit(100)];
    if (req.user?.role === 'Instructor') {
      queries.push(Query.equal('instructorId', userId || ''));
    }
    const courses = await databases.listDocuments(DATABASE_ID, COURSES_COLLECTION, queries);
    const courseMap = new Map(
      courses.documents.map((c) => {
        const courseDoc = c as any;
        return [courseDoc.$id, courseDoc.title];
      })
    );

    if (courses.total === 0) {
      return res.status(200).json({ enrollments: [] });
    }

    // 2. Fetch all enrollments for these courses
    const allEnrollments = [];
    for (const courseId of courseMap.keys()) {
      const courseEnrollments = await databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION, [
        Query.equal('courseId', courseId),
        Query.limit(100)
      ]);

      for (const enc of courseEnrollments.documents) {
        const encDoc = enc as any;
        const profile = await getProfileDoc(encDoc.userId);
        allEnrollments.push({
          id: encDoc.$id,
          userId: encDoc.userId,
          studentName: profile ? `${(profile as any).firstName} ${(profile as any).lastName}` : encDoc.userId,
          studentEmail: profile ? (profile as any).email || 'No email' : 'No email',
          courseId: encDoc.courseId,
          courseTitle: courseMap.get(encDoc.courseId) || 'Unknown Course',
          progress: Number(encDoc.progress || 0),
          completedLessons: Number(encDoc.completedLessons || 0),
          status: encDoc.status,
          updatedAt: encDoc.updatedAt || encDoc.$updatedAt
        });
      }
    }

    res.status(200).json({ enrollments: allEnrollments });
  } catch (err: any) {
    console.error('[Academy Instructor Students] Error listing students:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// INSTRUCTOR: Revenue summary
router.get('/instructor/revenue', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor access required.' });
  }

  const userId = req.user?.id;

  try {
    // 1. Get instructor's courses
    const queries: any[] = [Query.limit(100)];
    if (req.user?.role === 'Instructor') {
      queries.push(Query.equal('instructorId', userId || ''));
    }
    const coursesResult = await databases.listDocuments(DATABASE_ID, COURSES_COLLECTION, queries);
    const courses = coursesResult.documents as any[];

    if (courses.length === 0) {
      return res.status(200).json({
        totalRevenue: 0,
        instructorShare: 0,
        totalStudents: 0,
        totalCourses: 0,
        courses: [],
        monthlyRevenue: []
      });
    }

    // 2. For each course, count enrollments and compute revenue
    const PLATFORM_CUT = 0.30; // 30% platform fee
    const courseStats = [];
    const monthlyMap: Record<string, number> = {};
    let totalStudents = 0;
    let totalGross = 0;

    for (const course of courses) {
      const enrollments = await databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION, [
        Query.equal('courseId', course.$id),
        Query.limit(1000)
      ]);

      const count = enrollments.total;
      const price = Number(course.price || 0);
      const gross = count * price;
      const instructorEarning = gross * (1 - PLATFORM_CUT);

      totalStudents += count;
      totalGross += gross;

      // Aggregate monthly revenue from enrollment timestamps
      for (const enr of enrollments.documents as any[]) {
        const date = new Date(enr.$createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + price * (1 - PLATFORM_CUT);
      }

      courseStats.push({
        courseId: course.$id,
        title: course.title,
        price,
        enrollments: count,
        gross,
        instructorEarning,
        isPublished: Boolean(course.isPublished),
        category: course.category || 'General'
      });
    }

    // 3. Sort monthly revenue chronologically, last 12 months
    const monthlyRevenue = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, amount]) => ({
        month,
        label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        amount: Math.round(amount)
      }));

    res.status(200).json({
      totalRevenue: Math.round(totalGross),
      instructorShare: Math.round(totalGross * (1 - PLATFORM_CUT)),
      platformFee: Math.round(totalGross * PLATFORM_CUT),
      totalStudents,
      totalCourses: courses.length,
      courses: courseStats,
      monthlyRevenue
    });
  } catch (err: any) {
    console.error('[Academy Instructor Revenue] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// INSTRUCTOR: Get lessons for a course
router.get('/courses/:courseId/lessons', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor access required.' });
  }

  const { courseId } = req.params;

  try {
    const lessons = await listCourseLessons(courseId);
    res.status(200).json({ lessons });
  } catch (err: any) {
    console.error('[Academy Instructor Lessons] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// INSTRUCTOR: Get modules for a course
router.get('/courses/:courseId/modules', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor access required.' });
  }

  const { courseId } = req.params;

  try {
    const modules = await databases.listDocuments(DATABASE_ID, MODULES_COLLECTION, [
      Query.equal('courseId', courseId),
      Query.orderAsc('order'),
      Query.limit(100)
    ]).catch(() => ({ documents: [] }));

    res.status(200).json({ modules: modules.documents.map((m: any) => ({
      id: m.$id,
      courseId: m.courseId,
      title: m.title,
      description: m.description,
      order: m.order,
      isPublished: m.isPublished
    })) });
  } catch (err: any) {
    console.error('[Academy Instructor Modules] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// INSTRUCTOR: Create course
router.post('/courses', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor access required.' });
  }

  const { title, description, category, level, summary, coverImage, price, isPublished } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  try {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const course = await databases.createDocument(DATABASE_ID, COURSES_COLLECTION, ID.unique(), {
      title,
      description,
      instructorId: req.user.id,
      instructorName: req.user.name || 'Instructor',
      slug,
      category: category || 'General',
      level: level || 'Beginner',
      summary: summary || '',
      coverImage: coverImage || '',
      price: price !== undefined ? Number(price) : 0,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : false,
      lessonCount: 0
    });

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (err: any) {
    console.error('[Academy Instructor] Error creating course:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// INSTRUCTOR/ADMIN: Delete course (cascades: lessons, assignments, enrollments)
router.delete('/courses/:courseId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor or Admin access required.' });
  }

  const { courseId } = req.params;

  try {
    // Check ownership
    const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, courseId);
    if (req.user.role === 'Instructor' && (course as any).instructorId !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this course.' });
    }

    // 1. Delete all lessons
    const lessons = await databases.listDocuments(DATABASE_ID, LESSONS_COLLECTION, [
      Query.equal('courseId', courseId), Query.limit(200)
    ]);
    await Promise.all(lessons.documents.map((l: any) => databases.deleteDocument(DATABASE_ID, LESSONS_COLLECTION, l.$id)));

    // 2. Delete all assignments (and their submissions)
    const assignments = await databases.listDocuments(DATABASE_ID, ASSIGNMENTS_COLLECTION, [
      Query.equal('courseId', courseId), Query.limit(200)
    ]);
    for (const assignment of assignments.documents as any[]) {
      const submissions = await databases.listDocuments(DATABASE_ID, SUBMISSIONS_COLLECTION, [
        Query.equal('assignmentId', assignment.$id), Query.limit(200)
      ]);
      await Promise.all(submissions.documents.map((s: any) => databases.deleteDocument(DATABASE_ID, SUBMISSIONS_COLLECTION, s.$id)));
      await databases.deleteDocument(DATABASE_ID, ASSIGNMENTS_COLLECTION, assignment.$id);
    }

    // 3. Delete all enrollments
    const enrollments = await databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION, [
      Query.equal('courseId', courseId), Query.limit(200)
    ]);
    await Promise.all(enrollments.documents.map((e: any) => databases.deleteDocument(DATABASE_ID, ENROLLMENTS_COLLECTION, e.$id)));

    // 4. Delete the course itself
    await databases.deleteDocument(DATABASE_ID, COURSES_COLLECTION, courseId);

    console.log(`[Academy] Course ${courseId} and all related data deleted by ${req.user?.id}`);
    res.status(200).json({ message: 'Course and all related data deleted successfully.' });
  } catch (err: any) {
    console.error('[Academy] Error deleting course:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// INSTRUCTOR: Update course

router.patch('/courses/:courseId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor access required.' });
  }

  const { courseId } = req.params;
  const updates = req.body;

  try {
    // Check ownership
    const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, courseId);
    if (req.user.role === 'Instructor' && (course as any).instructorId !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this course.' });
    }

    const allowedFields = ['title', 'description', 'category', 'level', 'summary', 'coverImage', 'price', 'isPublished'];
    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        if (key === 'price') updateData[key] = Number(updates[key]);
        else if (key === 'isPublished') updateData[key] = Boolean(updates[key]);
        else updateData[key] = updates[key];
      }
    }

    if (updates.title) {
      updateData.slug = updates.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const updated = await databases.updateDocument(DATABASE_ID, COURSES_COLLECTION, courseId, updateData);

    res.status(200).json({ message: 'Course updated successfully', course: updated });
  } catch (err: any) {
    console.error('[Academy Instructor] Error updating course:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// INSTRUCTOR: Create lesson
router.post('/courses/:courseId/lessons', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor access required.' });
  }

  const { courseId } = req.params;
  const { title, content, videoUrl, order, durationMinutes, isPreview, moduleId } = req.body;

  if (!title || order === undefined) {
    return res.status(400).json({ error: 'Title and order are required.' });
  }

  try {
    // Check ownership of course
    const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, courseId);
    if (req.user.role === 'Instructor' && (course as any).instructorId !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this course.' });
    }

    const lesson = await databases.createDocument(DATABASE_ID, LESSONS_COLLECTION, ID.unique(), {
      courseId,
      title,
      content: content || '',
      videoUrl: videoUrl || '',
      order: Number(order),
      durationMinutes: durationMinutes !== undefined ? Number(durationMinutes) : 0,
      isPreview: isPreview !== undefined ? Boolean(isPreview) : false,
      moduleId: moduleId || ''
    });

    // Increment lessonCount on course
    const currentCount = await getLessonCount(courseId, Number((course as any).lessonCount || 0));
    await databases.updateDocument(DATABASE_ID, COURSES_COLLECTION, courseId, {
      lessonCount: currentCount + 1
    });

    res.status(201).json({ message: 'Lesson created successfully', lesson });
  } catch (err: any) {
    console.error('[Academy Instructor] Error creating lesson:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// INSTRUCTOR: Update lesson
router.patch('/lessons/:lessonId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor access required.' });
  }

  const { lessonId } = req.params;
  const updates = req.body;

  try {
    const lesson = await databases.getDocument(DATABASE_ID, LESSONS_COLLECTION, lessonId);
    // Check ownership of parent course
    const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, (lesson as any).courseId);
    if (req.user.role === 'Instructor' && (course as any).instructorId !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this course.' });
    }

    const allowedFields = ['title', 'content', 'videoUrl', 'order', 'durationMinutes', 'isPreview', 'moduleId'];
    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        if (key === 'order' || key === 'durationMinutes') updateData[key] = Number(updates[key]);
        else if (key === 'isPreview') updateData[key] = Boolean(updates[key]);
        else updateData[key] = updates[key];
      }
    }

    const updated = await databases.updateDocument(DATABASE_ID, LESSONS_COLLECTION, lessonId, updateData);

    res.status(200).json({ message: 'Lesson updated successfully', lesson: updated });
  } catch (err: any) {
    console.error('[Academy Instructor] Error updating lesson:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// INSTRUCTOR: Delete lesson
router.delete('/lessons/:lessonId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor access required.' });
  }

  const { lessonId } = req.params;

  try {
    const lesson = await databases.getDocument(DATABASE_ID, LESSONS_COLLECTION, lessonId);
    const courseId = (lesson as any).courseId;

    // Check ownership of parent course
    const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, courseId);
    if (req.user.role === 'Instructor' && (course as any).instructorId !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this course.' });
    }

    await databases.deleteDocument(DATABASE_ID, LESSONS_COLLECTION, lessonId);

    // Decrement lessonCount on course
    const currentCount = await getLessonCount(courseId, Number((course as any).lessonCount || 0));
    await databases.updateDocument(DATABASE_ID, COURSES_COLLECTION, courseId, {
      lessonCount: Math.max(0, currentCount - 1)
    });

    res.status(200).json({ message: 'Lesson deleted successfully' });
  } catch (err: any) {
    console.error('[Academy Instructor] Error deleting lesson:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// INSTRUCTOR: Create module
router.post('/courses/:courseId/modules', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor access required.' });
  }

  const { courseId } = req.params;
  const { title, description, order, isPublished } = req.body;

  if (!title || order === undefined) {
    return res.status(400).json({ error: 'Title and order are required.' });
  }

  try {
    const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, courseId);
    if (req.user.role === 'Instructor' && (course as any).instructorId !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this course.' });
    }

    const moduleDoc = await databases.createDocument(DATABASE_ID, MODULES_COLLECTION, ID.unique(), {
      courseId,
      title,
      description: description || '',
      order: Number(order),
      isPublished: isPublished !== undefined ? Boolean(isPublished) : false
    });

    res.status(201).json({ message: 'Module created successfully', module: moduleDoc });
  } catch (err: any) {
    console.error('[Academy Instructor] Error creating module:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// INSTRUCTOR: Update module
router.patch('/modules/:moduleId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor access required.' });
  }

  const { moduleId } = req.params;
  const updates = req.body;

  try {
    const moduleDoc = await databases.getDocument(DATABASE_ID, MODULES_COLLECTION, moduleId);
    const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, (moduleDoc as any).courseId);
    if (req.user.role === 'Instructor' && (course as any).instructorId !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this course.' });
    }

    const allowedFields = ['title', 'description', 'order', 'isPublished'];
    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        if (key === 'order') updateData[key] = Number(updates[key]);
        else if (key === 'isPublished') updateData[key] = Boolean(updates[key]);
        else updateData[key] = updates[key];
      }
    }

    const updated = await databases.updateDocument(DATABASE_ID, MODULES_COLLECTION, moduleId, updateData);
    res.status(200).json({ message: 'Module updated successfully', module: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// INSTRUCTOR: Delete module
router.delete('/modules/:moduleId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor access required.' });
  }

  const { moduleId } = req.params;

  try {
    const moduleDoc = await databases.getDocument(DATABASE_ID, MODULES_COLLECTION, moduleId);
    const courseId = (moduleDoc as any).courseId;
    const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, courseId);
    if (req.user.role === 'Instructor' && (course as any).instructorId !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this course.' });
    }

    // Unlink lessons from this module
    const lessons = await databases.listDocuments(DATABASE_ID, LESSONS_COLLECTION, [
      Query.equal('moduleId', moduleId), Query.limit(200)
    ]).catch(() => ({ documents: [] }));
    
    await Promise.all(lessons.documents.map((l: any) => databases.updateDocument(DATABASE_ID, LESSONS_COLLECTION, l.$id, { moduleId: '' })));

    await databases.deleteDocument(DATABASE_ID, MODULES_COLLECTION, moduleId);
    res.status(200).json({ message: 'Module deleted successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// INSTRUCTOR: Create assignment
router.post('/courses/:courseId/assignments', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor access required.' });
  }

  const { courseId } = req.params;
  const { title, instructions, dueDate, maxPoints } = req.body;

  if (!title || !instructions || !dueDate) {
    return res.status(400).json({ error: 'Title, instructions, and dueDate are required.' });
  }

  try {
    // Check ownership of course
    const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, courseId);
    if (req.user.role === 'Instructor' && (course as any).instructorId !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this course.' });
    }

    const assignment = await databases.createDocument(DATABASE_ID, ASSIGNMENTS_COLLECTION, ID.unique(), {
      courseId,
      title,
      instructions,
      dueDate: new Date(dueDate).toISOString(),
      maxPoints: maxPoints !== undefined ? Number(maxPoints) : 100
    });

    res.status(201).json({ message: 'Assignment created successfully', assignment });
  } catch (err: any) {
    console.error('[Academy Instructor] Error creating assignment:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ADMIN: Manually issue a certificate
router.post('/admin/certificates/issue', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin' && req.user?.role !== 'Instructor') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const { studentId, courseId } = req.body;

  if (!studentId || !courseId) {
    return res.status(400).json({ error: 'studentId and courseId are required.' });
  }

  try {
    const profile = await getProfileDoc(studentId);
    const studentName = profile ? `${(profile as any).firstName} ${(profile as any).lastName}` : 'Academy Student';
    const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, courseId);

    const { queueCertificateGeneration } = require('../services/queue');
    await queueCertificateGeneration(studentId, studentName, courseId, (course as any).title);

    res.status(200).json({ message: `Certificate generation queued successfully for ${studentName}.` });
  } catch (err: any) {
    console.error('[Academy Certificates Admin] Error manually issuing certificate:', err.message);
    res.status(400).json({ error: err.message });
  }
});


// --- Quiz Endpoints ---

router.get('/courses/:courseId/quizzes', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { courseId } = req.params;
  try {
    const quizzesList = await databases.listDocuments(DATABASE_ID, 'quizzes', [
      Query.equal('courseId', courseId),
      Query.limit(100)
    ]);
    res.status(200).json({ quizzes: quizzesList.documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/courses/:courseId/quizzes', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (!(await ensureAcademyReviewer(req.user?.role))) return res.status(403).json({ error: 'Access denied.' });
  const { courseId } = req.params;
  const { title, description, timeLimitMinutes, passingScore, questions, moduleId } = req.body;
  
  try {
    const updateData: any = {
      courseId,
      title,
      description: description || '',
      timeLimitMinutes: Number(timeLimitMinutes || 0),
      passingScore: Number(passingScore || 70),
      questions: questions || '[]'
    };
    if (moduleId) updateData.moduleId = moduleId;

    const quiz = await databases.createDocument(DATABASE_ID, 'quizzes', ID.unique(), updateData);
    res.status(201).json({ message: 'Quiz created', quiz });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/quizzes/:quizId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (!(await ensureAcademyReviewer(req.user?.role))) return res.status(403).json({ error: 'Access denied.' });
  const { quizId } = req.params;
  const { title, description, timeLimitMinutes, passingScore, questions, moduleId } = req.body;

  try {
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (timeLimitMinutes !== undefined) updateData.timeLimitMinutes = Number(timeLimitMinutes);
    if (passingScore !== undefined) updateData.passingScore = Number(passingScore);
    if (questions !== undefined) updateData.questions = questions;
    if (moduleId !== undefined) updateData.moduleId = moduleId;

    const quiz = await databases.updateDocument(DATABASE_ID, 'quizzes', quizId, updateData);
    res.status(200).json({ message: 'Quiz updated', quiz });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/quizzes/:quizId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (!(await ensureAcademyReviewer(req.user?.role))) return res.status(403).json({ error: 'Access denied.' });
  const { quizId } = req.params;

  try {
    await databases.deleteDocument(DATABASE_ID, 'quizzes', quizId);
    res.status(200).json({ message: 'Quiz deleted' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/quizzes/:quizId/attempts', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { quizId } = req.params;
  const userId = req.user?.id;
  const { courseId, score, passed, startedAt, answers } = req.body;

  try {
    const attempt = await databases.createDocument(DATABASE_ID, 'quiz_attempts', ID.unique(), {
      quizId,
      studentId: userId,
      courseId,
      score: Number(score || 0),
      passed: Boolean(passed),
      startedAt: startedAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      answers: answers || '[]'
    });
    res.status(201).json({ message: 'Quiz attempt saved', attempt });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/courses/:courseId/quiz-attempts/me', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { courseId } = req.params;
  const userId = req.user?.id;
  try {
    const attemptsList = await databases.listDocuments(DATABASE_ID, 'quiz_attempts', [
      Query.equal('studentId', userId || ''),
      Query.equal('courseId', courseId),
      Query.orderDesc('completedAt'),
      Query.limit(100)
    ]);
    res.status(200).json({ attempts: attemptsList.documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Testimonial Endpoints ---

router.get('/courses/:courseId/testimonials', async (req, res) => {
  const { courseId } = req.params;
  try {
    const testimonialsList = await databases.listDocuments(DATABASE_ID, 'testimonials', [
      Query.equal('courseId', courseId),
      Query.equal('isApproved', true),
      Query.orderDesc('createdAt'),
      Query.limit(50)
    ]);
    res.status(200).json({ testimonials: testimonialsList.documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/courses/:courseId/testimonials', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { courseId } = req.params;
  const userId = req.user?.id;
  const { content, rating } = req.body;
  
  try {
    const profile = await getProfileDoc(userId || '');
    const authorName = profile ? `${(profile as any).firstName} ${(profile as any).lastName}` : req.user?.name || 'Student';

    const testimonial = await databases.createDocument(DATABASE_ID, 'testimonials', ID.unique(), {
      userId,
      authorName,
      courseId,
      content,
      rating: Number(rating || 5),
      isApproved: false, // requires admin approval
      createdAt: new Date().toISOString()
    });
    res.status(201).json({ message: 'Testimonial submitted for review', testimonial });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================
// QUIZ ROUTES
// ============================================================

const QUIZZES_COLLECTION = 'quizzes';
const QUIZ_QUESTIONS_COLLECTION = 'quiz_questions';
const QUIZ_ATTEMPTS_COLLECTION = 'quiz_attempts';

// GET quizzes for a course (student/instructor/admin)
router.get('/courses/:courseId/quizzes', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { courseId } = req.params;
  try {
    const result = await databases.listDocuments(DATABASE_ID, QUIZZES_COLLECTION, [
      Query.equal('courseId', courseId),
      Query.orderAsc('order'),
      Query.limit(50)
    ]);
    res.status(200).json({ quizzes: result.documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET questions for a quiz (correctOption hidden for students)
router.get('/quizzes/:quizId/questions', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { quizId } = req.params;
  const role = req.user?.role || '';
  const isEditor = ['Instructor', 'Admin', 'Super Admin'].includes(role);
  try {
    const result = await databases.listDocuments(DATABASE_ID, QUIZ_QUESTIONS_COLLECTION, [
      Query.equal('quizId', quizId),
      Query.orderAsc('order'),
      Query.limit(100)
    ]);
    const questions = result.documents.map((q: any) => {
      if (!isEditor) {
        const { correctOption, ...safe } = q;
        return safe;
      }
      return q;
    });
    res.status(200).json({ questions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE quiz (instructor/admin)
router.post('/courses/:courseId/quizzes', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { courseId } = req.params;
  const role = req.user?.role || '';
  if (!['Instructor', 'Admin', 'Super Admin'].includes(role)) {
    return res.status(403).json({ error: 'Instructor or Admin access required.' });
  }
  const { title, description, passingScore, order } = req.body;
  if (!title) return res.status(400).json({ error: 'Quiz title is required.' });
  try {
    const quiz = await databases.createDocument(DATABASE_ID, QUIZZES_COLLECTION, ID.unique(), {
      courseId,
      title,
      description: description || '',
      passingScore: Number(passingScore) || 70,
      order: Number(order) || 1,
      isPublished: false
    });
    res.status(201).json({ quiz });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE quiz (instructor/admin)
router.patch('/quizzes/:quizId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { quizId } = req.params;
  const role = req.user?.role || '';
  if (!['Instructor', 'Admin', 'Super Admin'].includes(role)) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  const { title, description, passingScore, order, isPublished } = req.body;
  const update: Record<string, any> = {};
  if (title !== undefined) update.title = title;
  if (description !== undefined) update.description = description;
  if (passingScore !== undefined) update.passingScore = Number(passingScore);
  if (order !== undefined) update.order = Number(order);
  if (isPublished !== undefined) update.isPublished = Boolean(isPublished);
  try {
    const quiz = await databases.updateDocument(DATABASE_ID, QUIZZES_COLLECTION, quizId, update);
    res.status(200).json({ quiz });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE quiz + all its questions
router.delete('/quizzes/:quizId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { quizId } = req.params;
  const role = req.user?.role || '';
  if (!['Instructor', 'Admin', 'Super Admin'].includes(role)) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  try {
    // Delete all questions first
    const questions = await databases.listDocuments(DATABASE_ID, QUIZ_QUESTIONS_COLLECTION, [
      Query.equal('quizId', quizId), Query.limit(100)
    ]);
    await Promise.all(questions.documents.map((q: any) =>
      databases.deleteDocument(DATABASE_ID, QUIZ_QUESTIONS_COLLECTION, q.$id)
    ));
    // Delete all attempts
    const attempts = await databases.listDocuments(DATABASE_ID, QUIZ_ATTEMPTS_COLLECTION, [
      Query.equal('quizId', quizId), Query.limit(100)
    ]);
    await Promise.all(attempts.documents.map((a: any) =>
      databases.deleteDocument(DATABASE_ID, QUIZ_ATTEMPTS_COLLECTION, a.$id)
    ));
    await databases.deleteDocument(DATABASE_ID, QUIZZES_COLLECTION, quizId);
    res.status(200).json({ message: 'Quiz deleted.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ADD question to quiz
router.post('/quizzes/:quizId/questions', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { quizId } = req.params;
  const role = req.user?.role || '';
  if (!['Instructor', 'Admin', 'Super Admin'].includes(role)) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  const { question, optionA, optionB, optionC, optionD, correctOption, points, order } = req.body;
  if (!question || !optionA || !optionB || !correctOption) {
    return res.status(400).json({ error: 'question, optionA, optionB, and correctOption are required.' });
  }
  if (!['A', 'B', 'C', 'D'].includes(correctOption)) {
    return res.status(400).json({ error: 'correctOption must be A, B, C, or D.' });
  }
  try {
    const q = await databases.createDocument(DATABASE_ID, QUIZ_QUESTIONS_COLLECTION, ID.unique(), {
      quizId,
      question,
      optionA,
      optionB,
      optionC: optionC || '',
      optionD: optionD || '',
      correctOption,
      points: Number(points) || 1,
      order: Number(order) || 1
    });
    res.status(201).json({ question: q });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE question
router.patch('/quiz_questions/:questionId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { questionId } = req.params;
  const role = req.user?.role || '';
  if (!['Instructor', 'Admin', 'Super Admin'].includes(role)) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  const { question, optionA, optionB, optionC, optionD, correctOption, points, order } = req.body;
  const update: Record<string, any> = {};
  if (question !== undefined) update.question = question;
  if (optionA !== undefined) update.optionA = optionA;
  if (optionB !== undefined) update.optionB = optionB;
  if (optionC !== undefined) update.optionC = optionC;
  if (optionD !== undefined) update.optionD = optionD;
  if (correctOption !== undefined) update.correctOption = correctOption;
  if (points !== undefined) update.points = Number(points);
  if (order !== undefined) update.order = Number(order);
  try {
    const q = await databases.updateDocument(DATABASE_ID, QUIZ_QUESTIONS_COLLECTION, questionId, update);
    res.status(200).json({ question: q });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE question
router.delete('/quiz_questions/:questionId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { questionId } = req.params;
  const role = req.user?.role || '';
  if (!['Instructor', 'Admin', 'Super Admin'].includes(role)) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  try {
    await databases.deleteDocument(DATABASE_ID, QUIZ_QUESTIONS_COLLECTION, questionId);
    res.status(200).json({ message: 'Question deleted.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// SUBMIT quiz attempt (student auto-grades)
router.post('/quizzes/:quizId/submit', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { quizId } = req.params;
  const studentId = req.user?.id || '';

  try {
    // Check if already attempted
    const existing = await databases.listDocuments(DATABASE_ID, QUIZ_ATTEMPTS_COLLECTION, [
      Query.equal('quizId', quizId),
      Query.equal('studentId', studentId),
      Query.limit(1)
    ]);
    if (existing.total > 0) {
      return res.status(409).json({ error: 'You have already completed this quiz.', attempt: existing.documents[0] });
    }

    // Fetch quiz for passingScore + courseId
    const quiz = await databases.getDocument(DATABASE_ID, QUIZZES_COLLECTION, quizId) as any;

    // Fetch all questions with correct answers
    const questionsResult = await databases.listDocuments(DATABASE_ID, QUIZ_QUESTIONS_COLLECTION, [
      Query.equal('quizId', quizId),
      Query.limit(100)
    ]);
    const questions = questionsResult.documents as any[];

    // answers: { [questionId]: 'A'|'B'|'C'|'D' }
    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'answers object is required.' });
    }

    // Auto-grade
    let score = 0;
    let maxScore = 0;
    for (const q of questions) {
      maxScore += q.points || 1;
      if (answers[q.$id] === q.correctOption) {
        score += q.points || 1;
      }
    }

    const passed = maxScore > 0 ? (score / maxScore) * 100 >= quiz.passingScore : false;

    const attempt = await databases.createDocument(DATABASE_ID, QUIZ_ATTEMPTS_COLLECTION, ID.unique(), {
      quizId,
      studentId,
      courseId: quiz.courseId,
      score,
      maxScore,
      passed,
      answersJson: JSON.stringify(answers),
      completedAt: new Date().toISOString()
    });

    // Include correct answers in response so student sees what they got right
    const breakdown = questions.map((q: any) => ({
      questionId: q.$id,
      question: q.question,
      selected: answers[q.$id] || null,
      correct: q.correctOption,
      isCorrect: answers[q.$id] === q.correctOption,
      points: q.points || 1
    }));

    res.status(201).json({ attempt, score, maxScore, passed, passingScore: quiz.passingScore, breakdown });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET student's own attempt for a quiz
router.get('/quizzes/:quizId/attempt', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { quizId } = req.params;
  const studentId = req.user?.id || '';
  try {
    const result = await databases.listDocuments(DATABASE_ID, QUIZ_ATTEMPTS_COLLECTION, [
      Query.equal('quizId', quizId),
      Query.equal('studentId', studentId),
      Query.limit(1)
    ]);
    if (result.total === 0) return res.status(200).json({ attempt: null });
    res.status(200).json({ attempt: result.documents[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET all quiz attempts (admin)
router.get('/admin/quiz-attempts', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const role = req.user?.role || '';
  if (!['Admin', 'Super Admin'].includes(role)) return res.status(403).json({ error: 'Admin access required.' });
  try {
    const result = await databases.listDocuments(DATABASE_ID, QUIZ_ATTEMPTS_COLLECTION, [
      Query.orderDesc('$createdAt'), Query.limit(200)
    ]);
    res.status(200).json({ attempts: result.documents, total: result.total });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/testimonials/:testimonialId/approve', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (!(await ensureAcademyReviewer(req.user?.role))) return res.status(403).json({ error: 'Access denied.' });
  const { testimonialId } = req.params;
  const { isApproved } = req.body;

  try {
    const testimonial = await databases.updateDocument(DATABASE_ID, 'testimonials', testimonialId, {
      isApproved: Boolean(isApproved)
    });
    res.status(200).json({ message: 'Testimonial status updated', testimonial });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a course
router.delete('/admin/courses/:courseId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (!(await ensureAcademyReviewer(req.user?.role))) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const { courseId } = req.params;

  try {
    // 1. Delete course
    await databases.deleteDocument(DATABASE_ID, COURSES_COLLECTION, courseId);
    
    // 2. Delete all lessons for this course
    try {
      const lessons = await databases.listDocuments(DATABASE_ID, LESSONS_COLLECTION, [
        Query.equal('courseId', courseId),
        Query.limit(100)
      ]);
      await Promise.all(lessons.documents.map(l => databases.deleteDocument(DATABASE_ID, LESSONS_COLLECTION, l.$id)));
    } catch (_) {}

    // 3. Delete all enrollments for this course
    try {
      const enrollments = await databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION, [
        Query.equal('courseId', courseId),
        Query.limit(100)
      ]);
      await Promise.all(enrollments.documents.map(e => databases.deleteDocument(DATABASE_ID, ENROLLMENTS_COLLECTION, e.$id)));
    } catch (_) {}

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err: any) {
    console.error('[Academy] Error deleting course:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
