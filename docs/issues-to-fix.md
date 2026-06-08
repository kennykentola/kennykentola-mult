# Issues To Fix

This file tracks the problems found in the current codebase, ordered from highest risk to lowest risk / cleanup.

## P0 - Security and correctness

| # | Issue | Why it matters | Affected files | Status | Suggested fix |
|---|---|---|---|---|---|
| 1 | Registration lets the user choose their own role | A new account can be created as `Admin` or `Super Admin`, which is a privilege-escalation bug | `apps/api/src/routes/auth.ts` | Done | Ignore `role` from the client during registration and always create `Student` by default; only privileged admin flows should assign elevated roles |
| 2 | Socket chat does not verify room membership before joining or sending | Any authenticated user can guess a `roomId`, join it, and inject messages or signaling events | `apps/api/src/services/socket.ts`, `apps/web/src/hooks/useSocket.ts` | Done | Validate room membership on the server before `join_chat`, `send_message`, `call_user`, and `answer_call` |
| 3 | Receipt upload trusts a client-supplied filename | A malicious filename can create unsafe file paths or overwrite temp files; the endpoint also lacks real file validation | `apps/api/src/routes/payments.ts` | Done | Sanitize the filename, enforce allowed extensions and size limits, and avoid writing untrusted names directly to disk |
| 4 | Public academy endpoints expose course details without access checks | Private course metadata, assignments, or live class data may be readable by anyone with the course ID | `apps/api/src/routes/academy.ts` | Done | Check publication/enrollment/role before returning private course data |
| 5 | The API build currently fails | The backend cannot ship cleanly until TypeScript errors are fixed | `apps/api/src/routes/academy.ts` | Done | Fix the `Document` typing mismatches in the academy submission and instructor queries |

## P1 - Authentication and abuse resistance

| # | Issue | Why it matters | Affected files | Status | Suggested fix |
|---|---|---|---|---|---|
| 6 | JWTs are stored in `localStorage` | If any XSS lands, the session token can be stolen | `apps/web/src/features/auth/AuthContext.tsx`, `apps/web/src/hooks/useSocket.ts`, `apps/web/src/features/*Service.ts` | Open | Prefer httpOnly cookies or another server-managed session strategy |
| 7 | No obvious global rate limiting is mounted | Brute-force and abuse resistance is weaker than it should be for auth and upload endpoints | `apps/api/src/server.ts` | Done | Mount `express-rate-limit` globally and tighten sensitive routes further |
| 8 | Appwrite fallback values can hide a broken deployment | The server can keep booting with placeholder Appwrite values, which makes failures harder to catch | `apps/api/src/services/appwrite.ts`, `apps/api/src/server.ts` | Done | Fail fast in production when required Appwrite env vars are missing |

## P2 - Functional gaps

| # | Issue | Why it matters | Affected files | Status | Suggested fix |
|---|---|---|---|---|---|
| 9 | Super-admin payouts are mocked | The UI can show fake payout state and mislead operators | `apps/api/src/routes/super-admin.ts`, `apps/web/src/app/super-admin/payouts/page.tsx` | Done | Replace mock data with real persisted payout records |
| 10 | Admin analytics contain mocked / hardcoded values | Dashboard numbers are not trustworthy for real operations | `apps/api/src/routes/admin.ts` | Done | Drive analytics from actual database aggregations |

## P3 - Performance

| # | Issue | Why it matters | Affected files | Status | Suggested fix |
|---|---|---|---|---|---|
| 11 | Several endpoints do N+1 database reads | Works on small data, but latency grows quickly as content and users increase | `apps/api/src/routes/academy.ts`, `apps/api/src/routes/payments.ts` | Done | Batch reads where possible, cache repeated lookups, and reduce per-item `getDocument` calls |
| 12 | Payment history and pending-payment views do extra enrichment work per row | Each request fans out into many more Appwrite calls | `apps/api/src/routes/payments.ts` | Done | Preload related documents or denormalize display fields where appropriate |

## Notes

- The web app build currently succeeds.
- The API build now succeeds after the academy type fixes.
- **All 12 tracked issues are now resolved.** The only remaining open area is Issue #6 (JWT in localStorage) which is a known trade-off requiring a larger architectural change to httpOnly cookie sessions.
