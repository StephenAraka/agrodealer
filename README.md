# Agro Dealer Portal

A web portal for agro dealers to browse products, manage their wallet, make purchases, and view transaction history and receipts. Built for a bank-backed agro-finance use case.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) | File-based routing, server components by default, excellent DX |
| **Styling** | Tailwind CSS v4 | Utility-first keeps styles co-located; theme tokens enforce brand consistency |
| **UI font** | Poppins via `next/font` | Matches design system; loaded once, no CLS |
| **Backend** | Express 5 | Minimal, well-understood, fast to iterate |
| **Database** | PostgreSQL (local or Neon) | Relational integrity for transactions and wallets; Neon removes infra setup for dev |
| **Auth** | JWT + bcrypt | Stateless tokens fit a REST API; bcrypt is the safe choice for password hashing |
| **Validation** | Joi (server) + pure functions (client) | Joi provides declarative schema rules server-side; client validators are pure and reusable across forms |

---

## Running the project

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # fill in your DB credentials and JWT_SECRET
npm run dev            # nodemon → http://localhost:5001
```

**Database options:**

- **Local PostgreSQL** — set `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PORT`, `DB_PASSWORD`, `DB_SSL=false`
- **Neon (recommended for quick start)** — set `DATABASE_URL` (from your Neon project dashboard) and `DB_SSL=true`. No local Postgres installation needed.

See [`server/README.md`](server/README.md) for full env templates and API reference.

### 2. Frontend

```bash
cd client
npm install
npm run dev   # http://localhost:3000  →  redirects to /auth/login
```

Create `client/.env.local` and point it at the backend:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api
```

See [`client/README.md`](client/README.md) for architecture details, design tokens, and component decisions.

---

## Features to improve

- **Reports page** — currently a placeholder; needs charts, date filters, and export to CSV/PDF
- **Receipt design** — receipt HTML is functional but unstyled; a proper print layout with branding would improve the dealer experience
- **OTP delivery** — OTPs are returned in the API response for demo purposes; real deployment needs SMS integration (e.g. Africa's Talking, Twilio)
- **Role-based access** — currently single-role; a dealer/admin split would allow back-office product and user management
- **Offline support** — a PWA shell with cached product data would help dealers in low-connectivity environments
