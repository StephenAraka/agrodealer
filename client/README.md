Agro Dealer Portal client built with Next.js (App Router) and Tailwind CSS.

## Run locally

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The root route redirects to `/auth/login`.

## Current routes

- `/auth/login`
- `/dashboard`
- `/dashboard/overview`
- `/transactions`
- `/transactions/[transactionId]`
- `/reports`
- `/reports/monthly`

## Theme colors

Tailwind theme colors are configured in `tailwind.config.mjs`:

- `bg`
- `primaryYellow`
- `white`
- `textGray`
- `textGreen`
- `borderGray`
- `textBlack`
