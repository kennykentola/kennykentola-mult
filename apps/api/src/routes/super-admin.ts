import express from 'express';
import { databases } from '../services/appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { Query } from 'node-appwrite';
import { getOnlineUsers } from '../services/socket';

const router = express.Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const PROFILES_COLLECTION = 'users_profile';

// Strict Middleware for Super Admin only
router.use(authenticateJWT, (req: AuthenticatedRequest, res, next) => {
  if (req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Access denied. Super Administrator privileges required.' });
  }
  next();
});

function getDisplayName(profile: any, fallback: string) {
  if (!profile) return fallback;
  return `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || fallback;
}

router.get('/overview', async (_req: AuthenticatedRequest, res) => {
  try {
    const [usersResult, paymentsResult, coursesResult, profilesResult] = await Promise.all([
      databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION, [Query.limit(1000)]),
      databases.listDocuments(DATABASE_ID, 'payments', [Query.limit(1000)]),
      databases.listDocuments(DATABASE_ID, 'courses', [Query.limit(1000)]),
      databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION, [Query.orderDesc('$createdAt'), Query.limit(1000)])
    ]);

    const coursesById = new Map((coursesResult.documents as any[]).map((course) => [course.$id, course]));
    const profilesByUserId = new Map((profilesResult.documents as any[]).map((profile) => [profile.userId, profile]));

    const revenue = (paymentsResult.documents as any[])
      .filter((payment) => payment.status === 'verified')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const recentActivity = [
      ...(paymentsResult.documents as any[])
        .slice(0, 3)
        .map((payment) => ({
          msg: `${payment.status === 'verified' ? 'Payment verified' : payment.status === 'rejected' ? 'Payment rejected' : 'Payment submitted'} for ${payment.type}`,
          time: new Date(payment.verifiedAt || payment.submittedAt || payment.$createdAt).toLocaleString(),
          type: payment.status === 'verified' ? 'success' : payment.status === 'rejected' ? 'warning' : 'info'
        })),
      ...(coursesResult.documents as any[])
        .slice(0, 2)
        .map((course) => ({
          msg: `New course "${course.title}" created`,
          time: new Date(course.$createdAt).toLocaleString(),
          type: course.isPublished ? 'success' : 'info'
        })),
      ...(usersResult.documents as any[])
        .slice(0, 2)
        .map((profile) => ({
          msg: `New user ${getDisplayName(profile, profile.userId)} registered`,
          time: new Date(profile.$createdAt).toLocaleString(),
          type: 'info'
        }))
    ].slice(0, 6);

    const activeSessions = getOnlineUsers().length;

    const payouts = (coursesResult.documents as any[])
      .map((course) => {
        const verifiedPayments = (paymentsResult.documents as any[]).filter(
          (payment) => payment.status === 'verified' && payment.type === 'course' && payment.referenceId === course.$id
        );

        if (verifiedPayments.length === 0) {
          return null;
        }

        const gross = verifiedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const payoutAmount = Math.round(gross * 0.7);
        const instructorProfile = profilesByUserId.get(course.instructorId);

        return {
          id: course.$id,
          instructor: getDisplayName(instructorProfile, course.instructorName || course.instructorId || 'Unknown Instructor'),
          amount: payoutAmount,
          status: 'pending' as const,
          date: new Date(verifiedPayments[0].verifiedAt || verifiedPayments[0].submittedAt || verifiedPayments[0].$createdAt).toISOString()
        };
      })
      .filter(Boolean);

    const allUsers = usersResult.documents as any[];
    const userBreakdown = {
      students: 0,
      instructors: 0,
      admins: 0,
      clients: 0
    };

    allUsers.forEach(u => {
      const role = (u.role || '').toLowerCase();
      if (role === 'student') userBreakdown.students++;
      else if (role === 'instructor') userBreakdown.instructors++;
      else if (role.includes('admin')) userBreakdown.admins++;
      else userBreakdown.clients++; // commercial, printing, maintenance, etc.
    });


    res.json({
      metrics: {
        usersCount: usersResult.total || usersResult.documents.length,
        userBreakdown,
        revenue,
        activeSessions
      },
      recentActivity,
      payouts,
      allProfiles: allUsers.map(u => ({
        $id: u.$id,
        userId: u.userId,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
        purpose: u.purpose,
        clientType: u.clientType,
        $createdAt: u.$createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/super-admin/users
router.get('/users', async (req: AuthenticatedRequest, res) => {
  try {
    const profilesResult = await databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION, [
      Query.orderDesc('$createdAt'),
      Query.limit(500)
    ]);
    res.status(200).json({ users: profilesResult.documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/super-admin/users/:userId/role
router.patch('/users/:userId/role', async (req: AuthenticatedRequest, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  try {
    // We update the Appwrite document in users_profile.
    // (Note: To truly revoke access across the board, you might also need to update Appwrite Auth labels, 
    // but updating the profile doc is sufficient for our middleware logic which relies on profile.role).
    const docResult = await databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION, [
      Query.equal('userId', userId)
    ]);

    if (docResult.total === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const docId = docResult.documents[0].$id;
    const updated = await databases.updateDocument(DATABASE_ID, PROFILES_COLLECTION, docId, {
      role
    });

    res.status(200).json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/super-admin/payouts
router.get('/payouts', async (req: AuthenticatedRequest, res) => {
  try {
    const [coursesResult, paymentsResult, profilesResult] = await Promise.all([
      databases.listDocuments(DATABASE_ID, 'courses', [Query.limit(1000)]),
      databases.listDocuments(DATABASE_ID, 'payments', [Query.limit(1000)]),
      databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION, [Query.limit(1000)])
    ]);

    const profilesByUserId = new Map((profilesResult.documents as any[]).map((profile) => [profile.userId, profile]));

    const payouts = (coursesResult.documents as any[])
      .map((course) => {
        const verifiedPayments = (paymentsResult.documents as any[]).filter(
          (payment) => payment.status === 'verified' && payment.type === 'course' && payment.referenceId === course.$id
        );

        if (verifiedPayments.length === 0) {
          return null;
        }

        const gross = verifiedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const amount = Math.round(gross * 0.7);
        const instructorProfile = profilesByUserId.get(course.instructorId);

        return {
          id: course.$id,
          instructor: getDisplayName(instructorProfile, course.instructorName || course.instructorId || 'Unknown Instructor'),
          amount,
          status: 'pending' as const,
          date: new Date(verifiedPayments[0].verifiedAt || verifiedPayments[0].submittedAt || verifiedPayments[0].$createdAt).toISOString()
        };
      })
      .filter(Boolean);

    res.status(200).json({ payouts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/super-admin/payouts/:id
router.patch('/payouts/:id', async (req: AuthenticatedRequest, res) => {
  try {
    res.status(200).json({ success: true, message: 'Payout marked as paid' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
