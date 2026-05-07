// ── Seeding Script ──────────────────────────────────────────────────────────
// Run after pushing schema with: bun run db:push
// Usage: bun run seed
//
// Note: This script inserts seed data only. Schema must be
// created beforehand via `drizzle-kit push` or similar migration tools.
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { resolve } from 'path';
import * as schema from './schema.js';

const dbPath = resolve(import.meta.dir, '..', 'data.sqlite');
const sqlite = new Database(dbPath);
sqlite.run('PRAGMA journal_mode=WAL;');
sqlite.run('PRAGMA foreign_keys=ON;');
const db = drizzle(sqlite, { schema });

import { tenants, rooms, bookings } from './schema.js';

console.log('Inserting seed data...\n');

const ts = Date.now();

// Tenants
const [partyPalace] = await db.insert(tenants).values({
  name: 'Party Palace', slug: 'party-palace',
  settings: { currency: 'USD', timezone: 'America/New_York', theme_color: '#D71921' },
  createdAt: ts, updatedAt: ts,
}).returning();
const [zenSpace] = await db.insert(tenants).values({
  name: 'Zen Space', slug: 'zen-space',
  settings: { currency: 'USD', timezone: 'America/Los_Angeles', theme_color: '#4A9E5C' },
  createdAt: ts, updatedAt: ts,
}).returning();
const [neonLounge] = await db.insert(tenants).values({
  name: 'Neon Lounge', slug: 'neon-lounge',
  settings: { currency: 'USD', timezone: 'America/Chicago', theme_color: '#5B9BF6' },
  createdAt: ts, updatedAt: ts,
}).returning();
console.log('✅ 3 tenants created');

// Rooms
const [pp1] = await db.insert(rooms).values({ tenantId: partyPalace.id, name: 'Main Hall', capacity: 80, pricePerHour: 150, isDeleted: false, createdAt: ts, updatedAt: ts }).returning();
const [pp2] = await db.insert(rooms).values({ tenantId: partyPalace.id, name: 'VIP Room', capacity: 20, pricePerHour: 75, isDeleted: false, createdAt: ts, updatedAt: ts }).returning();
const [pp3] = await db.insert(rooms).values({ tenantId: partyPalace.id, name: 'Garden Terrace', capacity: 40, pricePerHour: 100, isDeleted: false, createdAt: ts, updatedAt: ts }).returning();
const [zs1] = await db.insert(rooms).values({ tenantId: zenSpace.id, name: 'Meditation Studio', capacity: 15, pricePerHour: 50, isDeleted: false, createdAt: ts, updatedAt: ts }).returning();
const [zs2] = await db.insert(rooms).values({ tenantId: zenSpace.id, name: 'Yoga Loft', capacity: 25, pricePerHour: 65, isDeleted: false, createdAt: ts, updatedAt: ts }).returning();
const [nl1] = await db.insert(rooms).values({ tenantId: neonLounge.id, name: 'Karaoke Suite', capacity: 12, pricePerHour: 60, isDeleted: false, createdAt: ts, updatedAt: ts }).returning();
const [nl2] = await db.insert(rooms).values({ tenantId: neonLounge.id, name: 'Dance Floor', capacity: 100, pricePerHour: 200, isDeleted: false, createdAt: ts, updatedAt: ts }).returning();
console.log('✅ 7 rooms created');

// Bookings
const now = Date.now();
const hrMs = 3600000;
await db.insert(bookings).values([
  { roomId: pp1.id, tenantId: partyPalace.id, startTime: now + 2*hrMs, endTime: now + 4*hrMs, customerName: 'Alice Chen', status: 'confirmed', createdAt: ts, updatedAt: ts },
  { roomId: pp1.id, tenantId: partyPalace.id, startTime: now + 26*hrMs, endTime: now + 29*hrMs, customerName: 'Bob Martinez', status: 'confirmed', createdAt: ts, updatedAt: ts },
  { roomId: pp2.id, tenantId: partyPalace.id, startTime: now + 3*hrMs, endTime: now + 5*hrMs, customerName: 'Carol White', status: 'pending', createdAt: ts, updatedAt: ts },
  { roomId: pp3.id, tenantId: partyPalace.id, startTime: now + 10*hrMs, endTime: now + 13*hrMs, customerName: 'Dave Kim', status: 'confirmed', createdAt: ts, updatedAt: ts },
  { roomId: zs1.id, tenantId: zenSpace.id, startTime: now + 1*hrMs, endTime: now + 2*hrMs, customerName: 'Eve Johnson', status: 'confirmed', createdAt: ts, updatedAt: ts },
  { roomId: zs1.id, tenantId: zenSpace.id, startTime: now + 5*hrMs, endTime: now + 7*hrMs, customerName: 'Frank Lee', status: 'pending', createdAt: ts, updatedAt: ts },
  { roomId: zs2.id, tenantId: zenSpace.id, startTime: now + 3*hrMs, endTime: now + 5*hrMs, customerName: 'Grace Park', status: 'confirmed', createdAt: ts, updatedAt: ts },
  { roomId: nl1.id, tenantId: neonLounge.id, startTime: now + 20*hrMs, endTime: now + 23*hrMs, customerName: 'Henry Zhang', status: 'confirmed', createdAt: ts, updatedAt: ts },
  { roomId: nl1.id, tenantId: neonLounge.id, startTime: now + 44*hrMs, endTime: now + 47*hrMs, customerName: 'Ivy Wu', status: 'pending', createdAt: ts, updatedAt: ts },
  { roomId: nl2.id, tenantId: neonLounge.id, startTime: now + 18*hrMs, endTime: now + 22*hrMs, customerName: 'Jack Liu', status: 'confirmed', createdAt: ts, updatedAt: ts },
]);
console.log('✅ 10 bookings created\n');

const t = await db.select().from(tenants);
const r = await db.select().from(rooms);
const b = await db.select().from(bookings);
console.log(`┌──────────┬────────────────────────────┐`);
console.log(`│ tenants  │ ${String(t.length).padEnd(26)} │`);
console.log(`│ rooms    │ ${String(r.length).padEnd(26)} │`);
console.log(`│ bookings │ ${String(b.length).padEnd(26)} │`);
console.log(`└──────────┴────────────────────────────┘`);
console.log('\nSeeding complete! 🎉');

sqlite.close();
