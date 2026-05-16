# Dispatch And ETA Backend Contract

Batch 4 makes dispatch decisions more trustworthy by separating ETA from generic technician scoring.

## Current Prototype State

- `src/lib/eta.ts` models technician location source, location freshness, routing provider, drive time, current job delay, wrap-up buffer, dispatch buffer, warnings, and ETA confidence.
- Dispatch cards show ETA source and next dispatch action.
- Crew status shows richer ETA labels instead of plain drive minutes.
- Dispatch detail shows an ETA breakdown.

## ETA Inputs

Production ETA should be calculated from:

- technician current location
- location source
- last seen timestamp
- current job status
- current job blocked-until time
- wrap-up buffer
- customer service address
- service area
- route provider drive time
- emergency priority
- technician emergency eligibility
- service area fit
- trade fit

## Location Sources

Supported source types:

- `technician_app`: live mobile app GPS ping
- `current_job`: current job address when GPS is unavailable
- `last_known`: most recent known location
- `home_base`: fallback starting point
- `manual`: dispatcher-entered location

## Routing Providers

Provider adapter should support:

- Google Maps
- Mapbox
- HERE or another future provider
- internal estimate fallback

Required adapter methods:

- `getDriveTime(origin, destination)`
- `getDistance(origin, destination)`
- `getRouteConfidence(origin, destination)`
- `handleRateLimit()`
- `fallbackEstimate(serviceArea, technicianZone)`

## ETA Formula

```text
arrival_minutes =
  current_job_delay_minutes
  + wrap_up_buffer_minutes
  + drive_minutes
  + dispatch_buffer_minutes
```

The app should display the underlying reason, not just the final number.

Examples:

- `34 min ETA - technician app - 2 min ago`
- `After 1:15 PM + 51 min drive - current job`
- `Tomorrow earliest - off duty`
- `Not eligible - not emergency eligible`

## Dispatch Action Plan

Every dispatch event should generate:

- recommended technician
- ETA estimate
- assignment status
- approval requirement
- next action
- audit summary

Assignment statuses:

- `ready_to_dispatch`
- `hold_for_approval`
- `not_recommended`

## API Endpoints

Initial endpoints:

- `GET /api/dispatch/events`
- `GET /api/dispatch/events/:id/eta`
- `POST /api/dispatch/events/:id/approve`
- `POST /api/dispatch/events/:id/assign`
- `POST /api/dispatch/events/:id/reassign`
- `POST /api/dispatch/events/:id/hold`
- `POST /api/technicians/:id/location`
- `GET /api/technicians/status`
- `POST /api/routing/estimate`

Every write endpoint must enforce RBAC and create an audit entry.

## Audit Events

Audit:

- ETA generated
- technician location updated
- dispatch recommendation accepted
- dispatch recommendation overridden
- technician assigned
- technician reassigned
- dispatch held
- customer notified
- technician notified

