import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    mdsvex({
      extensions: ['.svx'],
      templates: {
        runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url)),
      },
      // Preserve the export's legacy `layout: runbook` frontmatter unchanged.
      select_template: (_id, metadata) => metadata.layout,
    }),
    sveltekit({
      extensions: ['.svelte', '.svx'],
      preprocess: vitePreprocess(),
      adapter: adapter(),
    }),
  ],
});
