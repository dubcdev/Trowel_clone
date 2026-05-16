# Mobile UX Rules

Contractors review Trowel from a phone between jobs, in a truck, or after a call. Every tab should make the next decision obvious before showing detail.

## Screen Shape

Each tab should follow this order:

1. One priority summary.
2. One primary action or decision queue.
3. A short recent list.
4. Deeper operational detail only after the user asks for it.

Avoid repeating the same record in multiple long sections on one screen.

## Density Rules

- Show the next action first.
- Prefer one-line summaries over paragraphs.
- Use counts as filters, not extra dashboards.
- Keep technical/provider details out of primary mobile views.
- Keep cards compact unless they need an immediate decision.
- Use detail pages for transcripts, audit trails, provider logs, and long histories.
- Write every main-screen label for a 5th grader.
- Prefer plain words: `text` over `SMS`, `needs OK` over `approval`, `urgent` over `escalated`, `saved notes` over `context pack`, `arrival time` over `ETA`, `setup` over `configuration`, and `rules` only when they are business rules the owner understands.
- Avoid technical words on primary screens: `backend`, `adapter`, `provider`, `RBAC`, `compliance`, `pipeline`, `webhook`, `latency`, `confidence`, `audit`, `tenant`, and `enrichment`.
- Each tab should answer: `What is happening?`, `What should I tap?`, and `What happens next?`

## Tab Intent

- Today: what needs attention right now.
- Calls: call outcomes and call decisions.
- Jobs: current job and next job list.
- Customers: customer memory and unresolved issues.
- Settings: setup health and owner-only configuration.

The default mobile view should feel calm and scannable, not like a report.
