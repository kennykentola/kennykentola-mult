import { Router } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const STUDENT_PROJECTS_COLLECTION = 'student_projects';

const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    universityName: z.string().optional().default(''),
    department: z.string().optional().default(''),
    degree: z.string().optional().default(''),
    level: z.string().optional().default(''),
    serviceScope: z.string().optional().default('Full Process')
  })
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Create a new academic project request
// ──────────────────────────────────────────────────
router.post('/requests', authenticateJWT, validateRequest(createProjectSchema), async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const { title, description, universityName, department, degree, level, serviceScope } = req.body;

  try {
    const project = await databases.createDocument(
      DATABASE_ID,
      STUDENT_PROJECTS_COLLECTION,
      ID.unique(),
      {
        studentId: userId,
        title,
        description,
        universityName,
        department,
        degree,
        level,
        status: 'pending-proposal',
        serviceScope,
        price: 0
      }
    );

    res.status(201).json({
      message: 'Academic project requested successfully',
      project
    });
  } catch (err: any) {
    console.error('[Academic Projects] Error creating request:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Get all academic projects for the logged in user
// ──────────────────────────────────────────────────
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      STUDENT_PROJECTS_COLLECTION,
      [Query.equal('studentId', userId || '')]
    );

    res.status(200).json({ projects: response.documents });
  } catch (err: any) {
    console.error('[Academic Projects] Error fetching projects:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Get a single academic project by ID
// ──────────────────────────────────────────────────
router.get('/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  try {
    const project = await databases.getDocument(DATABASE_ID, STUDENT_PROJECTS_COLLECTION, id);
    
    // Only allow access if user is the student who requested it (admins handled in admin.ts usually, but if needed, we can check role)
    if ((project as any).studentId !== userId && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
       return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json({ project });
  } catch (err: any) {
    console.error('[Academic Projects] Error fetching project:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Student approves deliverables
// ──────────────────────────────────────────────────
router.patch('/:id/approve', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  try {
    const project = await databases.getDocument(DATABASE_ID, STUDENT_PROJECTS_COLLECTION, id);
    
    if ((project as any).studentId !== userId) {
       return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await databases.updateDocument(DATABASE_ID, STUDENT_PROJECTS_COLLECTION, id, {
      status: 'approved_by_student'
    });

    res.status(200).json({ project: updated });
  } catch (err: any) {
    console.error('[Academic Projects] Error approving project:', err.message);
    res.status(400).json({ error: err.message });
  }
});

const submitReceiptSchema = z.object({
  body: z.object({
    paymentReceiptUrl: z.string().url('Must be a valid URL')
  })
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Student uploads payment receipt
// ──────────────────────────────────────────────────
router.patch('/:id/payment', authenticateJWT, validateRequest(submitReceiptSchema), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const { paymentReceiptUrl } = req.body;
  try {
    const project = await databases.getDocument(DATABASE_ID, STUDENT_PROJECTS_COLLECTION, id);
    
    if ((project as any).studentId !== userId) {
       return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await databases.updateDocument(DATABASE_ID, STUDENT_PROJECTS_COLLECTION, id, {
      paymentReceiptUrl,
      status: 'payment-verifying'
    });

    res.status(200).json({ project: updated });
  } catch (err: any) {
    console.error('[Academic Projects] Error uploading receipt:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN ONLY: Get all academic projects globally
// ──────────────────────────────────────────────────
router.get('/admin/all', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  try {
    const response = await databases.listDocuments(DATABASE_ID, STUDENT_PROJECTS_COLLECTION, [
      Query.orderDesc('$createdAt')
    ]);
    res.status(200).json({ projects: response.documents });
  } catch (err: any) {
    console.error('[Academic Projects Admin] Error fetching all projects:', err.message);
    res.status(400).json({ error: err.message });
  }
});

const updateAdminProjectSchema = z.object({
  body: z.object({
    status: z.enum(['pending-proposal', 'quoting', 'awaiting-payment', 'payment-verifying', 'in-progress', 'completed', 'approved_by_student']).optional(),
    price: z.coerce.number().min(0).optional(),
    assignedDeveloper: z.string().optional(),
    proposalUrl: z.string().url().or(z.literal('')).optional(),
    documentationUrl: z.string().url().or(z.literal('')).optional(),
    sourceCodeUrl: z.string().url().or(z.literal('')).optional()
  })
});

// ──────────────────────────────────────────────────
// ADMIN ONLY: Update academic project status/price
// ──────────────────────────────────────────────────
router.patch('/admin/:id', authenticateJWT, validateRequest(updateAdminProjectSchema), async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  const { id } = req.params;
  const { status, price, assignedDeveloper, proposalUrl, documentationUrl, sourceCodeUrl } = req.body;

  try {
    // Only update fields that are provided
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (price !== undefined) updateData.price = Number(price);
    if (assignedDeveloper !== undefined) updateData.assignedDeveloper = assignedDeveloper;
    if (proposalUrl !== undefined) updateData.proposalUrl = proposalUrl;
    if (documentationUrl !== undefined) updateData.documentationUrl = documentationUrl;
    if (sourceCodeUrl !== undefined) updateData.sourceCodeUrl = sourceCodeUrl;

    const project = await databases.updateDocument(DATABASE_ID, STUDENT_PROJECTS_COLLECTION, id, updateData);

    res.status(200).json({
      message: 'Academic project updated successfully',
      project
    });
  } catch (err: any) {
    console.error('[Academic Projects Admin] Error updating project:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
