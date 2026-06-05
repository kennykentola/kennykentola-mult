import { Router } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const PRINT_ORDERS_COLLECTION = 'print_orders';
const PRICING_CONFIG_COLLECTION = 'pricing_config';

// ──────────────────────────────────────────────────
// PUBLIC: Get pricing information
// ──────────────────────────────────────────────────
router.get('/pricing', async (_req, res) => {
  try {
    const pricing = await databases.listDocuments(
      DATABASE_ID,
      PRICING_CONFIG_COLLECTION,
      [Query.equal('isActive', true)]
    );
    res.status(200).json({ pricing: pricing.documents });
  } catch (err: any) {
    console.error('[Printing] Error fetching pricing:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Create a new print order
// ──────────────────────────────────────────────────
router.post('/orders', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const {
    title,
    serviceType,
    quantity,
    paperSize,
    colorMode,
    sides,
    bindingType,
    specialInstructions,
    fileUrls,
    deliveryMethod
  } = req.body;

  if (!title || !serviceType) {
    return res.status(400).json({ error: 'Title and service type are required.' });
  }

  try {
    const order = await databases.createDocument(
      DATABASE_ID,
      PRINT_ORDERS_COLLECTION,
      ID.unique(),
      {
        userId,
        title,
        serviceType,
        status: 'pending',
        price: 0,
        quantity: quantity || 1,
        paperSize: paperSize || 'A4',
        colorMode: colorMode || 'bw',
        sides: sides || 'single',
        bindingType: bindingType || '',
        specialInstructions: specialInstructions || '',
        fileUrls: fileUrls || [],
        deliveryMethod: deliveryMethod || 'pickup'
      }
    );

    res.status(201).json({
      message: 'Print order created successfully',
      order
    });
  } catch (err: any) {
    console.error('[Printing] Error creating order:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Get current user's print orders
// ──────────────────────────────────────────────────
router.get('/orders', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;

  try {
    const orders = await databases.listDocuments(
      DATABASE_ID,
      PRINT_ORDERS_COLLECTION,
      [
        Query.equal('userId', userId || ''),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]
    );

    res.status(200).json({ orders: orders.documents, total: orders.total });
  } catch (err: any) {
    console.error('[Printing] Error fetching orders:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Get single print order by ID
// ──────────────────────────────────────────────────
router.get('/orders/:orderId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { orderId } = req.params;

  try {
    const order = await databases.getDocument(
      DATABASE_ID,
      PRINT_ORDERS_COLLECTION,
      orderId
    ) as any;

    // Ensure user can only view their own orders (unless Admin)
    if (order.userId !== req.user?.id && req.user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.status(200).json({ order });
  } catch (err: any) {
    console.error('[Printing] Error fetching order:', err.message);
    res.status(404).json({ error: 'Order not found.' });
  }
});

// ──────────────────────────────────────────────────
// ADMIN: List all print orders (with optional status filter)
// ──────────────────────────────────────────────────
router.get('/admin/orders', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Printer Operator') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { status, limit: queryLimit } = req.query;

  try {
    const queries = [
      Query.orderDesc('$createdAt'),
      Query.limit(Number(queryLimit) || 100)
    ];

    if (status && status !== 'all') {
      queries.push(Query.equal('status', status as string));
    }

    const orders = await databases.listDocuments(
      DATABASE_ID,
      PRINT_ORDERS_COLLECTION,
      queries
    );

    res.status(200).json({ orders: orders.documents, total: orders.total });
  } catch (err: any) {
    console.error('[Printing] Error listing admin orders:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN: Update order status (accept, process, ready, deliver, cancel)
// ──────────────────────────────────────────────────
router.patch('/admin/orders/:orderId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Printer Operator') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { orderId } = req.params;
  const { status, price, estimatedReadyAt } = req.body;

  try {
    const updateData: Record<string, any> = {};

    if (status) updateData.status = status;
    if (price !== undefined) updateData.price = price;
    if (estimatedReadyAt) updateData.estimatedReadyAt = estimatedReadyAt;
    if (status === 'delivered') updateData.completedAt = new Date().toISOString();

    const order = await databases.updateDocument(
      DATABASE_ID,
      PRINT_ORDERS_COLLECTION,
      orderId,
      updateData
    );

    res.status(200).json({
      message: `Order ${orderId} updated to ${status || 'modified'}.`,
      order
    });
  } catch (err: any) {
    console.error('[Printing] Error updating order:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
