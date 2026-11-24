# booking-v3 date hint contradicts tenant date order — 33 reports

## Resolution — 2026-11-24

Closed as **not planned**: the reported engineering outcome is
`hint won't fix — booking-v3 form retired`. The misleading hint was **not fixed**.
See the [versioned closing comment](https://github.com/aplich/mega-s01e03-what-it-shows/blob/main/drafts/resolutions/hint.md) for the owner-supplied
reference evidence and its limits. The original analysis below records the
4 October snapshot, not a claim that this harness tested production.

## Status and scope

Tracked separately for this challenge from the supplied support KB snapshot,
exported on 2026-10-04. The production form was not provided,
so the reproduction below is a proposed verification, not a completed test.

**33 unique reports are assigned to `hint` by the supplied KB rule**, received
from 2026-04-17 through 2026-09-22:

| Tenant | Locale | Form | Reports |
| --- | --- | --- | ---: |
| `alder.physio` | `de-DE` | `booking-v3` | 12 |
| `copper.studio` | `es-ES` | `booking-v3` | 11 |
| `pale.harbour` | `pt-PT` | `booking-v3` | 10 |

In the snapshot these reports are merged into source ticket #4471, although its
documented parser fix does not address this distinct form-hint mismatch.

## Problem

The supplied KB defines the booking-v3 date hint as `MM/DD/YYYY`. For a day-first
tenant, people following that hint enter the month first, but the form reads
their input using the tenant's day-first convention. The visible instruction
and the input interpretation disagree.

Unlike the shared-parser issue, this case instructs people to enter the wrong
format. Fixing only the shared parser is not evidence that this issue is fixed.

## Evidence

- `R-41259`: `copper.studio`, `form`, locale `es-ES`, `booking-v3`.
  “Customer booked 11 April and got an invite for 4 November.” Intake tagged it
  `parser`; the form and tenant context assign it to `hint`.
- `R-41251`: `pale.harbour`, `form`, `booking-v3`, subject “Booking on the wrong
  date”. `R-41211` has the same tenant and subject but channel `app`, and belongs
  to `parser`. Subject-only merging hides the distinction.
- `src/lib/kb/causes.ts` defines the two form hints and the form/channel rule.
- Intake tagged 18 of these reports as `hint` and 15 as `parser`.

## Proposed reproduction — not yet run against the product

1. Open the booking-v3 form for a day-first tenant, for example `copper.studio`.
2. Check the hint displayed under the date field.
3. To book 11 April 2026, follow `MM/DD/YYYY` and enter `04/11/2026`.
4. Submit and inspect the saved booking and invite.

Expected: the visible instruction agrees with validation and interpretation;
the date intended by a person following that instruction remains 11 April.

Reported behavior: the form interprets the input day-first, producing 4 November.

## Counting method and exclusions

Deduplicate `reports-4471.json` by report ID, filter source ticket #4471, look up
tenant locale and form, then run the supplied `groupByCause` / `causeOf` logic.
All 33 assignments have channel `form`, day-first tenant locale, and booking-v3.

- Do not use browser locale or `meta.intakeTag` as the cause.
- Do not include app/email reports just because the tenant runs booking-v3.
- Do not include booking-v2 form reports simply because their channel is `form`.
- The 33 assignments are separate from the parser issue's 379, totaling 412
  unique reports, not the export's 427 overlapping rows.
- No report ID from `desk-notes.json` / `oneDayMove` is in this group.

## Verification and closure

- Make the displayed format, input validation, and actual date interpretation
  agree for every supported tenant locale. Do not change all tenants to day-first.
- Verify all three affected tenant contexts and a month-first control locale.
- Test an ambiguous date and a day greater than 12 through submission and invite
  generation, not just the placeholder text.
- Verify booking-v2 and app/email paths retain correct behavior.
- File and track this problem separately from the shared-parser fix, with its
  own verification and closure evidence.
- Link both issues from a corrected KB page and prevent new reports from being
  merged solely on subject. The supplied data does not show a deployed fix.
