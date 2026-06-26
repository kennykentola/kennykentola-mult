import { Router } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const PRINT_ORDERS_COLLECTION = 'print_orders';
const PRICING_CONFIG_COLLECTION = 'pricing_config';
const PRINT_MESSAGES_COLLECTION = 'print_messages';

const createOrderSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    serviceType: z.string().min(1, 'Service type is required'),
    quantity: z.coerce.number().min(1).optional().default(1),
    paperSize: z.string().optional().default('A4'),
    colorMode: z.string().optional().default('bw'),
    sides: z.string().optional().default('single'),
    bindingType: z.string().optional().default(''),
    specialInstructions: z.string().optional().default(''),
    fileUrls: z.array(z.string().url()).optional().default([]),
    deliveryMethod: z.string().optional().default('pickup'),
    pageCount: z.coerce.number().min(0).optional().default(0)
  })
});

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
router.post('/orders', authenticateJWT, validateRequest(createOrderSchema), async (req: AuthenticatedRequest, res) => {
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
    deliveryMethod,
    pageCount
  } = req.body;

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
        fileUrl: (fileUrls && fileUrls.length > 0) ? fileUrls[0] : '',
        deliveryMethod: deliveryMethod || 'pickup',
        paymentStatus: 'pending',
        pricingType: pageCount && pageCount > 0 ? 'auto' : 'manual',
        pageCount: pageCount || 0,
        receiptUrl: '',
        fileType: 'document',
        printingType: 'document',
        doubleSided: sides === 'double'
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

const updateAdminOrderSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'processing', 'ready', 'delivered', 'cancelled']).optional(),
    price: z.coerce.number().min(0).optional(),
    estimatedReadyAt: z.string().datetime().optional()
  })
});

// ──────────────────────────────────────────────────
// ADMIN: Update order status (accept, process, ready, deliver, cancel)
// ──────────────────────────────────────────────────
router.patch('/admin/orders/:orderId', authenticateJWT, validateRequest(updateAdminOrderSchema), async (req: AuthenticatedRequest, res) => {
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

// ──────────────────────────────────────────────────
// AUTHENTICATED: Upload Payment Receipt
// ──────────────────────────────────────────────────
router.patch('/orders/:orderId/receipt', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { orderId } = req.params;
  const { receiptUrl } = req.body;

  if (!receiptUrl) return res.status(400).json({ error: 'Receipt URL is required' });

  try {
    const order = await databases.getDocument(DATABASE_ID, PRINT_ORDERS_COLLECTION, orderId) as any;
    if (order.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const updatedOrder = await databases.updateDocument(DATABASE_ID, PRINT_ORDERS_COLLECTION, orderId, {
      receiptUrl,
      paymentStatus: 'awaiting_verification'
    });

    res.status(200).json({ message: 'Receipt uploaded successfully', order: updatedOrder });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN: Verify Payment
// ──────────────────────────────────────────────────
router.patch('/admin/orders/:orderId/verify-payment', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Printer Operator') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { orderId } = req.params;
  const { paymentStatus } = req.body; // 'paid' or 'rejected'

  try {
    const updatedOrder = await databases.updateDocument(DATABASE_ID, PRINT_ORDERS_COLLECTION, orderId, {
      paymentStatus,
      status: paymentStatus === 'paid' ? 'processing' : 'pending' // Auto start processing if paid
    });

    res.status(200).json({ message: `Payment marked as ${paymentStatus}`, order: updatedOrder });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Get Messages for Order
// ──────────────────────────────────────────────────
router.get('/orders/:orderId/messages', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { orderId } = req.params;

  try {
    const order = await databases.getDocument(DATABASE_ID, PRINT_ORDERS_COLLECTION, orderId) as any;
    if (order.userId !== req.user?.id && req.user?.role !== 'Admin' && req.user?.role !== 'Printer Operator') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const messages = await databases.listDocuments(DATABASE_ID, PRINT_MESSAGES_COLLECTION, [
      Query.equal('orderId', orderId),
      Query.orderAsc('timestamp')
    ]);

    res.status(200).json({ messages: messages.documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// AUTHENTICATED: Send Message for Order
// ──────────────────────────────────────────────────
router.post('/orders/:orderId/messages', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { orderId } = req.params;
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: 'Message cannot be empty.' });

  try {
    const order = await databases.getDocument(DATABASE_ID, PRINT_ORDERS_COLLECTION, orderId) as any;
    const isAdmin = req.user?.role === 'Admin' || req.user?.role === 'Printer Operator';
    
    if (order.userId !== req.user?.id && !isAdmin) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const newMessage = await databases.createDocument(DATABASE_ID, PRINT_MESSAGES_COLLECTION, ID.unique(), {
      orderId,
      senderId: req.user?.id,
      senderRole: isAdmin ? 'admin' : 'customer',
      message,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({ message: newMessage });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
