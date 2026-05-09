# Booking System

A multi-tenant room booking platform with role-based access control powered by [better-auth](https://better-auth.com).

## Features

- **Multi-tenant architecture** — each tenant has its own rooms and bookings, isolated by slug
- **RBAC permissions** — superadmin, admin, manager, and user roles with scoped access
- **Room management** — create, update, soft-delete rooms per tenant
- **Booking system** — availability checking, conflict prevention, status lifecycle (pending → confirmed → completed/cancelled)
- **Admin dashboards** — tenant-scoped admin panel + global superadmin panel
- **Static file serving** — SPA fallback with production-ready static assets in `dist/`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Tailwind CSS v4, Vite 8, Lucide Icons |
| Backend | Hono (Bun runtime) |
| ORM | Drizzle ORM 0.44 + drizzle-kit |
| Database | SQLite (`bun:sqlite`) |
| Auth | better-auth v1.6 with email/password |
| Validation | Zod v4 + `@hono/zod-validator` |

## Role Hierarchy

| Role | Permissions |
|------|------------|
| **superadmin** | Create admins. View all tenants, users, and bookings. Full system access. |
| **admin** | Create own tenants. Create managers and users within owned tenants. Manage rooms/bookings in owned tenants. |
| **manager** | Manage rooms and bookings within their assigned tenant. |
| **user** | Browse rooms and create bookings within their assigned tenant. |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed

### Installation

```bash
bun install
```

### Database Setup

Push the schema to SQLite:

```bash
bun run db:push
```

Seed sample data + initial superadmin:

```bash
bun run db:seed
```

### Run Dev Server

```bash
bun run dev
```

The API server starts alongside the Vite dev server (default port `3002`).

### Default Credentials

After seeding, a superadmin account is created automatically:

- **Email:** `superadmin@example.com`
- **Password:** `superadmin123`

## Project Structure

```
server/
  auth.ts              # better-auth instance (drizzle adapter)
  db/
    index.ts           # Drizzle + bun:sqlite connection
    schema.ts          # All table definitions (including auth tables)
  middleware/
    auth.ts            # authMiddleware, requireRole, requireTenantAccess
    tenant.ts          # Tenant resolution middleware
  routes/
    bookings.ts        # Booking CRUD + availability
    rooms.ts           # Room CRUD
    tenants.ts         # Tenant list + creation
    users.ts           # User creation + listing (RBAC enforced)
  index.ts             # Hono app entry
  seed.ts              # Seed script with superadmin creation
src/
  api/
    auth-client.js     # better-auth client
    client.js          # REST API client
  context/
    AuthContext.jsx    # Auth state + session management
    TenantContext.jsx  # Current tenant resolution
  pages/
    AdminDashboard.jsx       # Tenant-scoped admin (rooms, bookings, users)
    SuperadminDashboard.jsx  # Global superadmin panel
    LoginPage.jsx            # Email/password login
    ...
```

## Auth Integration

better-auth tables (`user`, `session`, `account`, `verification`) are defined directly in `server/db/schema.ts` and managed by Drizzle. The `userProfiles` table extends auth users with RBAC fields:

- `role` — `superadmin` | `admin` | `manager` | `user`
- `tenantId` — the tenant this user belongs to (null for superadmin/admin)
- `createdById` — who created this user

The `tenants` table has an `ownerId` linking to the admin who created it.

## API Overview

### Auth (better-auth)

All auth endpoints are handled by better-auth under `/api/auth/*`:

- `POST /api/auth/sign-up/email` — Register
- `POST /api/auth/sign-in/email` — Login
- `GET  /api/auth/sign-out` — Logout
- `GET  /api/auth/session` — Get current session

### Users

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/users/me` | Any authenticated user |
| GET | `/api/users` | superadmin, admin (scoped) |
| POST | `/api/users` | superadmin (creates admin), admin (creates manager/user) |

### Tenants

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/tenants` | Public |
| GET | `/api/tenants/:slug` | Public |
| POST | `/api/tenants` | admin, superadmin |

### Rooms

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/tenants/:slug/rooms` | Public |
| POST | `/api/tenants/:slug/rooms/new` | manager, admin, superadmin + tenant access |
| PATCH | `/api/tenants/:slug/rooms/:id` | manager, admin, superadmin + tenant access |
| DELETE | `/api/tenants/:slug/rooms/:id` | manager, admin, superadmin + tenant access |

### Bookings

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/tenants/:slug/bookings` | Public |
| GET | `/api/tenants/:slug/bookings/available` | Public |
| POST | `/api/tenants/:slug/bookings` | Any authenticated + tenant access |
| PATCH | `/api/tenants/:slug/bookings/:id` | manager, admin, superadmin + tenant access |
| DELETE | `/api/tenants/:slug/bookings/:id` | manager, admin, superadmin + tenant access |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3002` |
| `BETTER_AUTH_SECRET` | JWT/session secret | `dev-secret-change-me-in-production` |
| `BETTER_AUTH_URL` | Base URL for auth callbacks | auto-detected from request |

See `.env.example` for all configurable options.

## Build & Deploy

Build the frontend for production:

```bash
bun run build
```

This outputs static assets to `dist/`. In production mode the Hono server serves these directly via `serveStatic`, so you only need to run the backend:

```bash
bun run server/index.ts
```

### With PM2

```bash
pm2 start server/index.ts --name booking-system --interpreter "bun"
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server + Hono API (hot reload) |
| `bun run build` | Production build → `dist/` |
| `bun run db:push` | Push Drizzle schema to SQLite |
| `bun run db:seed` | Seed sample data + initial superadmin |
