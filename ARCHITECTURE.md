# Architecture & Decisions Log

This document records the key architectural decisions made for the Financial
Management project, so they aren't lost between sessions. Update it whenever
a significant decision is made or changed.

## Tech stack

- **Runtime:** Node.js (ES Modules — `"type": "module"` in `package.json`)
- **Framework:** Express
- **Database:** PostgreSQL, accessed via `pg` (raw SQL, no ORM — deliberate
  choice, see "Why no ORM" below)
- **Validation:** Zod
- **Testing:** Vitest
- **Dev tooling:** nodemon (auto-restart), dotenv (env vars)

## Why no ORM

Raw `pg` + hand-written SQL was chosen over an ORM (e.g. Prisma) deliberately,
for two reasons:
1. Learning goal — the project is being built to deeply understand SQL and
   backend fundamentals, not to abstract them away.
2. The debt overflow logic needs multi-step, transactional writes
   (`BEGIN`/`COMMIT`/`ROLLBACK`) that are natural in raw SQL and don't gain
   much from an ORM layer.

This can be revisited later once fundamentals are solid.

## Project structure

```
financial-management/
├── migrations/              # Sequential .sql files, run manually via psql -f
├── src/
│   ├── config/
│   │   └── db.js            # pg Pool, single source of DB connection
│   ├── controllers/         # HTTP request/response handling, no SQL here
│   ├── errors/
│   │   └── AppError.js      # Custom error classes (NotFoundError, etc.)
│   ├── middleware/
│   │   ├── asyncHandler.js  # Wraps async controllers, forwards errors to next()
│   │   └── errorHandler.js  # Centralized error -> HTTP response translation
│   ├── routes/               # Express routers, one file per resource
│   ├── services/             # All SQL/business logic lives here
│   └── validators/           # Zod schemas, one per resource
├── server.js                 # App entry point, mounts everything
└── .env / .env.example
```

**Layering rule:** routes → controllers → services → database. Controllers
never write SQL directly; services never touch `req`/`res`. Validation
happens in the controller (via a Zod schema imported from `validators/`)
before calling the service.

## Error handling pattern

- Services `throw` plain `Error` or custom `AppError` subclasses
  (`NotFoundError` → 404, `ConflictError` → 409, `ValidationError` → 400).
- Controllers are wrapped in `asyncHandler`, so they never need `try/catch` —
  they just `throw` and Express routes it to `errorHandler.js`.
- `errorHandler.js` is the **single place** that:
  - Formats `AppError` instances into `{ error, details? }` JSON with the
    right status code.
  - Translates known Postgres error codes (`23503` FK violation, `23505`
    unique violation) into appropriate HTTP responses — distinguishing
    INSERT-blocked (400, referencing something that doesn't exist) from
    DELETE-blocked (409, still referenced by other rows) via `req.method`.
  - Falls back to a generic 500 + server-side `console.error` for anything
    unexpected.

## Database schema (high level)

7 tables, in migration order:
1. `categories` — income/expense categories
2. `installment_purchases` — parent record for credit-card-style split purchases
3. `debt_groups` — the consolidated-debt "umbrella" (fixed monthly payment,
   linked to a category)
4. `sub_debts` — individual items within a debt group; tracks
   `remaining_amount` and `status`
5. `debt_payments` — one row per monthly payment event against a debt group
6. `debt_payment_allocations` — itemized audit trail of how each payment was
   split across sub-debts (this is what makes the overflow logic provable)
7. `transactions` — the single ledger; every real money movement (plain
   transactions, individual installment occurrences, individual debt
   payments) lives here, linked back via nullable FKs
   (`installment_purchase_id`, `debt_payment_id`)

**Design rule:** transactions derived from installments or debt payments
(non-null `installment_purchase_id` / `debt_payment_id`) cannot be edited or
deleted directly via the API — they're system-managed to prevent desyncing
their parent records. Plain transactions are freely editable.

## The overflow payment algorithm

Lives as a **pure function** in `src/services/overflow-algorithm.js`
(`calculateOverflowAllocation`), deliberately separated from any database
code so it's independently unit-testable. Given a total payment and a list
of active sub-debts, it iteratively:
1. Splits the remaining payment equally across still-active sub-debts.
2. Closes out (pays exactly what's owed) any sub-debt whose remaining
   balance is ≤ its equal share.
3. Recalculates the equal share for the smaller pool and repeats, allowing
   a single payment to cascade through multiple payoffs in one pass.

`src/services/debt-payments.service.js` wraps this pure function in a
database transaction: fetch active sub-debts → run the algorithm → insert
`debt_payments` + `debt_payment_allocations` rows → update `sub_debts` →
insert a summary `transactions` row, all atomically.

Covered by unit tests in `overflow-algorithm.test.js` (simple split,
single close-out with overflow, multi-debt cascade, exact final payoff).

## Multi-machine development

This project has been developed across two local machines (desktop +
notebook), each running its own independent PostgreSQL instance during
development. Schema changes are made in the migration files and re-run
manually on each machine (`psql -f migrations/00X_....sql`). `.env` is
gitignored and configured independently per machine (ports, credentials
may differ between them).

**This local dual-database setup is temporary** — see Hosting Plan below
for the long-term direction, which consolidates to a single database.

## Hosting plan (decided, not yet implemented)

**Goal:** the user travels frequently and wants data reliably synced across
desktop, notebook, and eventually phone — from anywhere, not just the home
network.

**Decision:**
- **Single backend, not one per device.** A cheap cloud VPS
  (~$5/mo, e.g. DigitalOcean/Hetzner) will run the one true PostgreSQL
  instance and the one true Express API. All devices become clients of this
  single backend — the current per-machine local databases will be retired.
- **Access via Tailscale, not public exposure.** The VPS will have Tailscale
  installed, as will every client device (desktop, notebook, phone). The API
  is reached over the private Tailscale network (its Tailscale IP), never
  through a public port. This was chosen over traditional public hosting
  (domain + HTTPS + public login) because it avoids almost the entire
  "public internet attack surface" problem for a single-user financial app,
  at no cost.
- **Lightweight authentication will still be added** on top of the Tailscale
  network as defense-in-depth (not yet implemented / not yet designed in
  detail).
- **Frontend hosting:** the same Express server on the VPS will serve the
  frontend's static files alongside the JSON API (Option A from our
  discussion) — one process, one deployment, reached the same way via
  Tailscale from any device's browser. This was chosen over hosting the
  frontend separately (e.g. on Vercel/Netlify) since that split would add
  complexity with no real benefit for a single-user app where the API isn't
  publicly reachable anyway.

**Not yet done:** VPS provisioning, Tailscale setup, migrating the schema
and data to the VPS, pointing both local machines' `.env` at the VPS's
Tailscale IP, decommissioning the local databases, implementing auth. This
is deliberately deferred until the API surface (and later, the frontend) is
more complete, to avoid paying for hosting before it's needed.

## CORS

Currently configured permissively (`cors()` with no options — allows any
origin). This is intentional for now, since nothing is publicly exposed yet.
**Must be revisited and restricted** to the actual frontend's origin once
hosting is set up.

## Testing strategy

- **Unit tests** (Vitest): pure logic only so far — the overflow algorithm.
  No DB dependency, fast, run via `npm test`.
- **Manual integration testing**: done throughout via `curl`/Insomnia against
  a real local database, verifying full request→response→DB round trips,
  including transaction rollback behavior.
- **Not yet done:** automated integration tests against a real (test)
  database for the service layer (installments, debt payments). Deferred —
  needs a dedicated test database setup.

## Open / deferred items

- `PUT`/`PATCH`/`DELETE` for installments and debt groups (currently
  create/read only — intentionally deferred, since "editing" these has
  tricky semantics around already-generated derived data)
- Service-layer integration tests with a dedicated test database
- Authentication implementation
- VPS provisioning + Tailscale setup + data migration to single source of truth
- CORS restriction once hosting/frontend origin is known
- Frontend (next phase, starting now)
