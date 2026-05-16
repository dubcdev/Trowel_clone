# MVP Phone Provisioning

The MVP communication model is forwarding-first.

The contractor should not need to port their phone number during onboarding. The product should get them operational in minutes, then offer number porting later as an upgrade path.

## Voice Workflow

1. Customer calls the contractor's existing public business number.
2. Contractor enables simple carrier call forwarding.
3. Calls forward to the contractor's assigned Twilio AI voice number.
4. Twilio Voice routes the call into the AI receptionist pipeline.
5. AI answers, qualifies, books, escalates, summarizes, and dispatches as needed.

Owner-facing promise:

`Activate your AI front desk instantly while keeping your current business number.`

## SMS Workflow

Inbound SMS to the original business number may remain with the current carrier during MVP setup.

Trowel provisions a dedicated AI texting number for:

- SMS conversations
- appointment confirmations
- follow-ups
- booking coordination
- customer photo uploads
- payment links
- technician updates
- review requests
- after-hours lead recovery

After an AI-handled call, the system sends:

`Thanks for calling Bayview HVAC & Plumbing. You can reply here for scheduling, updates, photos, or questions.`

This naturally moves the customer into the AI-managed texting thread without requiring immediate porting.

## A2P 10DLC And SMS Compliance

SMS compliance must not block onboarding.

Trowel uses an ISV-style architecture:

- One master platform Twilio account
- Twilio subaccount per contractor business
- Contractor-specific AI voice number
- Contractor-specific AI texting number
- Messaging Service per contractor business
- Contractor-specific messaging reputation
- Contractor-specific compliance registrations
- Secondary Customer Profile
- A2P Brand Registration
- A2P Campaign Registration

Trowel must not run contractors through:

- one shared number pool
- one shared messaging identity
- one giant operational account

Each contractor gets isolated phone numbers, messaging service, webhook configuration, compliance state, number lifecycle, and messaging reputation. This keeps one contractor's deliverability, compliance issue, or abuse event from contaminating every other business on the platform.

During onboarding, the platform enriches and pre-fills:

- business name
- public phone number
- business address
- website
- trade category
- business hours
- service area
- services offered
- emergency service availability
- messaging use case
- sample SMS messages
- suggested opt-in language

The contractor confirms or edits required fields:

- legal business name
- EIN / Tax ID where applicable
- authorized contact name
- contact email
- contact phone
- entity/business type
- messaging use case
- opt-in method

The app should clearly say:

- `AI Voice Front Desk is live.`
- `AI texting verification is in progress.`
- `SMS approval is processing in the background.`

Voice operations, scheduling, dispatch, customer memory, summaries, and testing continue while A2P review is pending.

## Future Porting

Porting is optional during MVP.

When a number is ported:

- The contractor's original business number becomes the primary communication identity.
- Voice and SMS unify under the original number.
- The system promotes the ported number and deprecates the temporary AI texting number.

## Stored Twilio Data

The phone provisioning model stores:

- Twilio account SID
- Twilio subaccount SID
- isolation architecture
- voice phone number SID
- SMS phone number SID
- messaging service SID
- A2P status
- voice status
- SMS status
- communication mode
- porting status
- call-forwarding onboarding status
- recording policy
- retention policy

## Current Implementation

- `src/lib/phone-provisioning.ts` models the forwarding-first activation flow.
- A2P profile, registration status, compliance fields, sample messages, and opt-in language are modeled in `src/lib/phone-provisioning.ts`.
- `src/lib/voice-sms.ts` references the assigned AI voice and AI texting numbers in webhook contracts.
- `src/routes/onboarding.tsx` shows instant activation steps.
- `src/routes/settings.tsx` shows phone setup status and owner-facing next actions.

## Live Integration Boundary

The current implementation is provider-ready but not live. Real Twilio integration should start after confirming:

- subaccount creation strategy
- contractor isolation and lifecycle controls
- phone number purchasing/provisioning rules
- forwarding verification method
- call recording and retention policy
- SMS/MMS media handling
- live transfer targets
- emergency escalation notification targets
