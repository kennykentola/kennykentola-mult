import { Router } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT, optionalAuthenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const STUDENT_PROJECTS_COLLECTION = 'student_projects';
const MESSAGES_COLLECTION = 'chat_messages';
const MILESTONES_COLLECTION = 'project_milestones'; // we can just reuse this collection for academic milestones

const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    universityName: z.string().optional().default(''),
    department: z.string().optional().default(''),
    degree: z.string().optional().default(''),
    level: z.string().optional().default(''),
    serviceScope: z.string().optional().default('Full Process'),
    initialDocumentUrl: z.string().optional()
  })
});

// ──────────────────────────────────────────────────
// AUTHENTICATED OR GUEST: Create a new academic project request
// ──────────────────────────────────────────────────
router.post('/requests', optionalAuthenticateJWT, validateRequest(createProjectSchema), async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id || 'guest';
  let { title, description, universityName, department, degree, level, serviceScope, initialDocumentUrl, clientName, clientEmail, clientPhone } = req.body;

  if (userId === 'guest') {
    description = `[GUEST REQUEST] Name: ${clientName || 'N/A'} | Email: ${clientEmail || 'N/A'} | Phone: ${clientPhone || 'N/A'}\n\n${description}`;
  }

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
        price: 0,
        initialDocumentUrl
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
    
    // Only allow access if user is the student who requested it, an Admin, or the assigned Mentor
    const isAdmin = req.user?.role === 'Admin' || req.user?.role === 'Super Admin';
    const isStudent = (project as any).studentId === userId;
    const isAssignedMentor = req.user?.role === 'Mentor' && (project as any).assignedMentorId === userId;

    if (!isStudent && !isAdmin && !isAssignedMentor) {
       return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch associated chat messages
    const messages = await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION,
      [Query.equal('roomId', id), Query.orderAsc('$createdAt')]
    );

    res.status(200).json({ project, messages: messages.documents });
  } catch (err: any) {
    console.error('[Academic Projects] Error fetching project:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Send a chat message for an academic project
// ──────────────────────────────────────────────────
router.post('/:id/messages', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) return res.status(400).json({ error: 'Content is required.' });

  try {
    const senderName = req.user?.name || 'Unknown User';
    const message = await databases.createDocument(
      DATABASE_ID,
      MESSAGES_COLLECTION,
      ID.unique(),
      {
        roomId: id,
        senderId: req.user?.id,
        senderName: senderName,
        content
      }
    );

    res.status(201).json({ message });
  } catch (err: any) {
    console.error('[Academic Projects] Error sending message:', err.message);
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
    paymentReceiptUrl: z.string().min(1)
  })
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Student uploads payment receipt (Part by Part)
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

    // Append the new receipt URL using a comma separator if one already exists
    let newReceipts = paymentReceiptUrl;
    if ((project as any).paymentReceiptUrl) {
      newReceipts = `${(project as any).paymentReceiptUrl},${paymentReceiptUrl}`;
    }

    const updated = await databases.updateDocument(DATABASE_ID, STUDENT_PROJECTS_COLLECTION, id, {
      paymentReceiptUrl: newReceipts,
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
    status: z.string().optional(),
    price: z.coerce.number().min(0).optional(),
    amountPaid: z.coerce.number().min(0).optional(),
    assignedDeveloper: z.string().optional(),
    assignedMentorId: z.string().optional(),
    assignedMentorName: z.string().optional(),
    proposalUrl: z.string().optional(),
    documentationUrl: z.string().optional(),
    sourceCodeUrl: z.string().optional()
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
  const { status, price, amountPaid, assignedDeveloper, assignedMentorId, assignedMentorName, proposalUrl, documentationUrl, sourceCodeUrl } = req.body;

  try {
    // Only update fields that are provided
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (price !== undefined) updateData.price = Number(price);
    if (amountPaid !== undefined) updateData.amountPaid = Number(amountPaid);
    if (assignedDeveloper !== undefined) updateData.assignedDeveloper = assignedDeveloper;
    if (assignedMentorId !== undefined) updateData.assignedMentorId = assignedMentorId;
    if (assignedMentorName !== undefined) updateData.assignedMentorName = assignedMentorName;
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

// ──────────────────────────────────────────────────
// MENTOR ONLY: Get all projects assigned to the mentor
// ──────────────────────────────────────────────────
router.get('/mentor/all', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Mentor') {
    return res.status(403).json({ error: 'Unauthorized. Mentors only.' });
  }

  try {
    const response = await databases.listDocuments(DATABASE_ID, STUDENT_PROJECTS_COLLECTION, [
      Query.equal('assignedMentorId', req.user.id),
      Query.orderDesc('$createdAt')
    ]);
    res.status(200).json({ projects: response.documents });
  } catch (err: any) {
    console.error('[Academic Projects Mentor] Error fetching projects:', err.message);
    res.status(400).json({ error: err.message });
  }
});

const updateMentorProjectSchema = z.object({
  body: z.object({
    status: z.string().optional(),
    documentationUrl: z.string().optional(),
    sourceCodeUrl: z.string().optional()
  })
});

// ──────────────────────────────────────────────────
// MENTOR ONLY: Update academic project (status and deliverables only)
// ──────────────────────────────────────────────────
router.patch('/mentor/:id', authenticateJWT, validateRequest(updateMentorProjectSchema), async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Mentor') {
    return res.status(403).json({ error: 'Unauthorized. Mentors only.' });
  }

  const { id } = req.params;
  const { status, documentationUrl, sourceCodeUrl } = req.body;

  try {
    // Verify project belongs to mentor
    const project = await databases.getDocument(DATABASE_ID, STUDENT_PROJECTS_COLLECTION, id);
    if ((project as any).assignedMentorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (documentationUrl !== undefined) updateData.documentationUrl = documentationUrl;
    if (sourceCodeUrl !== undefined) updateData.sourceCodeUrl = sourceCodeUrl;

    const updated = await databases.updateDocument(DATABASE_ID, STUDENT_PROJECTS_COLLECTION, id, updateData);
    res.status(200).json({ project: updated });
  } catch (err: any) {
    console.error('[Academic Projects] Error updating project by mentor:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// TASKS
// ──────────────────────────────────────────────────

router.get('/:id/tasks', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'academic_tasks', [
      Query.equal('projectId', req.params.id),
      Query.orderAsc('$createdAt')
    ]);
    res.status(200).json({ tasks: response.documents });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/tasks', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    // Only admins or mentors should create tasks ideally, but we'll keep it simple
    const task = await databases.createDocument(DATABASE_ID, 'academic_tasks', ID.unique(), {
      projectId: req.params.id,
      title: req.body.title,
      completed: false
    });
    res.status(201).json({ task });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id/tasks/:taskId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await databases.updateDocument(DATABASE_ID, 'academic_tasks', req.params.taskId, {
      completed: req.body.completed
    });
    res.status(200).json({ task: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id/tasks/:taskId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    await databases.deleteDocument(DATABASE_ID, 'academic_tasks', req.params.taskId);
    res.status(200).json({ message: 'Task deleted' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// PAYMENTS
// ──────────────────────────────────────────────────

router.get('/:id/payments', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'academic_payments', [
      Query.equal('projectId', req.params.id),
      Query.orderAsc('$createdAt')
    ]);
    res.status(200).json({ payments: response.documents });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/payments', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    // Check how many payments exist to set installmentNumber
    const existing = await databases.listDocuments(DATABASE_ID, 'academic_payments', [
      Query.equal('projectId', req.params.id)
    ]);
    
    if (existing.total >= 3) {
      return res.status(400).json({ error: 'Maximum of 3 installments allowed.' });
    }

    const payment = await databases.createDocument(DATABASE_ID, 'academic_payments', ID.unique(), {
      projectId: req.params.id,
      amount: Number(req.body.amount),
      receiptUrl: req.body.receiptUrl,
      status: 'pending',
      installmentNumber: existing.total + 1
    });
    res.status(201).json({ payment });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id/payments/:paymentId/approve', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const payment = await databases.updateDocument(DATABASE_ID, 'academic_payments', req.params.paymentId, {
      status: 'approved'
    });
    
    // Update the project's amountPaid
    const project = await databases.getDocument(DATABASE_ID, STUDENT_PROJECTS_COLLECTION, req.params.id);
    const newAmountPaid = (project as any).amountPaid + (payment as any).amount;
    await databases.updateDocument(DATABASE_ID, STUDENT_PROJECTS_COLLECTION, req.params.id, {
      amountPaid: newAmountPaid
    });

    res.status(200).json({ payment });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
