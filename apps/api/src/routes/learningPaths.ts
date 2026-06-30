import { Router, Request, Response } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { requireAdmin } from '../middleware/auth';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const COLLECTION_ID = 'learning_paths';

// GET all learning paths (Public)
router.get('/', async (req, res) => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
    res.status(200).json(response.documents);
  } catch (error: any) {
    console.error('Error fetching learning paths:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// GET single learning path by slug (Public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('slug', slug),
      Query.limit(1)
    ]);

    if (response.documents.length === 0) {
      return res.status(404).json({ error: 'Learning path not found' });
    }

    res.status(200).json(response.documents[0]);
  } catch (error: any) {
    console.error('Error fetching learning path:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// POST create learning path (Admin Only)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { 
      title, slug, description, iconName, color, borderColor, 
      duration, level, prerequisites, technologies, careerOutcomes, curriculum 
    } = req.body;

    // Basic validation
    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and slug are required' });
    }

    // Check if slug exists
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('slug', slug)
    ]);

    if (existing.total > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const payload = {
      title, slug, description, iconName, color, borderColor,
      duration, level, prerequisites, technologies, careerOutcomes, curriculum
    };

    const response = await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), payload);
    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating learning path:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// PUT update learning path (Admin Only)
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    
    // Remove appwrite specific attributes if sent by accident
    delete payload.$id;
    delete payload.$createdAt;
    delete payload.$updatedAt;
    delete payload.$permissions;
    delete payload.$databaseId;
    delete payload.$collectionId;

    const response = await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, payload);
    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error updating learning path:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// DELETE learning path (Admin Only)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting learning path:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
