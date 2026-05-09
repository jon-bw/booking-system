// ── Seeding Script ──────────────────────────────────────────────────────────
// Run after pushing schema with: bun run db:push
// Usage: bun run db:seed
//
// Note: This script inserts seed data only. Schema must be
// created beforehand via `drizzle-kit push` or similar migration tools.

import { db } from './db/index';
import { tenants, rooms, bookings, userProfiles, pageBlocks } from './db/schema';
import { auth } from './auth';
import { eq } from 'drizzle-orm';

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
console.log('✅ 10 bookings created');

// Create initial superadmin
const superadminEmail = 'superadmin@example.com';
const superadminPassword = 'superadmin123';

try {
  const result: any = await auth.api.signUpEmail({
    body: { email: superadminEmail, password: superadminPassword, name: 'Superadmin' },
  });
  const userId = result?.user?.id ?? result?.id;
  if (userId) {
    await db.update(userProfiles)
      .set({ role: 'superadmin' })
      .where(eq(userProfiles.userId, userId));
    console.log('✅ Superadmin created:', superadminEmail);
  }
} catch (err: any) {
  if (err.message?.includes('already exists')) {
    console.log('ℹ️  Superadmin already exists');
  } else {
    console.error('❌ Failed to create superadmin:', err.message);
  }
}

// Create an admin account for each tenant
const tenantAdmins = [
  { tenant: partyPalace, email: 'admin@partypalace.com', password: 'admin123', name: 'Party Palace Admin' },
  { tenant: zenSpace, email: 'admin@zenspace.com', password: 'admin123', name: 'Zen Space Admin' },
  { tenant: neonLounge, email: 'admin@neonlounge.com', password: 'admin123', name: 'Neon Lounge Admin' },
];

for (const { tenant, email, password, name } of tenantAdmins) {
  try {
    const result: any = await auth.api.signUpEmail({
      body: { email, password, name },
    });
    const userId = result?.user?.id ?? result?.id;
    if (userId) {
      await db.update(userProfiles)
        .set({ role: 'admin', tenantId: tenant.id })
        .where(eq(userProfiles.userId, userId));
      await db.update(tenants)
        .set({ ownerId: userId })
        .where(eq(tenants.id, tenant.id));
      console.log(`✅ Admin created for ${tenant.name}:`, email);
    }
  } catch (err: any) {
    if (err.message?.includes('already exists')) {
      console.log(`ℹ️  Admin for ${tenant.name} already exists`);
    } else {
      console.error(`❌ Failed to create admin for ${tenant.name}:`, err.message);
    }
  }
}

// ── Page Blocks (sample blocks for each tenant) ─────────────────────────────
const blockTs = Date.now();

// Party Palace: hero + room_list + contact
await db.insert(pageBlocks).values([
  { tenantId: partyPalace.id, blockType: 'hero', config: { title: 'Party Palace', subtitle: 'The ultimate celebration venue for every occasion', ctaText: 'Browse Rooms', ctaLink: `/${partyPalace.slug}` }, sortOrder: 0, isVisible: true, createdAt: blockTs },
  { tenantId: partyPalace.id, blockType: 'room_list', config: { title: 'Our Spaces', showPrices: true, showCapacity: true }, sortOrder: 1, isVisible: true, createdAt: blockTs },
  { tenantId: partyPalace.id, blockType: 'contact', config: { title: 'Contact Us', email: 'hello@partypalace.com', phone: '+1 555-0100', address: '123 Celebration Ave, New York, NY' }, sortOrder: 2, isVisible: true, createdAt: blockTs },
]);

// Zen Space: hero + room_list + contact
await db.insert(pageBlocks).values([
  { tenantId: zenSpace.id, blockType: 'hero', config: { title: 'Zen Space', subtitle: 'Find your calm in our curated wellness studios', ctaText: 'Explore Rooms', ctaLink: `/${zenSpace.slug}` }, sortOrder: 0, isVisible: true, createdAt: blockTs },
  { tenantId: zenSpace.id, blockType: 'room_list', config: { title: 'Our Studios', showPrices: true, showCapacity: true }, sortOrder: 1, isVisible: true, createdAt: blockTs },
  { tenantId: zenSpace.id, blockType: 'contact', config: { title: 'Reach Out', email: 'info@zenspace.com', phone: '+1 555-0200', address: '456 Mindful Lane, Los Angeles, CA' }, sortOrder: 2, isVisible: true, createdAt: blockTs },
]);

// Neon Lounge: hero + room_list + contact
await db.insert(pageBlocks).values([
  { tenantId: neonLounge.id, blockType: 'hero', config: { title: 'Neon Lounge', subtitle: 'Where the night comes alive', ctaText: 'See Our Spaces', ctaLink: `/${neonLounge.slug}` }, sortOrder: 0, isVisible: true, createdAt: blockTs },
  { tenantId: neonLounge.id, blockType: 'room_list', config: { title: 'Venues', showPrices: true, showCapacity: true }, sortOrder: 1, isVisible: true, createdAt: blockTs },
  { tenantId: neonLounge.id, blockType: 'contact', config: { title: 'Get in Touch', email: 'vibes@neonlounge.com', phone: '+1 555-0300', address: '789 Electric Blvd, Chicago, IL' }, sortOrder: 2, isVisible: true, createdAt: blockTs },
]);

console.log('✅ 9 page blocks created (3 per tenant)');

const t = await db.select().from(tenants);
const r = await db.select().from(rooms);
const b = await db.select().from(bookings);
const pb = await db.select().from(pageBlocks);
console.log(`┌──────────┬────────────────────────────┐`);
console.log(`│ tenants  │ ${String(t.length).padEnd(26)} │`);
console.log(`│ rooms    │ ${String(r.length).padEnd(26)} │`);
console.log(`│ bookings │ ${String(b.length).padEnd(26)} │`);
console.log(`│ page_blk │ ${String(pb.length).padEnd(26)} │`);
console.log(`└──────────┴────────────────────────────┘`);
console.log('\nSeeding complete! 🎉');
