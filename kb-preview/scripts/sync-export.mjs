import { cp, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const source = new URL('../kb-export/support-kb/src/', root);

// Only generated copies are replaced. Never edit the original export or ZIP.
for (const relative of ['lib', 'routes/kb']) {
  const destination = new URL(`src/${relative}`, root);
  await mkdir(new URL('./', destination), { recursive: true });
  await cp(new URL(relative, source), destination, { recursive: true });
}

const overlay = new URL('overlays/src/', root);
if (await stat(overlay).catch((error) => {
  if (error.code === 'ENOENT') return null;
  throw error;
})) {
  await cp(overlay, new URL('src/', root), { recursive: true });
}

console.log(`Copied KB sources and authored overlays to ${fileURLToPath(new URL('src/', root))}`);
