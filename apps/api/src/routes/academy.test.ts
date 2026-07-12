import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import academyRouter from './academy';

// Mock authentication middleware
vi.mock('../middleware/auth', () => ({
  authenticateJWT: (req: any, _res: any, next: any) => {
    if (req.headers['authorization'] === 'Bearer invalid') {
      return _res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = {
      id: req.headers['x-test-user-id'] || 'student_123',
      email: 'test@example.com',
      name: 'Test Student',
      role: req.headers['x-test-role'] || 'Student'
    };
    next();
  },
  optionalAuthenticateJWT: (req: any, _res: any, next: any) => {
    if (req.headers['x-test-role']) {
      req.user = {
        id: req.headers['x-test-user-id'] || 'student_123',
        email: 'test@example.com',
        name: 'Test Student',
        role: req.headers['x-test-role']
      };
    }
    next();
  },
  AuthenticatedRequest: {}
}));

// Mock the Appwrite database SDK
vi.mock('../services/appwrite', () => ({
  databases: {
    createDocument: vi.fn(),
    listDocuments: vi.fn(),
    getDocument: vi.fn(),
    updateDocument: vi.fn()
  }
}));

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/academy', academyRouter);
  return app;
}

describe('Academy Routes Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /academy/courses', () => {
    it('returns public published courses', async () => {
      const { databases } = await import('../services/appwrite');
      const mockResponse = {
        total: 1,
        documents: [
          { $id: 'course_1', title: 'React 101', price: 0, instructorName: 'Jane Doe', isPublished: true }
        ]
      };
      (databases.listDocuments as any).mockResolvedValue(mockResponse);

      const app = createApp();
      const response = await request(app).get('/academy/courses');

      expect(response.status).toBe(200);
      expect(response.body.courses).toHaveLength(1);
      expect(response.body.courses[0].title).toBe('React 101');
    });
  });

  describe('POST /academy/courses/:id/testimonials', () => {
    it('returns 400 when missing required fields', async () => {
      const app = createApp();
      const response = await request(app)
        .post('/academy/courses/c1/testimonials')
        .set('x-test-role', 'Student')
        .send({
          rating: 5
          // missing content
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Content and rating are required.');
    });

    it('creates a testimonial correctly mapped to Appwrite schema', async () => {
      const { databases } = await import('../services/appwrite');
      const mockTestimonial = { $id: 'test_1', content: 'Great course' };
      (databases.createDocument as any).mockResolvedValue(mockTestimonial);
      (databases.listDocuments as any).mockResolvedValue({ total: 1, documents: [{ $id: 'user_prof_1' }] });

      const app = createApp();
      const response = await request(app)
        .post('/academy/courses/c1/testimonials')
        .set('x-test-role', 'Student')
        .set('x-test-user-id', 'user_123')
        .send({
          content: 'Great course',
          rating: 5
        });

      expect(response.status).toBe(201);
      expect(databases.createDocument).toHaveBeenCalledWith(
        expect.any(String),
        'testimonials', // Note: Make sure the backend uses 'testimonials'
        expect.any(String),
        expect.objectContaining({
          userId: 'user_123',
          studentId: 'user_123', // Redundant mapped field
          courseId: 'c1',
          content: 'Great course',
          reviewText: 'Great course', // Redundant mapped field
          rating: 5
        })
      );
    });
  });

});
