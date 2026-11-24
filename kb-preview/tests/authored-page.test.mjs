import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../overlays/src/routes/kb/incidents/4471-review/+page.svx', import.meta.url), 'utf8');
const decision = readFileSync(new URL('../overlays/src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx', import.meta.url), 'utf8');
const outcomes = JSON.parse(readFileSync(new URL('../overlays/src/lib/data/review-outcomes.json', import.meta.url), 'utf8'));

test('authored page uses a structured course signature rather than an author display name', () => {
  const signature = source.match(/^signature: (.+)$/m)?.[1];
  // This guards against the original mistake; authenticity is checked by the course.
  assert.match(signature ?? '', /^v1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.match(source, /const signature = metadata\.signature;/);
  assert.match(source.trim(), /<RenderStamp \{signature\} \/>$/);
});

test('proposed decision uses the same course signature and preserves accepted history', () => {
  assert.equal(decision.match(/^signature: (.+)$/m)?.[1], source.match(/^signature: (.+)$/m)?.[1]);
  assert.match(decision, /^status: proposed$/m);
  assert.match(decision, /const signature = metadata\.signature;/);
  assert.match(decision.trim(), /<RenderStamp \{signature\} \/>$/);
  assert.match(decision, /Preserve that accepted historical record unchanged/);
});

test('parser completion and retired-form hint closure remain distinct', () => {
  assert.deepEqual(Object.keys(outcomes.resolutions).sort(), ['hint', 'parser']);
  assert.equal(outcomes.resolutions.parser.state, 'closed');
  assert.equal(outcomes.resolutions.parser.stateReason, 'completed');
  assert.equal(outcomes.resolutions.parser.outcome, 'fixed');
  assert.equal(outcomes.resolutions.hint.state, 'closed');
  assert.equal(outcomes.resolutions.hint.stateReason, 'not_planned');
  assert.equal(outcomes.resolutions.hint.outcome, "won't fix");
  assert.match(outcomes.resolutions.hint.detail, /retired.*not fixed/);
  assert.match(outcomes.basis, /not independently observed/);
  for (const page of [source, decision]) assert.match(page, /<EngineeringOutcomes \/>/);
});
