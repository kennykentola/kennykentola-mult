import { Router } from 'express';
import { ID, Query } from 'node-appwrite';
import { databases } from '../services/appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const IDEAS_COLLECTION = 'academic_ideas';

// Schema for creating/updating ideas
const ideaSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    category: z.string().optional().default('General'),
    status: z.string().optional().default('active'),
    retentionPeriod: z.string().optional().default('1 year')
  })
});

// GET /api/academic-ideas (Public)
router.get('/', async (req, res) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      IDEAS_COLLECTION,
      [Query.limit(100), Query.orderDesc('createdAt')]
    );
    res.json(response.documents);
  } catch (error: any) {
    console.error('Error fetching ideas:', error);
    res.status(500).json({ error: 'Failed to fetch ideas' });
  }
});

// POST /api/academic-ideas (Admin only)
router.post('/', authenticateJWT, validateRequest(ideaSchema), async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { title, description, category, status, retentionPeriod } = req.body;

  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      IDEAS_COLLECTION,
      ID.unique(),
      {
        title,
        description,
        category,
        status,
        retentionPeriod,
        createdAt: new Date().toISOString()
      }
    );
    res.status(201).json(document);
  } catch (error: any) {
    console.error('Error creating idea:', error);
    res.status(500).json({ error: 'Failed to create idea' });
  }
});

// PUT /api/academic-ideas/:id (Admin only)
router.put('/:id', authenticateJWT, validateRequest(ideaSchema), async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { title, description, category, status, retentionPeriod } = req.body;

  try {
    const document = await databases.updateDocument(
      DATABASE_ID,
      IDEAS_COLLECTION,
      req.params.id,
      {
        title,
        description,
        category,
        status,
        retentionPeriod
      }
    );
    res.json(document);
  } catch (error: any) {
    console.error('Error updating idea:', error);
    res.status(500).json({ error: 'Failed to update idea' });
  }
});

// DELETE /api/academic-ideas/:id (Admin only)
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    await databases.deleteDocument(DATABASE_ID, IDEAS_COLLECTION, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting idea:', error);
    res.status(500).json({ error: 'Failed to delete idea' });
  }
});

export default router;
