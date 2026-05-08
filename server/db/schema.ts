// ── Database Schema Definition ─────────────────────────────────────────────
// All table definitions live in this file.
// Schema changes should be pushed with:
//   bun run db:push
//
// The schema is the single source of truth — all DDL operations should match this.
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// ── Role Enum Type ─────────────────────────────────────────────────────────
export type UserRole = 'superadmin' | 'admin' | 'manager' | 'user';

// ── Better-Auth Tables ─────────────────────────────────────────────────────
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

// Tenants
export const tenants = sqliteTable('tenants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  ownerId: text('owner_id'), // admin who created this tenant
  settings: text('settings', { mode: 'json' }),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
});

// User Profiles (extends better-auth user with RBAC data)
export const userProfiles = sqliteTable('user_profiles', {
  userId: text('user_id').primaryKey(), // matches better-auth user id
  role: text('role', { enum: ['superadmin', 'admin', 'manager', 'user'] }).notNull().default('user'),
  tenantId: integer('tenant_id').references(() => tenants.id),
  createdById: text('created_by_id'),
  createdAt: integer('created_at'),
});

// Rooms
export const rooms = sqliteTable('rooms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull(),
  pricePerHour: real('price_per_hour').notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull(),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
});

// Bookings
export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomId: integer('room_id').notNull().references(() => rooms.id),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  startTime: integer('start_time').notNull(),
  endTime: integer('end_time').notNull(),
  customerName: text('customer_name').notNull(),
  status: text('status').notNull(),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
});
