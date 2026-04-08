# Agro Dealer Portal — Client

Next.js 16 (App Router) + Tailwind CSS v4 frontend for the Agro Dealer Portal.

## Getting started

```bash
npm install
npm run dev   # http://localhost:3000  →  redirects to /auth/login
npm run build
npm run lint
```

---

## Project structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/               #   login, register
│   ├── dashboard/          #   overview, buy
│   ├── transactions/       #   listing, [transactionId] detail
│   └── reports/
├── components/
│   ├── shared/             # Primitive, reusable UI (Button, TextInput, DropdownSelect, SuccessModal)
│   └── global/             # App-level composed components (AuthSplitLayout, LoginHelpForm, DashboardShell, PaymentSuccessModal)
└── lib/
    ├── api/                # Typed fetch wrappers (auth.ts, dashboard.ts, client.ts)
    ├── validators/         # Pure validation functions (auth.ts)
    ├── session.ts          # Token read/write helpers
    └── toast.ts            # Centralised toast wrapper
```

---

## Architecture decisions

### Next.js App Router
Pages are server components by default; only components that need state or browser APIs are marked `"use client"`. This keeps the JS bundle small and lets the server handle as much rendering as possible.

### Component separation: `shared` vs `global`

| Layer | Purpose | Examples |
|---|---|---|
| `shared/` | Single-responsibility primitives. No business logic. Fully reusable across any project. | `Button`, `TextInput`, `DropdownSelect` |
| `global/` | App-specific composed components that assemble shared primitives with domain layout or state. | `AuthSplitLayout`, `LoginHelpForm`, `DashboardShell` |

**Why this matters:** Shared components can be changed in one place and the effect propagates everywhere. They are tested and understood in isolation. Global components express business intent and are where state lives, keeping pages thin and declarative.

### Validation layer (`lib/validators/`)
All validation is pure functions that return an error string or `""`. They are imported both by form components (for inline errors) and can be reused in API layer tests. No validation is duplicated between pages.

### API layer (`lib/api/`)
All server calls go through typed fetch wrappers in `lib/api/`. Pages and components never call `fetch` directly. This centralises base URL, auth headers, and error normalisation.

### Tailwind configuration (`tailwind.config.mjs`)
Brand colours and character-style font sizes are defined once in the theme and referenced by name everywhere (`text-textGreen`, `bg-primaryYellow`, `text-cs-37`). Changing a colour updates every usage.

---

## Design tokens

### Colours

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#FCFCFC` | Page background |
| `primaryYellow` | `#E8B40A` | Primary action buttons, highlights |
| `textGreen` | `#009438` | Headings, brand accent |
| `textBlack` | `#272935` | Default body text |
| `textGray` | `#707070` | Labels, secondary text |
| `borderGray` | `#00000029` | Subtle borders, card edges |
| `white` | `#FFFFFF` | Card surfaces |

### Typography (character styles)

| Class | Font | Size | Weight | Colour |
|---|---|---|---|---|
| `.cs-futura-bold-37` | Futura → Poppins | 37px | 700 | `textGreen` |
| `.cs-poppins-bold-15` | Poppins | 15px | 700 | white |
| `.cs-poppins-semibold-16` | Poppins | 16px | 600 | `textGray` |
| `.cs-poppins-medium-20` | Poppins | 20px | 500 | `textGray` |
| `.cs-poppins-semibold-13` | Poppins | 13px | 600 | `textGray` |
| `.cs-poppins-bold-13` | Poppins | 13px | 700 | `primaryYellow` |
| `.cs-poppins-regular-13` | Poppins | 13px | 400 | `textGray` |
| `.cs-poppins-semibold-11` | Poppins | 11px | 600 | `textBlack` |

Futura is not available on Google Fonts; the stack falls back to Poppins (loaded via `next/font`) on devices without it.

---

## Accessibility

Accessibility is treated as a first-class concern, not an afterthought.

**Colour contrast**
`textBlack` (`#272935`) on `white` (`#FFFFFF`) and `textGreen` (`#009438`) on white both exceed WCAG AA contrast ratios. `primaryYellow` is only used for icons and text (not as a background for body copy) to stay within contrast limits.

**Semantic HTML**
Pages use correct landmark elements: `<main>` wraps page content, `<form>` wraps all inputs, labels are bound to inputs with matching `id`/`htmlFor`, and heading levels follow a logical hierarchy (`h1` → `p`).

**ARIA**
Decorative images are marked with descriptive `alt` text; purely decorative elements use `aria-hidden="true"` (e.g. the chevron icon inside the Continue button, the decorative leaf overlay). Disabled buttons expose their state natively via the HTML `disabled` attribute — no ARIA needed.

**Focus management**
All interactive elements are keyboard-reachable. A global `focus-visible` ring using `textGreen` is defined in `globals.css` and applies consistently to inputs, buttons, and links without being distracting during mouse use.

**Form validation**
Validation uses `noValidate` on forms so browser defaults are suppressed and our own accessible inline errors (rendered as `<p>` below each field) are shown instead. Error messages are always associated with their field by proximity in the DOM.

---

## Routes

| Route | Description |
|---|---|
| `/` | Redirects to `/auth/login` |
| `/auth/login` | Username → password two-step sign-in with help flow |
| `/auth/register` | New account registration |
| `/dashboard` | Dashboard landing |
| `/dashboard/overview` | Dashboard overview child page |
| `/dashboard/buy` | Purchase flow |
| `/transactions` | Transaction listing |
| `/transactions/[transactionId]` | Transaction detail (dynamic) |
| `/reports` | Reports landing |
| `/reports/monthly` | Monthly report child page |
