# Date parser reads day-first tenant input as month-first — 379 assigned reports

## Status and scope

Tracked separately for this challenge from the supplied support KB snapshot,
exported on 2026-10-04. The production parser was not provided,
so the reproduction below is a proposed verification, not a completed test.

**379 unique reports are assigned to `parser` by the supplied KB rule**, across
11 tenants, received from 2026-04-01 through 2026-10-04. They are currently merged
into source ticket #4471. This count includes five explicitly flagged reports
whose descriptions do not independently establish this mechanism; see below.

Do not interpret the report count as a count of affected people or bookings.

## Problem

The KB describes a shared parser that reads dates month-first even for tenants
whose date convention is day-first. Ambiguous numeric dates are interpreted as
a different calendar date. This is distinct from the booking-v3 form's incorrect
date hint and should not share that issue's remediation or closure criteria.

## Evidence

- `R-41203`: `lantern.row`, `app`, tenant locale `cs-CZ`, form `booking-v2`.
  “Booked for 2 December. The invite says 12 February.”
- `R-41200`: `harbour.dental`, `app`, locale `en-GB`, form `booking-v2`.
  “Our 7 April reminder went out on 4 July.”
- The supplied `src/lib/kb/causes.ts`, `causeOf`, describes the shared parser and
  assigns reports using tenant locale and form/channel context, not subject or
  `meta.intakeTag`.
- Of the assigned reports, intake tagged 356 as `parser` and 23 as `hint`.
  Intake labels are not a reliable substitute for tenant context.

## Proposed reproduction — not yet run against the product

1. Use a day-first tenant, for example `lantern.row` (`cs-CZ`).
2. Exercise the app path described in `R-41203` that uses the shared date parser.
3. Enter the intended date 2 December 2026 as `02/12/2026`.
4. Inspect the saved date and resulting calendar invite.

Expected: 2026-12-02 remains 2 December throughout the flow.

Reported behavior: the invite shows 12 February, consistent with month-first
interpretation of the input.

## Counting method and exclusions

1. Load `reports-4471.json`; keep one record per ID with the supplied `uniqueById`.
2. Filter `mergedInto === 4471`.
3. Resolve each report's tenant from `src/lib/data/tenants/`.
4. Run the supplied `groupByCause` / `causeOf` logic.

The export has 427 rows but only 412 unique report IDs. This issue's 379 assigned
reports and the form-hint issue's 33 assignments are disjoint and sum to 412.
Identical bodies with different IDs remain separate reports.

## Diagnosis limits: five reports need follow-up

`desk-notes.json` identifies `R-41202`, `R-41209`, `R-41236`, `R-41344`, and
`R-41620`. The current KB counts all five under `parser`, with a footnote. Their
bodies describe a one-day shift, an unexplained order of events, or different
days in Lisbon and Toronto, rather than a documented day/month swap.

The count of 379 is therefore the current assignment count, not 379 independently
verified parser reproductions. Do not silently subtract these reports, count
them twice, or declare a shared timezone defect without more evidence.

For each, obtain the original input, expected and actual date/time, tenant and
recipient timezone, form/channel, and raw invite or reproducible sequence. If a
different cause is established, link a separate issue and reconcile the counts.

## Verification and closure

- Preserve intended dates for day-first input through parsing, storage, and
  invite generation; test ambiguous values in both directions.
- Include days greater than 12 and a month-first locale as regression controls.
- Verify the actual product path; passing the KB classifier tests is not proof
  that the production parser has been fixed.
- Record the disposition of the five flagged reports before claiming that every
  assigned report is resolved.
- Keep the booking-v3 hint issue separate; do not close it just because this
  parser fix ships.
- Update the incident page and any affected triage guidance with linked evidence
  and the actual fix status. The supplied data does not demonstrate a shipped fix.
