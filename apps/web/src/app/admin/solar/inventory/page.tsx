'use client';

import { useEffect, useState } from 'react';
import { inventoryService, InventoryItem } from '../../../../features/solar/inventoryService';

export default function AdminInventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: 'solar',
    quantityInStock: 0,
    unitPrice: 0,
    reorderThreshold: 5,
    isActive: true
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await inventoryService.getAllItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await inventoryService.updateItem(editingId, { ...form });
      } else {
        await inventoryService.createItem({ ...form });
      }
      setEditingId(null);
      setIsAdding(false);
      fetchItems();
    } catch (err) {
      console.error('Failed to save item:', err);
      alert('Error saving inventory item.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.deleteItem(id);
        fetchItems();
      } catch (err) {
        console.error('Failed to delete item:', err);
        alert('Error deleting item.');
      }
    }
  };

  const startEditing = (item: InventoryItem) => {
    setEditingId(item.$id);
    setIsAdding(false);
    setForm({
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantityInStock: item.quantityInStock,
      unitPrice: item.unitPrice,
      reorderThreshold: item.reorderThreshold,
      isActive: item.isActive
    });
  };

  const resetForm = () => {
    setForm({
      name: '',
      sku: '',
      category: 'solar',
      quantityInStock: 0,
      unitPrice: 0,
      reorderThreshold: 5,
      isActive: true
    });
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Inventory...</div>;

  const lowStockItems = items.filter(i => i.quantityInStock <= i.reorderThreshold);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
          <p className="text-sm text-slate-400 mt-1">Manage stock for solar panels, batteries, and electrical tools.</p>
        </div>
        <div className="flex gap-4">
          <a href="/admin/solar" className="text-slate-400 hover:text-white px-4 py-2 border border-slate-700 rounded-lg text-sm transition-colors">
            &larr; Back to Solar
          </a>
          <button
            onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Item
          </button>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-red-300">Low Stock Alert</h3>
            <p className="text-sm">You have {lowStockItems.length} items currently at or below their reorder threshold. An email alert has been dispatched to procurement.</p>
          </div>
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{editingId ? 'Edit Item' : 'New Item'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="400W Monocrystalline Panel"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">SKU</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                value={form.sku}
                onChange={e => setForm({...form, sku: e.target.value})}
                placeholder="SOL-400W-001"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                id="category"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
              >
                <option value="solar">Solar Component</option>
                <option value="electrical">Electrical Wire/Tools</option>
                <option value="battery">Battery/Inverter</option>
                <option value="misc">Miscellaneous</option>
              </select>
            </div>
            <div>
              <label htmlFor="unitPrice" className="block text-xs font-medium text-slate-400 mb-1">Unit Price ($)</label>
              <input
                id="unitPrice"
                type="number"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                value={form.unitPrice}
                onChange={e => setForm({...form, unitPrice: Number(e.target.value)})}
              />
            </div>
            <div>
              <label htmlFor="quantityInStock" className="block text-xs font-medium text-slate-400 mb-1">Quantity In Stock</label>
              <input
                id="quantityInStock"
                type="number"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                value={form.quantityInStock}
                onChange={e => setForm({...form, quantityInStock: Number(e.target.value)})}
              />
            </div>
            <div>
              <label htmlFor="reorderThreshold" className="block text-xs font-medium text-slate-400 mb-1">Reorder Threshold</label>
              <input
                id="reorderThreshold"
                type="number"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                value={form.reorderThreshold}
                onChange={e => setForm({...form, reorderThreshold: Number(e.target.value)})}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  className="rounded border-slate-800 bg-slate-950 text-blue-500"
                  checked={form.isActive}
                  onChange={e => setForm({...form, isActive: e.target.checked})}
                />
                <span className="text-sm text-slate-300">Active Listing</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium"
            >
              Save Item
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Item & SKU</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Stock Level</th>
                <th className="p-4 font-semibold">Unit Price</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No inventory items found.</td>
                </tr>
              ) : (
                items.map(item => {
                  const isLowStock = item.quantityInStock <= item.reorderThreshold;
                  return (
                    <tr key={item.$id} className={`hover:bg-slate-800/20 transition-colors ${!item.isActive ? 'opacity-50' : ''}`}>
                      <td className="p-4">
                        <div className="font-medium text-white mb-1">{item.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{item.sku}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded capitalize">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className={`font-semibold ${isLowStock ? 'text-red-400' : 'text-green-400'}`}>
                          {item.quantityInStock} units
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Threshold: {item.reorderThreshold}
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => startEditing(item)}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.$id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
