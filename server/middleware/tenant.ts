import { createMiddleware } from 'hono/factory';
import { db } from '../db/index.js';
import { tenants } from '../db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Tenant resolution middleware.
 * Extracts :tenantSlug from the URL, resolves to tenant_id,
 * and attaches tenantId + tenant object to Hono context.
 */
export const tenantMiddleware = createMiddleware(async (c, next) => {
  const tenantSlug = c.req.param('tenantSlug');

  if (!tenantSlug) {
    return c.json({ error: 'Tenant slug is required' }, 400);
  }

  const result = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, tenantSlug))
    .limit(1);

  if (result.length === 0) {
    return c.json({ error: `Tenant "${tenantSlug}" not found` }, 404);
  }

  c.set('tenantId', result[0].id);
  c.set('tenant', result[0]);

  await next();
});
