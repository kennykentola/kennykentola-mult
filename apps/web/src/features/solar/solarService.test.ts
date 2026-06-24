import { describe, it, expect, vi, beforeEach } from 'vitest';
import { solarService } from './solarService';

vi.mock('../../lib/sessionJwt', () => ({
  getSessionJwt: vi.fn()
}));

const mockGetSessionJwt = await import('../../lib/sessionJwt').then(m => m.getSessionJwt);

describe('solarService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockGetSessionJwt as any).mockResolvedValue('test-jwt-token');
  });

  describe('getMyJobs', () => {
    it('fetches jobs successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ jobs: [{ $id: 'job_1' }] })
      } as any);

      const jobs = await solarService.getMyJobs();
      expect(jobs).toEqual([{ $id: 'job_1' }]);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/solar'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-jwt-token' }
        })
      );
    });

    it('throws on fetch error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({})
      } as any);

      await expect(solarService.getMyJobs()).rejects.toThrow('Failed to fetch solar jobs');
    });
  });

  describe('requestJob', () => {
    it('creates a job request', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'ok', job: { $id: 'new-job' } })
      } as any);

      const result = await solarService.requestJob({
        jobType: 'solar-installation',
        description: 'Install panels',
        address: '123 Main St'
      });

      expect(result.job.$id).toBe('new-job');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/solar/requests'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            jobType: 'solar-installation',
            description: 'Install panels',
            address: '123 Main St'
          })
        })
      );
    });

    it('throws with server error message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Insufficient quota' })
      } as any);

      await expect(
        solarService.requestJob({
          jobType: 'solar-installation',
          description: 'Install panels',
          address: '123 Main St'
        })
      ).rejects.toThrow('Insufficient quota');
    });
  });

  describe('getAllJobs', () => {
    it('fetches all jobs for admin', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ jobs: [{ $id: 'a' }, { $id: 'b' }] })
      } as any);

      const jobs = await solarService.getAllJobs();
      expect(jobs).toHaveLength(2);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/solar/admin/all'),
        expect.any(Object)
      );
    });
  });

  describe('updateJob', () => {
    it('updates a job', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'updated', job: { $id: 'job_1', status: 'paid' } })
      } as any);

      const result = await solarService.updateJob('job_1', { status: 'paid', quotePrice: 5000 });
      expect(result.job.status).toBe('paid');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/solar/admin/job_1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'paid', quotePrice: 5000 })
        })
      );
    });
  });
});
