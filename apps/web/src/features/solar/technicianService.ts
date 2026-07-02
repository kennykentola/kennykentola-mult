import { api } from '../academy/api';
import { SolarJob } from '@company/shared';

export const technicianService = {
  async getAssignedJobs(): Promise<SolarJob[]> {
    const res = await api.get('/solar/technician');
    return res.data.jobs;
  },

  async updateJobStatus(id: string, status: string): Promise<SolarJob> {
    const res = await api.patch(`/solar/technician/${id}/status`, { status });
    return res.data.job;
  }
};
