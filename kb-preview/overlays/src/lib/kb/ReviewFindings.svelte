<script lang="ts">
  import raw from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import links from '#lib/data/review-links.json';
  import outcomes from '#lib/data/review-outcomes.json';
  import { groupByCause, readAs, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  const reports = $derived(uniqueById(raw as Report[]).filter((r) => r.mergedInto === 4471));
  const groups = $derived(groupByCause(reports, tenantOf));
  const flagged = $derived(reports.filter((r) => notes.oneDayMove.includes(r.id)));
  const mismatches = $derived(groups.reduce((sum, group) => sum + group.reports.filter((r) => r.meta.intakeTag !== group.cause).length, 0));
  const titles = $derived(new Set(reports.map((r) => r.subject)));
  const mixedTitles = $derived([...titles].filter((title) => groups.filter((g) => g.reports.some((r) => r.subject === title)).length > 1).length);
  const firstMerge = $derived(reports.map((r) => r.mergedAt).filter((t): t is string => !!t).sort((a, b) => Date.parse(a) - Date.parse(b))[0]);
  const beforeFirstMerge = $derived(reports.filter((r) => Date.parse(r.receivedAt) < Date.parse(firstMerge)).length);
  const mergeWeek = '2026-06-29';
  const nextWeek = '2026-07-06';
  const inMergeWeek = (timestamp: string | null) => !!timestamp && timestamp.slice(0, 10) >= mergeWeek && timestamp.slice(0, 10) < nextWeek;
  const incoming = $derived(reports.filter((r) => inMergeWeek(r.receivedAt)).length);
  const merged = $derived(reports.filter((r) => inMergeWeek(r.mergedAt)).length);
  const labels: Record<string, string> = {
    parser: 'Shared parser reads day-first input month-first',
    hint: 'booking-v3 hint disagrees with day-first interpretation',
    unplaced: 'No supported cause assigned: needs triage',
  };
  const issueLink = (cause: string): string | null => links[cause as keyof typeof links] ?? null;
  const resolutionOf = (cause: string) => outcomes.resolutions[cause as keyof typeof outcomes.resolutions];
</script>

<h2>Count each report once</h2>
<p class="report-count">
  <strong>{raw.length}</strong> exported rows contain <strong>{reports.length}</strong>
  unique reports merged into #4471; <strong>{raw.length - reports.length}</strong>
  repeated rows are excluded. These are report counts, not unique people or bookings.
</p>

<div class="table-wrap" role="region" aria-label="Cause assignments and issue status">
  <table class="review-counts">
    <thead>
      <tr><th>Problem / KB assignment</th><th>Reports</th><th>Tenants</th><th>Received</th><th>Issue status</th></tr>
    </thead>
    <tbody>
      {#each groups as group (group.cause)}
        <tr data-cause={group.cause}>
          <td><strong>{labels[group.cause]}</strong><br /><code>{group.cause}</code></td>
          <td>{group.reports.length}</td>
          <td>{group.tenants}</td>
          <td>{group.firstSeen} → {group.lastSeen}</td>
          <td>
            {#if issueLink(group.cause)}
              <a href={issueLink(group.cause)}>Separate GitHub issue</a>
              {#if resolutionOf(group.cause)}
                <br /><span class="issue-resolution">{resolutionOf(group.cause).state} · {resolutionOf(group.cause).stateReason}</span>
                <br />{resolutionOf(group.cause).outcome}
              {/if}
            {:else}
              Draft only — not published
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<p>
  <strong>{mismatches}</strong> intake labels disagree with the supplied KB assignment.
  Use tenant locale, form and channel; browser locale and intake labels do not settle the cause.
</p>

<h2>Assignments are not individual reproductions</h2>
<p>
  The supplied classifier uses tenant context, not the report body.
  <strong>{flagged.length}</strong> reports are flagged by the desk's notes.
  {#each groups as group (group.cause)}
    {#if readAs(group, notes.oneDayMove)}
      All {readAs(group, notes.oneDayMove)} remain counted under <code>{group.cause}</code>.
    {/if}
  {/each}
  Their descriptions do not establish a day/month swap, and do not prove a shared timezone defect.
  The assignment counts above deliberately retain these reports rather than losing or double-counting them.
</p>
<ul class="flagged-reports">
  {#each flagged as report (report.id)}
    <li>
      <strong>{report.id}</strong> · <code>{report.tenant}</code> · {report.channel}
      <blockquote>{report.body}</blockquote>
    </li>
  {/each}
</ul>
<p>
  Follow up with the original input, expected and actual date/time, tenant and recipient timezone,
  form/channel and raw invite or reproducible sequence. A different calendar day across cities can
  be correct for the same instant; the event's time and intended date semantics matter.
  If a different cause is established, create a linked issue and reconcile these counts.
</p>

<h2>Do not merge by subject</h2>
<p>
  <strong>{mixedTitles}</strong> of the <strong>{titles.size}</strong> distinct subjects appear in
  more than one assigned cause. Similar wording is a search aid, not a merge criterion.
</p>

<h2>Read the queue timeline correctly</h2>
<p class="queue-facts">
  The first recorded merge was <time datetime={firstMerge}>{firstMerge}</time>.
  <strong>{beforeFirstMerge}</strong> reports had already arrived.
  In the week starting {mergeWeek}, <strong>{incoming}</strong> reports arrived while
  <strong>{merged}</strong> were merged. The large merge bar reflects backlog processing,
   not a demonstrated spike in new reports. The timeline alone does not establish a deployed fix;
   the engineering outcomes are recorded separately with their sources.
</p>

<style>
  .table-wrap { overflow-x: auto; }
  .review-counts { min-width: 680px; }
  blockquote { margin: 0.35rem 0 1rem; border-left: 3px solid var(--line); padding-left: 0.75rem; }
  .flagged-reports { padding-left: 1.4rem; }
  time { overflow-wrap: anywhere; }
</style>
