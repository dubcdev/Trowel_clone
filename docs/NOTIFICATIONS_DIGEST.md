# Notifications And Daily Digest

Batch 9 adds the operating alert layer for Trowel.

The goal is simple: a contractor should open the phone and immediately know what needs attention.

## Included Now

- In-app notification records.
- Push/SMS/email delivery event model.
- Role-based notification preferences.
- Emergency, payment, booking conflict, photo upload, after-hours, and sync-failure alert types.
- Tap destinations for every alert.
- Daily digest model.
- Today screen digest summary.
- Bell icon count.
- Alerts screen at `/notifications`.
- Settings alert category.

## Alert Rules

Urgent alerts include emergencies and critical customer situations.

Important alerts include booking conflicts, calendar sync issues, payment holds, repeat issues, and customer photos.

Normal alerts include successful bookings, collected payments, after-hours captures, and FYI updates.

## Mobile Behavior

The app keeps alerts short:

- what happened
- why it matters
- what to tap next

Every alert must deep-link to the screen where the contractor can act.

## Pending Live Work

- Firebase/APNs push delivery.
- Twilio SMS alert sending.
- Email digest delivery.
- Worker retries for failed delivery.
- Opened/actioned tracking from real user events.
- User-editable alert preferences.
