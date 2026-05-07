import { Hono } from 'hono';
import { and, eq, lt, gt } from 'drizzle-orm';
import { db } from '../db/index.js';
import { bookings } from '../db/schema.js';

const router = new Hono();

// GET /api/tenants/:tenantSlug/bookings — list all bookings
router.get('/', async (c) => {
  const tenantId = c.get('tenantId');
  const data = await db.select().from(bookings)
    .where(eq(bookings.tenantId, tenantId));
  return c.json({ success: true, data });
});

// GET /api/tenants/:tenantSlug/bookings/available
// ?room_id=1&start=1234567890&end=1234567890
router.get('/available', async (c) => {
  const tenantId = c.get('tenantId');
  const roomId = parseInt(c.req.query('room_id') || '0');
  const start = parseInt(c.req.query('start') || '0');
  const end = parseInt(c.req.query('end') || '0');

  if (!roomId || !start || !end) {
    return c.json({ error: 'room_id, start, and end query params required' }, 400);
  }

  // Overlap: (new_start < existing_end) AND (new_end > existing_start)
  const conflicts = await db.select().from(bookings)
    .where(and(
      eq(bookings.roomId, roomId),
      eq(bookings.tenantId, tenantId),
      eq(bookings.status, 'confirmed'),
      lt(bookings.startTime, end),
      gt(bookings.endTime, start)
    ));

  return c.json({ success: true, available: conflicts.length === 0, conflicts });
});

// GET /api/tenants/:tenantSlug/bookings/:bookingId
router.get('/:bookingId{id}', async (c) => {
  const tenantId = c.get('tenantId');
  const bookingId = parseInt(c.req.param('bookingId'));
  const data = await db.select().from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.tenantId, tenantId)));
  if (data.length === 0) return c.json({ error: 'Booking not found' }, 404);
  return c.json({ success: true, data: data[0] });
});

// POST /api/tenants/:tenantSlug/bookings — create with overlap guard (409)
router.post('/', async (c) => {
  const tenantId = c.get('tenantId');
  const body = await c.req.json();
  const { roomId, customerName, startTime, endTime, status = 'pending' } = body;

  if (!roomId || !customerName || !startTime || !endTime) {
    return c.json({ error: 'roomId, customerName, startTime, endTime required' }, 400);
  }

  const startTs = new Date(startTime).getTime();
  const endTs = new Date(endTime).getTime();
  if (startTs >= endTs) {
    return c.json({ error: 'startTime must be before endTime' }, 400);
  }

  // Strict overlap prevention: (new_start < existing_end) AND (new_end > existing_start)
  const conflicts = await db.select().from(bookings)
    .where(and(
      eq(bookings.roomId, roomId),
      eq(bookings.tenantId, tenantId),
      eq(bookings.status, 'confirmed'),
      lt(bookings.startTime, endTs),
      gt(bookings.endTime, startTs)
    ));

  if (conflicts.length > 0) {
    return c.json({
      error: 'Booking conflict: this room is already booked for the selected time',
      conflicts
    }, 409);
  }

  const [created] = await db.insert(bookings).values({
    roomId, tenantId,
    startTime: startTs, endTime: endTs,
    customerName, status,
  }).returning();
  return c.json({ success: true, data: created }, 201);
});

// PATCH /api/tenants/:tenantSlug/bookings/:bookingId
router.patch('/:bookingId{id}', async (c) => {
  const tenantId = c.get('tenantId');
  const bookingId = parseInt(c.req.param('bookingId'));
  const body = await c.req.json();

  const existing = await db.select().from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.tenantId, tenantId)));
  if (existing.length === 0) return c.json({ error: 'Booking not found' }, 404);

  const updates: Record<string, unknown> = {};
  if (body.customerName !== undefined) updates.customerName = body.customerName;
  if (body.status !== undefined) updates.status = body.status;
  if (body.startTime !== undefined) updates.startTime = new Date(body.startTime).getTime();
  if (body.endTime !== undefined) updates.endTime = new Date(body.endTime).getTime();

  if (body.startTime !== undefined || body.endTime !== undefined) {
    const s = updates.startTime ? Number(updates.startTime) : existing[0].startTime;
    const e = updates.endTime ? Number(updates.endTime) : existing[0].endTime;
    const overlap = await db.select().from(bookings).where(and(
      eq(bookings.roomId, existing[0].roomId),
      eq(bookings.tenantId, tenantId),
      eq(bookings.status, 'confirmed'),
      lt(bookings.startTime, e),
      gt(bookings.endTime, s)
    ));
    const others = overlap.filter(b => b.id !== bookingId);
    if (others.length > 0) return c.json({ error: 'Booking conflict', conflicts: others }, 409);
  }

  const [updated] = await db.update(bookings).set(updates)
    .where(eq(bookings.id, bookingId)).returning();
  return c.json({ success: true, data: updated });
});

// DELETE /api/tenants/:tenantSlug/bookings/:bookingId
router.delete('/:bookingId{id}', async (c) => {
  const tenantId = c.get('tenantId');
  const bookingId = parseInt(c.req.param('bookingId'));
  const existing = await db.select().from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.tenantId, tenantId)));
  if (existing.length === 0) return c.json({ error: 'Booking not found' }, 404);
  await db.delete(bookings).where(eq(bookings.id, bookingId));
  return c.json({ success: true, message: 'Booking deleted' });
});

export default router;
