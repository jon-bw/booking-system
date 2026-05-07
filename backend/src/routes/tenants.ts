import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tenants } from '../db/schema.js';

const router = new Hono();

// GET /api/tenants — list all tenants
router.get('/', async (c) => {
  const data = await db.select().from(tenants);
  return c.json({ success: true, data });
});

// GET /api/tenants/:slug — get single tenant by slug
router.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const data = await db.select().from(tenants).where(eq(tenants.slug, slug));
  if (data.length === 0) return c.json({ error: 'Tenant not found' }, 404);
  return c.json({ success: true, data: data[0] });
});

// POST /api/tenants — create tenant
router.post('/', async (c) => {
  const body = await c.req.json();
  const { name, slug, settings } = body;
  if (!name || !slug) return c.json({ error: 'name and slug required' }, 400);

  const [created] = await db.insert(tenants).values({
    name, slug, settings: settings || {},
  }).returning();
  return c.json({ success: true, data: created }, 201);
});

export default router;
