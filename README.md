# Satoshi Galaxy — Nostr Marketing Platform (Frontend)

A production-ready **B2B control panel** for the Nostr Marketing Platform MVP: companies in the
Bitcoin ecosystem run automated, contextual promotional campaigns on Nostr — discovering relevant
users, sending **zaps**, and publishing **AI-crafted comments**, all from one dashboard.

Built to the **"Satoshi Galaxy B2B"** art direction: deep-space backdrop, dark glassmorphism panels,
galactic-green (success) and lightning-amber (zaps) neon accents, and a calm, data-first layout.

> Frontend for the FastAPI backend described in `backend-design.md` / OpenAPI `0.1.0`.

---

## ✨ Tech stack

| Concern            | Choice                                                            |
| ------------------ | ----------------------------------------------------------------- |
| Framework          | **Next.js 15** (App Router) + **React 19**                        |
| Language           | **TypeScript** (strict, `noUncheckedIndexedAccess`)               |
| Styling            | **Tailwind CSS** with a custom Satoshi Galaxy design system       |
| Server state       | **TanStack React Query v5**                                       |
| HTTP               | **Axios** with JWT request + 401 response interceptors            |
| Global/auth state  | **Zustand** (persisted JWT, hydration-aware route guards)         |
| UI primitives      | **Radix UI** (Slider, Select, Dialog, Label) styled from scratch  |
| Icons              | **lucide-react**                                                  |

---

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure the API base URL
cp .env.local.example .env.local
#   then edit NEXT_PUBLIC_API_BASE_URL to point at your FastAPI backend
#   (defaults to http://localhost:8000)

# 3. Run the dev server
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # next lint
npm run typecheck  # tsc --noEmit
```

### Environment

| Variable                   | Description                                  | Default                 |
| -------------------------- | -------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the FastAPI backend (no trailing `/`) | `http://localhost:8000` |

---

## 🗂️ Project structure

```text
src/
├── app/
│   ├── (auth)/                  # Public portal (redirects out if logged in)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/             # Authenticated shell (sidebar + topbar + guard)
│   │   ├── dashboard/           # The Observatory — aggregated metrics
│   │   ├── campaigns/           # List · /new (create) · /[id] (detail)
│   │   └── settings/            # Company profile
│   ├── error.tsx                # Global error boundary
│   ├── not-found.tsx
│   ├── layout.tsx               # Fonts, Starfield, Providers
│   ├── providers.tsx            # React Query + session bootstrap + Toaster
│   └── globals.css              # Design tokens + glass utilities
├── components/
│   ├── ui/                      # Button, Input, Card (glass), Slider, Select, Dialog, Toaster…
│   ├── layout/                  # Sidebar, Topbar, Starfield, Logo, AuthShell, PageHeader
│   └── campaigns/               # CampaignForm, KeywordInput, MetricCard, CampaignActions,
│                                #   StatusBadge, CampaignsTable, InteractionsTable
└── lib/
    ├── api/                     # Axios client, endpoint modules, error parser, query keys
    ├── hooks/                   # React Query hooks (auth, campaigns, metrics, company)
    ├── store/                   # Zustand stores (auth, toast)
    ├── types/api.ts             # TypeScript contracts derived from the OpenAPI schema
    ├── constants.ts             # Business rules (zap limits, packages, status metadata)
    └── utils/                   # cn(), sats/date formatting
```

---

## 🖥️ Screens

- **Portal** (`/login`, `/register`) — centered glass panel; register creates the company + first user.
- **The Observatory** (`/dashboard`) — aggregated top-line metrics (sats sent, impacts consumed,
  successful zaps, comments published), a live active-campaign spotlight with progress, and recent campaigns.
- **Campaigns** (`/campaigns`) — filterable table by status.
- **Create campaign** (`/campaigns/new`) — name, description, URL, dynamic **keyword tags**,
  **NWC** secret input, **package** selector (100 / 500 / 1000) and a **zap-amount** slider + input
  (100–5000 sats) with a live budget estimate.
- **Campaign detail** (`/campaigns/[id]`) — the vault: live metrics (polled every 15 s while active),
  impact progress, configuration, lifecycle actions (**Activate / Pause / Resume** with NWC re-validation
  and a wallet **funds test**), and a paginated **interactions** history.

---

## 🔌 API mapping

| Endpoint                              | Where it's used                                  |
| ------------------------------------- | ------------------------------------------------ |
| `POST /auth/register`, `POST /auth/login` | Portal forms (`useRegister`, `useLogin`)     |
| `GET /auth/me`                        | Session bootstrap → Zustand store                |
| `GET /companies/me`, `PATCH /companies/me` | Dashboard header · Settings                 |
| `GET /campaigns`                      | Campaigns list · dashboard recent · aggregation  |
| `POST /campaigns`                     | Create campaign form                             |
| `GET /campaigns/{id}`                 | Campaign detail                                  |
| `POST .../activate · /pause · /resume`| Lifecycle action buttons                         |
| `POST .../test-nwc`                   | "Test wallet" in the activate/resume dialog      |
| `GET .../metrics`                     | Metric cards (per-campaign + aggregated)         |
| `GET .../interactions`               | Paginated interactions table                     |

### Error handling

`lib/api/errors.ts` normalizes every failure into `{ status, message, fieldErrors, isValidation }`.
FastAPI **422** validation payloads are parsed via `detail[].loc` and mapped back onto the exact form
field, so server-side validation surfaces inline. Other statuses fall back to friendly messages, and a
401 on a protected route clears the session and redirects to login. User-facing failures also raise a
themed toast.

---

## 🔐 Security note (JWT storage)

For the MVP the JWT is stored in `localStorage` (via a persisted Zustand store) and attached by the
Axios request interceptor. This is the pragmatic choice for a token returned in a JSON body. For a
hardened deployment, move the token to an **httpOnly, Secure, SameSite cookie** set by a small Next.js
route handler / BFF, and switch the route guards to middleware. The Axios layer is isolated so this
swap touches only `lib/api/client.ts` and `lib/store/auth-store.ts`.

---

## 🎨 Design tokens

Defined in `tailwind.config.ts` + `globals.css`:

- **Surfaces** — `galaxy.900` (`#0B0F19`) → `galaxy.950` deep-space gradient, `.glass` / `.glass-strong` panels.
- **Accents** — `aurora` (galactic green, success/active), `lightning` (amber, zaps/sats),
  `nebula` (violet), `cosmic` (blue, info).
- **Motion** — extremely slow star twinkle, subtle glow pulses, fade-ins. Nothing that distracts from data.

---

Generated with [Claude Code](https://claude.com/claude-code).
