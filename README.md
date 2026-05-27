

````markdown
# Sell My Return

**Sell My Return** is a UK rail travel platform concept that matches two passengers travelling in opposite directions and coordinates one eligible return-ticket purchase funded by both users.

> Two people travelling opposite directions. One matched return purchase. Shared saving.

## Product concept

Example:

| Traveller | Requested journey | Intended future allocation |
| --- | --- | --- |
| User A | Edinburgh → Glasgow | Outward journey credential |
| User B | Glasgow → Edinburgh | Return journey credential |

The users are **co-buyers**, not sellers. No user receives payment from another user. Each user agrees to fund their share of a matched rail purchase. Their payment amount is authorised first and captured only after the required acceptance and booking conditions are met.

## Scope boundary

The first proof of concept must establish that this platform can interact with live UK rail retailing:

1. Search for a live UK rail return fare.
2. Select an eligible return ticket.
3. Purchase a real ticket through an accessible rail retail or distribution integration.
4. Receive and securely store the resulting ticket fulfilment artefact.

The later commercial and regulatory phase concerns allocating the outward and return credentials to two separate matched travellers. Separate QR/barcode delivery is not assumed in the initial proof of concept.

## Target transaction flow

```text
User A submits A → B journey request
User B submits B → A journey request
        ↓
Platform finds a compatible reverse-route match
        ↓
Platform requests a live eligible return fare
        ↓
Both users accept their quoted contribution and terms
        ↓
Both payment amounts are authorised, not captured
        ↓
Platform purchases one real return ticket
        ↓
Platform receives booking confirmation and ticket fulfilment artefact
        ↓
Both authorised payments are captured
        ↓
Future approved capability: distribute each journey credential to its traveller
```

## Product goals

- Reduce the effective cost of one-way rail travel where a return fare provides better value than two individual singles.
- Match inverse travel demand before any ticket purchase takes place.
- Prove that live ticket retailing and fulfilment can be integrated technically.
- Collect route, demand and saving data that can support future commercial discussions with rail retail and transport stakeholders.
- Build the application so that approved separate journey-credential distribution can be introduced later without redesigning the platform.

## Delivery phases

## Phase 0: Live rail purchase proof of concept

### Objective

Demonstrate that Sell My Return can search for and purchase a real UK rail return ticket through a suitable rail retail or distribution integration, then receive its fulfilment artefact.

### Initial internal interface

Create an internal admin route:

```text
/admin/rail-poc
```

The page should support:

- origin station selection;
- destination station selection;
- outbound travel date;
- return travel date or same-day return selection;
- live return-fare search;
- supported ticket-type selection;
- booking creation;
- provider-required payment or settlement step;
- booking confirmation display;
- fulfilment artefact retrieval;
- secure persistence of booking metadata;
- audit logging of provider requests, responses and state transitions.

### Required proof

Given a supported route and date, the application must be able to:

```text
Retrieve a live UK return fare
→ create or submit a booking
→ purchase the selected ticket
→ receive a booking confirmation/reference
→ receive and store the ticket fulfilment artefact
```

Possible fulfilment artefacts include:

- e-ticket barcode data;
- PDF ticket;
- mobile ticket reference;
- ticket-on-departure or collection reference;
- provider-specific digital ticket payload.

### Phase 0 output

Create:

```text
docs/rail-integration-spike.md
```

This document must record:

```text
Provider investigated
Developer, sandbox or controlled-live access route
Authentication mechanism
Available booking/search endpoints or integration method
Supported UK rail ticket products
Return-fare search outcome
Booking request and response model
Fulfilment response format
Payment and settlement ownership
Commercial or accreditation constraints
Decision: proceed, hold or reject
```

## Phase 1: Customer accounts and journey requests

### Objective

Create the customer-facing foundation for submitting one-way journeys that may be matched into a paired return purchase.

### Features

- customer registration and sign-in;
- customer profile;
- journey request creation;
- origin station;
- destination station;
- travel date;
- acceptable departure-time window;
- request expiry and cancellation;
- request status display;
- in-app and email notifications.

### Initial limitations

The first customer workflow should support:

- one adult passenger per request;
- UK rail routes supported by the chosen retail provider;
- compatible flexible return products;
- no Railcards initially;
- no group travel initially;
- no split-ticket optimisation initially.

## Phase 2: Reverse-route matching with live fare quotation

### Objective

Match two compatible one-way journey requests and calculate the proposed saving using a live return fare.

### Matching principle

```text
User A requests: Edinburgh → Glasgow
User B requests: Glasgow → Edinburgh

Compatible result:
One Edinburgh ⇄ Glasgow return purchase candidate
```

### Matching rules

A proposed match must satisfy:

- origin and destination are reversed;
- travel dates are compatible with the selected return product;
- travel windows are compatible with fare restrictions;
- both requests are active and unmatched;
- both passengers are eligible for the fare product;
- a live purchasable return fare exists;
- neither request is already committed to another active match.

### Match offer

Each user should see:

- requested journey;
- matched route;
- ticket type;
- standard individual comparison price where available;
- matched contribution amount;
- displayed saving;
- acceptance expiry time;
- terms requiring both participants to proceed before booking.

## Phase 3: Mutual acceptance and authorised funds

### Objective

Reserve each user's payment contribution without taking final payment until the matched purchase is ready to proceed.

### Payment principle

Users do not pay each other. Each user authorises their contribution to the platform's booking transaction.

```text
Match proposed
→ User A accepts and authorises contribution
→ User B accepts and authorises contribution
→ Both authorisations confirmed
→ Ticket purchase can begin
```

### Candidate payment integration

**Stripe PaymentIntents with manual capture**

Stripe supports placing a hold on eligible payment methods and capturing the funds later by creating a `PaymentIntent` with:

```ts
capture_method: 'manual'
```

Development reference:

- Stripe Payments: <https://stripe.com/payments>
- Stripe separate authorisation and capture documentation: <https://docs.stripe.com/payments/place-a-hold-on-a-payment-method>

### Payment rules

- Create one payment authorisation per matched participant.
- Do not purchase the rail ticket until both required authorisations succeed.
- Do not capture either payment until the ticket purchase succeeds and the fulfilment artefact is recorded.
- Cancel authorised funds if the match expires, a participant declines, authorisation fails or booking cannot proceed.
- Store payment provider references and process webhook events as the authoritative payment state.

### Engineering constraint

Authorisation holds expire. The booking workflow must complete within a short application-controlled acceptance and purchase window. The system must store the provider's capture deadline for each authorised payment and never rely on an indefinite hold.

## Phase 4: Automated live ticket purchase

### Objective

Use the proven rail integration from Phase 0 inside the matched customer flow.

### Booking workflow

```text
Both users authorised
→ recheck or reserve fare
→ create rail booking
→ complete rail purchase
→ retrieve fulfilment artefact
→ store booking and ticket data
→ capture both user payments
→ confirm successful matched purchase
```

### Required handling

| Scenario | Required system behaviour |
| --- | --- |
| Fare remains available | Purchase ticket and continue |
| Fare changes before purchase | Offer revised contribution or cancel match |
| Fare becomes unavailable | Cancel match and release authorisations |
| Booking fails | Release both authorisations and record failure |
| Booking succeeds but fulfilment is delayed | Persist booking reference and retry fulfilment retrieval safely |
| Ticket is received but customer payment capture fails | Escalate to operations with a full audit trail |

### Provider payment model

The rail retail provider may require:

- direct provider checkout;
- merchant settlement;
- wallet/pre-funded retail balance;
- invoice-based settlement;
- another commercial arrangement.

This must be established during the Phase 0 integration spike. The customer-facing Stripe authorisation model must be reconciled with the rail provider's required booking/payment sequence.

## Phase 5: Operations, analytics and pilot evidence

### Objective

Provide the operational visibility required for a controlled pilot and future rail-provider discussions.

### Admin capabilities

- view submitted journey requests;
- view proposed and accepted matches;
- view live fare quotes and expiries;
- view payment authorisation and capture states;
- view booking attempts and fulfilment status;
- inspect audit events;
- retry fulfilment retrieval where permitted;
- cancel failed or expired matches safely.

### Metrics

Track:

- number of journey requests per route;
- inverse-route match rate;
- average proposed saving per matched traveller;
- acceptance rate after a match proposal;
- payment authorisation success rate;
- booking success rate;
- fulfilment retrieval success rate;
- unmatched demand by route and time window;
- number of users stating that the saving would make them choose rail.

## Deferred approved-delivery phase: separate journey credential distribution

This phase depends on the required rail-provider agreements and applicable ticketing rules.

It includes:

- assigning the outward and return journey credentials to separate matched travellers;
- displaying each traveller's permitted QR/barcode or ticket artefact;
- validating how credential presentation works at gates and inspections;
- determining customer identity and entitlement handling;
- managing cancellations, refunds, disruption and Delay Repay per traveller;
- ensuring the commercial and ticketing model is approved for live operation.

The application architecture should anticipate this phase through a dedicated fulfilment adapter and `JourneyLegAllocation` model, without implementing unapproved ticket distribution behaviour in the initial proof of concept.

## Recommended technology stack

| Area | Technology | Purpose |
| --- | --- | --- |
| Monorepo | pnpm workspaces + Turborepo | Shared TypeScript project structure and coordinated builds |
| Web application | Next.js, TypeScript, Tailwind CSS, shadcn/ui | Responsive customer app and internal admin console |
| Backend API | NestJS, TypeScript | Modular domain services and external integration endpoints |
| Database | PostgreSQL + Prisma | Transactional matching, payment, booking and audit data |
| Background processing | Redis + BullMQ | Match expiry, provider retries, notifications and orchestration |
| Authentication | Auth.js | Customer and admin authentication |
| Customer payment authorisation | Stripe PaymentIntents with manual capture | Authorise contributions before booking and capture after success |
| Rail integration | Provider adapter selected through Phase 0 | Live fare search, booking and fulfilment retrieval |
| Notifications | Resend initially | Customer match and booking notifications |
| Testing | Vitest or Jest plus Playwright | Unit, integration and end-to-end coverage |
| Local development services | Docker Compose | PostgreSQL and Redis |
| Deployment | Vercel plus managed API/PostgreSQL/Redis hosting | Prototype deployment path |

## Architecture decision

The initial platform should be a **modular monolith** with a worker process, not a collection of microservices.

The early technical risk is not service scaling. It is:

- obtaining usable live rail retail access;
- executing a reliable booking workflow;
- receiving ticket fulfilment;
- coordinating two authorised customer payments around one rail purchase.

A modular monolith allows these risks to be addressed quickly while retaining clean domain boundaries.

## Proposed repository structure

```text
the-new-saas/
├── apps/
│   ├── web/                         # Next.js customer and admin application
│   ├── api/                         # NestJS API
│   └── worker/                      # BullMQ asynchronous workflow processor
├── packages/
│   ├── database/                    # Prisma schema and migrations
│   ├── shared-types/                # DTOs, enums and domain contracts
│   ├── ui/                          # Shared UI components
│   └── integrations/
│       ├── rail/                    # Rail retail provider adapter contracts
│       └── payments/                # Stripe provider adapter
├── docs/
│   ├── architecture.md
│   ├── product-flow.md
│   ├── rail-integration-spike.md
│   ├── payment-orchestration.md
│   └── api-contracts.md
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

## Core backend modules

```text
AuthModule
UserModule
StationModule
JourneyRequestModule
MatchingModule
FareQuoteModule
PaymentModule
RailBookingModule
TicketFulfilmentModule
NotificationModule
AdminModule
AuditModule
```

## Core domain model

| Entity | Responsibility |
| --- | --- |
| `User` | Customer identity, authentication and contact details |
| `Station` | Origin and destination station reference data |
| `JourneyRequest` | One user's requested one-way rail journey |
| `Match` | Proposed or confirmed pairing of inverse journey requests |
| `MatchParticipant` | Each matched user's contribution, acceptance and payment state |
| `FareQuote` | Live rail return-fare quote, restrictions and provider expiry |
| `PaymentAuthorisation` | User contribution authorisation, capture and cancellation state |
| `BookingOrder` | Rail purchase attempt and provider booking reference |
| `TicketFulfilment` | Ticket artefact received from the rail provider |
| `JourneyLegAllocation` | Future allocation of a permitted journey credential to a matched user |
| `Notification` | Customer communication record |
| `AuditEvent` | Immutable trace of business and integration state transitions |

## Match lifecycle

```text
SEARCHING
→ MATCH_PROPOSED
→ AWAITING_ACCEPTANCE
→ AWAITING_AUTHORISATIONS
→ FULLY_AUTHORISED
→ PURCHASING_TICKET
→ TICKET_PURCHASED
→ FULFILMENT_RECEIVED
→ PAYMENTS_CAPTURED
→ COMPLETED
```

Failure and termination states:

```text
EXPIRED
DECLINED
AUTHORISATION_FAILED
FARE_CHANGED
BOOKING_FAILED
FULFILMENT_FAILED
PAYMENT_CAPTURE_FAILED
CANCELLED
```

## Integration adapter contracts

The application should depend on provider contracts rather than binding the business logic directly to one external supplier.

```ts
interface RailRetailProvider {
  searchReturnFares(
    request: ReturnFareSearchRequest,
  ): Promise<ReturnFareQuote[]>;

  createBooking(
    request: CreateRailBookingRequest,
  ): Promise<RailBookingReservation>;

  completeBooking(
    request: CompleteRailBookingRequest,
  ): Promise<RailBookingConfirmation>;

  retrieveFulfilment(
    bookingReference: string,
  ): Promise<TicketFulfilment>;
}

type TicketFulfilment =
  | {
      type: 'ETICKET';
      barcodeData: string;
      documentUrl?: string;
    }
  | {
      type: 'PDF';
      documentUrl: string;
    }
  | {
      type: 'MOBILE_REFERENCE';
      reference: string;
    }
  | {
      type: 'COLLECTION_REFERENCE';
      reference: string;
    };
```

```ts
interface PaymentProvider {
  authoriseContribution(
    request: AuthoriseContributionRequest,
  ): Promise<PaymentAuthorisationResult>;

  captureAuthorisation(
    authorisationReference: string,
  ): Promise<PaymentCaptureResult>;

  cancelAuthorisation(
    authorisationReference: string,
  ): Promise<PaymentCancellationResult>;
}
```

## External API and provider discovery notes

## Payment integration: Stripe

### Purpose

Stripe is the initial candidate for customer payment authorisation because it supports separating payment authorisation from capture.

The intended flow is:

```text
Create payment authorisation for User A
Create payment authorisation for User B
Wait until both are authorised
Purchase rail ticket
Capture both authorised payments
```

### Development access

- Create a Stripe developer account.
- Use Stripe Test Mode during development.
- Use test payment methods and webhook events.
- Use PaymentIntents with manual capture for eligible payment methods.

### Starting documentation

- Stripe Payments: <https://stripe.com/payments>
- Manual capture / payment holds: <https://docs.stripe.com/payments/place-a-hold-on-a-payment-method>
- PaymentIntent API: <https://docs.stripe.com/api/payment_intents>

### Required implementation checks

- authorised amount;
- capture deadline;
- authorisation state;
- cancellation/release flow;
- webhook signature verification;
- idempotency keys for booking-linked payment operations;
- reconciliation where rail booking succeeds but payment capture does not.

## Live rail retail integration

### Required capability

The chosen rail provider route must support, directly or through approved onboarding:

```text
Station search
Live UK rail fare search
Return-ticket product selection
Booking creation
Ticket purchase or settlement workflow
Booking confirmation
Ticket fulfilment retrieval
Development, certification or controlled-live testing route
```

### Important distinction

```text
Timetable or open rail data access is not the same as ticket retail access.
```

A provider is suitable for Phase 0 only where it enables the platform to purchase or issue a valid rail ticket and retrieve the resulting fulfilment artefact.

## Candidate rail provider and access routes

| Candidate route | Why investigate it | What must be confirmed |
| --- | --- | --- |
| SilverRail | Rail commerce and distribution technology provider | UK National Rail fare search, booking, fulfilment, sandbox or partner onboarding |
| Trainline commercial or partner route | Evidence that digital UK ticket retailing and digital ticket fulfilment operate at scale | Whether an API/partner integration is available for third-party product embedding |
| Rail Delivery Group / Rail Settlement Plan pathway | Industry route relevant to third-party retailing, settlement and ticket issuing | Accreditation, settlement and production retail requirements |
| Rail Data Marketplace | Supporting rail datasets and API discovery | Useful operational/reference data only unless a retail-capable product is identified |

### Starting points

- SilverRail: <https://www.silverrailtech.com/>
- Trainline Business retail example: <https://www.thetrainline.com/business>
- Rail Delivery Group: <https://www.raildeliverygroup.com/>
- Rail Data Marketplace: <https://raildata.org.uk/>

### Provider selection questions

Before implementation against any rail provider, confirm:

| Question | Why it matters |
| --- | --- |
| Is there a sandbox, certification environment or controlled-live integration route? | Determines how the proof of concept can be tested |
| Can the integration search UK National Rail return fares? | Required for the product proposition |
| Can it purchase an Anytime Day Return or a comparable flexible return product? | Keeps initial matching practical |
| What fulfilment artefact is returned after purchase? | Determines secure ticket storage and display |
| Can the provider reserve a fare or booking before final purchase? | Affects payment orchestration |
| Who is merchant of record? | Affects settlement, accounting and refund ownership |
| How is the rail booking funded or settled? | Determines how customer Stripe authorisations relate to rail purchase |
| What requirements apply to production third-party retailing? | Defines route from POC to live operation |
| What agreement would permit later delivery of journey credentials to separate matched travellers? | Defines the deferred feature boundary |

## Security and operational requirements

The application will process customer identities, payment references and rail ticket artefacts. The initial implementation should therefore include:

- role-based access for admin functionality;
- encrypted secret management;
- secure storage for ticket fulfilment data;
- no storage of raw customer card details;
- Stripe webhook signature verification;
- provider request/response redaction in logs;
- immutable audit events for booking and payment transitions;
- idempotent payment and booking actions;
- database transaction protection against duplicate matching;
- retry-safe fulfilment retrieval;
- operational escalation for capture or fulfilment failures.

## Critical failure scenarios

| Scenario | Expected handling |
| --- | --- |
| No inverse journey request exists | Keep journey request open until expiry or cancellation |
| One user does not accept before expiry | Expire match and return the other request to searchable state |
| One payment authorises but the other fails | Cancel the successful authorisation and cancel the match |
| Fare changes before booking | Present revised offer or cancel and release funds |
| Fare becomes unavailable | Cancel booking attempt and release both authorisations |
| Rail booking fails | Release both authorisations and record provider failure |
| Booking succeeds but fulfilment retrieval is delayed | Persist booking reference and retry fulfilment retrieval safely |
| Payment capture fails after successful rail purchase | Flag for operations and preserve a complete audit trail |
| Two workers try to allocate the same request | Prevent through database transaction and uniqueness constraints |
| Ticket artefact is exposed incorrectly | Restrict access, log reads and rotate/reissue only where provider supports it |

## Prototype success measures

The proof of concept should be judged against these outcomes:

### Rail integration measures

- developer, sandbox or controlled-live provider route identified;
- successful live return-fare search;
- successful real ticket purchase;
- successful receipt and secure storage of fulfilment artefact;
- documented provider settlement and production-access requirements.

### Marketplace measures

- journey requests submitted per route;
- inverse-route match rate;
- average quoted saving per matched traveller;
- acceptance rate;
- payment authorisation rate;
- booking success rate;
- fulfilment success rate;
- unmatched demand by route and time window;
- evidence that savings increase willingness to use rail.

## Immediate implementation order

1. Create `docs/rail-integration-spike.md`.
2. Investigate live UK rail retail integration routes and document access requirements.
3. Select the first provider capable of live return-ticket booking and fulfilment retrieval.
4. Scaffold the TypeScript monorepo, database, API, worker and admin web application.
5. Build `/admin/rail-poc`.
6. Complete one live return-ticket search, purchase and fulfilment retrieval through the selected integration.
7. Build customer journey request submission.
8. Implement inverse-route matching using live fare quotation.
9. Add Stripe Test Mode authorisation and capture orchestration.
10. Add operational reporting, audit trails and recovery workflows.
11. Pursue the required provider and regulatory agreement for approved separate journey-credential delivery.

## Current status

```text
Status: Planning
Repository purpose: Technical proof of concept for Sell My Return
First engineering milestone: Live UK rail return-ticket purchase and fulfilment retrieval
Deferred commercial feature: Separate delivery of outward and return credentials to matched travellers
```
````
