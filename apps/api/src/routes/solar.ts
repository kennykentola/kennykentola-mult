import { Router } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const SOLAR_COLLECTION = 'solar_jobs';

// ──────────────────────────────────────────────────
// AUTHENTICATED: Create a new solar/electrical job request
// ──────────────────────────────────────────────────
router.post('/requests', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const { jobType, description, address, scheduledDate, siteImageUrls } = req.body;

  if (!jobType || !description || !address) {
    return res.status(400).json({ error: 'Missing required fields for solar job.' });
  }

  try {
    const data: any = {
      clientId: userId,
      jobType,
      description,
      address,
      status: 'pending-quote',
      quotePrice: 0,
      assignedTechnicians: [],
      siteImageUrls: Array.isArray(siteImageUrls) ? siteImageUrls : []
    };
    
    if (scheduledDate) {
      data.scheduledDate = new Date(scheduledDate).toISOString();
    }

    const job = await databases.createDocument(
      DATABASE_ID,
      SOLAR_COLLECTION,
      ID.unique(),
      data
    );

    res.status(201).json({
      message: 'Solar job requested successfully',
      job
    });
  } catch (err: any) {
    console.error('[Solar] Error creating request:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Get all solar jobs for the logged in client
// ──────────────────────────────────────────────────
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      SOLAR_COLLECTION,
      [Query.equal('clientId', userId || ''), Query.orderDesc('$createdAt')]
    );

    res.status(200).json({ jobs: response.documents });
  } catch (err: any) {
    console.error('[Solar] Error fetching jobs:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Get all solar jobs assigned to a technician
// ──────────────────────────────────────────────────
router.get('/technician', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      SOLAR_COLLECTION,
      [
        Query.search('assignedTechnicians', userId as string),
        Query.orderDesc('$createdAt')
      ]
    );

    res.json({ jobs: response.documents });
  } catch (err: any) {
    console.error('[Solar] Error fetching technician jobs:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Technician updates job status
// ──────────────────────────────────────────────────
router.patch('/technician/:id/status', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Ensure the technician is actually assigned to this job
    const job = await databases.updateDocument(
      DATABASE_ID,
      SOLAR_COLLECTION,
      id,
      { status }
    ) as any;

    if (userId && !job.assignedTechnicians?.includes(userId)) {
      return res.status(403).json({ error: 'You are not assigned to this job.' });
    }

    const allowedStatuses = ['in-progress', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Technicians can only set status to in-progress or completed.' });
    }

    const updatedJob = await databases.updateDocument(
      DATABASE_ID,
      SOLAR_COLLECTION,
      id,
      { status }
    );

    res.json({ message: 'Status updated successfully', job: updatedJob });
  } catch (err: any) {
    console.error('[Solar] Error updating job status by technician:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN: Get all solar jobs
// ──────────────────────────────────────────────────
router.get('/admin/all', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  try {
    const response = await databases.listDocuments(DATABASE_ID, SOLAR_COLLECTION, [
      Query.orderDesc('$createdAt')
    ]);
    res.status(200).json({ jobs: response.documents });
  } catch (err: any) {
    console.error('[Solar Admin] Error fetching all jobs:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN ONLY: Update solar job status/quote and assign technicians
// ──────────────────────────────────────────────────
router.patch('/admin/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  const { id } = req.params;
  const { status, quotePrice, assignedTechnicians, scheduledDate } = req.body;

  try {
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (quotePrice !== undefined) updateData.quotePrice = Number(quotePrice);
    if (assignedTechnicians !== undefined) updateData.assignedTechnicians = Array.isArray(assignedTechnicians) ? assignedTechnicians : [assignedTechnicians];
    if (scheduledDate !== undefined) updateData.scheduledDate = new Date(scheduledDate).toISOString();

    const job = await databases.updateDocument(DATABASE_ID, SOLAR_COLLECTION, id, updateData);

    res.status(200).json({
      message: 'Solar job updated successfully',
      job
    });
  } catch (err: any) {
    console.error('[Solar Admin] Error updating job:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
