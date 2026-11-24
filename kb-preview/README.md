# S01E03: local rendering of the supplied support KB

This is a local SvelteKit/mdsvex wrapper around the original export. It does not
connect to the support system, update the export, or publish anything.

`src/lib/` and `src/routes/kb/` are generated copies of
`../kb-export/support-kb/src/`; edit neither. `npm run sync:export` restores the
copies from the untouched original. New authored content is kept in
`overlays/src/`, which is copied after the original export. Edit the overlay,
not the generated copies.

## Run

```sh
npm ci
npm run sync:export
npm test
npm run build
npm run preview
```

The preview binds only to `127.0.0.1:4173`. The static site is in `build/`.

To capture the rendered pages while the preview is running:

```sh
npx playwright install chromium
npm run capture
npm run capture:review
npm run capture:decision
```

On a minimal machine Chromium may also need system libraries. Install them only
with the machine owner's permission. Checked capture output is committed in
`artifacts/`; rebuilding the static site updates the committed `build/` directory.

The wrapper uses the supplied Svelte components and TypeScript logic. It does
not replace them with hand-written HTML or a Python reconstruction. The rendered
review ages use the machine clock; the underlying reports remain the snapshot
exported on 2026-10-04.

Restart `npm run preview` after rebuilding: Vite's preview can otherwise retain
the old immutable-asset list, causing 404s for the new hashed scripts and styles.
The capture scripts fail on browser errors rather than accepting a broken page.

## Deliverables

- Authored page: `overlays/src/routes/kb/incidents/4471-review/+page.svx`.
- Proposed decision: `overlays/src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx`.
- Computed findings: `overlays/src/lib/kb/ReviewFindings.svelte`.
- Published issue links: `overlays/src/lib/data/review-links.json`.
- Distinct closure outcomes and reference sources: `overlays/src/lib/data/review-outcomes.json`.
- Versioned issue bodies: `../drafts/issues/parser.md` and `../drafts/issues/hint.md`.
- Closing comments: `../drafts/resolutions/parser.md` and `../drafts/resolutions/hint.md`.
- Rendered review: `artifacts/review/page.pdf`, `desktop.png` and `mobile.png`.
- Rendered decision: `artifacts/decision/page.pdf`, `desktop.png` and `mobile.png`.
- Browser-check results: `artifacts/review/checks.json`, `artifacts/decision/checks.json`
  and `artifacts/original/checks.json`.

The incident review is a draft and decision 0002 is proposed, not accepted policy.
Both use the exact course-issued ticket as their frontmatter signature, with
author credit kept separate. The two issues are published in
[`aplich/mega-s01e03-what-it-shows`](https://github.com/aplich/mega-s01e03-what-it-shows/issues).
Parser closes as completed; the hint closes as not planned because booking-v3
was retired, not fixed. Sources and their limits are explicit in the outcome record.
The local rendering scripts do not fetch live reports or create GitHub issues.

`artifacts/review/page.html` is a DOM snapshot, not a standalone HTML file: it
references the site's styles and scripts. Serve the complete `build/` directory
for the working HTML site, or use the PDF/PNG for a standalone visual record.

Pinned versions and download integrity are recorded in `package-lock.json`.
SvelteKit 3 configuration lives in `vite.config.js`; mdsvex 1 is a Vite plugin.
The export's legacy `layout` metadata is mapped to its original layout component
without changing the source export. The test loader transpiles original `.ts`
files with TypeScript because the Ubuntu Node build lacks native type stripping.
