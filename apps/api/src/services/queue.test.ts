import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as queueService from './queue';
import * as pdfService from './pdfService';

vi.mock('./pdfService', () => ({
  generateAndUploadCertificate: vi.fn(),
}));

// Mock databases
vi.mock('./appwrite', () => ({
  databases: {
    createDocument: vi.fn(),
  }
}));

describe('Queue Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('queueCertificateGeneration falls back to immediate execution when BullMQ is unavailable', async () => {
    vi.mocked(pdfService.generateAndUploadCertificate).mockResolvedValue('http://appwrite/file.pdf');

    // Call the function
    await queueService.queueCertificateGeneration('user123', 'John Doe', 'course-123', 'React 101');

    // Advance the setTimeout
    await vi.runAllTimersAsync();

    // It should invoke generateAndUploadCertificate
    expect(pdfService.generateAndUploadCertificate).toHaveBeenCalledWith(
      'John Doe',
      'React 101',
      expect.any(String), // certificateNumber
      expect.any(String)  // issueDate
    );
  });
});
