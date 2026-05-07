import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { tenantMiddleware } from './middleware/tenant.js';
import tenantRoutes from './routes/tenants.js';
import roomRoutes from './routes/rooms.js';
import bookingRoutes from './routes/bookings.js';

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

// ── Public Tenant Routes ───────────────────────────────────────────────────
app.route('/api/tenants', tenantRoutes);

// ── Tenant-Scoped Routes ──────────────────────────────────────────────────
app.use('/api/tenants/:tenantSlug/rooms/*', tenantMiddleware);
app.use('/api/tenants/:tenantSlug/bookings/*', tenantMiddleware);

app.route('/api/tenants/:tenantSlug/rooms', roomRoutes);
app.route('/api/tenants/:tenantSlug/bookings', bookingRoutes);

// ── Static Files (Production mode) ─────────────────────────────────────────
const distPath = `${import.meta.dir}/../dist`;
app.use('/assets/*', serveStatic({ root: distPath }));
app.get('/', async (c) => new Response(Bun.file(`${distPath}/index.html`)));
app.get('/browse', async (c) => new Response(Bun.file(`${distPath}/index.html`)));
app.get('/admin', async (c) => new Response(Bun.file(`${distPath}/index.html`)));

// ── Start Server ───────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3002;

console.log(`Booking System API running on http://localhost:${PORT}`);

export default {
  port: PORT,
  fetch: app.fetch,
};
