# Booking System — Claude Code Context

Multi-tenant room booking platform. **Keep the project README.md accurate when you change things.**

## Architecture
- **Backend:** Hono (Bun runtime), port 3002. Single-process — Hono also serves static files in production.
- **Frontend:** React 19 + Vite 8 + Tailwind CSS v4. SPA fallback served from `dist/`.
- **Database:** SQLite via Drizzle ORM + `bun:sqlite`. Single file at `booking.db`.
- **Auth:** better-auth v1.6 with email/password.

## Project Structure
```
server/
  auth.ts              # better-auth instance
  db/
    index.ts           # Drizzle + bun:sqlite connection  
    schema.ts          # All table definitions
  middleware/
    auth.ts            # authMiddleware, requireRole, requireTenantAccess
    tenant.ts          # Tenant resolution (:tenantSlug)
  routes/
    bookings.ts        # Booking CRUD + availability
    rooms.ts           # Room CRUD
    tenants.ts         # Tenant list + creation
    users.ts           # User creation + listing (RBAC)
  index.ts             # Hono app entry
  seed.ts              # Seed script
src/
  api/
    auth-client.js     # better-auth client
    client.js          # REST API client
  context/
    AuthContext.jsx    # Auth state
    TenantContext.jsx  # Current tenant
  pages/           # All React pages (see README for details)
```

## Key Commands
- `bun run dev` → Vite + Hono API
- `bun run build` → production build to `dist/`
- `bun run db:push` → Drizzle schema push
- `bun run db:seed` → seed sample data

## DB Patterns
- All tables defined in `server/db/schema.ts`  
- Push with `drizzle-kit push`
- Soft delete uses `is_deleted` boolean + `deleted_at` timestamp

## Auth Roles
superadmin > admin > manager > user (RBAC with tenant scoping)

## Design System (Nothing Design)
- Fonts: Doto (display), Space Grotesk (body), Space Mono (labels)
- Colors: `#0a0a0a` bg, `#111111` surfaces, `#333333` borders, `#E8E8E8` text
- Accent: `#D71921` (destructive), `#4A9E5C` (confirmed), `#5B9BF6` (interactive)
- Buttons: Space Mono ALL CAPS, pill shape, outlined NOT filled
- NO shadows, gradients, solid fills on active states

## Code Conventions
- `.jsx` files for React components
- Named exports only
- ES modules (`type: "module"`)
- Use `const` arrow functions for components
- Tailwind v4: `@theme` for design tokens, NO spacing overrides inside @theme
- No try/catch in API routes — use Hono `app.onError()`

## Tenant-Scoped URLs
All tenant routes use `/api/tenants/:tenantSlug/...` pattern. The `tenantMiddleware` resolves the slug to a tenant ID before the route handler runs.
