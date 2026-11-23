import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:4173';
const output = new URL('../artifacts/original/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1000 },
    colorScheme: 'light',
    locale: 'en-GB',
    timezoneId: 'UTC',
  });
  const errors = [];
  const requests = [];
  await context.route('**/*', async (route) => {
    if (new URL(route.request().url()).origin !== base) {
      errors.push(`Blocked non-local request: ${route.request().url()}`);
      return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', (response) => {
    requests.push({ url: response.url(), status: response.status() });
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  });

  const results = {
    capturedAt: new Date().toISOString(),
    browser: browser.version(),
    base,
    pages: {},
  };

  for (const [name, path] of [
    ['index', '/kb/'],
    ['triage', '/kb/triage/dedupe/'],
    ['decision-0001', '/kb/decisions/0001-dedupe-by-subject/'],
    ['incident-4471', '/kb/incidents/4471/'],
  ]) {
    const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, path);
    await page.locator('h1').waitFor();
    const text = await page.locator('body').innerText();
    results.pages[name] = {
      path,
      title: await page.title(),
      text,
      tables: await page.locator('table').allTextContents(),
      staleBanner: await page.locator('.banner').count(),
    };
    await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, output)), fullPage: true });
    await writeFile(new URL(`${name}.html`, output), await page.content());
    await writeFile(new URL(`${name}.txt`, output), text + '\n');

    if (name === 'index') {
      // Authored overlays add rows without changing the original index component.
      for (const href of ['/kb/triage/dedupe', '/kb/incidents/4471', '/kb/decisions/0001-dedupe-by-subject']) {
        assert.equal(await page.locator(`table a[href="${href}"]`).count(), 1);
      }
    }
    if (name === 'triage') {
      assert.equal(await page.locator('.banner').count(), 1);
      assert.match(text, /subject line matches/);
      assert.match(await page.locator('.verdict').innerText(), /different causes/);
      results.dedupeRows = await page.locator('table tbody tr').allTextContents();
      const tenants = page.getByRole('combobox', { name: 'tenant', exact: true });
      const channels = page.getByRole('combobox', { name: 'channel', exact: true });
      await tenants.nth(1).selectOption('alder.physio');
      await channels.nth(1).selectOption('form');
      await page.waitForFunction(() => document.querySelector('.verdict')?.textContent.includes('same cause'));
      assert.match(await page.locator('.verdict').innerText(), /same cause — merge/);
      await channels.nth(1).selectOption('app');
      await page.waitForFunction(() => document.querySelector('.verdict')?.textContent.includes('different causes'));
      results.interactiveCheck = 'Same tenant/form merges; switching only form to app keeps causes apart.';
    }
    if (name === 'incident-4471') {
      assert.equal(await page.locator('.banner').count(), 0);
      assert.match(await page.locator('.sum').innerText(), /412 reports merged into #4471 ·\s*2\s*causes/);
      const rows = await page.locator('table tbody tr').allTextContents();
      assert.equal(rows.length, 2);
      assert.match(rows[0], /parser\s*379/);
      assert.match(rows[1], /hint\s*33/);
      assert.match(rows[1], /not this ticket — no ticket of its own/);
      assert.match(text, /5 reports read as a one-day move/);
      assert.match(text, /One issue, one fix queued/);
      assert.equal(await page.locator('figure svg rect').count(), 54);
      results.causeRows = rows;
    }
  }

  assert.deepEqual(errors, [], 'Browser/network errors must be resolved, not hidden');
  results.requests = requests;
  results.errors = errors;
  await writeFile(new URL('checks.json', output), JSON.stringify(results, null, 2) + '\n');
  console.log(`Captured and checked four original pages with Chromium ${browser.version()}.`);
  console.log('Original rendered table:', results.causeRows);
  console.log('Interactive dedupe: passed. Staleness banners: passed. Browser errors: 0.');
  console.log(`Local artifacts: ${fileURLToPath(output)}`);
} finally {
  await browser.close();
}
