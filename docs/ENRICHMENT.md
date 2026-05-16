# Onboarding And Public Enrichment

The onboarding goal is speed to value without letting unverified public data shape live AI behavior.

## Data Sources

Trowel may use compliant public sources only:

- Contractor website
- Contact, services, FAQ, emergency, and service-area pages
- `sitemap.xml`
- Structured schema markup
- Public provider APIs and business directories where terms allow it
- Owner-entered information

Do not access login-protected systems, private records, gated data, or sources that disallow collection.

## Field Contract

Every enriched field must carry:

- Confidence score
- Source URL
- Editable flag
- Owner confirmation requirement
- Timestamp

The AI receptionist cannot use unconfirmed service, emergency, scheduling, or payment rules to book work.

## Pipeline

1. Normalize business identity.
2. Locate official website.
3. Check robots and rate limits.
4. Crawl approved public pages only.
5. Extract structured fields.
6. Identify trade type and service terms.
7. Generate intake profile.
8. Generate escalation rules.
9. Generate AI receptionist profile.
10. Show owner confirmation cards.
11. Prepare demo call.

## Confirmation Rules

Owner-confirmed fields can power booking, dispatch, and AI responses.

Low-confidence or unconfirmed fields stay in review. The AI may mention that the office will confirm details, but it should not invent availability, pricing, emergency promises, or service coverage.

## Demo Call Readiness

The demo call should only run after the system has enough confirmed services, hours, source-of-truth scheduling rules, emergency handling, phone setup, and receptionist profile data to behave reliably.
