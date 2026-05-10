import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tenants } from '../db/schema.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = new Hono();

const themeSchema = z.object({
  colors: z.object({
    background: z.string().optional().default('#0a0a0a'),
    surface: z.string().optional().default('#111111'),
    text: z.string().optional().default('#E8E8E8'),
    textMuted: z.string().optional().default('#6b7280'),
    border: z.string().optional().default('#333333'),
    accent: z.string().optional().default('#5B9BF6'),
    accentHover: z.string().optional(),
    destructive: z.string().optional().default('#D71921'),
  }).optional(),
  fonts: z.object({
    display: z.string().optional().default('Doto, sans-serif'),
    body: z.string().optional().default('Space Grotesk, sans-serif'),
    mono: z.string().optional().default('Space Mono, monospace'),
  }).optional(),
  buttonStyle: z.enum(['pill', 'rounded', 'sharp']).optional().default('pill'),
  borderRadius: z.string().optional().default('999px'),
  mode: z.enum(['dark', 'light']).optional().default('dark'),
}).optional();

// GET /api/tenants/:tenantSlug/theme — public
router.get('/', async (c) => {
  const tenantSlug = c.req.param('tenantSlug');
  const tenant = await db.select({ theme: tenants.theme })
    .from(tenants)
    .where(eq(tenants.slug, tenantSlug))
    .limit(1);
  if (tenant.length === 0) return c.json({ error: 'Tenant not found' }, 404);
  const theme = tenant[0].theme || {};
  return c.json({ success: true, data: theme });
});

// PUT /api/tenants/:tenantSlug/theme — admin only
router.put(
  '/',
  authMiddleware,
  requireRole('manager', 'admin', 'superadmin'),
  zValidator('json', themeSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const body = await c.req.valid('json') || {};

    const existing = await db.select({ theme: tenants.theme })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);
    if (existing.length === 0) return c.json({ error: 'Tenant not found' }, 404);

    const currentTheme = (existing[0].theme || {}) as Record<string, unknown>;
    const newTheme = { ...currentTheme, ...body };

    const [updated] = await db.update(tenants)
      .set({ theme: newTheme, updatedAt: Date.now() })
      .where(eq(tenants.id, tenantId))
      .returning({ theme: tenants.theme });

    return c.json({ success: true, data: updated.theme || {} });
  }
);

export default router;
