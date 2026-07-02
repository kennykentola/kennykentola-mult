import { api } from '../academy/api';

export interface InventoryItem {
  $id: string;
  name: string;
  sku: string;
  category: string;
  quantityInStock: number;
  unitPrice: number;
  reorderThreshold: number;
  isActive: boolean;
  lastRestockedAt?: string;
  $createdAt: string;
  $updatedAt: string;
}

export const inventoryService = {
  async getAllItems(): Promise<InventoryItem[]> {
    const res = await api.get('/inventory');
    return res.data.items;
  },

  async createItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await api.post('/inventory', data);
    return res.data.item;
  },

  async updateItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await api.patch(`/inventory/${id}`, data);
    return res.data.item;
  },

  async deleteItem(id: string): Promise<void> {
    await api.delete(`/inventory/${id}`);
  }
};
