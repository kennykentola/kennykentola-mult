# Multi-Company Ecosystem: API Documentation & Architecture

This document explains how the APIs are linked and how data flows through the application.
**Note:** This file is for local developer reference only and is ignored by git.

## 1. High-Level Architecture
The system follows a standard **Client-Server-Database** model:
- **Frontend (Client)**: Next.js (`apps/web`) and React Native (`apps/mobile`)
- **Backend (Server)**: Express API (`apps/api`) running on Node.js
- **Database / Auth / Storage**: Appwrite (`fra.cloud.appwrite.io`)

### Data Flow
1. The **Frontend** talks directly to Appwrite for **Authentication** (Login, Signup, OAuth). Appwrite issues a session JSON Web Token (JWT).
2. For business logic (e.g., chat, printing requests, telemetry, academic projects, payments), the Frontend calls the **Express API** (e.g., `http://localhost:5000/api/v1/...`).
3. The Frontend passes the Appwrite JWT in the `Authorization: Bearer <token>` header to the Express API.
4. The Express API receives the request and runs it through the `authenticateJWT` middleware (`apps/api/src/middleware/auth.ts`). This middleware asks Appwrite to verify the token.
5. Once verified, the Express API performs operations securely using the Appwrite Server SDK (`node-appwrite`), using secure server keys configured in `.env` (`APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`).

## 2. API Routes Summary
All routes are prefixed with `/api/v1` and are located in `apps/api/src/routes/`.

- **`/auth`**: Handles updating user profiles in the Appwrite database (`users_profile` collection) immediately after they sign up or login. It bridges Appwrite Auth with custom database records.
- **`/academic-projects`**: Manages the CS Student Projects. Users can request projects, and Admins can update the price/status and attach deliverables (proposal, thesis, source code).
- **`/chat`**: Handles the fetching of chat rooms, messages, and user lists. Real-time chat delivery is handled via Socket.io.
- **`/printing`**: Manages 3D printing requests, allowing users to upload files and Admins to approve/quote them.
- **`/academy`**: (In development) Manages online courses, modules, and video streaming.
- **`/payments`**: Integrates with Paystack to initialize payments and verify transactions via webhooks.
- **`/admin`**: High-privileged routes that allow Super Admins to view analytics, fetch all user directories, and manage platform-wide settings.
- **`/telemetry`**: Enterprise IoT reporting (e.g., drone monitoring, industrial sensor tracking).

## 3. Real-Time Socket.io Connection
The application uses **Socket.io** (`apps/api/src/services/socket.ts`) for real-time features like chat messaging and live notifications.
- When the frontend connects, it passes the Appwrite JWT.
- The Socket server verifies the JWT before allowing the user to join chat rooms (e.g., `direct` rooms or `community_global`).
- *Note:* If the Appwrite server is offline or unreachable, the socket connection will fail with an error like `fetch failed` because it cannot verify the token.

## 4. Input Validation & Security Audit
### Are we hardcoding sensitive data?
**No.** After reviewing the codebase:
- The frontend exposes `https://fra.cloud.appwrite.io/v1` and the Project ID (`kennykentolamult`). **This is completely safe and required** for public-facing SDKs.
- The backend (`apps/api/src/services/appwrite.ts`) relies exclusively on your local `.env` file for the highly sensitive `APPWRITE_API_KEY` and `PAYSTACK_SECRET_KEY`. As long as you don't commit your `.env` file, your secrets are safe.

### Do we validate incoming data?
**Currently: Basic Validation.** 
Most API routes perform manual checks (e.g., `if (!title || !description) return error;`) to ensure required data is present before sending it to the Appwrite Database. Appwrite then enforces its own strict database schema (e.g., field types, character limits).
- **Recommendation:** While Appwrite's schema protects the database, you can strengthen the Express API by implementing a validation library like **Zod** or **express-validator**. This would prevent bad data from even reaching the Appwrite service layer.
