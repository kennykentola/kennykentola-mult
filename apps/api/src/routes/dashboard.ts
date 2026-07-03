import { Router } from 'express';
import { databases } from '../services/appwrite';
import { Query } from 'node-appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

router.get('/stats', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 1. Get active projects
    const projects = await databases.listDocuments(
      DATABASE_ID,
      'projects',
      [
        Query.equal('clientId', userId),
        Query.notEqual('status', 'completed')
      ]
    );

    // 2. Get academy courses enrolled
    const enrollments = await databases.listDocuments(
      DATABASE_ID,
      'academy_enrollments',
      [
        Query.equal('studentId', userId)
      ]
    );

    // 3. Get active tickets
    const tickets = await databases.listDocuments(
      DATABASE_ID,
      'tickets',
      [
        Query.equal('userId', userId),
        Query.notEqual('status', 'resolved')
      ]
    );

    res.json({
      activeProjects: projects.total,
      enrolledCourses: enrollments.total,
      openTickets: tickets.total,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
