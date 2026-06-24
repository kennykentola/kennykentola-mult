/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import solarRouter from './solar';

vi.mock('../middleware/auth', () => ({
  authenticateJWT: (req: any, _res: any, next: any) => {
    req.user = {
      id: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
      role: req.headers['x-test-role'] || 'Client'
    };
    next();
  },
  AuthenticatedRequest: {}
}));

vi.mock('../services/appwrite', () => ({
  databases: {
    createDocument: vi.fn(),
    listDocuments: vi.fn(),
    updateDocument: vi.fn()
  }
}));

function createAppWithRole(role: string) {
  const app = express();
  app.use(express.json());

  app.use('/solar', (req: any, res: any, next: any) => {
    req.headers['x-test-role'] = role;
    next();
  }, solarRouter);

  return app;
}

describe('Solar Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /solar/requests', () => {
    it('creates a solar job request', async () => {
      const { databases } = await import('../services/appwrite');
      const mockJob = { $id: 'job_1', jobType: 'solar-installation', description: 'Install panels', address: '123 Main St' };
      (databases.createDocument as any).mockResolvedValue(mockJob);

      const app = createAppWithRole('Client');
      const response = await request(app)
        .post('/solar/requests')
        .set('x-test-role', 'Client')
        .send({
          jobType: 'solar-installation',
          description: 'Install 5kW solar panels',
          address: '123 Main St'
        });

      expect(response.status).toBe(201);
      expect(response.body.job).toEqual(mockJob);
      expect(databases.createDocument).toHaveBeenCalledTimes(1);
    });

    it('returns 400 for missing required fields', async () => {
      const app = createAppWithRole('Client');
      const response = await request(app)
        .post('/solar/requests')
        .set('x-test-role', 'Client')
        .send({ jobType: 'solar-installation' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required fields for solar job.');
    });

    it('returns 400 on database error', async () => {
      const { databases } = await import('../services/appwrite');
      (databases.createDocument as any).mockRejectedValue(new Error('DB error'));

      const app = createAppWithRole('Client');
      const response = await request(app)
        .post('/solar/requests')
        .set('x-test-role', 'Client')
        .send({
          jobType: 'solar-installation',
          description: 'Install 5kW solar panels',
          address: '123 Main St'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('DB error');
    });
  });

  describe('GET /solar', () => {
    it('returns jobs for authenticated user', async () => {
      const { databases } = await import('../services/appwrite');
      const mockResponse = { documents: [{ $id: 'job_1', jobType: 'solar-installation' }] };
      (databases.listDocuments as any).mockResolvedValue(mockResponse);

      const app = createAppWithRole('Client');
      const response = await request(app)
        .get('/solar')
        .set('x-test-role', 'Client');

      expect(response.status).toBe(200);
      expect(response.body.jobs).toEqual(mockResponse.documents);
    });
  });

  describe('GET /solar/admin/all', () => {
    it('allows Admin to fetch all jobs', async () => {
      const { databases } = await import('../services/appwrite');
      const mockResponse = { documents: [{ $id: 'job_1' }, { $id: 'job_2' }] };
      (databases.listDocuments as any).mockResolvedValue(mockResponse);

      const app = createAppWithRole('Admin');
      const response = await request(app)
        .get('/solar/admin/all')
        .set('x-test-role', 'Admin');

      expect(response.status).toBe(200);
      expect(response.body.jobs).toHaveLength(2);
    });

    it('returns 403 for non-admin users', async () => {
      const app = createAppWithRole('Client');
      const response = await request(app)
        .get('/solar/admin/all')
        .set('x-test-role', 'Client');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Unauthorized. Admins only.');
    });
  });

  describe('PATCH /solar/admin/:id', () => {
    it('updates a solar job as Admin', async () => {
      const { databases } = await import('../services/appwrite');
      const mockJob = { $id: 'job_1', status: 'quoted', quotePrice: 5000 };
      (databases.updateDocument as any).mockResolvedValue(mockJob);

      const app = createAppWithRole('Admin');
      const response = await request(app)
        .patch('/solar/admin/job_1')
        .set('x-test-role', 'Admin')
        .send({ status: 'quoted', quotePrice: 5000 });

      expect(response.status).toBe(200);
      expect(response.body.job.status).toBe('quoted');
    });

    it('returns 403 for non-admin users', async () => {
      const app = createAppWithRole('Client');
      const response = await request(app)
        .patch('/solar/admin/job_1')
        .set('x-test-role', 'Client')
        .send({ status: 'quoted' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Unauthorized. Admins only.');
    });
  });
});
