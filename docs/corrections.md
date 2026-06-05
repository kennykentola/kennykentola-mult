# Corrections, Debugging & Troubleshooting Log (`corrections.md`)

This log documents common issues, tricky bugs, and platform pitfalls encountered during development, along with their solutions. Review this file whenever you encounter system errors.

---

## 1. Authentication & API Connections

### CORS Preflight Errors (Client-to-Backend Blocked)
* **Symptoms:** Web console displays `Access-Control-Allow-Origin header is missing` or `CORS preflight request failed`.
* **Root Cause:** Next.js UI is on a separate port or domain (e.g. localhost:3000) than the Express API (e.g. localhost:5000), and CORS settings are missing `credentials: true` or have wildcard origins.
* **Resolution:** Never use `origin: '*'` when sending cookies or Auth headers. In `server.ts`, configure:
  ```typescript
  app.use(cors({
    origin: process.env.CLIENT_URL, // e.g. http://localhost:3000 (No trailing slash)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  }));
  ```

### Appwrite Permission Denied (`AppwriteException: User unauthorized`)
* **Symptoms:** Users receive `401 Unauthorized` or `403 Forbidden` when writing print orders or registering courses.
* **Root Cause:** Appwrite collection-level permissions are restrictive by default.
* **Resolution:** Ensure the Appwrite console collection settings match our RBAC matrix:
  - Go to **Appwrite Console** > **Database** > **Collections** > **Settings**.
  - Add Role permissions (e.g., set `Create` for role `users` under the `print_orders` collection, or set `Read` to `any` for `courses`).

---

## 2. Manual Payment Systems

### Duplicate Transfer Screenshot / Receipt Upload Fraud
* **Symptoms:** A user attempts to submit the same bank transfer confirmation multiple times to buy separate courses.
* **Root Cause:** Lack of uniqueness check on reference numbers.
* **Resolution:** Set a unique index constraint on the `referenceNumber` attribute. In our backend route controller, validate it explicitly:
  ```typescript
  const existingPayment = await databases.listDocuments(
    DATABASE_ID,
    PAYMENTS_COLLECTION_ID,
    [Query.equal('referenceNumber', submittedReference)]
  );
  if (existingPayment.total > 0) {
    throw new Error('This transaction reference has already been claimed.');
  }
  ```

---

## 3. Real-Time Chat & Sockets

### Mobile Socket Disconnections in Background Mode
* **Symptoms:** React Native chat stops receiving real-time messages when the phone screen turns off or user switches apps.
* **Root Cause:** Operating systems pause background websocket connections to save battery.
* **Resolution:** Configure automatic socket reconnection on client init and sync state upon reconnection:
  ```typescript
  const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    transports: ['websocket']
  });

  socket.on('reconnect', () => {
    // Re-fetch conversation logs to catch up on missed messages
    fetchLatestMessages();
  });
  ```

---

## 4. Query & Database Constraints

### Appwrite Missing Relation Data (Pagination Limits)
* **Symptoms:** Admin dashboard only loads 25 print jobs or projects, even though more are in the database.
* **Root Cause:** Appwrite lists documents with a default limit of 25 to protect bandwidth.
* **Resolution:** Always specify your limit or implement cursor pagination when making queries:
  ```typescript
  const result = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_ID,
    [
      Query.limit(100), // Request up to 100 documents
      Query.orderDesc('$createdAt')
    ]
  );
  ```

### MongoDB Whitelist Blocking (After Phase 2 Migration)
* **Symptoms:** Server logs show `MongooseServerSelectionError: connection timed out`.
* **Root Cause:** MongoDB Atlas has IP whitelisting enabled, but Render’s dynamic server IP changed.
* **Resolution:** In MongoDB Atlas dashboard:
  - Go to **Network Access**.
  - Add IP Address `0.0.0.0/0` to allow traffic from Render (secure this database access with strong database user accounts).

---

## 5. Mobile Bundling & Package Resolution

### Metro Monorepo Path Resolution Failures (Windows)
* **Symptoms:** Browser console displays `Refused to execute script from '...AppEntry.bundle?platform=web...' because its MIME type ('application/json') is not executable` with a `500 Internal Server Error`.
* **Root Cause:** Metro fails to resolve hoisted dependencies in a monorepo workspace on Windows, generating relative URL paths with backslashes (`/..\..\node_modules\expo\AppEntry.js`) which the dev server cannot process.
* **Resolution:** Create a `metro.config.js` in the React Native workspace (`apps/mobile/metro.config.js`) to explicitly define the `watchFolders` (pointing to the workspace root) and `nodeModulesPaths` (pointing to both local and hoisted node_modules) and disable hierarchical lookup. Clear Metro's cache using `npx expo start --clear`.
