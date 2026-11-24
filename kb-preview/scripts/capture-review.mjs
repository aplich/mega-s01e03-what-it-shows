import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { deskRef } from '../src/lib/kb/desk-ref.ts';

const base = 'http://127.0.0.1:4173';
const path = '/kb/incidents/4471-review/';
const output = new URL('../artifacts/review/', import.meta.url);
const source = await readFile(new URL('../overlays/src/routes/kb/incidents/4471-review/+page.svx', import.meta.url), 'utf8');
const signature = source.match(/^signature: (.+)$/m)[1];
assert.match(signature, /^v1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/, 'Use the course-issued signature, not an author display name; the course validates its authenticity.');
const links = JSON.parse(await readFile(new URL('../overlays/src/lib/data/review-links.json', import.meta.url), 'utf8'));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = { capturedAt: new Date().toISOString(), browser: browser.version(), path, viewports: {} };

try {
  for (const [name, viewport] of [
    ['desktop', { width: 1280, height: 1000 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({ viewport, colorScheme: 'light', locale: 'en-GB', timezoneId: 'UTC' });
    const errors = [];
    await context.route('**/*', (route) => {
      if (new URL(route.request().url()).origin !== base) {
        errors.push(`Blocked non-local request: ${route.request().url()}`);
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
    });
    assert.equal((await page.goto(`${base}${path}`, { waitUntil: 'networkidle' })).status(), 200);
    const text = await page.locator('body').innerText();
    assert.equal(await page.locator('.status').innerText(), 'draft');
    assert.equal(await page.locator('.review-counts tbody tr').count(), 2);
    assert.equal(await page.locator('[data-cause="parser"] td').nth(1).innerText(), '379');
    assert.equal(await page.locator('[data-cause="hint"] td').nth(1).innerText(), '33');
    assert.match(await page.locator('.report-count').innerText(), /427.*412[\s\S]*15/);
    assert.equal(await page.locator('.flagged-reports > li').count(), 5);
    assert.equal(await page.locator('.stamp b').innerText(), deskRef(signature));
    assert.equal(await page.locator('.stamp.missing').count(), 0);
    assert.equal(await page.locator('.review-counts a').count(), 2);
    for (const cause of ['parser', 'hint']) {
      const link = page.locator(`[data-cause="${cause}"] a`);
      assert.match(links[cause], /^https:\/\/github\.com\/aplich\/mega-s01e03-what-it-shows\/issues\/[1-9]\d*$/);
      assert.equal(await link.getAttribute('href'), links[cause]);
    }
    assert.doesNotMatch(text, /have not been published|Draft only — not published/);
    assert.match(text, /not a live support-system view/);
    assert.match(text, /Proposed process change, not an accepted desk decision/);
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(pageWidth <= viewport.width, `${name}: no whole-page horizontal overflow`);
    assert.deepEqual(errors, []);

    await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, output)), fullPage: true });
    if (name === 'desktop') {
      await page.screenshot({ path: fileURLToPath(new URL('desktop-first-screen.png', output)) });
      await writeFile(new URL('page.html', output), await page.content());
      await writeFile(new URL('page.txt', output), text + '\n');
      await page.pdf({ path: fileURLToPath(new URL('page.pdf', output)), format: 'A4', printBackground: true });
    }
    results.viewports[name] = { viewport, pageWidth, errors, deskRef: deskRef(signature) };
    await context.close();
  }
  await writeFile(new URL('checks.json', output), JSON.stringify(results, null, 2) + '\n');
  console.log('Draft review: desktop and mobile checked; counts, uncertainty notes and computed signature verified.');
  console.log(`Local screenshots, PDF, HTML and checks: ${fileURLToPath(output)}`);
} finally {
  await browser.close();
}
