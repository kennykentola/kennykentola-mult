import { getSessionJwt } from '../../lib/sessionJwt';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const maintenanceService = {
  async getMyContracts() {
    const token = await getSessionJwt();
    const res = await fetch(`${API_BASE}/maintenance`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch maintenance contracts');
    const data = await res.json();
    return data.contracts;
  },

  async requestContract(payload: { title: string; serviceType: string; frequency: string; startDate: string; endDate?: string }) {
    const token = await getSessionJwt();
    const res = await fetch(`${API_BASE}/maintenance/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to request maintenance contract');
    }
    return res.json();
  },

  async getAllContracts() {
    const token = await getSessionJwt();
    const res = await fetch(`${API_BASE}/maintenance/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch all contracts');
    const data = await res.json();
    return data.contracts;
  },

  async updateContract(id: string, updates: { status?: string; amount?: number }) {
    const token = await getSessionJwt();
    const res = await fetch(`${API_BASE}/maintenance/admin/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update contract');
    return res.json();
  }
};
