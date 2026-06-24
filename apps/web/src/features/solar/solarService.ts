import { getSessionJwt } from '../../lib/sessionJwt';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const solarService = {
  async getMyJobs() {
    const token = await getSessionJwt();
    const res = await fetch(`${API_BASE}/solar`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch solar jobs');
    const data = await res.json();
    return data.jobs;
  },

  async requestJob(payload: { jobType: string; description: string; address: string; scheduledDate?: string }) {
    const token = await getSessionJwt();
    const res = await fetch(`${API_BASE}/solar/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to request solar job');
    }
    return res.json();
  },

  async getAllJobs() {
    const token = await getSessionJwt();
    const res = await fetch(`${API_BASE}/solar/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch all solar jobs');
    const data = await res.json();
    return data.jobs;
  },

  async updateJob(id: string, updates: { status?: string; quotePrice?: number; assignedTechnicians?: string[]; scheduledDate?: string }) {
    const token = await getSessionJwt();
    const res = await fetch(`${API_BASE}/solar/admin/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update solar job');
    return res.json();
  }
};
