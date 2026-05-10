import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { auth } from './auth.js';
import { tenantMiddleware } from './middleware/tenant.js';
import { authMiddleware, requireRole } from './middleware/auth.js';
import tenantRoutes from './routes/tenants.js';
import roomRoutes from './routes/rooms.js';
import bookingRoutes from './routes/bookings.js';
import userRoutes from './routes/users.js';
import pageBlockRoutes from './routes/pageBlocks.js';
import themeRoutes from './routes/themes.js';
import { eq } from 'drizzle-orm';
import { tenants } from './db/schema.js';
import { db } from './db/index.js';

const app = new Hono();

// ── Global Middleware ──────────────────────────────────────────────────────
app.use('*', cors());

// Global error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (c) => c.json({ status: 'ok', uptime: process.uptime() }));

// ── Auth Routes ────────────────────────────────────────────────────────────
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

// ── Public Tenant Page ──────────────────────────────────────────────────────
app.get('/api/tenants/:tenantSlug/page', tenantMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const { pageBlocks } = await import('./db/schema.js');
  const blocks = await db
    .select()
    .from(pageBlocks)
    .where(eq(pageBlocks.isVisible, true))
    .orderBy(pageBlocks.sortOrder);
  return c.json({ success: true, data: blocks });
});

// ── Public Theme ─────────────────────────────────────────────────────────────
app.get('/api/tenants/:tenantSlug/theme', async (c) => {
  const tenantSlug = c.req.param('tenantSlug');
  const tenant = await db.select({ theme: tenants.theme })
    .from(tenants)
    .where(eq(tenants.slug, tenantSlug))
    .limit(1);
  if (tenant.length === 0) return c.json({ error: 'Tenant not found' }, 404);
  return c.json({ success: true, data: tenant[0].theme || {} });
});

// ── Public Tenant Routes ───────────────────────────────────────────────────
app.route('/api/tenants', tenantRoutes);
app.route('/api/users', userRoutes);

// ── Admin: Page Block Routes (manager+) ─────────────────────────────────────
app.use('/api/tenants/:tenantSlug/page-blocks/*', tenantMiddleware);
app.use('/api/tenants/:tenantSlug/page-blocks/:id', tenantMiddleware);
app.use('/api/tenants/:tenantSlug/page-blocks/reorder', tenantMiddleware);
app.route('/api/tenants/:tenantSlug/page-blocks', pageBlockRoutes);

// ── Admin: Theme Routes ─────────────────────────────────────────────────────
app.use('/api/tenants/:tenantSlug/theme', tenantMiddleware, authMiddleware, requireRole('manager', 'admin', 'superadmin'));
app.route('/api/tenants/:tenantSlug/theme', themeRoutes);

// ── Tenant-Scoped Routes ──────────────────────────────────────────────────
app.use('/api/tenants/:tenantSlug/rooms/*', tenantMiddleware);
app.use('/api/tenants/:tenantSlug/bookings/*', tenantMiddleware);

app.route('/api/tenants/:tenantSlug/rooms', roomRoutes);
app.route('/api/tenants/:tenantSlug/bookings', bookingRoutes);

// ── Static Files (Production mode) ─────────────────────────────────────────
// Serve uploaded files
app.get('/uploads/*', serveStatic({ root: './dist' }))

// Serve static files from dist directory
app.get('/assets/*', serveStatic({ root: './dist' }))
app.get('/uploads/*', serveStatic({ root: './dist' }))
// SPA fallback: serve index.html for all non-API routes
app.get('/*', serveStatic({
  root: './dist',
  rewriteRequestPath: () => '/index.html'
}))

// ── Start Server ───────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3002;

console.log(`Booking System API running on http://localhost:${PORT}`);

export default {
  port: PORT,
  fetch: app.fetch,
};
