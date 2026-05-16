# Payments Workflow

Trowel payments are an optional operational workflow. They help a contractor collect deposits, diagnostic fees, emergency deposits, appointment confirmation payments, and simple invoice links without turning the product into accounting software.

## MVP Rule

Payment setup must not block onboarding. The AI front desk can answer calls, book or hold appointments, dispatch, text, and summarize operations even while payments are not connected.

## Stripe Connect Plan

The live provider path is Stripe Connect using Accounts v2. The contractor owns the connected Stripe account. Trowel stores the connected account reference, capability status, onboarding status, and whether charges and payouts are enabled.

Trowel should create hosted Checkout Sessions or secure payment links for approved operational payments. Do not use the legacy Charges API.

## Modeled Entities

- `payment_accounts`
- `payment_requests`
- `deposits`
- `invoices`
- `payment_events`
- `refund_events`
- `payment_status_history`

Every payment request tracks business, customer, job, appointment, amount, reason, provider, provider payment id, sent, paid, failed, refunded, waived, owner approval, and whether the AI may send it.

## AI Safety Rules

The AI never invents prices. It may only request an amount when the rule is owner-confirmed, the policy allows AI requests, and the provider is ready.

If a payment rule is missing, unconfirmed, or unclear, the AI creates or keeps a hold and escalates to the owner or dispatcher.

Customer-facing language should stay simple:

> To confirm your appointment, we will send a secure payment link for the diagnostic fee.

## Live Integration Steps

1. Create or connect the Stripe account.
2. Complete account onboarding and required capabilities.
3. Create Checkout Sessions or payment links for owner-approved payment requests.
4. Listen for provider webhook events and update payment status history.
5. Confirm jobs only after payment is paid, waived, or not required.
6. Support refund-ready records before adding live refund execution.
