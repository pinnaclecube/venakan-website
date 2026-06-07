# Venakan Info Solutions — Website Current State

> **Purpose of this document:** A single source of truth describing the *current* state of the Venakan marketing website, suitable for uploading to Claude as project knowledge. It reflects the codebase as of the latest work and **supersedes the older `CLAUDE.md` wherever they disagree** (the original `CLAUDE.md` predates the light‑mode redesign, the dynamic hero, eyebrow removal, and the 2018 founding date).

_Last updated: 2026‑06 · Branch: `claude/amazing-hypatia-7v2lT` · Live: https://venakaninfo.com_

---

## 1. Project Identity

- **What it is:** Marketing website for **Venakan Info Solutions LLC**, an AI‑only firm.
- **Live URL:** https://venakaninfo.com
- **Repo:** https://github.com/pinnaclecube/venakan-website
- **Hosting:** Vercel — every push to `main` auto‑deploys to venakaninfo.com (~60s). Framework: Vite, Output: `dist`, Root: `./`.
- **Founder:** Arvind Kandula — Founder & CEO (also founder of DevCare Solutions and Pinnacle Cube).
- **Company founded:** **2018.**

---

## 2. Tech Stack (actual versions in `package.json`)

| Layer | Technology |
|-------|-----------|
| Framework | Vite `^7.3` + React `19.1.0` + TypeScript |
| Routing | **Wouter** `^3.3` (not React Router) |
| Styling | **Tailwind CSS v4** `^4.1` (via `@tailwindcss/vite`, **no `tailwind.config.js`**) + shadcn/ui |
| Animation | **Framer Motion** `^12.23` + a custom `Reveal` scroll component |
| Icons | Lucide React `^0.545` |
| Forms | React Hook Form `^7.55` + Zod `^3.25` (note: homepage hero form is a local‑state mock, see §8) |
| Data | TanStack Query `^5.90` (provider mounted; minimal usage) |
| Build out | `dist/` |
| Node | 20.x |

**Commands:** `npm run dev` (localhost:5173) · `npm run build` (production, also catches TS errors) · `npx tsc -p tsconfig.json --noEmit` (typecheck). This is a **Vite** project, not CRA.

---

## 3. Repository Structure

```
/
├── index.html                     ← meta tags live here
├── public/                        ← favicon.svg, robots.txt, opengraph.jpg
├── src/
│   ├── main.tsx                   ← entry
│   ├── App.tsx                    ← router + layout shell
│   ├── index.css                  ← ALL global styles + CSS design tokens
│   ├── assets/venakan-logo.png    ← wordmark (now BLACK, see §5)
│   ├── components/
│   │   ├── ServiceHero.tsx        ← reusable hero for service pages
│   │   ├── StrategyProcessFlow.tsx← interactive process stepper (Strategy page)
│   │   ├── layout/                ← Navbar, Footer, CookieBanner, ScrollProgress,
│   │   │                            ScrollToTop, PageTransition, ArticleLayout
│   │   └── ui/                    ← shadcn primitives + Reveal.tsx, NeuralCanvas.tsx
│   ├── hooks/                     ← use-mobile, use-toast
│   ├── lib/utils.ts
│   └── pages/
│       ├── Home, RD, Strategy, Training, Development, Staffing
│       ├── Resources, About, Contact
│       ├── Privacy, Disclaimer, Terms, not-found
│       └── resources/Article1..6.tsx
```

> **Note:** Layout components live under `src/components/layout/` and UI primitives under `src/components/ui/`. (The old `CLAUDE.md` lists flatter paths like `src/components/Navbar.tsx` — those are stale.)

---

## 4. Routes

```
/                Home
/rd              AI R&D
/strategy        AI Strategy
/training        AI Training
/development     AI Development
/staffing        AI Staffing
/resources       Resources hub
/about           About
/contact         Contact
/privacy /disclaimer /terms   Legal

/resources/why-ai-strategies-fail        Article1
/resources/ai-readiness-scorecard        Article2
/resources/agentic-vs-automation         Article3
/resources/workforce-compliance-talent   Article4
/resources/llm-production-survival       Article5
/resources/responsible-ai                Article6
```

App shell (`App.tsx`): `ScrollToTop` → `ScrollProgress` → `Navbar` → routed `main` (wrapped in `PageTransition`) → `Footer` → `CookieBanner`. Wouter `Switch`/`Route`; fallback → `NotFound`.

---

## 5. Design System — **LIGHT MODE** (current)

The site was converted from the original dark navy theme to a **crisp white / dark‑ink light theme**. All tokens live in `src/index.css`.

### Palette
| Token | Value | Use |
|-------|-------|-----|
| `--bg-base` | `#FFFFFF` | page base (odd sections) |
| `--bg-surface` | `#F9FAFB` | raised surface (even sections, footer) |
| `--bg-inset` | `#F3F4F6` | inset chips/icons |
| `--ink-primary` | `#111827` | headings / primary text |
| `--ink-secondary` | `#374151` | body text |
| `--ink-tertiary` | `#6B7280` | small/muted text |
| `--ink-muted` | `#9CA3AF` | labels, placeholders |
| `--brand-blue` | `#3B4BCC` | primary accent |
| `--brand-violet` | `#6B3FA8` | secondary accent |
| `--cyan` | `#0891B2` | tertiary accent |
| `--border` / `--border-mid` / `--border-strong` | `rgba(0,0,0,.08 / .12 / .18)` | borders |

### Critical build wiring (Tailwind v4 — important for future edits)
This project has **no `tailwind.config.js`**; colors are wired through `:root` + an `@theme inline` block. Two non‑obvious behaviors:

1. **`text-white` / `text-white/NN` now render as DARK INK.** Tailwind's `white` theme color is overridden in `:root` (`--color-white: #111827`). So existing `className="text-white"` / `text-white/70` is *correct* on the light bg. The opacity variants (`bg-white/10`, `border-white/20`, `placeholder-white/30`) become subtle dark tints — also correct. **Do not "fix" these.**
2. **`bg-navy`, `text-brand-blue`, `text-blue-bright`, `bg-brand-blue`, `border-border-mid`, `text-cyan` are NO‑OP utilities** (those names were never registered in `@theme`, so Tailwind emits no CSS for them). They exist in markup but render nothing. Accent colors actually come from **inline `style={{…var(--…)}}`**, the global classes below, and the legacy `--color-*` aliases. Section background "rhythm" (white → grey → white) is created with **inline `background: var(--bg-surface)`** on even sections, not via `bg-navy-mid`.
3. **Legacy aliases remapped to light** so inline styles flip automatically: `--color-navy #FFFFFF`, `--color-navy-mid #F9FAFB`, `--color-navy-light #F3F4F6`, `--color-white #111827`, `--white-dim #374151`, `--white-muted #6B7280`, `--color-blue-bright/-violet-bright` = brand blue/violet.
4. The shadcn `@theme` tokens (`--color-background`, `--color-card`, `--color-border`, …) were converted from HSL triplets to **direct light color values** (removing the old `hsl()` wrapping).

### Global component classes (in `index.css`)
- **`.glass`** — white card: `background #FFFFFF`, `1px solid var(--border)`, radius 16, soft shadow (`0 1px 3px / 0 4px 16px rgba(0,0,0,.06/.04)`), **no backdrop‑filter**. Hover: brand‑blue border tint + lift.
- **`.btn-primary`** — gradient `135deg #3B4BCC→#6B3FA8`, white text, radius 8.
- **`.btn-ghost`** — transparent, `1.5px var(--border-mid)`, ink text; hover → brand‑blue border/text + faint blue bg.
- **`.gradient-text`** — `linear-gradient(135deg,#3B4BCC 0%,#6B3FA8 50%,#7C3AED 100%)` clipped to text (visible on white).
- **`.tag` / `.tag-blue|violet|amber|green`** — small pill labels, light tinted backgrounds.
- **`.grid-bg` / `.grid-bg-fine`** — faint brand‑blue grid, `rgba(59,75,204,0.04)` lines, 56px.
- **`.form-input` / `.form-label` / `.divider`** — light form helpers.
- Scrollbar: brand gradient thumb on light track. The old dark `body::after` noise overlay was **removed**.
- **`.section-label` was deleted** (see eyebrow removal, §7).

### Typography (actually loaded)
Google Fonts loaded in `index.css`: **Outfit** (display/headings), **Inter** (body), **JetBrains Mono** (labels/mono), exposed as `--font-display`, `--font-body`, `--font-mono`.
> ⚠️ The old `CLAUDE.md` says "Syne / Space Grotesk" — that is **aspirational/stale**; those families are *not* loaded. Use the real `--font-*` variables. Don't switch font names without also adding the `@import`.

### Motion
- **`Reveal`** (`components/ui/Reveal.tsx`) — IntersectionObserver scroll‑reveal with variants: `heading` (translateY 16px, 500ms), `body` (opacity‑only, 400ms), `card` (translateY 12px, 350ms; pair with ~60ms stagger). Honors `prefers-reduced-motion` (fade only).
- **`NeuralCanvas`** (`components/ui/NeuralCanvas.tsx`) — animated particle network, recolored for white bg (brand‑blue nodes `rgba(59,75,204,0.35)`, faint blue/violet lines, max line opacity 0.15). **Used only on the homepage hero**, `opacity={0.6}`. Service heroes use `.grid-bg-fine` instead.

---

## 6. Homepage Hero — **Dynamic rotating left panel** (current)

`src/pages/Home.tsx`. Layout: **left ~65% / right ~35%**, grid `lg:grid-cols-[1.85fr_1fr]`, collapses to 1 column at `max-width: 860px`. Background `var(--bg-base)` + `grid-bg` + `NeuralCanvas`.

### Left panel = auto‑rotating 5‑card carousel
- Built with **Framer Motion `AnimatePresence` (`mode="wait"`)** — crossfade: `initial {opacity:0, y:6}` → `animate {opacity:1, y:0}` → `exit {opacity:0, y:-4}`, 400ms, ease `cubic-bezier(0.23,1,0.32,1)`. `prefers-reduced-motion` → plain 0.2s opacity fade.
- **Auto‑advances every 2 seconds** (`setInterval`, 2000ms). **Pauses on hover** of the left panel (`onMouseEnter/Leave` → `isPaused`). Manual nav via **dot indicators** (active = 24×6 gradient pill, inactive = 6px dot at `rgba(59,75,204,0.25)`); clicking a dot jumps immediately and resets the timer (effect keyed on `[isPaused, currentCard]`).
- State: `currentCard (0–4)`, `isPaused`. Cards defined in a top‑level `HERO_CARDS` const. Each card: `h1Line1`, `h1Line2` (gradient), `subheading`, `stats[3]` ({value,label} with 1px dividers between), `primaryCta` (`btn-primary`), `secondaryCta` (`btn-ghost`) — both routed via wouter `Link`.

### The 5 cards
1. **Core Identity** — "Pure AI." / "Research to Results." · stats 6 / 5 / 1 · CTAs → /contact, /rd
2. **Market Gap** — "Enterprise AI." / "Built for the Midwest." · stats 200–5K / 12+ / 0 · CTAs → /strategy, /rd
3. **Strategy** — "AI Strategy." / "That Actually Ships." · stats 6 wks / 4 / 100% · CTAs → /strategy, /strategy
4. **Development** — "We Build AI." / "End to End." · stats 3 / 0 / 100% · CTAs → /development, /development
5. **Talent** — "AI Talent." / "Vetted Against Real Delivery." · stats 16+ / 2 / 0 · CTAs → /staffing, /staffing

### Right panel (unchanged)
A glass contact form card ("Start a conversation"): name/email/company, interest chips, optional message, submit. Currently a **local‑state mock** (1.2s fake delay → success state); **not yet wired to a backend** (see §11).

---

## 7. Section Headers / Eyebrows — **REMOVED**

All "eyebrow" labels (the small mono‑uppercase kicker above a heading) were removed site‑wide for a cleaner, less templated feel:
- Every `section-label` element deleted (Home, About ×4, Training, Development, Contact) and the `.section-label` CSS removed.
- The homepage hero "AI‑First. Always." tag removed.
- `StrategyProcessFlow` "The Venakan Method" eyebrow removed.
- **`ServiceHero` no longer has an `eyebrow` prop** — the prop, the breadcrumb trail, and the eyebrow tag were all removed; the six callers no longer pass `eyebrow`.

**Kept** (these are content, not eyebrows): R&D vertical **status badges** ("In Development", "Beta", "Research Phase"), contact **interest chips**, Resources **filter pills**, blog **category tags**, the contact‑form **"Live" badge**.

> Search invariants to preserve: `grep section-label` → 0, `grep eyebrow` → 0, `grep "AI-First. Always."` → 0.

---

## 8. Pages & Key Components

- **`ServiceHero`** (used by RD, Strategy, Training, Development, Staffing, About). Props: `h1Line1`, `h1Line2` (gradient), `subhead`, `chips?`, `primaryCta` (→ /contact), `secondaryCta?` + `secondaryCtaTo?`, `rightPanel?` (hidden < 860px), `stats?` ({value,label}, **count‑up on scroll**). Hero bg `var(--bg-surface)` + `grid-bg-fine` + bottom border. **No eyebrow.**
- **`StrategyProcessFlow`** — interactive multi‑stage stepper on the Strategy page; styled via an inline `<style>{spfCss}</style>` block (fully light‑mode).
- **`Navbar`** — frosted white (default `rgba(255,255,255,.85)` blur 12px; scrolled `.95` blur 20px + shadow). Black logo wordmark, ink links, brand‑blue active state.
- **`Footer`** — light grey (`var(--bg-surface)`); brand blurb now uses the primary positioning line (§9); social/legal links; dynamic copyright `© {getFullYear()}`.
- **`CookieBanner`**, **`ScrollProgress`** (brand gradient bar), **`ArticleLayout`** (light prose, brand‑blue H2s, left‑border callouts).
- **Resources** hub — filter pills + featured/article cards (category tags kept); newsletter strip; hero now carries the market‑position line (§9).
- **About** — narrative sections (Why We Exist, The Context with stat citations, architecture, principles, leadership/founder note, "What Venakan Is / Is Not" red‑vs‑green cards), "Founded 2018" stat.
- **Legal** (Privacy/Terms/Disclaimer) — light hero band + prose.

---

## 9. Positioning Language (current, stress‑tested)

The site **does not** use "first and only" claims. Three approved lines are applied by context:

- **Primary** — *"Built exclusively for AI. No legacy IT practice. No generalist consulting. Just AI — from day one."* → Footer brand blurb + hero Card 1.
- **Secondary** — *"The only Midwest firm covering the full AI spectrum — R&D, Strategy, Training, Development, and Staffing — under one roof."* → hero Card 2 + About hero subhead.
- **Market position** — *"Enterprise AI for organizations that global consulting firms price out and local IT firms underqualify for."* → About intro + Resources hero + (variant) hero Card 2.

> **Legal note:** Named‑competitor references were removed. The earlier "McKinsey prices out…" phrasing was replaced with the generic **"global consulting firms."** The "McKinsey State of AI" stat citation was genericized to **"Industry State of AI research, 2024."** Two non‑company citations remain on the About page: *"MIT Sloan Management Review, 2024"* and *"National Foundation for American Policy, 2023."*

---

## 10. Brand Constants

- **Tagline:** "Pure AI. Research to Results." (Old "We Don't Adopt AI. We Build It." is permanently retired.)
- **Five service lines:** AI R&D · AI Strategy · AI Training · AI Development · AI Staffing.
- **Logo:** `src/assets/venakan-logo.png` — solid **black** wordmark "VENAKAN INFO SOLUTIONS" (recolored for light bg; dark‑mode blue glow filters removed from Navbar/Footer/Home).
- **Social/contact:** LinkedIn `linkedin.com/company/venakaninfo` · X `twitter.com/venakaninfo` · `info@venakaninfo.com`.
- **Meta (`index.html`):** title "Venakan Info Solutions | Pure AI. Research to Results."; description = AI‑only company blurb; canonical `https://venakaninfo.com`; og:image `…/logos/Venakan_Logo-02.png`.

### Content rules (still in force)
1. **No immigration/visa language** — use "workforce compliance verification", "employment eligibility", "HR compliance" instead of H‑1B/I‑9/visa/etc.
2. **No fake social proof** — no invented logos, testimonials, or avatar rows. (The old fake "Trusted by AI leaders" avatar row was removed when the hero became dynamic.)
3. **No named‑competitor disparagement** (see §9 legal note).
4. Compliance content should carry: *"This is for engagement planning only. It is not legal advice."*

---

## 11. Known Issues / Open Items

- **`theme-color` meta is still `#06070F`** (dark navy) in `index.html` — inconsistent with the light theme; consider updating to `#FFFFFF`.
- **Contact form is a front‑end mock** — homepage hero form and Contact page need a real backend (the old `CLAUDE.md` notes a **Formspree** form ID placeholder). Not yet wired.
- **"Schedule a Call" / Calendly** — per the old `CLAUDE.md`, CTAs may point at a generic Calendly URL; the real booking link still needs to be supplied.
- **Founder headshot** — About uses initials/placeholder; `public/images/arvind-kandula.jpg` not yet present.
- **Dead `bg-navy*` class names** remain in markup (harmless no‑ops; left to minimize churn).
- **Bundle size** — the JS chunk is >500 kB (Framer Motion etc.); Vite prints a chunk‑size *warning* (not an error). Code‑splitting is a possible optimization.
- Two non‑company stat citations (MIT Sloan, NFAP) remain on About — keep unless a stricter "no named organizations" policy is desired.

---

## 12. Recent Change History (this work stream)

Most‑recent first (branch `claude/amazing-hypatia-7v2lT`):
1. Hero rotates every **2s**; removed McKinsey/named‑competitor references.
2. **Dynamic rotating hero** (5 cards, Framer Motion) + stress‑tested **positioning language**.
3. Corrected **founding year to 2018**.
4. **Black logo** for light bg + removed **all eyebrow** labels.
5. **Dark → light mode** conversion (full design‑token rewrite + every component).
6. Varied section headers (reduced mechanical eyebrow/H2/subtext repetition).
7. Removed homepage hero mouse‑spotlight layer.
8. Reduced hero background treatments (NeuralCanvas to homepage only; service heroes → grid).
9. Differentiated scroll‑reveal animations by content type.
10. Corrected Venakan brand meta tags.

---

## 13. Working Agreement / Deploy

- Develop locally, verify with `npm run build` (zero TS errors) before pushing.
- Push → Vercel auto‑deploys to production in ~60s. **Never push untested to `main`.**
- DNS (GoDaddy) and email (Microsoft 365 MX/SPF) records are configured — **do not touch**.
- Do not change without being asked: meta tags, DNS, `dist/`, `.gitignore`, Vercel build settings.
