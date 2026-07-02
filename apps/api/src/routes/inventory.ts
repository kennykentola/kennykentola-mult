import { Router } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const INVENTORY_COLLECTION = 'inventory_items';

// Require Admin or Super Admin role for all routes
const requireAdmin = (req: AuthenticatedRequest, res: any, next: any) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }
  next();
};

// Get all inventory items
router.get('/', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, INVENTORY_COLLECTION, [
      Query.orderDesc('$createdAt')
    ]);
    res.status(200).json({ items: response.documents });
  } catch (err: any) {
    console.error('[Inventory] Error fetching items:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Create a new inventory item
router.post('/', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { name, sku, category, quantityInStock, unitPrice, reorderThreshold, isActive } = req.body;

  if (!name || !sku || !category) {
    return res.status(400).json({ error: 'Missing required fields for inventory item.' });
  }

  try {
    const data = {
      name,
      sku,
      category,
      quantityInStock: Number(quantityInStock) || 0,
      unitPrice: Number(unitPrice) || 0,
      reorderThreshold: Number(reorderThreshold) || 5,
      isActive: isActive !== undefined ? isActive : true,
    };

    const item = await databases.createDocument(
      DATABASE_ID,
      INVENTORY_COLLECTION,
      ID.unique(),
      data
    );

    res.status(201).json({
      message: 'Inventory item created successfully',
      item
    });
  } catch (err: any) {
    console.error('[Inventory] Error creating item:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Update an inventory item
router.patch('/:id', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { name, sku, category, quantityInStock, unitPrice, reorderThreshold, isActive } = req.body;

  try {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (sku !== undefined) updateData.sku = sku;
    if (category !== undefined) updateData.category = category;
    if (quantityInStock !== undefined) updateData.quantityInStock = Number(quantityInStock);
    if (unitPrice !== undefined) updateData.unitPrice = Number(unitPrice);
    if (reorderThreshold !== undefined) updateData.reorderThreshold = Number(reorderThreshold);
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Auto-update lastRestockedAt if quantity increases
    if (quantityInStock !== undefined) {
      const existing = await databases.getDocument(DATABASE_ID, INVENTORY_COLLECTION, id) as any;
      if (Number(quantityInStock) > existing.quantityInStock) {
        updateData.lastRestockedAt = new Date().toISOString();
      }
    }

    const item = await databases.updateDocument(DATABASE_ID, INVENTORY_COLLECTION, id, updateData);

    res.status(200).json({
      message: 'Inventory item updated successfully',
      item
    });
  } catch (err: any) {
    console.error('[Inventory] Error updating item:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Delete an inventory item
router.delete('/:id', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    await databases.deleteDocument(DATABASE_ID, INVENTORY_COLLECTION, id);
    res.status(200).json({ message: 'Inventory item deleted successfully' });
  } catch (err: any) {
    console.error('[Inventory] Error deleting item:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
