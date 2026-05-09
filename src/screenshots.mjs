
import { chromium } from 'playwright';
import process from 'process';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const dir = process.argv[2];

  // Capture console
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('ERR:', err.message));
  
  // 1. HOME - wait for data
  await page.goto('http://localhost:3002/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  
  // Check if API data loaded
  const body = await page.evaluate(() => document.body.innerHTML);
  console.log('Home body contains tenants:', body.includes('Party Palace') || body.includes('Neon Lounge'));
  
  await page.screenshot({ path: dir + '/home-tenants.png', fullPage: true });
  console.log('📸 Home captured');

  // 2. BROWSE
  await page.goto('http://localhost:3002/party-palace', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  
  const body2 = await page.evaluate(() => document.body.innerHTML);
  console.log('Browse body contains Main Hall:', body2.includes('Main Hall') || body2.includes('VIP') || body2.includes('No rooms'));
  
  await page.screenshot({ path: dir + '/browse-rooms.png', fullPage: true });
  console.log('📸 Browse captured');

  // Click first room
  const firstRoom = await page.$('a.group');
  if (firstRoom) {
    await firstRoom.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: dir + '/room-detail.png', fullPage: true });
    console.log('📸 Room detail captured');
  }

  // 3. ADMIN
  await page.goto('http://localhost:3002/admin/party-palace', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  
  const body3 = await page.evaluate(() => document.body.innerHTML);
  console.log('Admin contains rooms:', body3.includes('room') || body3.includes('Room'));
  
  await page.screenshot({ path: dir + '/admin-dashboard.png', fullPage: true });
  console.log('📸 Admin captured');

  await browser.close();
  console.log('✅ All done');
})();
