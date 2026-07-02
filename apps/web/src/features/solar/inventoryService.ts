

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const inventoryService = {
  async getAllItems(): Promise<InventoryItem[]> {
    const res = await fetch(`${API_URL}/api/v1/inventory`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await res.json();
    return data.items || data;
  },

  async createItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await fetch(`${API_URL}/api/v1/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    return result.item || result;
  },

  async addStock(id: string, amount: number): Promise<InventoryItem> {
    const res = await fetch(`${API_URL}/api/v1/inventory/${id}/restock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    return data.item || data;
  },

  async updateItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await fetch(`${API_URL}/api/v1/inventory/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    return result.item || result;
  },

  async deleteItem(id: string): Promise<void> {
    await fetch(`${API_URL}/api/v1/inventory/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
};
