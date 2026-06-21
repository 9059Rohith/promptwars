# 🌍 CarbonWise — Carbon Footprint Awareness Platform

> Measure, understand, and reduce your everyday CO₂ emissions. A personal carbon tracker — like a fitness tracker, but for the planet.

CarbonWise turns everyday activities (driving, electricity, food, shopping, waste) into actionable **CO₂e** insights, then coaches you toward a greener lifestyle with analytics, goals, gamification, and an AI sustainability coach.

---

## ✨ Features

| Area | What you get |
|------|--------------|
| **Carbon Calculator** | Realistic emission factors across Transport, Electricity, Food, Shopping & Waste with a live estimate as you type |
| **Dashboard** | Carbon score, daily/weekly/monthly/yearly emissions, trees-to-offset, green streak, sustainability level + interactive charts |
| **Analytics** | Pie chart, 30-day line trend, 8-week bar trend, category breakdown, top emission source |
| **Activity Logger** | Full emission history grouped by day, with delete |
| **AI Sustainability Coach** | Personalised, **quantified** reduction tips. Uses OpenAI/Gemini when a key is set, otherwise a built-in deterministic rules engine (works fully offline) |
| **Goals** | Create % reduction goals with live progress bars |
| **Gamification** | XP, levels, daily streaks, and 8 unlockable badges |
| **Leaderboard** | Users ranked by carbon score & XP |
| **Tree Offset** | Trees needed to offset your annual emissions |
| **Reports** | Print-to-PDF report + CSV export |
| **Eco Map** | Leaflet + OpenStreetMap showing nearby recycling, EV charging, transit & green spaces |
| **UX** | Dark/Light mode, responsive, WCAG-minded (skip link, ARIA, focus rings, reduced-motion), PWA manifest |

---

## 🧱 Tech Stack

- **Framework:** Next.js (App Router) + React 19 + TypeScript
- **Styling:** TailwindCSS v4, custom design tokens, dark mode via `next-themes`
- **Charts:** Recharts
- **Validation:** Zod (shared client + server)
- **Backend:** Next.js Route Handlers (REST API)
- **Database:** Prisma ORM + MongoDB Atlas
- **Auth:** JWT (httpOnly cookie via `jose`) + bcrypt password hashing + route middleware
- **AI:** Groq (Llama 3.3 70B) — OpenAI/Gemini also supported; offline rules-engine fallback
- **Maps:** Leaflet + OpenStreetMap
- **Testing:** Vitest
- **Deploy:** Vercel / Docker

> **Architecture note:** The REST API is implemented with Next.js Route Handlers rather than a separate Express server, so the whole app deploys as one unit. The logic is cleanly separated into `src/lib/*` services (emissions, scoring, analytics, gamification, auth, ai) that an Express server could call verbatim if you prefer to split them out.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env        # set DATABASE_URL (MongoDB Atlas), JWT_SECRET, GROQ_API_KEY

# 3. Set up the database + demo data
npm run setup               # prisma generate + db push + seed

# 4. Run
npm run dev                 # http://localhost:3000
```

**Demo login (after seeding):** `demo@carbonwise.app` / `password123`

> **MongoDB Atlas:** make sure your cluster's **Network Access** allows your IP
> (use `0.0.0.0/0` to allow anywhere for hackathon/demo), and the connection
> string includes a database name (`/carbonwise`).

### Other scripts

```bash
npm run build      # prisma generate + production build
npm start          # run production build
npm test           # unit tests (Vitest)
npm run db:studio  # open Prisma Studio
npm run db:seed    # reseed demo data
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | MongoDB Atlas connection string (with `/carbonwise` db name) |
| `JWT_SECRET` | ✅ | ≥16 char random string for signing sessions |
| `GROQ_API_KEY` | optional | Enables Groq (Llama 3.3) AI coach |
| `OPENAI_API_KEY` | optional | Enables GPT-powered coach |
| `GEMINI_API_KEY` | optional | Enables Gemini-powered coach |

Without any AI key the coach automatically uses the offline rules engine — **no feature breaks**.

---

## 📡 API Reference

All endpoints live under `/api`. Auth is via the `cw_token` httpOnly cookie. Responses are `{ data }` on success or `{ error, details? }` on failure.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Create account `{ name, email, password }` |
| `POST` | `/api/auth/login` | Log in `{ email, password }` |
| `POST` | `/api/auth/logout` | Clear session |
| `GET` | `/api/auth/me` | Current user + level |
| `GET` | `/api/activities` | List activities |
| `POST` | `/api/activities` | Log activity `{ category, subtype, amount, date?, note? }` |
| `DELETE` | `/api/activities/:id` | Delete activity |
| `GET` | `/api/stats` | Dashboard payload (analytics, score, level, badges) |
| `GET` / `POST` | `/api/goals` | List / create reduction goals |
| `POST` | `/api/coach` | AI/rules recommendations `{ question? }` |
| `GET` | `/api/leaderboard` | Ranked users |

Security: input validation (Zod), per-route rate limiting, bcrypt hashing, JWT sessions, secure HTTP headers (`next.config.ts`), parameterised queries via Prisma (SQL-injection safe), httpOnly + SameSite cookies.

---

## 📁 Folder Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated shell (sidebar layout)
│   │   ├── dashboard/  calculator/  activities/  analytics/
│   │   ├── goals/  achievements/  coach/  leaderboard/
│   │   ├── report/  map/  profile/
│   │   └── layout.tsx
│   ├── api/                # REST route handlers
│   │   ├── auth/  activities/  goals/  stats/  coach/  leaderboard/
│   ├── login/  signup/     # Public auth pages
│   ├── layout.tsx  page.tsx (landing)  globals.css
│   └── middleware.ts        # Route protection
├── components/             # UI primitives, charts, nav, theme, map, auth form
└── lib/                    # Domain + infra services
    ├── emissions.ts        # Emission factors & CO₂ math
    ├── scoring.ts          # Carbon score, levels, XP
    ├── analytics.ts        # Aggregation engine
    ├── achievements.ts     # Badge definitions & evaluation
    ├── gamification.ts     # Achievement sync
    ├── ai.ts               # Rules engine + LLM coach
    ├── auth.ts  prisma.ts  validation.ts  rate-limit.ts  api.ts  utils.ts
prisma/                     # schema.prisma + seed.ts
tests/                      # Vitest unit tests
```

---

## 🚢 Deployment

### Vercel (recommended)
1. Push to GitHub and import into Vercel.
2. Add env vars: `DATABASE_URL` (MongoDB Atlas), `JWT_SECRET`, `GROQ_API_KEY`.
3. Build command `npm run build` runs `prisma generate` automatically. Run
   `npm run db:push` and `npm run db:seed` once locally to initialise the DB.
4. In Atlas → Network Access, allow `0.0.0.0/0` so Vercel's servers can connect.

### Docker
```bash
docker compose up --build      # http://localhost:3000
```

### Render / Railway
Use the included `Dockerfile`, set the env vars, expose port 3000.

---

## 🧪 Emission Factors

Factors (kg CO₂e/unit) are realistic mid-range estimates drawn from UK DEFRA 2023 conversion factors, IPCC AR6, and EPA averages. Exact values vary by region/methodology — see `src/lib/emissions.ts`. A mature tree is assumed to absorb ~21 kg CO₂/year.

---

## 📸 Screenshots

_Add screenshots of the Dashboard, Calculator, Analytics, and Report pages here._

| Dashboard | Calculator | Analytics |
|-----------|-----------|-----------|
| _placeholder_ | _placeholder_ | _placeholder_ |

---

## 📄 License

MIT — built for learning & hackathons. 🌱
