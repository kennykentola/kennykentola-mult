import { Router } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const AGENCY_PROJECTS_COLLECTION = 'agency_projects';

// ──────────────────────────────────────────────────
// AUTHENTICATED: Submit Agency Project Brief
// ──────────────────────────────────────────────────
router.post('/requests', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const { title, description, projectType, budget, deadline } = req.body;

  if (!title || !description || !projectType) {
    return res.status(400).json({ error: 'Title, description, and projectType are required.' });
  }

  try {
    const payload: any = {
      clientId: userId,
      title,
      description,
      projectType,
      status: 'pending-quote',
    };

    if (budget) payload.budget = Number(budget);
    if (deadline) payload.deadline = new Date(deadline).toISOString();

    const project = await databases.createDocument(
      DATABASE_ID,
      AGENCY_PROJECTS_COLLECTION,
      ID.unique(),
      payload
    );

    res.status(201).json({
      message: 'Project estimation brief submitted successfully',
      project
    });
  } catch (err: any) {
    console.error('[Agency] Error creating brief:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Get current client's agency projects
// ──────────────────────────────────────────────────
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;

  try {
    const projects = await databases.listDocuments(
      DATABASE_ID,
      AGENCY_PROJECTS_COLLECTION,
      [
        Query.equal('clientId', userId || ''),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]
    );

    res.status(200).json({ projects: projects.documents });
  } catch (err: any) {
    console.error('[Agency] Error fetching projects:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN: List all agency projects
// ──────────────────────────────────────────────────
router.get('/admin/all', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  try {
    const projects = await databases.listDocuments(
      DATABASE_ID,
      AGENCY_PROJECTS_COLLECTION,
      [Query.orderDesc('$createdAt'), Query.limit(100)]
    );

    res.status(200).json({ projects: projects.documents });
  } catch (err: any) {
    console.error('[Agency] Error listing all projects:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN: Update agency project status/quote
// ──────────────────────────────────────────────────
router.patch('/admin/:projectId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { projectId } = req.params;
  const { status, quotePrice, deadline } = req.body;

  try {
    const updateData: any = {};
    if (status) updateData.status = status;
    if (quotePrice !== undefined) updateData.quotePrice = Number(quotePrice);
    if (deadline) updateData.deadline = new Date(deadline).toISOString();

    const project = await databases.updateDocument(
      DATABASE_ID,
      AGENCY_PROJECTS_COLLECTION,
      projectId,
      updateData
    );

    res.status(200).json({
      message: `Agency project updated.`,
      project
    });
  } catch (err: any) {
    console.error('[Agency] Error updating project:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export const agencyRouter = router;
