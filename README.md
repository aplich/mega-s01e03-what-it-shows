# S01E03 — what it shows

Review of source support ticket **#4471** for the
[MEGA.dev challenge](https://hq.mega.dev/challenges/what-it-shows).
The supplied KB is a snapshot exported on **2026-10-04**, not a live support feed.

## Findings and tickets

| Problem described by the KB | Assigned unique reports | GitHub ticket |
| --- | ---: | --- |
| Shared parser reads day-first input month-first | **379** | [Issue #1](https://github.com/aplich/mega-s01e03-what-it-shows/issues/1) |
| booking-v3 hint says `MM/DD/YYYY` for a day-first form | **33** | [Issue #2](https://github.com/aplich/mega-s01e03-what-it-shows/issues/2) |

There are **427 rows, 412 unique report IDs and 15 repeated rows**. Counts use the
supplied classifier and tenant data, not intake labels or matching subject lines.
The groups are disjoint. These are report counts, not unique people or bookings.

**Five reports inside the parser assignment remain diagnostically unresolved:**
`R-41202`, `R-41209`, `R-41236`, `R-41344`, `R-41620`. Their descriptions do not
establish a day/month swap or a common timezone defect. Both the parser ticket
and the rendered page preserve this limitation and describe the evidence needed.
The production parser and form were not supplied; proposed product reproductions
are not presented as completed tests or a shipped fix.

## The page as the desk sees it

- **[Rendered page — PDF](kb-preview/artifacts/review/page.pdf)**
- [Desktop screenshot](kb-preview/artifacts/review/desktop.png)
- [Mobile screenshot](kb-preview/artifacts/review/mobile.png)
- **[Authored page — `.svx`](kb-preview/overlays/src/routes/kb/incidents/4471-review/+page.svx)**
- [Computed findings component](kb-preview/overlays/src/lib/kb/ReviewFindings.svelte)
- [Browser verification](kb-preview/artifacts/review/checks.json)
- [Complete static site](kb-preview/build/)

The PDF/PNG are real Chromium renders of the Svelte/mdsvex page, not hand-made
HTML substitutes. GitHub shows the static HTML as source; run the local preview
to use the interactive site. No public web hosting is enabled.

The page remains a **draft for desk review**, authored with
`OpenCode / litellm/gpt-6.1-sol`. Its frontmatter `signature` carries the exact
challenge ticket issued by the course, not the author's display name. Publishing
it does not mean the desk accepted its proposed process changes, or that the
course accepted this submission.

## Reproduce locally

Requires Node.js 24.19+ and npm. From the repository root:

```sh
cd kb-preview
npm ci
npm run sync:export
npm test
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/kb/incidents/4471-review/`.
The server binds only to loopback. To repeat browser checks, install Playwright's
Chromium with the machine owner's permission, then run `npm run capture` and
`npm run capture:review` while the preview is running. Restart the preview after
each rebuild. See [the rendering project README](kb-preview/README.md) for details.

## Repository structure

- `kb-export/support-kb/`: the 30 supplied files, preserved byte for byte.
- `kb-preview/overlays/src/`: authored page, component and actual issue links.
- `kb-preview/scripts/`, `tests/`: reproduction and render checks.
- `kb-preview/artifacts/`: checked renders and browser-check results.
- `kb-preview/build/`: checked static site, including its required assets.
- `drafts/issues/`: versioned bodies used to create the two GitHub issues.

Only generated copies in `kb-preview/src/lib/` and `src/routes/kb/` are ignored.
Edit the overlay rather than these copies. The historical accepted decision 0001
and the original export have not been rewritten.

The old KB's subject-only merge instruction contradicts its interactive examples.
The review proposes mechanism-based triage but does not claim policy approval.
The queue's July merge spike is backlog processing, not proof of an incoming
report spike or a successful fix. Rebuilding recalculates the snapshot; it does
not obtain new reports.
