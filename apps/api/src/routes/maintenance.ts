import { Router } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const MAINTENANCE_COLLECTION = 'maintenance_contracts';

// ──────────────────────────────────────────────────
// AUTHENTICATED: Create a new maintenance contract request
// ──────────────────────────────────────────────────
router.post('/requests', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const { title, serviceType, frequency, startDate, endDate } = req.body;

  if (!title || !serviceType || !frequency || !startDate) {
    return res.status(400).json({ error: 'Missing required fields for maintenance contract.' });
  }

  try {
    const data: any = {
      clientId: userId,
      title,
      serviceType,
      frequency,
      status: 'pending',
      startDate: new Date(startDate).toISOString(),
      amount: 0
    };
    
    if (endDate) {
      data.endDate = new Date(endDate).toISOString();
    }

    const contract = await databases.createDocument(
      DATABASE_ID,
      MAINTENANCE_COLLECTION,
      ID.unique(),
      data
    );

    res.status(201).json({
      message: 'Maintenance contract requested successfully',
      contract
    });
  } catch (err: any) {
    console.error('[Maintenance] Error creating request:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Get all maintenance contracts for the logged in client
// ──────────────────────────────────────────────────
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      MAINTENANCE_COLLECTION,
      [Query.equal('clientId', userId || ''), Query.orderDesc('$createdAt')]
    );

    res.status(200).json({ contracts: response.documents });
  } catch (err: any) {
    console.error('[Maintenance] Error fetching contracts:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN ONLY: Get all maintenance contracts globally
// ──────────────────────────────────────────────────
router.get('/admin/all', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  try {
    const response = await databases.listDocuments(DATABASE_ID, MAINTENANCE_COLLECTION, [
      Query.orderDesc('$createdAt')
    ]);
    res.status(200).json({ contracts: response.documents });
  } catch (err: any) {
    console.error('[Maintenance Admin] Error fetching all contracts:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN ONLY: Update maintenance contract status/amount
// ──────────────────────────────────────────────────
router.patch('/admin/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  const { id } = req.params;
  const { status, amount } = req.body;

  try {
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (amount !== undefined) updateData.amount = Number(amount);

    const contract = await databases.updateDocument(DATABASE_ID, MAINTENANCE_COLLECTION, id, updateData);

    res.status(200).json({
      message: 'Maintenance contract updated successfully',
      contract
    });
  } catch (err: any) {
    console.error('[Maintenance Admin] Error updating contract:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
