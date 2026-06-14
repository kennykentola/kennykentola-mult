import { Router } from 'express';
import { Query } from 'node-appwrite';
import { databases, users } from '../services/appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getRecentMonths(count: number) {
  const months: { key: string; label: string }[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: getMonthKey(date),
      label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    });
  }

  return months;
}

router.get('/analytics', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  try {
    const [users, courses, enrollments, printOrders, payments] = await Promise.all([
      databases.listDocuments(DATABASE_ID, 'users_profile', [Query.limit(1000)]),
      databases.listDocuments(DATABASE_ID, 'courses', [Query.limit(1000)]),
      databases.listDocuments(DATABASE_ID, 'course_enrollments', [Query.limit(1000)]),
      databases.listDocuments(DATABASE_ID, 'print_orders', [Query.limit(1000)]),
      databases.listDocuments(DATABASE_ID, 'payments', [Query.limit(1000)])
    ]);

    const totalUsers = users.total;
    const totalCourses = courses.total;
    const totalEnrollments = enrollments.total;
    const totalPrintOrders = printOrders.total;
    const totalRevenue = (payments.documents as any[])
      .filter((payment) => payment.status === 'verified')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const recentMonths = getRecentMonths(5);
    const monthlyBuckets = new Map(
      recentMonths.map((month) => [month.key, { name: month.label, revenue: 0, users: 0, enrollments: 0 }])
    );

    (users.documents as any[]).forEach((user) => {
      const monthKey = getMonthKey(new Date(user.$createdAt));
      const bucket = monthlyBuckets.get(monthKey);
      if (bucket) bucket.users += 1;
    });

    (enrollments.documents as any[]).forEach((enrollment) => {
      const monthKey = getMonthKey(new Date(enrollment.$createdAt));
      const bucket = monthlyBuckets.get(monthKey);
      if (bucket) bucket.enrollments += 1;
    });

    (payments.documents as any[]).forEach((payment) => {
      if (payment.status !== 'verified') return;
      const monthKey = getMonthKey(new Date(payment.verifiedAt || payment.submittedAt || payment.$createdAt));
      const bucket = monthlyBuckets.get(monthKey);
      if (bucket) bucket.revenue += Number(payment.amount || 0);
    });

    const monthlyData = recentMonths.map((month) => monthlyBuckets.get(month.key) || {
      name: month.label,
      revenue: 0,
      users: 0,
      enrollments: 0
    });

    res.status(200).json({
      metrics: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalPrintOrders,
        totalRevenue,
        activeProjects: await databases.listDocuments(DATABASE_ID, 'projects', [Query.limit(1)]).then((result) => result.total).catch(() => 0)
      },
      monthlyData
    });
  } catch (err: any) {
    console.error('[Admin Analytics] Error fetching metrics:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Users Management
router.get('/users', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  try {
    const authUsers = await users.list([Query.limit(100)]);
    const profileUsers = await databases.listDocuments(DATABASE_ID, 'users_profile', [Query.limit(100)]);

    const mapped = (profileUsers.documents as any[]).map((profile) => {
      const authUser = authUsers.users.find(u => u.$id === profile.userId);
      return {
        ...profile,
        status: authUser?.status ? 'active' : 'inactive' // appwrite returns boolean status for active/blocked
      };
    });

    res.status(200).json({ users: mapped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:userId/status', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  const { userId } = req.params;
  const { action } = req.body; // 'deactivate' or 'reactivate'

  try {
    const isActive = action !== 'deactivate';
    await users.updateStatus(userId, isActive);

    await databases.createDocument(DATABASE_ID, 'user_activity_logs', 'unique()', {
      userId: req.user.id,
      action: isActive ? 'reactivate_user' : 'deactivate_user',
      resourceType: 'user',
      resourceId: userId,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({ message: `User successfully ${isActive ? 'reactivated' : 'deactivated'}.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Refunds
router.post('/payments/:paymentId/refund', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  const { paymentId } = req.params;

  try {
    await databases.updateDocument(DATABASE_ID, 'payments', paymentId, {
      status: 'refunded',
      updatedAt: new Date().toISOString()
    });

    await databases.createDocument(DATABASE_ID, 'user_activity_logs', 'unique()', {
      userId: req.user.id,
      action: 'process_refund',
      resourceType: 'payment',
      resourceId: paymentId,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({ message: 'Refund processed successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Activity Logs
router.get('/activity-logs', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  try {
    const logs = await databases.listDocuments(DATABASE_ID, 'user_activity_logs', [
      Query.orderDesc('timestamp'),
      Query.limit(100)
    ]);
    res.status(200).json({ logs: logs.documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Instructor Payouts
router.get('/payouts', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  try {
    const payouts = await databases.listDocuments(DATABASE_ID, 'instructor_payouts', [
      Query.orderDesc('payoutDate'),
      Query.limit(100)
    ]);
    res.status(200).json({ payouts: payouts.documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
