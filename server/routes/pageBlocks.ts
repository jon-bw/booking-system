import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { eq, and, asc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { pageBlocks } from '../db/schema.js';
import { authMiddleware, requireRole, requireTenantAccess } from '../middleware/auth.js';

const router = new Hono();

const validBlockTypes = [
  'hero', 'room_list', 'about', 'gallery', 'contact',
  'cta', 'booking_form', 'testimonials', 'rich_text'
] as const;

const createBlockSchema = z.object({
  blockType: z.enum(validBlockTypes),
  config: z.record(z.unknown()).optional(),
  sortOrder: z.number().optional(),
  isVisible: z.boolean().optional(),
});

const updateBlockSchema = z.object({
  blockType: z.enum(validBlockTypes).optional(),
  config: z.record(z.unknown()).optional(),
  sortOrder: z.number().optional(),
  isVisible: z.boolean().optional(),
});

const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.number(),
    sortOrder: z.number(),
  })),
});

// GET /api/tenants/:tenantSlug/page-blocks — list blocks (manager+)
router.get('/', authMiddleware, requireRole('manager', 'admin', 'superadmin'), requireTenantAccess, async (c) => {
  const tenantId = c.get('tenantId');
  const blocks = await db
    .select()
    .from(pageBlocks)
    .where(eq(pageBlocks.tenantId, tenantId))
    .orderBy(asc(pageBlocks.sortOrder));
  return c.json({ success: true, data: blocks });
});

// POST /api/tenants/:tenantSlug/page-blocks — create block (manager+)
router.post(
  '/',
  authMiddleware,
  requireRole('manager', 'admin', 'superadmin'),
  requireTenantAccess,
  zValidator('json', createBlockSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const body = await c.req.valid('json');

    // Auto-set sortOrder if not provided
    const existing = await db.select({ sortOrder: pageBlocks.sortOrder })
      .from(pageBlocks)
      .where(eq(pageBlocks.tenantId, tenantId))
      .orderBy(sql`${pageBlocks.sortOrder} DESC`)
      .limit(1);
    const sortOrder = body.sortOrder ?? (existing.length > 0 ? existing[0].sortOrder + 1 : 0);

    const now = Date.now();
    const [created] = await db.insert(pageBlocks).values({
      tenantId,
      blockType: body.blockType,
      config: body.config || {},
      sortOrder,
      isVisible: body.isVisible ?? true,
      createdAt: now,
    }).returning();
    return c.json({ success: true, data: created }, 201);
  }
);

// PATCH /api/tenants/:tenantSlug/page-blocks/reorder — reorder blocks (manager+)
// IMPORTANT: Must come before /:id to avoid "reorder" being captured as :id param
router.patch(
  '/reorder',
  authMiddleware,
  requireRole('manager', 'admin', 'superadmin'),
  requireTenantAccess,
  zValidator('json', reorderSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const { items } = await c.req.valid('json');

    for (const item of items) {
      await db.update(pageBlocks)
        .set({ sortOrder: item.sortOrder })
        .where(and(eq(pageBlocks.id, item.id), eq(pageBlocks.tenantId, tenantId)));
    }

    const blocks = await db.select()
      .from(pageBlocks)
      .where(eq(pageBlocks.tenantId, tenantId))
      .orderBy(asc(pageBlocks.sortOrder));
    return c.json({ success: true, data: blocks });
  }
);

// PATCH /api/tenants/:tenantSlug/page-blocks/:id — update block (manager+)
router.patch(
  '/:id',
  authMiddleware,
  requireRole('manager', 'admin', 'superadmin'),
  requireTenantAccess,
  zValidator('json', updateBlockSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const blockId = parseInt(c.req.param('id'));
    const body = await c.req.valid('json');

    const existing = await db.select()
      .from(pageBlocks)
      .where(and(eq(pageBlocks.id, blockId), eq(pageBlocks.tenantId, tenantId)));
    if (existing.length === 0) return c.json({ error: 'Block not found' }, 404);

    const updates: Record<string, unknown> = {};
    if (body.blockType !== undefined) updates.blockType = body.blockType;
    if (body.config !== undefined) updates.config = body.config;
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;
    if (body.isVisible !== undefined) updates.isVisible = body.isVisible;

    const [updated] = await db.update(pageBlocks)
      .set(updates)
      .where(eq(pageBlocks.id, blockId))
      .returning();
    return c.json({ success: true, data: updated });
  }
);

// DELETE /api/tenants/:tenantSlug/page-blocks/:id — delete block (manager+)
router.delete(
  '/:id',
  authMiddleware,
  requireRole('manager', 'admin', 'superadmin'),
  requireTenantAccess,
  async (c) => {
    const tenantId = c.get('tenantId');
    const blockId = parseInt(c.req.param('id'));

    const existing = await db.select()
      .from(pageBlocks)
      .where(and(eq(pageBlocks.id, blockId), eq(pageBlocks.tenantId, tenantId)));
    if (existing.length === 0) return c.json({ error: 'Block not found' }, 404);

    await db.delete(pageBlocks).where(eq(pageBlocks.id, blockId));
    return c.json({ success: true, message: 'Block deleted' });
  }
);

export default router;
