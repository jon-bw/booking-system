// ── Database Schema Definition ─────────────────────────────────────────────
// All table definitions live in this file.
// Schema changes should be pushed with:
//   bun run db:push
//
// The schema is the single source of truth — all DDL operations should match this.
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Tenants
export const tenants = sqliteTable('tenants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  settings: text('settings', { mode: 'json' }),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
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
