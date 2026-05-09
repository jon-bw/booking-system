import { Hono } from 'hono';
import { eq, and, inArray } from 'drizzle-orm';
import { auth } from '../auth.js';
import { db } from '../db/index.js';
import { userProfiles, tenants, user } from '../db/schema.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import type { UserRole } from '../db/schema.js';

const router = new Hono();

// GET /api/users/me — current user + profile
router.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  const profile = c.get('profile');
  return c.json({ success: true, data: { user, profile } });
});

// GET /api/users — list users (scoped by role)
router.get('/', authMiddleware, requireRole('superadmin', 'admin'), async (c) => {
  const profile = c.get('profile');

  if (profile.role === 'superadmin') {
    const data = await db
      .select({
        userId: userProfiles.userId,
        role: userProfiles.role,
        tenantId: userProfiles.tenantId,
        createdById: userProfiles.createdById,
        name: user.name,
        email: user.email,
      })
      .from(userProfiles)
      .innerJoin(user, eq(userProfiles.userId, user.id));
    return c.json({ success: true, data });
  }

  // admin: show users in owned tenants + themselves
  const ownedTenants = await db
    .select()
    .from(tenants)
    .where(eq(tenants.ownerId, profile.userId));

  const tenantIds = ownedTenants.map((t) => t.id);

  if (tenantIds.length === 0) {
    return c.json({ success: true, data: [] });
  }

  const data = await db
    .select({
      userId: userProfiles.userId,
      role: userProfiles.role,
      tenantId: userProfiles.tenantId,
      createdById: userProfiles.createdById,
      name: user.name,
      email: user.email,
    })
    .from(userProfiles)
    .innerJoin(user, eq(userProfiles.userId, user.id))
    .where(inArray(userProfiles.tenantId, tenantIds));

  return c.json({ success: true, data });
});

// POST /api/users — create a new user (superadmin or admin only)
router.post('/', authMiddleware, requireRole('superadmin', 'admin'), async (c) => {
  const creatorProfile = c.get('profile');
  const body = await c.req.json();
  const { email, password, role, tenantId, name } = body;

  if (!email || !password || !role) {
    return c.json({ error: 'email, password, and role are required' }, 400);
  }

  // Role hierarchy enforcement
  if (creatorProfile.role === 'admin') {
    if (role === 'admin' || role === 'superadmin') {
      return c.json({ error: 'Admins can only create manager or user roles' }, 403);
    }
    if (tenantId) {
      const owned = await db
        .select()
        .from(tenants)
        .where(and(eq(tenants.id, tenantId), eq(tenants.ownerId, creatorProfile.userId)))
        .limit(1);
      if (owned.length === 0) {
        return c.json({ error: 'You do not own this tenant' }, 403);
      }
    }
  }

  if (creatorProfile.role === 'superadmin' && role === 'superadmin') {
    return c.json({ error: 'Cannot create additional superadmins' }, 403);
  }

  try {
    const result: any = await auth.api.signUpEmail({
      body: { email, password, name: name || email.split('@')[0] },
    });

    const userId = result?.user?.id ?? result?.id;
    if (!userId) {
      return c.json({ error: 'User creation failed' }, 500);
    }

    await db
      .update(userProfiles)
      .set({
        role: role as UserRole,
        tenantId: tenantId || null,
        createdById: creatorProfile.userId,
      })
      .where(eq(userProfiles.userId, userId));

    return c.json({ success: true, data: { id: userId, email, role } }, 201);
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to create user' }, 400);
  }
});

export default router;
