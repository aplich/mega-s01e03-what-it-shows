import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../overlays/src/routes/kb/incidents/4471-review/+page.svx', import.meta.url), 'utf8');

test('authored page uses a structured course signature rather than an author display name', () => {
  const signature = source.match(/^signature: (.+)$/m)?.[1];
  // This guards against the original mistake; authenticity is checked by the course.
  assert.match(signature ?? '', /^v1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.match(source, /const signature = metadata\.signature;/);
  assert.match(source.trim(), /<RenderStamp \{signature\} \/>$/);
});
