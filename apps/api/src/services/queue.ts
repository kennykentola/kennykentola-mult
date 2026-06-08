import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { generateAndUploadCertificate } from './pdfService';
import { databases } from './appwrite';
import { ID } from 'node-appwrite';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

let redisConnection: IORedis | null = null;
let certificateQueue: Queue | null = null;
let certificateWorker: Worker | null = null;
let isRedisAvailable = false;

// Try to initialize Redis connection
try {
  redisConnection = new IORedis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null,
    connectTimeout: 2000, // Fail fast if Redis is not running
  });

  redisConnection.on('connect', () => {
    console.log('[Queue] Redis connection established. Initializing BullMQ...');
    isRedisAvailable = true;
    initializeBullMQ();
  });

  redisConnection.on('error', (err) => {
    if (!isRedisAvailable) {
      console.warn(
        `[Queue] Warning: Redis is not running at ${REDIS_HOST}:${REDIS_PORT}. BullMQ is disabled. Falling back to immediate server execution.`
      );
    }
    // Suppress error bubble to prevent crashes
  });
} catch (err) {
  console.warn('[Queue] Exception during Redis client creation. Using local fallback.');
}

// Function to initialize BullMQ
function initializeBullMQ() {
  if (!redisConnection) return;

  certificateQueue = new Queue('certificate-jobs', {
    connection: redisConnection as any,
  });

  certificateWorker = new Worker(
    'certificate-jobs',
    async (job: Job) => {
      console.log(`[Queue Worker] Processing job ${job.id}: ${job.name}`);
      const { studentId, studentName, courseId, courseTitle } = job.data;
      await processCertificateJob(studentId, studentName, courseId, courseTitle);
    },
    { connection: redisConnection as any }
  );

  certificateWorker.on('completed', (job) => {
    console.log(`[Queue Worker] Job ${job.id} completed successfully.`);
  });

  certificateWorker.on('failed', (job, err) => {
    console.error(`[Queue Worker] Job ${job?.id} failed:`, err);
  });
}

/**
 * Perform actual certificate creation and database write
 */
async function processCertificateJob(
  studentId: string,
  studentName: string,
  courseId: string,
  courseTitle: string
) {
  const certificateNumber = `CERT-${courseId.slice(0, 4).toUpperCase()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;
  const issueDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  console.log(`[Certificate Builder] Generating certificate ${certificateNumber} for ${studentName}...`);
  
  // 1. Generate PDF & Upload
  const pdfUrl = await generateAndUploadCertificate(
    studentName,
    courseTitle,
    certificateNumber,
    issueDate
  );

  console.log(`[Certificate Builder] PDF uploaded successfully: ${pdfUrl}`);

  // 2. Save document reference in Appwrite DB
  await databases.createDocument(
    DATABASE_ID,
    'certificates',
    ID.unique(),
    {
      studentId,
      courseId,
      certificateNumber,
      issuedAt: new Date().toISOString(),
      pdfUrl,
    }
  );

  console.log('[Certificate Builder] Database record saved successfully.');
}

/**
 * API to enqueue a certificate generation job
 */
export async function queueCertificateGeneration(
  studentId: string,
  studentName: string,
  courseId: string,
  courseTitle: string
) {
  const jobPayload = { studentId, studentName, courseId, courseTitle };

  if (isRedisAvailable && certificateQueue) {
    console.log(`[Queue] Enqueuing certificate job to BullMQ for ${studentName}...`);
    await certificateQueue.add('generateCertificate', jobPayload, {
      attempts: 3,
      backoff: 5000,
    });
  } else {
    // Local memory background fallback
    console.log(`[Queue Fallback] Processing certificate generation asynchronously on local server for ${studentName}...`);
    setTimeout(async () => {
      try {
        await processCertificateJob(studentId, studentName, courseId, courseTitle);
      } catch (err) {
        console.error('[Queue Fallback] Error in local asynchronous certificate generation:', err);
      }
    }, 100);
  }
}
