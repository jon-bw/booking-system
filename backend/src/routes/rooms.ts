import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { rooms } from '../db/schema.js';

const router = new Hono();

// GET /api/tenants/:tenantSlug/rooms — list all rooms
router.get('/', async (c) => {
  const tenantId = c.get('tenantId');
  const data = await db
    .select()
    .from(rooms)
    .where(eq(rooms.tenantId, tenantId));
  return c.json({ success: true, data });
});

// GET /api/tenants/:tenantSlug/rooms/:roomId — single room
router.get('/:roomId{id}', async (c) => {
  const tenantId = c.get('tenantId');
  const roomId = parseInt(c.req.param('roomId'));
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

// POST /api/tenants/:tenantSlug/rooms — create room
router.post('/', async (c) => {
  const tenantId = c.get('tenantId');
  const body = await c.req.json();
  const { name, capacity, pricePerHour } = body;
  if (!name || capacity === undefined || pricePerHour === undefined) {
    return c.json({ error: 'name, capacity, and pricePerHour are required' }, 400);
  }
  const [created] = await db.insert(rooms).values({
    tenantId,
    name,
    capacity: Number(capacity),
    pricePerHour: Number(pricePerHour),
    isDeleted: false,
  }).returning();
  return c.json({ success: true, data: created }, 201);
});

// PATCH /api/tenants/:tenantSlug/rooms/:roomId — update room
router.patch('/:roomId{id}', async (c) => {
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

  const [updated] = await db.update(rooms).set(updates)
    .where(eq(rooms.id, roomId)).returning();
  return c.json({ success: true, data: updated });
});

// DELETE /api/tenants/:tenantSlug/rooms/:roomId — soft delete
router.delete('/:roomId{id}', async (c) => {
  const tenantId = c.get('tenantId');
  const roomId = parseInt(c.req.param('roomId'));
  const existing = await db.select().from(rooms)
    .where(and(eq(rooms.id, roomId), eq(rooms.tenantId, tenantId)));
  if (existing.length === 0) return c.json({ error: 'Room not found' }, 404);
  await db.update(rooms).set({ isDeleted: true }).where(eq(rooms.id, roomId));
  return c.json({ success: true, message: 'Room soft-deleted' });
});

export default router;
