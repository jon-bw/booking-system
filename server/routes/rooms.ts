import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { rooms } from '../db/schema.js';
import { authMiddleware, requireRole, requireTenantAccess } from '../middleware/auth.js';

const router = new Hono();

// GET /api/tenants/:tenantSlug/rooms — list all rooms (public)
router.get('/', async (c) => {
  const tenantId = c.get('tenantId');
  const data = await db
    .select()
    .from(rooms)
    .where(eq(rooms.tenantId, tenantId));
  return c.json({ success: true, data });
});

// POST /api/tenants/:tenantSlug/rooms/:roomId — single room (public)
router.post('/:roomId', async (c) => {
  const tenantId = c.get('tenantId');
  const body = await c.req.json();
  const { roomId } = body;
  const data = await db
    .select()
    .from(rooms)
    .where(and(
      eq(rooms.id, roomId),
      eq(rooms.tenantId, tenantId)
    ));
  if (data.length === 0) return c.json({ error: 'Room not found' }, 404);
  return c.json({ success: true, data: data[0] });
});

// POST /api/tenants/:tenantSlug/rooms — create room (manager, admin, superadmin)
router.post(
  '/new',
  authMiddleware,
  requireRole('manager', 'admin', 'superadmin'),
  requireTenantAccess,
  async (c) => {
    const tenantId = c.get('tenantId');
    const body = await c.req.json();
    const { name, capacity, pricePerHour, description, images } = body;
    if (!name || capacity === undefined || pricePerHour === undefined) {
      return c.json({ error: 'name, capacity, and pricePerHour are required' }, 400);
    }
    const [created] = await db.insert(rooms).values({
      tenantId,
      name,
      capacity: Number(capacity),
      pricePerHour: Number(pricePerHour),
      description: description || null,
      images: (images && images.length > 0) ? JSON.stringify(images) : null,
      isDeleted: false,
    }).returning();
    return c.json({ success: true, data: created }, 201);
  }
);

// PATCH /api/tenants/:tenantSlug/rooms/:roomId — update room (manager, admin, superadmin)
router.patch(
  '/:roomId',
  authMiddleware,
  requireRole('manager', 'admin', 'superadmin'),
  requireTenantAccess,
  async (c) => {
    const tenantId = c.get('tenantId');
    const roomId = parseInt(c.req.param('roomId'));
    const body = await c.req.json();

    const existing = await db.select().from(rooms)
      .where(and(eq(rooms.id, roomId), eq(rooms.tenantId, tenantId)));
    if (existing.length === 0) return c.json({ error: 'Room not found' }, 404);

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.capacity !== undefined) updates.capacity = Number(body.capacity);
    if (body.pricePerHour !== undefined) updates.pricePerHour = Number(body.pricePerHour);
    if (body.isDeleted !== undefined) updates.isDeleted = body.isDeleted;
    if (body.description !== undefined) updates.description = body.description;
    if (body.images !== undefined) {
      updates.images = (Array.isArray(body.images) && body.images.length > 0) ? JSON.stringify(body.images) : null;
    }

    const [updated] = await db.update(rooms).set(updates)
      .where(eq(rooms.id, roomId)).returning();
    return c.json({ success: true, data: updated });
  }
);

// DELETE /api/tenants/:tenantSlug/rooms/:roomId — soft delete (manager, admin, superadmin)
router.delete(
  '/:roomId',
  authMiddleware,
  requireRole('manager', 'admin', 'superadmin'),
  requireTenantAccess,
  async (c) => {
    const tenantId = c.get('tenantId');
    const roomId = parseInt(c.req.param('roomId'));
    const existing = await db.select().from(rooms)
      .where(and(eq(rooms.id, roomId), eq(rooms.tenantId, tenantId)));
    if (existing.length === 0) return c.json({ error: 'Room not found' }, 404);
    await db.update(rooms).set({ isDeleted: true }).where(eq(rooms.id, roomId));
    return c.json({ success: true, message: 'Room soft-deleted' });
  }
);

export default router;
