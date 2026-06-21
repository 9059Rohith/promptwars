# Architecture

CarbonWise is a single Next.js (App Router) application that serves both the UI
and a REST API, backed by MongoDB via Prisma.

## Layers

```
┌─────────────────────────────────────────────────────────┐
│  UI (src/app/(app)/*, src/components/*)                   │  client + server components
├─────────────────────────────────────────────────────────┤
│  REST API (src/app/api/*)                                 │  route handlers
├─────────────────────────────────────────────────────────┤
│  Domain services (src/lib/*)                              │  pure, framework-agnostic
│  emissions · scoring · analytics · prediction ·           │
│  achievements · gamification · notifications · ai         │
├─────────────────────────────────────────────────────────┤
│  Infrastructure (src/lib/*)                               │
│  prisma · auth (jose/bcrypt) · rate-limit · logger ·      │
│  validation (zod) · api helpers                           │
├─────────────────────────────────────────────────────────┤
│  Prisma ORM → MongoDB Atlas                               │
└─────────────────────────────────────────────────────────┘
```

## Key principles

- **Pure domain core.** Everything in `src/lib` that computes (emissions,
  scoring, analytics, prediction, notifications, the AI rules engine) is a pure
  function with no I/O — which is why it's covered by fast unit tests and could
  be lifted into an Express service unchanged.
- **Validation at the edge.** Every mutating route parses its body with a Zod
  schema (`src/lib/validation.ts`) before touching the database.
- **Centralised error handling.** Route handlers wrap logic in `try/catch` and
  delegate to `handleError`, which maps `AuthError`/`ZodError`/unknown to the
  right status codes and logs via the structured `logger`.
- **Stateless auth.** A signed JWT (jose, HS256) is stored in an httpOnly,
  SameSite cookie; `middleware.ts` guards protected routes; bcrypt hashes
  passwords with cost 12.
- **Graceful degradation.** The AI coach falls back to a deterministic rules
  engine when no LLM key is configured, so no feature hard-depends on a third
  party.

## Request lifecycle (mutating example: log activity)

1. `POST /api/activities` → rate-limit check → `requireSession()`
2. Zod `activitySchema` validates the body
3. `calculateCO2` (domain) computes emissions from the factor table
4. Prisma persists the activity; XP/streak updated; `syncAchievements` runs
5. `{ activity, newBadges }` returned; client refreshes

## Data model

`User 1—* Activity`, `User 1—* Goal`, `User 1—* Achievement`
(see `prisma/schema.prisma`). Achievements are unique per `(userId, code)`.

## Testing

`npm run verify` runs ESLint, `tsc --noEmit`, and the Vitest suite. The pure
domain layer is exhaustively unit-tested (`tests/*`). CI runs the same gates on
every push (`.github/workflows/ci.yml`).
