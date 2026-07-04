import { Router, Request, Response } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { databases } from '../services/appwrite';
import { Query } from 'node-appwrite';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

// Get notifications for a user
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { documents } = await databases.listDocuments(
      DATABASE_ID,
      'notifications',
      [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt'),
        Query.limit(50)
      ]
    );

    res.json(documents);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark a notification as read
router.patch('/:id/read', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Ensure they own it
    const notification = await databases.getDocument(DATABASE_ID, 'notifications', id) as any;
    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await databases.updateDocument(
      DATABASE_ID,
      'notifications',
      id,
      { isRead: true }
    );

    res.json(updated);
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all as read
router.patch('/read-all', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { documents } = await databases.listDocuments(
      DATABASE_ID,
      'notifications',
      [
        Query.equal('userId', userId),
        Query.equal('isRead', false)
      ]
    );

    // Batch update
    await Promise.all(documents.map(doc => 
      databases.updateDocument(DATABASE_ID, 'notifications', doc.$id, { isRead: true })
    ));

    res.json({ success: true, count: documents.length });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

export default router;
