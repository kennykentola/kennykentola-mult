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
 * NOTE: express-rate-limit v7 uses an in-memory store by default.
 * If you scale to multiple API instances (e.g. Render auto-scaling) you MUST
 * add a shared store (e.g. `rate-limit-redis`) so counters are shared.
 */

import rateLimit from 'express-rate-limit';

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
  message: {
    error: 'Too many newsletter requests. Please wait 15 minutes before trying again.'
  }
});
