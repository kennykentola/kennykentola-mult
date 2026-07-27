import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './api';
import * as sessionJwt from '../../lib/sessionJwt';

// Mock the sessionJwt module
vi.mock('../../lib/sessionJwt', () => ({
  getSessionJwt: vi.fn(),
}));

describe('Academy API wrapper', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetchAcademyCatalog calls fetch with correct URL and no auth headers', async () => {
    const mockResponse = { courses: [], total: 0 };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await api.fetchAcademyCatalog();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/academy/courses'),
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('submitTestimonial adds Authorization header and sends POST request', async () => {
    const mockToken = 'test-token-123';
    vi.mocked(sessionJwt.getSessionJwt).mockResolvedValueOnce(mockToken);

    const mockResponse = { message: 'Success', testimonial: { id: 't1', content: 'Great', rating: 5 } };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const payload = { content: 'Great course!', rating: 5 };
    const result = await api.submitTestimonial('course-1', payload);

    expect(sessionJwt.getSessionJwt).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/academy/courses/course-1/testimonials'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('throws an error if response is not ok', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid course ID' }),
    });

    await expect(api.fetchAcademyCourse('invalid-id')).rejects.toThrow('Invalid course ID');
  });
});
