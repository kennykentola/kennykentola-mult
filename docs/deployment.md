# Deployment & Infrastructure Guide (`deployment.md`)

This guide outlines the production deployment setup using free and budget-friendly tiers of **Vercel/Netlify** (frontend), **Render** (backend), **MongoDB Atlas** (database), and **Upstash** (Redis cache & queues).

---

## Architecture Overview

```
[ Client: Next.js (Vercel) ] <---> [ API Backend: Node/Express (Render) ]
                                            |
                         +------------------+------------------+
                         |                  |                  |
               [ MongoDB Atlas ]     [ Upstash Redis ]    [ Cloudinary ]
```

---

## 1. Frontend Hosting: Vercel or Netlify

We recommend **Vercel** for Next.js 15 apps due to native optimization, serverless rendering performance, and deep integration with Vercel Speed Insights.

### Vercel Deployment Steps
1. Push your Next.js workspace repository to GitHub.
2. Log in to [Vercel](https://vercel.com) using your GitHub account.
3. Click **Add New** > **Project** and import your repository.
4. Configure the project settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./apps/web` (if using monorepo) or `./` (for standalone)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
5. Add the Environment Variables (see Environment Variables section below).
6. Click **Deploy**. Vercel will automatically generate SSL certificates and assign a subdomain (e.g. `company.vercel.app`).

### Custom Domains & Headers
- Add your custom domain in the **Settings** > **Domains** panel on Vercel.
- Configure security headers in Next.js via `next.config.ts`:
  ```typescript
  import type { NextConfig } from 'next';

  const nextConfig: NextConfig = {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://res.cloudinary.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.yourcompany.com wss://api.yourcompany.com;" }
          ]
        }
      ];
    }
  };
  export default nextConfig;
  ```

---

## 2. Backend Hosting: Render (Web Service)

Render offers a Free Tier for Node.js Web Services. However, the free tier comes with a limitation: **instances spin down after 15 minutes of inactivity**, causing a 30-50 second delay on the next request.

### Mitigating Render Free-Tier Sleeping
To prevent the server from sleeping, setup a free cron job on [UptimeRobot](https://uptimerobot.com) to ping the `/api/health` status endpoint every **10 minutes**.

### Health Check Endpoint (Express)
```typescript
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});
```

### Render Deployment Steps
1. Log in to [Render](https://render.com) and click **New** > **Web Service**.
2. Connect your GitHub repository.
3. Select the branch and set the parameters:
   - **Runtime:** Node
   - **Build Command:** `npm run build` (transpile TypeScript to JS)
   - **Start Command:** `node dist/server.js`
4. Choose the **Free Plan Instance**.
5. Add the environment variables (see below).
6. Enable **Auto-Deploy** on git pushes.

---

## 3. Database: MongoDB Atlas (M0 Shared Tier)

MongoDB Atlas offers a generous 512MB free shared cluster that never expires.

### Configuration
1. Sign up on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database cluster named `company-db-cluster` using the **Shared M0** option (AWS or Google Cloud).
3. **Network Access Setup:**
   - Since Render assigns dynamic IPs to its free services, you must whitelist all IPs: Add an IP address rule of `0.0.0.0/0` in Atlas Network Access.
   - Secure the connection by using a strong username and randomly-generated password for the database user.
4. **Connection URL:**
   - Copy the connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/company?retryWrites=true&w=majority`

---

## 4. Cache & Queue: Upstash Redis

Render's free Redis services are not persistent and have small connection limits. We recommend **Upstash Serverless Redis** which provides up to 10,000 requests/day on the free tier, with persistent storage.

### Configuration
1. Log in to [Upstash Console](https://console.upstash.com).
2. Create a Serverless Database.
3. Enable **Eviction** if using strictly for caching, or **No Eviction** if using for BullMQ task queues.
4. Copy the URL string starting with `rediss://...`

---

## 5. Security Configuration

To secure the backend in production, enforce these Express middlewares:

```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

// Secure HTTP Headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://yourcompany.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));

// API Rate Limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// Express Parser size restrictions
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
```

---

## 6. Environment Variables

Create three separate sets of `.env` files for deployment.

### Backend Environments (`.env.production` on Render)
```ini
NODE_ENV=production
PORT=10000

# Databases
DATABASE_URL=mongodb+srv://db_user:strong_password@cluster.mongodb.net/production?retryWrites=true&w=majority
REDIS_URL=rediss://default:upstash_token@your-redis.upstash.io:6379

# Tokens
JWT_SECRET=super_long_hex_secret_key_here
JWT_REFRESH_SECRET=another_super_long_hex_secret_key_here

# Services
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# URLs
CLIENT_URL=https://yourcompany.com
API_URL=https://api-service.onrender.com
```

### Next.js Frontend Environments (`.env.production` on Vercel)
```ini
NEXT_PUBLIC_API_URL=https://api-service.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://api-service.onrender.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Mobile React Native Environments (`.env` in Expo App)
```ini
EXPO_PUBLIC_API_URL=https://api-service.onrender.com
EXPO_PUBLIC_SOCKET_URL=https://api-service.onrender.com
```
