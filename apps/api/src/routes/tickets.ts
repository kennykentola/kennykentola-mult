import { Router } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const TICKETS_COLLECTION = 'tickets';
const MESSAGES_COLLECTION = 'chat_messages';

// ──────────────────────────────────────────────────
// AUTHENTICATED: Create a new support ticket
// ──────────────────────────────────────────────────
router.post('/requests', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const { subject, description, priority, projectOrContractId } = req.body;

  if (!subject || !description) {
    return res.status(400).json({ error: 'Subject and description are required.' });
  }

  try {
    const data: any = {
      userId,
      subject,
      description,
      priority: priority || 'medium',
      status: 'open',
    };
    
    if (projectOrContractId) {
      data.projectOrContractId = projectOrContractId;
    }

    const ticket = await databases.createDocument(
      DATABASE_ID,
      TICKETS_COLLECTION,
      ID.unique(),
      data
    );

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket
    });
  } catch (err: any) {
    console.error('[Tickets] Error creating ticket:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Get all tickets for the logged in client
// ──────────────────────────────────────────────────
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      TICKETS_COLLECTION,
      [Query.equal('userId', userId || ''), Query.orderDesc('$createdAt')]
    );

    res.status(200).json({ tickets: response.documents });
  } catch (err: any) {
    console.error('[Tickets] Error fetching user tickets:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Get tickets by project ID
// ──────────────────────────────────────────────────
router.get('/project/:projectId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { projectId } = req.params;
  const userId = req.user?.id;
  const role = req.user?.role;

  try {
    if (role !== 'Admin' && role !== 'Super Admin') {
      const project = await databases.getDocument(DATABASE_ID, 'agency_projects', projectId) as any;
      if (project.clientId !== userId && project.pmId !== userId && !(project.assignedTeam && project.assignedTeam.includes(userId))) {
        return res.status(403).json({ error: 'Access denied.' });
      }
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      TICKETS_COLLECTION,
      [Query.equal('projectOrContractId', projectId), Query.orderDesc('$createdAt')]
    );

    res.status(200).json({ tickets: response.documents });
  } catch (err: any) {
    console.error('[Tickets] Error fetching project tickets:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Get single ticket by ID
// ──────────────────────────────────────────────────
router.get('/:ticketId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { ticketId } = req.params;

  try {
    const ticket = await databases.getDocument(
      DATABASE_ID,
      TICKETS_COLLECTION,
      ticketId
    ) as any;

    if (ticket.userId !== req.user?.id && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
      if (ticket.projectOrContractId) {
        try {
          const project = await databases.getDocument(DATABASE_ID, 'agency_projects', ticket.projectOrContractId) as any;
          if (project.pmId !== req.user?.id && !(project.assignedTeam && project.assignedTeam.includes(req.user?.id))) {
            return res.status(403).json({ error: 'Access denied.' });
          }
        } catch {
          return res.status(403).json({ error: 'Access denied.' });
        }
      } else {
        return res.status(403).json({ error: 'Access denied.' });
      }
    }

    // Fetch messages for this ticket (using the ticketId as the roomId)
    const messages = await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION,
      [Query.equal('roomId', ticketId), Query.orderAsc('$createdAt')]
    );

    res.status(200).json({
      ticket,
      messages: messages.documents,
    });
  } catch (err: any) {
    console.error('[Tickets] Error fetching ticket:', err.message);
    res.status(404).json({ error: 'Ticket not found.' });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Send message in a ticket
// ──────────────────────────────────────────────────
router.post('/:ticketId/messages', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { ticketId } = req.params;
  const { content, fileUrl } = req.body;
  const userId = req.user?.id;
  const userName = req.user?.name || 'User';

  if (!content) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  try {
    const ticket = await databases.getDocument(DATABASE_ID, TICKETS_COLLECTION, ticketId) as any;
    if (ticket.userId !== userId && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
      if (ticket.projectOrContractId) {
        const project = await databases.getDocument(DATABASE_ID, 'agency_projects', ticket.projectOrContractId) as any;
        if (project.pmId !== userId && !(project.assignedTeam && project.assignedTeam.includes(userId))) {
          return res.status(403).json({ error: 'Access denied.' });
        }
      } else {
        return res.status(403).json({ error: 'Access denied.' });
      }
    }

    const messageData: any = {
      roomId: ticketId,
      senderId: userId,
      type: 'text',
      content: content
    };

    if (fileUrl) {
      messageData.fileId = fileUrl;
    }

    const message = await databases.createDocument(
      DATABASE_ID,
      MESSAGES_COLLECTION,
      ID.unique(),
      messageData
    );

    res.status(201).json({ message });
  } catch (err: any) {
    console.error('[Tickets] Error sending message:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN ONLY: Get all tickets globally
// ──────────────────────────────────────────────────
router.get('/admin/all', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  try {
    const response = await databases.listDocuments(DATABASE_ID, TICKETS_COLLECTION, [
      Query.orderDesc('$createdAt')
    ]);
    res.status(200).json({ tickets: response.documents });
  } catch (err: any) {
    console.error('[Tickets Admin] Error fetching all tickets:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN ONLY: Update ticket status/priority
// ──────────────────────────────────────────────────
router.patch('/admin/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  const { id } = req.params;
  const { status, priority, assignedTo } = req.body;

  try {
    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;

    const ticket = await databases.updateDocument(
      DATABASE_ID,
      TICKETS_COLLECTION,
      id,
      updateData
    );

    res.status(200).json({ message: 'Ticket updated successfully', ticket });
  } catch (err: any) {
    console.error('[Tickets Admin] Error updating ticket:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
