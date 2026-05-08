import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { auth } from '../auth.js';
import { db } from '../db/index.js';
import { tenants, userProfiles } from '../db/schema.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = new Hono();

// GET /api/tenants — list tenants scoped to the caller's role
router.get('/', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  // Not authenticated → public list
  if (!session || !session.user) {
    const data = await db.select().from(tenants);
    return c.json({ success: true, data });
  }

  const profileResult = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1);

  const profile = profileResult[0];

  // No profile yet, or superadmin → full list
  if (!profile || profile.role === 'superadmin') {
    const data = await db.select().from(tenants);
    return c.json({ success: true, data });
  }

  // Admin → only tenants they own
  if (profile.role === 'admin') {
    const data = await db
      .select()
      .from(tenants)
      .where(eq(tenants.ownerId, profile.userId));
    return c.json({ success: true, data });
  }

  // Manager / user → only their assigned tenant
  if (profile.tenantId) {
    const data = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, profile.tenantId));
    return c.json({ success: true, data });
  }

  return c.json({ success: true, data: [] });
});

// GET /api/tenants/:slug — get single tenant by slug (public)
router.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const data = await db.select().from(tenants).where(eq(tenants.slug, slug));
  if (data.length === 0) return c.json({ error: 'Tenant not found' }, 404);
  return c.json({ success: true, data: data[0] });
});

// POST /api/tenants — create tenant (admin or superadmin only)
router.post('/', authMiddleware, requireRole('admin', 'superadmin'), async (c) => {
  const body = await c.req.json();
  const { name, slug, settings } = body;
  if (!name || !slug) return c.json({ error: 'name and slug required' }, 400);

  const profile = c.get('profile');
  const ownerId = profile.role === 'admin' ? profile.userId : null;

  const [created] = await db.insert(tenants).values({
    name, slug, ownerId, settings: settings || {},
  }).returning();
  return c.json({ success: true, data: created }, 201);
});

export default router;
