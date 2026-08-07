/**
 * rateLimiters.ts
 *
 * Centralised rate-limit definitions for every surface that needs protection
 * beyond the global backstop (300 req / 15 min) already applied in server.ts.
 *
 * Strategy
 * ─────────
 * • Auth endpoints    → brute-force / credential-stuffing guard
 * • AI endpoints      → paid-API credit protection
 * • Code execution    → external Piston quota protection
 * • File uploads      → storage / bandwidth abuse protection
 * • Payments          → fraud / receipt-spam protection
 * • Contact / quote   → email-sending abuse protection (public, no auth)
 * • Newsletter        → subscription-spam protection (public, no auth)
 * • Orchestrator      → multi-provider AI credit protection
 * • AI-video          → HuggingFace quota protection
 *
 * Store strategy
 * ──────────────
 * When REDIS_URL is set (Render production), all counters are stored in Redis
 * so they are shared across every API instance (safe for auto-scaling).
 * When REDIS_URL is absent (local dev), in-memory store is used transparently.
 */

import rateLimit, { Options } from 'express-rate-limit';
import Redis from 'ioredis';
import { RedisStore } from 'rate-limit-redis';

// ─────────────────────────────────────────────────────────
// Redis client — only created if REDIS_URL is available
// ─────────────────────────────────────────────────────────
let redisClient: Redis | null = null;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    // Render's free Redis can have occasional cold starts — retry quietly
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  });

  redisClient.on('error', (err) => {
    // Log but don't crash the server — in-memory will take over for this request
    console.error('[RateLimit Redis] Connection error:', err.message);
  });

  console.log('[RateLimit] Redis store active for rate limiting.');
} else {
  console.warn('[RateLimit] REDIS_URL not set — using in-memory store (safe for single instance only).');
}

/**
 * Returns a RedisStore if Redis is available, otherwise undefined (in-memory).
 * The `prefix` keeps each limiter's keys isolated in Redis.
 */
function makeStore(prefix: string): Partial<Options> {
  if (!redisClient) return {};
  const client = redisClient;
  return {
    store: new RedisStore({
      // rate-limit-redis v4 sendCommand: first element is command, rest are args
      sendCommand: (command: string, ...args: string[]) =>
        client.call(command, ...args) as Promise<number>,
      prefix: `rl:${prefix}:`,
    }),
  };
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

/** Skip rate limiting for preflight OPTIONS requests */
const skipOptions = (req: any) => req.method === 'OPTIONS';

// ─────────────────────────────────────────────────────────
// 1. AUTH — brute-force / account-creation flood guard
//    20 requests per IP per 15 minutes
// ─────────────────────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOptions,
  ...makeStore('auth'),
  message: {
    error: 'Too many authentication attempts from this IP. Please try again in 15 minutes.'
  }
});

// ─────────────────────────────────────────────────────────
// 2. AI CHAT / CONTENT GENERATION — paid API credit guard
//    10 requests per IP per 60 seconds
// ─────────────────────────────────────────────────────────
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOptions,
  ...makeStore('ai'),
  message: {
    error: 'AI request limit reached. Please wait a moment before sending more requests.'
  }
});

// ─────────────────────────────────────────────────────────
// 3. AI VIDEO GENERATION — HuggingFace quota guard
//    5 requests per IP per 10 minutes (video gen is very expensive)
// ─────────────────────────────────────────────────────────
export const aiVideoLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOptions,
  ...makeStore('ai-video'),
  message: {
    error: 'AI video generation limit reached. Please wait 10 minutes before trying again.'
  }
});

// ─────────────────────────────────────────────────────────
// 4. ORCHESTRATOR — multi-provider AI credit guard
//    5 requests per IP per 60 seconds (each call hits multiple paid APIs)
// ─────────────────────────────────────────────────────────
export const orchestratorLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOptions,
  ...makeStore('orchestrator'),
  message: {
    error: 'Orchestrator rate limit exceeded. Please wait before generating more content.'
  }
});

// ─────────────────────────────────────────────────────────
// 5. CODE EXECUTION — Piston external quota guard
//    15 executions per IP per 60 seconds
// ─────────────────────────────────────────────────────────
export const executeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOptions,
  ...makeStore('execute'),
  message: {
    error: 'Code execution limit reached. Please wait before running more code.'
  }
});

// ─────────────────────────────────────────────────────────
// 6. FILE UPLOAD — storage / bandwidth abuse guard
//    20 uploads per IP per 15 minutes
// ─────────────────────────────────────────────────────────
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOptions,
  ...makeStore('upload'),
  message: {
    error: 'Upload limit reached. Please wait 15 minutes before uploading more files.'
  }
});

// ─────────────────────────────────────────────────────────
// 7. PAYMENTS — receipt-spam / fraud guard
//    30 requests per IP per 15 minutes
// ─────────────────────────────────────────────────────────
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOptions,
  ...makeStore('payments'),
  message: {
    error: 'Too many payment requests. Please wait 15 minutes before trying again.'
  }
});

// ─────────────────────────────────────────────────────────
// 8. CONTACT FORM — email-sending abuse guard (public route)
//    5 submissions per IP per 15 minutes
// ─────────────────────────────────────────────────────────
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOptions,
  ...makeStore('contact'),
  message: {
    error: 'Too many contact submissions. Please wait 15 minutes before submitting again.'
  }
});

// ─────────────────────────────────────────────────────────
// 9. NEWSLETTER — subscription-spam guard (public route)
//    10 requests per IP per 15 minutes
// ─────────────────────────────────────────────────────────
export const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOptions,
  ...makeStore('newsletter'),
  message: {
    error: 'Too many newsletter requests. Please wait 15 minutes before trying again.'
  }
});
