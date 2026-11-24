<script lang="ts">
  import outcomes from '#lib/data/review-outcomes.json';
  import links from '#lib/data/review-links.json';
</script>

<section class="engineering-outcomes" aria-labelledby="engineering-outcome">
  <h2 id="engineering-outcome">Engineering outcome: 5 October</h2>
  <p class="outcome-source">
    The reported course update says <strong>{outcomes.reportedUpdate}</strong>.
    {outcomes.basis}
    The source system is the <a href={outcomes.coursePage}>course Challenge page</a>.
  </p>
  <ul>
    {#each Object.entries(outcomes.resolutions) as [cause, resolution] (cause)}
      <li data-resolution={cause}>
        <strong>{cause}: {resolution.outcome}</strong> — {resolution.detail}.
        <a href={links[cause as keyof typeof links]}>Our {cause} issue</a>
        is <code>{resolution.state}</code> with reason <code>{resolution.stateReason}</code>.
        <a href={resolution.evidence}>Reference engineering resolution</a>.
      </li>
    {/each}
  </ul>
  <p>
    Closure is not the same as a fix: the parser is recorded as completed, but the
    hint is not planned because its form was retired. These are reported engineering
    decisions, not independently verified production tests or course acceptance.
    The report counts and unresolved diagnostic limitations remain in the historical record.
  </p>
</section>
