# PactOs — Build Plan

A premium, minimal, enterprise-fintech UI for programmable financial agreements on Stellar. Fully mocked data, no backend, no blockchain calls. Design language: Stripe/Linear/Mercury — trust, whitespace, restrained motion.

## Stack note (important)

Your brief specifies Next.js 15 App Router. This Lovable project runs on **TanStack Start v1 + React 19 + Vite 7 + Tailwind v4 + shadcn/ui**, which is the supported stack here (Next.js is not). All other choices carry over 1:1:

- Framer Motion (motion/react), Lucide, Zustand, Recharts — all installed as needed
- File-based routing under `src/routes/` instead of Next `app/`
- Same component architecture, same visual result

If you need actual Next.js, say so and I'll stop — otherwise I'll proceed on TanStack Start.

## Design System

Tokens defined in `src/styles.css` via `@theme inline` + `:root` / `.dark`, mapped to oklch:

- background `#F8FAFC`, card white, text `#0F172A`, muted `#64748B`
- primary `#0EA5E9`, success `#22C55E`, warning `#F59E0B`
- radius `1rem`, subtle elevation shadows, hero-only gradient token
- Typography: Inter (body) + Instrument Serif (display accents) loaded via `<link>` in `__root.tsx`
- Dark mode variants for every token; theme toggle in top nav (persisted, hydration-safe)
- No hardcoded color utilities in components — semantic tokens only

## Routes

```
src/routes/
  __root.tsx                 # shell, fonts, providers, theme
  index.tsx                  # marketing homepage
  _app.tsx                   # app layout: sidebar + topbar + <Outlet/>
  _app.dashboard.tsx         # dashboard
  _app.agreements.tsx        # list of agreements
  _app.agreements.$id.tsx    # agreement detail + timeline + execute
  _app.builder.tsx           # visual agreement builder
  _app.templates.tsx         # template gallery
  _app.activity.tsx          # activity feed
  _app.analytics.tsx         # charts
  _app.settings.tsx          # settings (basic)
```

Each route sets its own `head()` with unique title/description/OG.

## Homepage (`/`)

- Sticky translucent nav, subtle logo mark
- Hero: display headline "Money should come with instructions.", subhead, primary "Create Agreement" → `/builder`, secondary "Watch Demo" opens execution animation modal
- Right side: animated **Money Flow Visualization** — nodes (Salary → Convert USD→INR → Split → 4 recipients → Completed) with animated dashed connection lines, particles traveling along paths, staggered node reveal (Framer Motion + SVG)
- Features grid (8 cards) with Lucide icons, hover-lift micro-interaction
- Why Stellar infographic: Soroban → Stellar DEX → Anchors → Recipients, animated on scroll
- Footer

## App Shell (`_app`)

- shadcn Sidebar (collapsible=icon): Dashboard, Agreements, Builder, Templates, Activity, Analytics, Settings — active-route highlight via `useRouterState`
- Top bar: search, notifications popover, theme toggle, avatar menu
- `<Outlet/>` inside main; fully responsive (sidebar becomes sheet on mobile)

## Dashboard

- Greeting header ("Good morning, Aditya 👋") with date + quick "New Agreement" CTA
- Stats row: 4 StatCards (Total Volume, Active Agreements, Success Rate, Upcoming Executions) with sparklines
- "Your Financial Agreements" — AgreementCard grid:
  - Family Agreement (Active, progress ring, next-run countdown, 4 recipient avatars, $1,200 monthly)
  - Hackathon Prize Split (Completed, green check)
  - Scholarship (Waiting for Deposit, amber pill)
- Recent Activity preview (5 items) → link to /activity

## Agreement Builder (`/builder`)

The signature page — visual, not a form.

- Left palette: draggable blocks WHEN / THEN / CONVERT / SPLIT / WAIT / IF / APPROVE / ESCROW / RETURN, each with icon + short description
- Canvas: infinite-feeling scrollable area with subtle dot grid. Blocks are rounded cards connected top-to-bottom by animated SVG paths. Add-block "+" affordance between nodes.
- Each block is expandable: click to open inline config (currency selects, percentages with live-sum validation for SPLIT, duration for WAIT, condition for IF)
- Drag to reorder (Framer Motion `Reorder`), delete on hover, duplicate action
- Right panel: agreement metadata (name, description, trigger, recipients), live JSON preview toggle, "Save Draft" + "Execute" buttons
- Prebuilt example pre-loaded matching your Family Agreement spec
- Mobile: canvas becomes vertical stack; palette becomes a bottom sheet

## Templates

Grid of TemplateCards (Family Remittance, Freelancer Escrow, Startup Payroll, Scholarship, NGO Aid, Emergency Fund, Hackathon Prize Split) — each with unique SVG illustration (inline, on-brand, no stock), description, "Use template" button → prefills builder.

## Agreement Detail (`/agreements/$id`)

- Header: name, status pill, cadence, key stats, "Execute Agreement" CTA
- Tabs: Overview · Timeline · Recipients · Activity
- Vertical animated Timeline component (staggered reveal, node icons, timestamps)
- Recipient list with avatars + share % bars
- Danger zone (Pause / Archive) at bottom

## Analytics

Recharts:

- Monthly Volume (area chart)
- Currency Distribution (donut)
- Execution Success Rate (line + KPI)
- Most Used Templates (horizontal bar)
- Recipient Breakdown (stacked bar)

Recharts colors sourced from CSS tokens; empty/loading skeletons.

## Activity Feed

Chronological grouped-by-day list of ActivityCards (icon, title, subtitle, relative time, status pill). Filter chips (All / Executions / Deposits / Payouts / Returns).

## Execution Animation (WOW)

Fullscreen modal (Dialog) triggered from agreement detail or homepage "Watch Demo":

- Cinematic SVG scene: Salary → Agreement Activated → USD → Stellar DEX → INR → Split → 4 recipients (Parents ✓, Education ✓, Emergency ✓, Savings ✓)
- Nodes light up in sequence; animated gradient stroke pulses travel along connectors; particle dots flow between nodes
- Ambient background: soft radial glow, subtle grid, reduced-motion fallback
- Completion card: "Completed Successfully · Executed by Soroban · 2.3s · 4 Recipients · 3 Conversions · 1 Agreement" with confetti-free tasteful check animation

## Reusable Components (`src/components/`)

```
layout/         AppSidebar, TopBar, ThemeToggle
marketing/      Hero, MoneyFlowVisual, FeatureGrid, WhyStellar, Footer
agreements/     AgreementCard, StatusPill, ProgressRing, RecipientAvatars,
                Timeline, TimelineNode, StatCard
builder/        BlockPalette, BuilderCanvas, BuilderBlock, BlockConfig,
                ConnectionLine, JsonPreview
templates/      TemplateCard, TemplateIllustration
activity/       ActivityCard, ActivityFilters
execution/      ExecutionModal, FlowScene, FlowNode, FlowConnector,
                ExecutionSummary
charts/         VolumeArea, CurrencyDonut, SuccessRateLine, TemplatesBar,
                RecipientStack
ui/             (shadcn primitives already present)
```

## State & Data (`src/lib/`)

- `mock/agreements.ts`, `mock/templates.ts`, `mock/activity.ts`, `mock/analytics.ts`, `mock/user.ts` — typed
- Zustand stores: `useAgreementsStore` (CRUD in-memory), `useBuilderStore` (blocks, connections, config), `useUIStore` (theme, sidebar open, active modal)
- `types.ts` — Agreement, Block, Recipient, ExecutionRun, TemplateDef, ActivityEvent
- Designed so a real Stellar/Soroban adapter can slot in behind a single `services/stellar.ts` interface later (mocked now)

## Motion & Micro-interactions

- Framer Motion for card lift, staggered lists, timeline reveals, block drag, connector draw
- Reduced-motion: honor `prefers-reduced-motion` — replace flows with static scenes
- Skeleton loaders on dashboard, analytics, activity

## Responsiveness

- Mobile-first grid utilities; sidebar → sheet; builder → vertical stack; charts → responsive containers
- Header rows use the `grid-cols-[minmax(0,1fr)_auto]` + `min-w-0` + `shrink-0` pattern to survive narrow widths

## Technical details

- Add deps: `motion`, `zustand`, `recharts`, `@dnd-kit/core` + `@dnd-kit/sortable` (for builder drag), `date-fns`
- shadcn components to add: sidebar, dialog, sheet, dropdown-menu, tabs, tooltip, popover, badge, progress, avatar, separator, scroll-area, toast/sonner
- Fonts loaded via `<link rel="stylesheet">` in `__root.tsx` head (Tailwind v4 rule: no remote `@import` in CSS)
- No `src/pages/`; every route file is created before any `<Link to>` references it
- Replace the placeholder `src/routes/index.tsx` with the real homepage
- Set proper `head()` metadata per route (title, description, og:*, twitter:card)

## Build order

1. Design tokens + fonts + theme toggle + app shell (sidebar, topbar)
2. Homepage (hero + money flow visual + features + why-stellar + footer)
3. Dashboard + mock data + reusable AgreementCard/StatCard/ProgressRing
4. Templates + Agreement detail + Timeline
5. Builder (palette, canvas, blocks, connectors, config panel)
6. Activity + Analytics (Recharts)
7. Execution animation modal (wired to detail + homepage demo)
8. Polish pass: micro-interactions, empty states, skeletons, responsive audit, dark-mode audit, a11y (focus rings, aria labels, reduced motion)

Deliverable: a polished, cohesive product that looks Series-A ready, entirely on mock data, with a clean extension seam for real Soroban integration later.