import { SolarJob } from '@company/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const technicianService = {
  async getAssignedJobs(): Promise<SolarJob[]> {
    const res = await fetch(`${API_URL}/api/v1/solar/technician`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await res.json();
    return data.jobs || data;
  },

  async updateJobStatus(id: string, status: string): Promise<SolarJob> {
    const res = await fetch(`${API_URL}/api/v1/solar/technician/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    return data.job || data;
  }
};
