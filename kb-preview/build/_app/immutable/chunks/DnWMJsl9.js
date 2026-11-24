import{t as e}from"./DK3Fl9T5.js";import{E as t,N as n,j as r,n as i,r as a,w as o}from"./DEcmSmVu.js";import{t as s}from"./Dt4TJggc.js";import{t as c}from"./DDCU7a66.js";import{n as l,r as u,t as d}from"./DXUybumh.js";import{t as f}from"./DpVie-ya.js";var p=e({default:()=>v,metadata:()=>m}),m={layout:`runbook`,title:`#4471 review · separate the mechanisms, keep the evidence`,owner:`OpenCode harness; support desk review pending`,status:`draft`,reviewed:`2026-11-24`,signature:`v1.eyJzdG9yeSI6Im9mZiIsInN1YiI6IjExMzY2IiwiYXVkIjoiY2hhbGxlbmdlOndoYXQtaXQtc2hvd3MiLCJpYXQiOjE3OTU1MTk2NDYsImV4cCI6MTc5NTYwNjA0Nn0.hHWBRkrSQ-B9Sq6OlIRdnU__rZp8qWesjpAbkF5C_dk`},h=new Set([`$$slots`,`$$events`,`$$legacy`]),g=t(`<p>Draft review of the KB export dated 2026-10-04, not a live support-system view.
The two closed GitHub issues are linked in the computed table below with distinct closure reasons.
Engineering outcomes are recorded separately from the historical export; no production fix was independently tested here.
This page does not claim that the support desk has accepted a new policy.</p>`),_=t(`<!><p>The <a href="/kb/incidents/4471">original incident page</a> says “One issue, one fix queued”.
Its computed cause table disagrees. The supplied KB describes a shared-parser
problem and a separate booking-form instruction problem, so one parser fix must
not be treated as resolving both.</p><h2>What is different</h2><ul><li><strong><strong>Parser:</strong></strong> the shared parser reads numeric dates month-first even when the
tenant's date convention is day-first. In <code>R-41203</code>, an app booking for
2 December appears in the invite as 12 February.</li> <li><strong><strong>Form hint:</strong></strong> booking-v3 prints <code>MM/DD/YYYY</code>, but for a day-first tenant its
form interprets the entry day-first. In <code>R-41259</code>, a form booking for 11 April
appears as 4 November. The visible instruction and interpretation must agree;
this is not evidence that the shared parser alone caused this report.</li></ul><p>These mechanisms come from the supplied KB logic and tenant data. The production
parser and form were not supplied; reproductions against the actual product
remain to be performed. The computed assignment is useful for triage, not proof
that every report individually demonstrates the assigned mechanism.</p><!><!><!><p>The signed <a href="/kb/decisions/0002-dedupe-by-cause/">proposed decision 0002</a> records the replacement triage rule without rewriting accepted decision 0001.</p><h2>What the desk should do next</h2><ol><li>Check the report body and the tenant's configured locale and form version.
Compare expected and actual behavior, including how the date entered the system.</li> <li>Match a report to a demonstrated mechanism, not just a similar subject, <code>browserLocale</code>, or <code>intakeTag</code>. App/email reports and form reports can differ
even for the same tenant.</li> <li>Track the shared-parser and booking-v3 hint problems in separate issues.
Keep the original report IDs and the snapshot date with each count.</li> <li>Keep unexplained reports visibly unresolved pending evidence. Do not infer
another defect solely from a city name, weekday, or the desk's note label.</li> <li>Record each engineering outcome separately. A completed parser fix is not a
fixed hint: the affected form was retired. Passing tests of this KB classifier
only verifies the KB, not the production product or each flagged report.</li></ol><p>For example, <code>R-41211</code> and <code>R-41251</code> share a tenant and title, but the app/form
difference changes their assignment. <code>R-41256</code> and <code>R-41428</code> even share the same
body and channel; different tenants and form versions put them in different groups.</p><h2>Guidance and decision history</h2><p>The <a href="/kb/triage/dedupe">triage page</a> and <a href="/kb/decisions/0001-dedupe-by-subject">accepted decision 0001</a> say to merge on subject alone. Their review date is old, and the rendered triage
page warns that it is stale. Its own interactive examples demonstrate why the
written rule can merge different causes or split one cause across titles.</p><p><strong><strong>Proposed process change, not an accepted desk decision:</strong></strong> stop treating a
subject match as sufficient evidence for merging. While investigating, retain
uncertain reports for triage rather than hiding them in a known ticket. Ask the
desk owner to approve updated operational guidance and a new decision that
supersedes 0001; preserve the accepted historical record unchanged.</p><h2>Reading and maintaining this page</h2><p>The export is a snapshot. Rendering it again recalculates the displayed values
from the same files; it does not fetch later reports. Counts and review age are
different: a recent review date is not proof of a correct diagnosis.</p><p>When new report data is available, update it through the agreed source, recompute
the counts, reconcile moved report IDs, and re-read the rendered page. Later issue
resolutions do not rewrite the original report export: preserve both the snapshot
and the separately sourced closure decisions. Do not interpret a partial month,
a drop in reports, or a spike in merges as proof of a fix.</p><p>This draft was authored with OpenCode / litellm/gpt-6.1-sol. Its frontmatter
signature is the exact ticket issued by the course for this challenge, as required
by the full course brief; it is not approval by the support desk. The desk reference
is computed from that signature by the supplied component, not entered by hand.</p><!>`,1);function v(e,t){let p=i(t,h),v=m.signature;s(e,a(()=>m,()=>p,{children:(e,t)=>{var i=_(),a=r(i);c(a,{children:(e,t)=>{var n=g();o(e,n)},$$slots:{default:!0}});var s=n(a,5);u(s,{});var p=n(s);f(p,{ticket:4471});var m=n(p);l(m,{});var h=n(m,12);d(h,{get signature(){return v}}),o(e,i)},$$slots:{default:!0}}))}export{v as n,p as t};