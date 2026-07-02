import { Router } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const COLLECTION_ID = 'project_portfolio';

// Public route to get active portfolio items
router.get('/', async (req, res) => {
  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('status', 'active'),
      Query.orderDesc('$createdAt')
    ]);
    res.status(200).json(result.documents);
  } catch (err: any) {
    console.error('Failed to fetch project portfolio:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Admin routes
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  try {
    const data = req.body;
    data.createdAt = new Date().toISOString();
    const result = await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), data);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  try {
    const { id } = req.params;
    const result = await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, req.body);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  try {
    const { id } = req.params;
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
