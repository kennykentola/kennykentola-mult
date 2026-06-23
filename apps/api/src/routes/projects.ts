import { Router } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const PROJECTS_COLLECTION = 'projects';
const MESSAGES_COLLECTION = 'project_messages';
const ASSETS_COLLECTION = 'project_assets';
const MILESTONES_COLLECTION = 'project_milestones';
const PAYMENTS_COLLECTION = 'payments';

// ──────────────────────────────────────────────────
// AUTHENTICATED: Create a new project request
// ──────────────────────────────────────────────────
router.post('/requests', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const { title, description, budget } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  try {
    const project = await databases.createDocument(
      DATABASE_ID,
      PROJECTS_COLLECTION,
      ID.unique(),
      {
        clientId: userId,
        title,
        description,
        budget: Number(budget) || 0,
        status: 'requested',
        developers: [],
        designers: []
      }
    );

    res.status(201).json({
      message: 'Project requested successfully',
      project
    });
  } catch (err: any) {
    console.error('[Projects] Error creating request:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Get current user's projects
// ──────────────────────────────────────────────────
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;

  try {
    const projects = await databases.listDocuments(
      DATABASE_ID,
      PROJECTS_COLLECTION,
      [
        Query.equal('clientId', userId || ''),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]
    );

    res.status(200).json({ projects: projects.documents, total: projects.total });
  } catch (err: any) {
    console.error('[Projects] Error fetching projects:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Get single project by ID
// ──────────────────────────────────────────────────
router.get('/:projectId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { projectId } = req.params;

  try {
    const project = await databases.getDocument(
      DATABASE_ID,
      PROJECTS_COLLECTION,
      projectId
    ) as any;

    if (project.clientId !== req.user?.id && req.user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Fetch milestones
    const milestones = await databases.listDocuments(
      DATABASE_ID,
      MILESTONES_COLLECTION,
      [Query.equal('projectId', projectId), Query.orderAsc('dueDate')]
    );

    // Fetch messages
    const messages = await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION,
      [Query.equal('projectId', projectId), Query.orderAsc('createdAt')]
    );

    // Fetch assets
    const assets = await databases.listDocuments(
      DATABASE_ID,
      ASSETS_COLLECTION,
      [Query.equal('projectId', projectId), Query.orderDesc('createdAt')]
    );

    // Fetch related payments (where referenceId == projectId)
    const payments = await databases.listDocuments(
      DATABASE_ID,
      PAYMENTS_COLLECTION,
      [Query.equal('referenceId', projectId), Query.orderDesc('submittedAt')]
    );

    res.status(200).json({ 
      project, 
      milestones: milestones.documents,
      messages: messages.documents,
      assets: assets.documents,
      payments: payments.documents
    });
  } catch (err: any) {
    console.error('[Projects] Error fetching project details:', err.message);
    res.status(404).json({ error: 'Project not found.' });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Send Chat Message
// ──────────────────────────────────────────────────
router.post('/:projectId/messages', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { projectId } = req.params;
  const { content, fileUrl } = req.body;

  if (!content) return res.status(400).json({ error: 'Content is required.' });

  try {
    const senderName = req.user?.name || 'Unknown User';
    const message = await databases.createDocument(
      DATABASE_ID,
      MESSAGES_COLLECTION,
      ID.unique(),
      {
        projectId,
        senderId: req.user?.id,
        senderName,
        content,
        fileUrl: fileUrl || null,
        createdAt: new Date().toISOString()
      }
    );
    res.status(201).json({ message });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Upload Asset
// ──────────────────────────────────────────────────
router.post('/:projectId/assets', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { projectId } = req.params;
  const { fileName, fileUrl, fileType } = req.body;

  if (!fileName || !fileUrl) return res.status(400).json({ error: 'FileName and FileUrl are required.' });

  try {
    const uploaderName = req.user?.name || 'Unknown User';
    const asset = await databases.createDocument(
      DATABASE_ID,
      ASSETS_COLLECTION,
      ID.unique(),
      {
        projectId,
        uploadedBy: req.user?.id,
        uploaderName,
        fileName,
        fileUrl,
        fileType: fileType || null,
        createdAt: new Date().toISOString()
      }
    );
    res.status(201).json({ asset });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN: List all projects
// ──────────────────────────────────────────────────
router.get('/admin/all', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  try {
    const projects = await databases.listDocuments(
      DATABASE_ID,
      PROJECTS_COLLECTION,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(100)
      ]
    );

    res.status(200).json({ projects: projects.documents, total: projects.total });
  } catch (err: any) {
    console.error('[Projects] Error listing all projects:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN: Update project status/budget
// ──────────────────────────────────────────────────
router.patch('/admin/:projectId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { projectId } = req.params;
  const { status, budget, pmId } = req.body;

  try {
    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (budget !== undefined) updateData.budget = Number(budget);
    if (pmId) updateData.pmId = pmId;
    if (req.body.pmName) updateData.pmName = req.body.pmName;

    const project = await databases.updateDocument(
      DATABASE_ID,
      PROJECTS_COLLECTION,
      projectId,
      updateData
    );

    res.status(200).json({
      message: `Project ${projectId} updated.`,
      project
    });
  } catch (err: any) {
    console.error('[Projects] Error updating project:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN: Create Milestone
// ──────────────────────────────────────────────────
router.post('/admin/:projectId/milestones', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { projectId } = req.params;
  const { title, description, dueDate } = req.body;

  try {
    const milestone = await databases.createDocument(
      DATABASE_ID,
      MILESTONES_COLLECTION,
      ID.unique(),
      {
        projectId,
        title,
        description: description || null,
        dueDate: dueDate || new Date().toISOString(),
        status: 'pending'
      }
    );
    res.status(201).json({ milestone });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN: Update Milestone
// ──────────────────────────────────────────────────
router.patch('/admin/milestones/:milestoneId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { milestoneId } = req.params;
  const { status } = req.body;

  try {
    const milestone = await databases.updateDocument(
      DATABASE_ID,
      MILESTONES_COLLECTION,
      milestoneId,
      { 
        status,
        completedAt: status === 'completed' ? new Date().toISOString() : null
      }
    );
    res.status(200).json({ milestone });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
