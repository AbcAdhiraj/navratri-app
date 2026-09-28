# Navratri NCR

**What are we doing for Navratri tonight?** — a consumer discovery site for garba, dandiya, Bollywood and DJ Navratri nights across Delhi, Dwarka, Noida, Gurugram and Ghaziabad, with dates, prices and entry rules checked at the source.

Built with Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4 and Supabase. Deploys to Vercel.

> Out of the box the app runs on **clearly-fake DEMO fixtures** (every title starts with `DEMO —`, every link points at `example.com`). Real events must be entered and verified in the admin before launch.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000 — DEMO fixtures, admin open at /admin
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` / `npm run typecheck` | ESLint (Next core-web-vitals + TS) / `tsc --noEmit` |
| `npm run db:seed-sql` | Regenerates `supabase/seed.sql` from the DEMO fixtures |

---

## Design system — "festival print"

The identity borrows from Gujarati and Rajasthani textiles and printed festival posters rather than screen gradients: **khadi paper and ink**, with flat colour blocks of **sindoor** red, **neel** (Ajrakh indigo) and **haldi** (turmeric), **mehendi** green reserved for trust/verification, and **bandhani** tie-dye dots and block-printed rangoli as texture. No glows, no glassmorphism, no gradient text.

Tokens live in [`src/app/globals.css`](src/app/globals.css) (`@theme`):

- **Colour** — `paper`, `paper-2/3`, `card`, `ink` (+ `ink-soft`, `ink-faint`), `sindoor`, `neel`, `haldi`, `mehendi`, `rani`, `kesar`, `cream` for text on colour blocks. All text pairings pass WCAG AA (checked with axe).
- **Type** — Bricolage Grotesque (display, condensed via `wdth`), Instrument Serif italic (accents), Manrope (UI/body). Scale: `.t-display`, `.t-h1`–`.t-h3`, `.t-body`, `.t-meta`, `.t-label`, `.kicker`.
- **Radius / shadow** — `--radius-chip|card|panel|sheet`; printed offset shadows `--shadow-print-sm|print|print-lg` (no blurry glows).
- **Motion** — `--ease-out-expo`, durations `fast/base/slow`, entrance `rise`, scroll reveals (`[data-reveal]`), CSS parallax (`[data-parallax]` + `--p`), stamp/pop micro-animations. Everything collapses under `prefers-reduced-motion`.
- **Components** — `.btn` (+ `-red`, `-haldi`, `-paper`, `-outline`, `-sm`), `.chip`, `.tag`, `.bandhani`, `.skeleton`, `.rail`, native-`<dialog>` sheets (`bottom` / `side` / `center` / `full`).

When an event has no authorised photography, cards show **original generative block-print artwork** (`PosterArt`) seeded by the event slug and coloured by event type — never stock photos. Rangoli designs are defined once per page as an SVG sprite and recoloured through CSS variables to keep the DOM light.

---

## Architecture

```
src/
  app/
    (site)/                 public site (shared Navbar, Footer, mobile nav, search)
      page.tsx              homepage (ISR, 5 min)
      events/page.tsx       discovery + filters (URL-synced, shareable)
      events/[slug]/        event detail, per-event OpenGraph image, loading state
      submit/               multi-step suggestion / correction flow + server action
      saved, methodology, privacy, terms
    admin/                  moderation (login, dashboard, events, submissions, history)
    sitemap.ts, robots.ts, icon.svg
  components/
    art/        Rangoli, RangoliSprite, PosterArt, EventMedia, Motifs (dandiya, diya, torana…)
    layout/     Navbar, MobileNav, Footer, PageHeader, DemoRibbon, Logo
    home/       Hero, DiscoveryControl, TonightSection, Spotlight, VibeGrid, LocalityGrid, RailSection, BudgetSection, TrustBand, SubmitCTA
    events/     cards (Featured, Standard, Horizontal, Row, Editorial), DateSelector, EventCarousel, EventsExplorer, LocalityCard, actions (save/share)
    filters/    FilterPanel, FilterSheet
    search/     SearchProvider (⌘K / "/"), SearchOverlay
    detail/     EventHero, TicketPanel, InfoBlock, VibeSection, CrowdSignal, TrustPanel, Gallery, BookingPanel (+ mobile bar)
    submit/     SubmissionForm, fields
    admin/      EventEditor, AdminNav, ui
    ui/         Icon, Sheet, Segmented, Toast, States (empty/error/skeletons), InteractionLayer
  lib/
    types.ts, constants.ts, format.ts, discovery.ts (filters, sections, search), validate.ts, vibes.ts, og.tsx
    data/       Repository interface + memory (fixtures) and Supabase implementations
    admin/      auth, duplicate detection, revision diff, blank/prefill helpers
  proxy.ts      refreshes the Supabase session on /admin routes
supabase/
  migrations/   schema, enums, constraints, indexes, RLS, storage buckets
  seed.sql      generated DEMO data
```

**Rendering.** Public pages are server components; the homepage and event pages are statically generated with 5-minute ISR. Interactivity (date selector, filters, search, sheets, submission form) lives in small client islands. One tiny `InteractionLayer` powers scroll reveals and parallax for the whole site.

**Data modes** ([`src/lib/data/index.ts`](src/lib/data/index.ts)):

| Condition | Data source |
| --- | --- |
| Supabase env vars set | Supabase (RLS enforced) |
| No Supabase, not a Vercel production deploy | In-memory DEMO fixtures (a striped "Preview" ribbon is shown) |
| No Supabase on a Vercel **production** deploy | Nothing — the site shows empty states rather than fictional events |

---

## Data integrity rules

These are enforced in the UI, the validators ([`src/lib/validate.ts`](src/lib/validate.ts)) and the database constraints:

- `null` always means **"Not confirmed"** — never "no".
- Unknown prices render as **"Price unknown"**, never ₹0. Free entry must be explicit (`price_status = 'free'`).
- The **Book tickets** CTA only renders for a `booking_verified` https link.
- **Vibe labels** require written evidence (and ideally a source) — each one is shown with "Why we say so".
- **Crowd impression** (e.g. "Roughly 50–60% women · 2025 edition · 8 reports · Not verified for tonight") is an aggregate of ≥ 3 approved attendee reports for that event or a named edition. Raw reports are private. Nothing is inferred from photos or appearance.
- **No ratings or scores.**
- **Photos** only with permission (`event_media.authorized`), with credit and year.
- **Fixtures** are titled `DEMO — …`, flagged `is_demo`, excluded from the sitemap, `noindex`ed, and hidden by RLS unless `site_settings.allow_demo` is on.

---

## Supabase setup

1. Create a project and apply the migration:
   ```bash
   supabase link --project-ref <ref>
   supabase db push                      # applies supabase/migrations/*
   ```
   (Or paste `supabase/migrations/20260928000000_init.sql` into the SQL editor.)
2. Optional, for a staging project: load the DEMO data and make it visible:
   ```sql
   -- run supabase/seed.sql, then:
   update public.site_settings set allow_demo = true;   -- never on production
   ```
3. Create a moderator: sign the user up in **Authentication → Users**, then
   ```sql
   insert into public.admin_roles (user_id, role) values ('<auth-user-uuid>', 'admin');
   ```
4. Set the environment variables (see [`.env.example`](.env.example)) locally and in Vercel:
   `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only, for private evidence uploads).

**Schema highlights** — enums for areas, event types, music, vibes, source kinds, statuses; `venues`, `events` (stable slug, tri-state entry/food booleans, price consistency and https-booking constraints, freshness flags), `event_occurrences`, `event_sources` (provenance), `event_vibes` (evidence required), `event_media` (authorised only), `crowd_reports` + `crowd_summary` view, `submissions`, `revisions` (before/after JSON), `moderation_decisions`, `admin_roles`, `site_settings`. Trigram indexes support search and the `find_duplicate_events()` function.

**RLS** — the public can read only published (non-demo unless allowed) events and their children, can insert submissions/crowd reports only as `pending`, and can never read them back. Everything else requires an `admin_roles` entry. These rules were exercised against Postgres 16 (anon, non-admin and admin sessions).

---

## Admin & moderation

`/admin` — utilitarian by design.

- **Dashboard**: pending queue, published/draft counts, events not re-checked in 7 days, unverified booking links.
- **Submissions**: evidence links and signed URLs for uploaded files, **duplicate detection** (name similarity + city, locality, venue and overlapping nights), side-by-side current values for corrections, reject / mark-duplicate with notes.
- **Create from submission / Apply correction** opens the event editor pre-filled; saving records a revision and approves the submission in one step. Nothing a visitor submits is ever published directly.
- **Event editor**: every field in the model, including sources, verification checks, vibes with evidence, media and crowd impressions. Each save stores a **revision** with a field-by-field diff.
- **History**: every moderation decision with actor and timestamp.

Auth: Supabase email/password + `admin_roles`. In fixture mode the admin is open during local development (edits live in memory) and can be unlocked on a preview with `ADMIN_DEMO_PASSWORD`.

---

## SEO & sharing

Unique `/events/<slug>` URLs, per-page metadata and canonical URLs, filter pages with descriptive titles (`/events?area=dwarka&date=2026-10-17`), generated OpenGraph images for the site and each event (poster art + date, venue, price; `DEMO` flagged), `schema.org/Event` JSON-LD for real events, sitemap and robots.

## Accessibility & performance

Semantic landmarks, skip link, visible focus rings, keyboard-operable date tabs, segmented controls, search (↑ ↓ Enter Esc, ⌘K or `/`) and native `<dialog>` sheets with focus management; `aria-live` result counts; reduced-motion support. axe-core reports **0 WCAG 2.1 AA violations** on the main pages at desktop and mobile widths.

No UI or animation libraries: motion is CSS plus one IntersectionObserver; images use `next/image`; decorative art is inline SVG; fonts are self-hosted through `next/font`.
