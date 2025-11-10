# AI Chat Forum

AI-assisted discussion forum with real-time threads, mentions, moderation tools, webhooks, and a clean Next.js 16 UI — built as a full-stack job task with production-style structure.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Backend](#backend)
- [Frontend](#frontend)
- [Authentication](#authentication)
- [Realtime (Socket.io)](#realtime-socketio)
- [Notifications](#notifications)
- [Moderation & Admin Tools](#moderation--admin-tools)
- [Webhooks](#webhooks)
- [AI Features](#ai-features)
- [User Profiles & Avatars](#user-profiles--avatars)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Worker Process](#worker-process)
- [Testing (Suggested)](#testing-suggested)
- [Logging & Monitoring](#logging--monitoring)
- [Deployment Notes](#deployment-notes)

---

## Overview

This project implements an **AI-powered forum** that demonstrates:

- A modern front-end using Next.js 16 and shadcn/ui.
- A TypeScript Node/Express backend using MongoDB, Redis, and Socket.io.
- Real-world patterns: auth, moderation, background workers, webhooks, summaries, notifications.

It’s designed to be:

- Easy to read and evaluate.
- Realistic enough for production-style reasoning.
- Flexible to plug in free/cheap AI providers.

---

## Key Features

### Forum

- Threads with title, description, tags.
- Nested replies (multi-level post tree).
- Latest activity timestamp on thread updates.
- Clean UI for reading and replying.

### Authentication

- Email/username + password.
- JWT access + refresh tokens, stored in **httpOnly cookies**.
- Auto-refresh logic on the client via Axios interceptor.
- Role-based access:
  - `user`
  - `admin` for moderation & admin dashboards.

### Realtime (Socket.io)

- Socket.io server attached to the backend.
- Client `useSocket` hook to:
  - connect/disconnect
  - `joinThread` / `leaveThread`
  - receive live notifications and (optionally) thread events.

### Notifications

- Stored in MongoDB and streamed in real-time.
- Notification types:
  - `reply`
  - `mention`
  - `flag`
  - `admin`
  - `digest` (extensible)
- Emitted via:
  - REST: `/api/notifications`
  - Socket.io: `notification` event
- De-dup logic to avoid double notifications when reply + mention target same user.

### Mentions

- `@username` detection in post content.
- Lookup users by username.
- Generate `mention` notifications.
- Integrated with real-time + webhooks.

---

## Tech Stack

**Frontend**

- Next.js 16
- React, TypeScript
- Tailwind CSS + shadcn/ui
- Axios for HTTP
- Socket.io client
- `react-hook-form` + `zod` for forms/validation

**Backend**

- Node.js (20+ recommended)
- Express + TypeScript
- MongoDB Atlas (Mongoose)
- Upstash Redis
- Socket.io
- JSON Web Tokens
- Imgbb API for image hosting
- Background worker for async jobs

---

## Architecture

Monorepo-style layout (adapted to this project):

```bash
ai-chat-forum/
  frontend/                # Next.js 16 app
    app/
    components/
    lib/
    hooks/
    ...
  backend/
    src/
      index.ts             # Express entrypoint
      routes/
        auth.ts
        profile.ts
        threads.ts
        posts.ts
        notifications.ts
        moderation.ts
        admin.dashboard.ts
        admin.webhooks.ts
      models/
        User.ts
        Thread.ts
        Post.ts
        Notification.ts
        Webhook.ts
        WebhookDelivery.ts
      services/
        notifications.ts
        webhooks.ts
        ai/
          service.ts       # summarizeThread, moderateText helpers
      lib/
        db.ts              # Mongo connection
        redis.ts           # Upstash Redis client
        socket.ts          # Socket.io server binding
      worker/
        index.ts           # background job consumer
```

---

## Backend

### Responsibilities

- REST API for auth, threads, posts, notifications, admin, webhooks.
- Socket.io server for realtime features.
- MongoDB & Redis integration.
- Background processing via worker and Redis queues.
- Role-based access control for admin features.

### Key Endpoints (High-Level)

**Auth**

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/avatar` – upload avatar during registration (imgbb)

**Profile**

- `GET /api/profile/me`
- `PUT /api/profile/me`
- `POST /api/profile/avatar` – authenticated avatar upload via imgbb

**Threads / Posts**

- `GET /api/threads`
- `GET /api/threads/:threadId`
- `POST /api/threads`
- `POST /api/threads/:threadId/posts`
- `POST /api/posts/:postId/flag` – manual user report

**Summaries**

- `GET /api/threads/:threadId/summary`
  - Uses cached summary on thread, with cooldown to avoid abuse.

**Notifications**

- `GET /api/notifications`
- `POST /api/notifications/read`
- Socket.io `notification` event for live pushes.

**Admin / Moderation**

- `GET /api/admin/dashboard`
  - Aggregate stats for:
    - totalThreads
    - totalPosts (excluding removed)
    - flaggedPosts
    - activeUsers (e.g. last 30 days)
    - recent flagged posts
- `GET /api/admin/moderation/posts`
- `PATCH /api/admin/moderation/posts/:postId/approve`
- `PATCH /api/admin/moderation/posts/:postId/remove`

**Webhooks**

- `GET /api/admin/webhooks`
- `POST /api/admin/webhooks`
- `PUT /api/admin/webhooks/:id`
- `PATCH /api/admin/webhooks/:id/toggle`
- `DELETE /api/admin/webhooks/:id`
- `GET /api/admin/webhooks/:id/deliveries`

---

## Frontend

### Highlights

- Next.js 16 app with App Router.
- shadcn/ui + Tailwind for consistent, modern styling.
- Axios client with:
  - `baseURL` from `NEXT_PUBLIC_API_BASE_URL`
  - `withCredentials` enabled
  - interceptor for token refresh.
- `Protected` component to guard authenticated/admin-only routes.
- Pages:
  - Auth: `/login`, `/register`
  - Threads listing & detail
  - Profile page with avatar & bio editing
  - Admin:
    - `/admin` dashboard
    - `/admin/moderation`
    - `/admin/webhooks`

---

## Authentication

- JWT-based authentication:
  - Access token (short-lived)
  - Refresh token (long-lived)
- Sent and stored in **httpOnly** cookies.
- Backend helpers to:
  - Issue tokens on login/register.
  - Rotate/refresh tokens.
  - Clear tokens on logout.
- Frontend:
  - Uses `useAuth` to store current user in context.
  - Reacts to 401s via refresh or redirects as needed.

---

## Realtime (Socket.io)

- Backend attaches Socket.io to Express HTTP server.
- Authenticated users join:
  - `user:{userId}` for notifications.
  - `thread:{threadId}` for thread-specific updates (optional).
- Frontend `useSocket`:
  - Exposes `isConnected`, `on`, `off`, `emit`, `joinThread`, `leaveThread`.
- Used for:
  - Real-time notifications.
  - Can be extended for live replies / presence.

---

## Notifications

`Notification` shape (client-side):

```ts
type Notification = {
  id: string
  userId: string
  type: 'reply' | 'mention' | 'flag' | 'admin' | 'digest'
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}
```

- Created on:
  - New reply to user’s post.
  - `@mention` in a post.
  - Flag/moderation events (optional).
- Delivered:
  - Via REST (fetch lists, mark read).
  - Via Socket.io for live updates.
  - Via webhooks for external systems.

---

## Moderation & Admin Tools

### Auto Moderation

- New posts push jobs into `jobs:ai_moderation` (Upstash Redis).
- Worker:
  - Fetches jobs.
  - Calls `moderateText(content)`.
  - Sets:
    - `isFlagged = true`
    - `aiFlags` with reasons/categories
  - Non-blocking for user requests.

### Manual Flags

- Users can report posts:
  - `POST /api/posts/:postId/flag`
  - Saves `flags[]` entries + sets `isFlagged = true`.

### Admin Moderation UI

- Lists flagged posts (AI + manual).
- Approve:
  - Clears flags and `aiFlags`, restores visibility.
- Remove:
  - Sets `status = 'removed'` (soft delete), hides from forum.

### Admin Dashboard

- Uses aggregation for stats.
- Displays flagged preview and quick moderation actions.

---

## Webhooks

- Outbound webhooks for:
  - `mention`
  - `reply`
  - `digest` (extensible)
- Each webhook:
  - `targetUrl`
  - `events`
  - `secret` (optional, for HMAC signatures)
  - `isActive`
- Delivery:
  - JSON payload describing event.
  - `x-webhook-signature` header if secret is set.
  - Logged in `WebhookDelivery` with:
    - statusCode
    - responseTime
    - error (if any)

---

## AI Features

- **Moderation**:
  - `moderateText(content)`:
    - Pluggable to any allowed free-tier/OSS model.
    - Returns `allowed` + optional flags (toxic, obscene, etc.).
- **Summaries**:
  - `summarizeThread(threadId, prompt)`:
    - Summarizes thread discussion.
    - Cached in `Thread.summary`.
    - Cooldown to prevent spam.

Implementation details are intentionally lightweight & swappable.

---

## User Profiles & Avatars

- Profile fields:
  - `displayName`
  - `bio`
  - `avatarUrl`
- Pages:
  - `/profile`:
    - Load via `GET /api/profile/me`.
    - Update via `PUT /api/profile/me`.
- Avatar upload:
  - Client reads file → base64.
  - Sends to:
    - `POST /api/profile/avatar` (for logged-in users), or
    - `POST /api/auth/avatar` (during registration).
  - Backend uploads to imgbb using `IMGBB_API_KEY`.
  - Stores returned URL as `avatarUrl`.

---

## Environment Variables

### Backend

```env
PORT=4000

MONGODB_URI=your_mongodb_uri
MONGODB_DB_NAME=aiChatForum

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

UPSTASH_REDIS_URL=your_upstash_redis_url
UPSTASH_REDIS_TOKEN=your_upstash_redis_token

HF_TOKEN=hf_xxx
HF_SUMMARIZATION_MODEL = model_name
HF_MODERATION_MODEL = model_name

IMGBB_API_KEY=your_imgbb_api_key

CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Update these for production deployments.

---

## Running Locally

### Prerequisites

- Node.js 20+
- pnpm / npm / yarn
- MongoDB Atlas instance
- Upstash Redis instance
- Imgbb API key

### Backend

```bash
cd backend
pnpm install

# dev
pnpm dev

# build & start
pnpm build
pnpm start
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Visit: `http://localhost:3000`

Make sure `NEXT_PUBLIC_API_BASE_URL` points to your backend.

---

## Worker Process

The worker runs background jobs (AI moderation, future notifications/webhooks batching):

```bash
cd backend
pnpm worker
```

Responsibilities:

- Connect to MongoDB & Redis.
- Loop over Redis queues:
  - `jobs:ai_moderation`:
    - Load post.
    - Run `moderateText`.
    - Update flags on post.
- Sleep briefly between polls to avoid tight CPU loops.

Deploy as a separate service/command in production.

---

## Testing (Suggested)

Recommended setup (optional for the assessment, but supported by structure):

- **Backend:**
  - Jest / Vitest + Supertest for routes and services.
- **Frontend:**
  - React Testing Library for critical flows (auth, posting, moderation).

---

## Logging & Monitoring

Suggested tools:

- Use `pino` or `winston` for structured logs.
- Log:
  - HTTP errors
  - Worker failures
  - Webhook attempts
  - AI moderation decisions

Can be integrated with hosted logging/monitoring platforms.

---

## Deployment Notes

- Backend & worker can be deployed on **Railway**:
  - One service for API.
  - One service for worker (`pnpm worker`).
- Frontend:
  - Deploy Next.js on Vercel or as a separate Node service.
- Configure:
  - `CORS_ORIGIN` to frontend URL.
  - Cookies with `secure: true` and proper domain in production.
  - Socket.io client to use the correct backend URL.

---

This project is structured to showcase:

- Solid full-stack architecture.
- Real-time features.
- Moderation pipeline.
- Webhooks and admin tooling.
- Practical AI integration points.
