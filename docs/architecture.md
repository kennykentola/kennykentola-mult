# System Architecture Design (`architecture.md`)

This document details the codebase layout, folder structures, Express API routes, Socket.io real-time chat architecture, and the design token system for the visual style.

---

## 1. Monorepo Directory Structure

We recommend using **npm workspaces** or **Yarn workspaces** to manage the frontend, backend, mobile app, and shared types in one codebase.

```
kennykentola-multi-company/
├── apps/
│   ├── web/                    # Next.js 15 Website & Admin Dashboard
│   │   ├── src/
│   │   │   ├── app/            # Next.js App Router (pages & layouts)
│   │   │   ├── components/     # UI Components (Shadcn UI basis)
│   │   │   ├── hooks/          # React hooks & queries
│   │   │   └── store/          # Zustand global state (auth, cart)
│   │   └── package.json
│   │
│   ├── mobile/                 # React Native / Expo Mobile Client
│   │   ├── src/
│   │   │   ├── app/            # Expo Router structure (tabs, auth)
│   │   │   ├── components/     # Mobile native view widgets
│   │   │   └── services/       # API call wrappers
│   │   └── package.json
│   │
│   └── api/                    # Node.js + Express Server
│       ├── src/
│       │   ├── controllers/    # Request handlers (auth, payment)
│       │   ├── models/         # Mongoose Schemas (User, Project)
│       │   ├── routes/         # Express endpoint routers
│       │   ├── services/       # Cloudinary, PDF Generator, SMS, Email
│       │   ├── sockets/        # Socket.io chat server handlers
│       │   ├── workers/        # BullMQ worker job logic
│       │   └── server.ts       # Server initialization
│       └── package.json
│
├── packages/
│   └── shared/                 # Common interfaces and validation schemas
│       ├── src/
│       │   ├── types.ts        # Shared TS interfaces
│       │   └── validation.ts   # Zod validation models
│       └── package.json
│
├── docs/                       # Architecture & setup plans (this folder)
├── package.json                # Root package workspace definition
└── README.md
```

---

## 2. Express API Endpoint Router Map

The API is separated into modular routers, prefixing all requests with `/api/v1`.

### Route Mapping & Paths
- `/api/v1/auth`
  - `POST /register` - Client/Student self-registration
  - `POST /login` - Password verification & token issuing
  - `POST /refresh-token` - Refreshing access tokens
  - `POST /logout` - Invalidate session
- `/api/v1/academy`
  - `GET /courses` - Get all published courses
  - `GET /courses/:id/lessons` - Access lesson list (restricted to purchased students)
  - `POST /courses/:id/assignments/:assignId/submit` - Student submit assignments
  - `POST /submissions/:id/grade` - Instructor grading submissions
- `/api/v1/projects`
  - `POST /request` - Client project request
  - `GET /client-board` - Client project list
  - `GET /pm-board` - Project manager assignment overview
  - `PATCH /:id/milestones/:mId` - Update milestone status
- `/api/v1/printing`
  - `POST /order` - Upload print file and create specifications
  - `POST /orders/:id/quote` - Admin sets price quote
  - `GET /jobs` - Printer operator view dashboard
- `/api/v1/solar`
  - `POST /request-install` - Request quotation
  - `GET /technician-jobs` - Electrician dashboard jobs
- `/api/v1/payments`
  - `GET /bank-accounts` - Active bank accounts
  - `POST /submit-receipt` - Upload screenshot and file reference
  - `PATCH /verify/:paymentId` - Admin approve/reject payment (updates corresponding module status)
- `/api/v1/chat`
  - `GET /conversations` - Fetch active user conversations
  - `GET /conversations/:id/messages` - Fetch paginated messages

---

## 3. Real-Time Chat Architecture (Socket.io)

```
[Client (Mobile/Web)] --- websocket connection ---> [ Socket.io Gateway ]
                                                           |
                      +-------------------+----------------+
                      |                   |
               [ Join Room ]     [ Save Message ] ---> [ Emit to Room ]
            "room_{conversation}"   (MongoDB)           (Active Receivers)
```

### Server-Side Socket.io Event Handling
```typescript
import { Server, Socket } from 'socket.io';
import Message from '../models/Message';

export const setupChatSockets = (io: Server) => {
  io.use((socket: Socket, next) => {
    // Authenticate socket handshake using JWT
    const token = socket.handshake.auth.token;
    // Verify JWT, append user context to socket
    // socket.user = decodedTokenUser;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    // Join room when entering conversation panel
    socket.on('join_conversation', (conversationId) => {
      socket.join(`room_${conversationId}`);
    });

    // Handle sending message
    socket.on('send_message', async (data) => {
      const { conversationId, content, attachments } = data;
      
      // 1. Persist to MongoDB
      const newMessage = await Message.create({
        conversationId,
        senderId: socket.user.id,
        content,
        attachments
      });

      // 2. Broadcast to room
      io.to(`room_${conversationId}`).emit('new_message', newMessage);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
};
```

---

## 4. Background Job Queue Setup (BullMQ)

For sending course completion notifications, generating payment receipt PDFs, and queuing large flyer/book-printing order uploads.

```typescript
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { generatePdfReceipt } from '../services/pdfService';

const connection = new IORedis(process.env.REDIS_URL!);

// 1. Define Queues
export const paymentQueue = new Queue('paymentQueue', { connection });

// 2. Define Workers
const paymentWorker = new Worker('paymentQueue', async (job) => {
  if (job.name === 'generateReceipt') {
    const { paymentId, receiptNumber, amount, paidBy, date } = job.data;
    
    // Process heavy task: generate PDF receipt and upload to Cloudinary
    const pdfUrl = await generatePdfReceipt({ receiptNumber, amount, paidBy, date });
    
    // Save PDF link in Receipt document
    await Receipt.create({
      paymentId,
      receiptNumber,
      amount,
      paidBy,
      date,
      pdfUrl
    });
  }
}, { connection });
```

---

## 5. Visual Design System: Modern SaaS + Glassmorphism

To give the application a premium SaaS look, the frontend style guide implements harmonized dark UI bases with subtle translucent layers, custom rounded cards, and vibrant accent colors.

### Tailwind Theme Integration (`tailwind.config.ts`)
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      colors: {
        background: 'hsl(222.2 84% 4.9%)', // Deep dark blue-black base
        card: 'hsla(222.2 84% 8%, 0.6)',    // Translucent dark card base
        border: 'hsla(217.2 32.6% 17.5%, 0.5)', // Subtle borders
        primary: {
          DEFAULT: 'hsl(263.4 70% 50.4%)', // Vibrant Indigo Accent
          foreground: 'hsl(210 40% 98%)',
        },
        secondary: {
          DEFAULT: 'hsl(180 100% 40%)',   // Cool Cyan Highlight
          foreground: 'hsl(222.2 47.4% 11.2%)',
        },
        muted: 'hsl(215 20.2% 65.1%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      }
    }
  }
};
export default config;
```

### Glassmorphism Utility Class
Applied on cards, headers, and modal dialogs to provide depth:
```css
.glass-panel {
  background: rgba(13, 20, 38, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```
