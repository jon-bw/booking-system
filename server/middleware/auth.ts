import { createMiddleware } from 'hono/factory';
import { eq, and } from 'drizzle-orm';
import { auth } from '../auth.js';
import { db } from '../db/index.js';
import { userProfiles, tenants } from '../db/schema.js';
import type { UserRole } from '../db/schema.js';

declare module 'hono' {
  interface ContextVariableMap {
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      image?: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    profile: {
      userId: string;
      role: UserRole;
      tenantId: number | null;
      createdById: string | null;
      createdAt: number | null;
    };
    tenantId: number;
    tenant: typeof tenants.$inferSelect;
  }
}

/**
 * Validates the better-auth session and attaches user + profile to context.
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session || !session.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const profileResult = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1);

  const profile = profileResult[0] ?? {
    userId: session.user.id,
    role: 'user' as UserRole,
    tenantId: null,
    createdById: null,
    createdAt: null,
  };

  c.set('user', session.user);
  c.set('profile', profile);

  await next();
});

/**
 * Require one of the specified roles.
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return createMiddleware(async (c, next) => {
    const profile = c.get('profile');
    if (!allowedRoles.includes(profile.role)) {
      return c.json({ error: 'Forbidden: insufficient role' }, 403);
    }
    await next();
  });
};

/**
 * Ensure the user can access the resolved tenant.
 * - superadmin: all tenants
 * - admin: only tenants they own
 * - manager/user: only their assigned tenant
 */
export const requireTenantAccess = createMiddleware(async (c, next) => {
  const profile = c.get('profile');
  const tenantId = c.get('tenantId');

  if (profile.role === 'superadmin') {
    return next();
  }

  if (profile.role === 'admin') {
    const tenant = await db
      .select()
      .from(tenants)
      .where(and(eq(tenants.id, tenantId), eq(tenants.ownerId, profile.userId)))
      .limit(1);
    if (tenant.length === 0) {
      return c.json({ error: 'Forbidden: you do not own this tenant' }, 403);
    }
    return next();
  }

  // manager / user
  if (profile.tenantId !== tenantId) {
    return c.json({ error: 'Forbidden: not a member of this tenant' }, 403);
  }

  await next();
});
