import { Router } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { sendEmail } from '../services/email';

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

    // Send email to admins
    const htmlContent = `
      <h3>New Solar/Electrical Consultation Request</h3>
      <p><strong>Client ID:</strong> ${userId}</p>
      <p><strong>Job Type:</strong> ${jobType}</p>
      <p><strong>Site Address:</strong> ${address}</p>
      ${scheduledDate ? `<p><strong>Preferred Date:</strong> ${scheduledDate}</p>` : ''}
      <hr />
      <h4>Details & Technical Requirements:</h4>
      <pre style="white-space: pre-wrap; font-family: sans-serif;">${description}</pre>
    `;

    await sendEmail({
      to: [
        'peterkehindeademola9@gmail.com',
        'peterkehindeademola@gmail.com',
        'ademolapeter233@gmail.com'
      ],
      subject: `[Solar Consultation] New Request: ${jobType}`,
      html: htmlContent
    }).catch(err => {
      console.error('[Solar] Failed to send admin email:', err);
    });

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

// ──────────────────────────────────────────────────
// SOLAR PROJECTS: Public API to get projects
// ──────────────────────────────────────────────────
router.get('/projects', async (req, res) => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'solar_projects', [
      Query.limit(100),
      Query.orderDesc('$createdAt')
    ]);
    res.status(200).json({ projects: response.documents });
  } catch (err: any) {
    console.error('[Solar Projects] Error fetching projects:', err.message);
    res.status(400).json({ error: err.message });
  }
});

router.get('/projects/:id', async (req, res) => {
  try {
    const project = await databases.getDocument(DATABASE_ID, 'solar_projects', req.params.id);
    res.status(200).json({ project });
  } catch (err: any) {
    console.error('[Solar Projects] Error fetching single project:', err.message);
    res.status(404).json({ error: 'Project not found' });
  }
});

// ──────────────────────────────────────────────────
// ADMIN ONLY: Create/Update/Delete Solar Projects
// ──────────────────────────────────────────────────
router.post('/projects', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  const { title, size, location, type, savings, image, description, roi, co2Offset, gridIndependence, uptime, equipment, timeline } = req.body;

  try {
    const project = await databases.createDocument(DATABASE_ID, 'solar_projects', ID.unique(), {
      title, size, location, type, savings, image, description,
      roi: roi || '', co2Offset: co2Offset || '', gridIndependence: gridIndependence || '', 
      uptime: uptime || '', equipment: Array.isArray(equipment) ? equipment : [], timeline: timeline || ''
    });
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (err: any) {
    console.error('[Solar Projects] Error creating project:', err.message);
    res.status(400).json({ error: err.message });
  }
});

router.put('/projects/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  const { title, size, location, type, savings, image, description, roi, co2Offset, gridIndependence, uptime, equipment, timeline } = req.body;

  try {
    const project = await databases.updateDocument(DATABASE_ID, 'solar_projects', req.params.id, {
      title, size, location, type, savings, image, description,
      roi: roi || '', co2Offset: co2Offset || '', gridIndependence: gridIndependence || '', 
      uptime: uptime || '', equipment: Array.isArray(equipment) ? equipment : [], timeline: timeline || ''
    });
    res.status(200).json({ message: 'Project updated successfully', project });
  } catch (err: any) {
    console.error('[Solar Projects] Error updating project:', err.message);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/projects/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  try {
    await databases.deleteDocument(DATABASE_ID, 'solar_projects', req.params.id);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err: any) {
    console.error('[Solar Projects] Error deleting project:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
