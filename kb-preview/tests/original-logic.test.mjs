import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import {
  causeOf, dayFirst, groupByCause, readAs, sameCause, ticketCause, uniqueById,
} from '../src/lib/kb/causes.ts';
import { DEDUPE_CASES } from '../src/lib/kb/dedupe-cases.ts';
import { daysSince, STALE_AFTER_DAYS } from '../src/lib/kb/staleness.ts';
import { deskRef } from '../src/lib/kb/desk-ref.ts';

const data = new URL('../src/lib/data/', import.meta.url);
const json = (relative) => JSON.parse(readFileSync(new URL(relative, data), 'utf8'));
const raw = json('reports-4471.json');
const reports = uniqueById(raw).filter((r) => r.mergedInto === 4471);
const notes = json('desk-notes.json');
const tenants = readdirSync(new URL('tenants/', data)).map((name) => json(`tenants/${name}`));
const tenantOf = (r) => tenants.find((t) => t.handle === r.tenant);
const groups = groupByCause(reports, tenantOf);

test('original uniqueById counts report IDs rather than rows or bodies', () => {
  assert.equal(raw.length, 427);
  assert.equal(reports.length, 412);
  const lastById = new Map(reports.map((r) => [r.id, r]));
  for (const row of raw) assert.deepEqual(row, lastById.get(row.id));
  assert.equal(uniqueById([{ id: 'a', value: 1 }, { id: 'a', value: 2 }])[0].value, 2);
});

test('original Intl-based locale rule evaluates all 11 tenants as day-first', () => {
  assert.equal(tenants.length, 11);
  for (const t of tenants) assert.equal(dayFirst(t.locale), true, t.handle);
  assert.equal(dayFirst('en-US'), false);
  assert.equal(causeOf({ channel: 'app' }, { locale: 'en-US', form: 'booking-v2' }), null);
  assert.equal(causeOf({ channel: 'app' }, undefined), null);
});

test('original groupByCause yields 379 parser and 33 hint assignments', () => {
  assert.deepEqual(groups.map((g) => [g.cause, g.reports.length, g.tenants]), [
    ['parser', 379, 11], ['hint', 33, 3],
  ]);
  assert.equal(ticketCause(groups, 4471), 'parser');
  assert.deepEqual(groups[0].taggedAs, { parser: 356, hint: 23 });
  assert.deepEqual(groups[1].taggedAs, { parser: 15, hint: 18 });
});

test('five desk-note reports remain assigned to parser, not a proven third cause', () => {
  assert.equal(notes.oneDayMove.length, 5);
  assert.equal(readAs(groups[0], notes.oneDayMove), 5);
  assert.equal(readAs(groups[1], notes.oneDayMove), 0);
});

test('identical subject and tenant can belong to different causes', () => {
  const a = reports.find((r) => r.id === 'R-41211');
  const b = reports.find((r) => r.id === 'R-41251');
  assert.equal(a.subject, b.subject);
  assert.equal(a.tenant, b.tenant);
  assert.equal(sameCause(a, tenantOf(a), b, tenantOf(b)), false);
});

test('even identical bodies need tenant/form context', () => {
  const a = reports.find((r) => r.id === 'R-41256');
  const b = reports.find((r) => r.id === 'R-41428');
  assert.equal(a.body, b.body);
  assert.equal(a.channel, b.channel);
  assert.equal(sameCause(a, tenantOf(a), b, tenantOf(b)), false);
});

test('all original dedupe examples agree with cause-based grouping', () => {
  assert.deepEqual(DEDUPE_CASES.map(({ a, b }) => sameCause(a, tenantOf(a), b, tenantOf(b))), [
    true, false, false, true, false,
  ]);
});

test('received dates and merge dates measure different events', () => {
  const withinWeek = (timestamp) => timestamp.slice(0, 10) >= '2026-06-29'
    && timestamp.slice(0, 10) < '2026-07-06';
  assert.equal(reports.filter((r) => withinWeek(r.receivedAt)).length, 15);
  assert.equal(reports.filter((r) => withinWeek(r.mergedAt)).length, 189);
  assert.equal(reports.filter((r) => r.mergedAt.startsWith('2026-07-02')).length, 184);
});

test('stale threshold is strictly more than 180 days', () => {
  assert.equal(STALE_AFTER_DAYS, 180);
  assert.equal(daysSince('2026-01-01', new Date('2026-06-30T00:00:00Z')), 180);
  assert.equal(daysSince('2026-01-01', new Date('2026-07-01T00:00:00Z')), 181);
  assert.ok(daysSince('2024-06-11', new Date('2026-11-23T00:00:00Z')) > STALE_AFTER_DAYS);
});

test('desk ref is derived reproducibly from the signature, not invented', () => {
  assert.equal(deskRef(' aplich '), deskRef('aplich'));
  assert.match(deskRef('aplich'), /^DR-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
  assert.notEqual(deskRef('aplich'), deskRef('someone else'));
});
