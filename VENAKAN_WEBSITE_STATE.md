# Venakan Info Solutions — Website Current State

> **Purpose of this document:** A single source of truth describing the *current* state of the Venakan marketing website, suitable for uploading to Claude as project knowledge. It reflects the codebase as of the latest work and **supersedes the older `CLAUDE.md` wherever they disagree.**

_Last updated: 2026‑06 · Branch: `claude/amazing-hypatia-7v2lT` · Live: https://venakaninfo.com_

> **Theme status:** The site currently runs the **Real‑Time Monitoring (RTM) dark design system** — slate‑dark surfaces, **emerald green (#34D399) reserved for live/status accents**, **brand blue (#3B4BCC) for CTAs/active states**, Oswald display type, bento/hairline layouts. (It previously went dark‑navy → light‑white → this RTM dark system. The doc below describes the *current* dark system; ignore any lingering "light mode" assumptions.)

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
| Forms | React Hook Form `^7.55` + Zod `^3.25` (note: hero + Contact forms are local‑state mocks, see §11) |
| Data | TanStack Query `^5.90` (provider mounted; minimal usage) |
| Build out | `dist/` |
| Node | 20.x |

**Commands:** `npm run dev` (localhost:5173) · `npm run build` (production, also catches TS errors) · `npx tsc -p tsconfig.json --noEmit` (typecheck). This is a **Vite** project, not CRA.

---

## 3. Repository Structure

```
/
├── index.html                     ← meta tags + Google Fonts live here
├── public/                        ← favicon.svg, robots.txt, opengraph.jpg
├── src/
│   ├── main.tsx                   ← entry
│   ├── App.tsx                    ← router + layout shell
│   ├── index.css                  ← ALL global styles + CSS design tokens
│   ├── assets/venakan-logo.png    ← BLACK wordmark; inverted to white via CSS (see §10)
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
/rd /strategy /training /development /staffing   Service pages
/resources       Resources hub
/about /contact
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

## 5. Design System — **RTM DARK** (current)

All tokens live in `src/index.css`. **Color discipline:** dark slate surfaces; **green = live/status only**; **brand blue = all CTAs + active states**; off‑white text. (A stricter "green is the *only* accent — no blue/violet" variant has been specced but is **not** applied in the current code.)

### Palette
| Token | Value | Use |
|-------|-------|-----|
| `--bg` / `--bg-base` | `#1E293B` | page base (odd sections) |
| `--surface` / `--bg-surface` | `#0F172A` | deep surface (even sections, footer, deep cards) |
| `--surface-2` / `--bg-inset` | `#162032` | raised cells/cards |
| `--surface-3` | `#1A2640` | hover state on cards |
| `--green` | `#34D399` | **status/live only** — stat values, section tags, category tags, link hovers, scroll progress |
| `--green-dim` / `--green-border` | `rgba(52,211,153,.10 / .22)` | green tints/borders |
| `--brand-blue` | `#3B4BCC` | **CTAs, active states, dot indicators, featured bento cell** |
| `--brand-violet` | `#6B3FA8` | used only in the `.gradient-text` and scroll‑progress gradients |
| `--white` / `--ink-primary` | `#FFFFFF` | primary text |
| `--text-2` / `--ink-secondary` | `rgba(255,255,255,.70)` | body text |
| `--text-3` / `--ink-tertiary` | `rgba(255,255,255,.45)` | labels/muted |
| `--text-4` | `rgba(255,255,255,.22)` | inactive dots |
| `--border` / `--border-mid` | `rgba(255,255,255,.08 / .13)` | borders |
| `--light-base` / `--light-ink` … | `#F8FAFC` / `#0F172A` … | **only** for the one hybrid light section (Home Organization Spectrum) |

Legacy aliases are kept and remapped to dark equivalents so existing inline styles flip automatically: `--color-navy #1E293B`, `--color-navy-mid #0F172A`, `--color-navy-light #162032`, `--color-white #FFFFFF`, `--color-blue-bright #93C5FD`, `--white-dim rgba(255,255,255,.70)`, `--white-muted rgba(255,255,255,.45)`, `--ven-border rgba(255,255,255,.08)`.

### ⚠️ Critical build wiring (Tailwind v4 — read before editing colors)
No `tailwind.config.js`; colors are wired through `:root` + an `@theme inline` block.

1. **`text-white` / `text-white/NN` now render WHITE.** Tailwind's `white` theme color is overridden in `:root` (`--color-white: #FFFFFF`). So existing `className="text-white"` / `text-white/70` is *correct* on the dark bg (white / translucent‑white). `bg-white/10`, `border-white/20`, `placeholder-white/30` become subtle light tints — also correct. **Do not "fix" these.**
   > Historical note: during the light‑mode era `--color-white` was `#111827` (ink). It is now `#FFFFFF`. Any doc/checklist line saying "text‑white renders as dark ink — do not change" is **stale** and must be ignored for the dark theme.
2. **`bg-navy`, `text-brand-blue`, `text-blue-bright`, `bg-brand-blue`, `border-border-mid`, `text-cyan` are NO‑OP utilities** (never registered in `@theme`; emit no CSS). Accent colors come from **inline `style={{…var(--…)}}`**, the global classes below, and the legacy `--color-*` aliases. Section background rhythm is created with **inline `background: var(--bg)/var(--surface)`**, not via `bg-navy*`.
3. The shadcn `@theme` tokens (`--color-background`, `--color-card`, `--color-border`, …) map to the dark values via direct `var(--…)` references (no `hsl()`).

### Global component classes (in `index.css`)
- **`.glass`** — dark card: `background rgba(15,23,42,0.70)`, `1px solid var(--border)`, radius 8, `backdrop-filter blur(20px)`. Hover: green‑border tint.
- **`.btn-primary`** — **solid brand‑blue** (`var(--brand-blue)`), white text, **JetBrains‑Mono 11px uppercase**, radius 8; hover `#2D3DB8` + lift.
- **`.btn-ghost`** — transparent, `1px var(--border-mid)`, white text, mono uppercase; hover → brand‑blue border + faint blue bg.
- **`.gradient-text`** — `linear-gradient(135deg,#34D399 0%,#3B4BCC 50%,#6B3FA8 100%)` clipped to text (used on hero H1 line 2 + service H1 line 2).
- **`.tag` + `.tag-blue|green|violet|amber`** — small mono‑uppercase pills (blue=#93C5FD, green=var(--green), violet, amber). `.section-tag` — green mono kicker.
- **`.grid-bg` / `.grid-bg-fine`** — green dot/line grid, `rgba(52,211,153,0.04)`, 48px.
- **`.bento-grid` / `.bento-cell`** — hairline‑bordered grid (1px gaps over `var(--border)`); cells `var(--surface)`, hover `var(--surface-2)`.
- **`.section-dark` (#1E293B) / `.section-deep` (#0F172A) / `.section-light`** (the single hybrid light section, `--light-base`).
- **`.form-input` / `.form-label` / `.divider`** — dark form helpers.
- Scrollbar: green→blue gradient thumb on `var(--surface)` track.
- **Keyframes:** `meshDrift` (hero gradient drift), `livePulse` (status‑dot pulse), `scrollCue`, `orgPanelIn`; `.reveal` honors `prefers-reduced-motion`.

### Typography (actually loaded)
Google Fonts in **both** `index.html` and `index.css`: **Oswald** (display/headings — `--font-display`/`--oswald`), **Inter** (body — `--font`/`--font-body`), **JetBrains Mono** (labels/buttons/tags — `--mono`). `h1–h4` are Oswald 500 globally.
> ⚠️ The old `CLAUDE.md` says "Syne / Space Grotesk" and earlier docs said "Outfit" — both **stale**. The display face is now **Oswald**.

### Motion
- **`Reveal`** (`ui/Reveal.tsx`) — IntersectionObserver scroll‑reveal, variants `heading`/`body`/`card`; respects reduced‑motion.
- **`NeuralCanvas`** (`ui/NeuralCanvas.tsx`) — animated particle network, **emerald** (node fill `rgba(52,211,153,0.4)`, glow `rgba(52,211,153,0.10)`, green→blue lines, max line opacity 0.15). **Homepage hero only**, `opacity={0.5}`.

---

## 6. Homepage Hero (`src/pages/Home.tsx`)

Layout: **left ~65% / right ~35%**, grid `lg:grid-cols-[1.85fr_1fr]`, collapses to 1 column at `max-width: 860px`.

### Layered dark background
Behind the content, absolutely‑positioned layers: **Layer 1** animated gradient mesh (green/blue/violet radial glows + `var(--surface)`, `meshDrift 10s` drift), **Layer 2** green dot grid (28px), **Layer 3** faint scan‑lines, **Layer 4** emerald `NeuralCanvas` @0.5. Content sits at `z-index 1+`.

### Left panel = auto‑rotating 5‑card carousel
- **Framer Motion `AnimatePresence` (`mode="wait"`)** crossfade (opacity + translateY, `cubic-bezier(0.23,1,0.32,1)`); reduced‑motion → 0.2s opacity.
- **Auto‑advances every 2 s**; **pauses on hover**; **dot indicators** (active = brand‑blue 24×6 pill, inactive = 6px `--text-4` dot) jump + reset the timer.
- A **live‑status indicator** sits above the H1: pulsing green dot (`livePulse`) + mono "Pure AI · Research to Results".
- Per card: H1 line 1 (Oswald, white), H1 line 2 (`gradient-text`), Oswald‑light subheading, 3‑stat row (**green values**, mono labels, 1px dividers), `btn-primary` + `btn-ghost` (wouter `Link`).
- **The 5 cards:** ① Core Identity "Pure AI." / "Research to Results." → /contact,/rd · ② Market Gap "Enterprise AI." / "Built for the Midwest." → /strategy,/rd · ③ "AI Strategy." / "That Actually Ships." → /strategy · ④ "We Build AI." / "End to End." → /development · ⑤ "AI Talent." / "Vetted Against Real Delivery." → /staffing.

### Right panel — contact form card
Dark glass (`rgba(15,23,42,0.85)`), **solid 2px brand‑blue top border**, header with green "live" badge, brand‑blue interest chips, `btn-primary` submit. **Local‑state mock** (fake delay → success); not wired to a backend.

### Sections below the hero
Hybrid rhythm: dark (`--bg`) ↔ deep (`--surface`), **plus one light section** (Organization Spectrum, `.section-light` on `--light-base`). Capabilities use a **bento‑grid** with a **brand‑blue featured cell** (AI R&D). Spectrum bar gradient = green→blue→violet. Article preview cards on `--surface-2`, green category tags.

---

## 7. Section Headers / Eyebrows — **REMOVED**

All "eyebrow" kickers were removed site‑wide and the `.section-label` element is gone. `ServiceHero` has **no `eyebrow` prop** (and no breadcrumb). Search invariants: `grep section-label` → 0, `grep eyebrow` → 0, `grep "AI-First. Always."` → 0. **Kept** (content, not eyebrows): R&D status badges, interest chips, Resources filter pills, blog category tags, the hero "Live" badge.

---

## 8. Pages & Key Components (current RTM styling)

- **`ServiceHero`** (RD/Strategy/Training/Development/Staffing/About). Props: `h1Line1`, `h1Line2` (`gradient-text`), `subhead`, `chips?`, `primaryCta` (→ /contact), `secondaryCta?`+`secondaryCtaTo?`, `rightPanel?` (hidden < 860px), `stats?` (**count‑up on scroll, green values**). Hero = layered green/blue radial‑glow bg + `grid-bg-fine`; **green chips**; dark right‑panel card with 2px... (uses `glass` + dark surface). **No eyebrow / no card number.**
- **`StrategyProcessFlow`** — interactive stepper (Strategy page), styled via inline `<style>{spfCss}</style>` — fully dark (`var(--surface)` panels, white text, green/blue accents).
- **`Navbar`** — 56px frosted dark bar (`rgba(15,23,42,.92/.97)`, blur 16); **white logo** via `filter: brightness(0) invert(1)`; hairline vertical separator; mono‑uppercase links with `border-left` dividers (active = white on `rgba(255,255,255,.04)`); **brand‑blue "Let's Talk AI →" CTA**; Oswald 32px mobile overlay.
- **`Footer`** — dark `var(--surface)`; **the top logo+tagline banner was removed**; Oswald column headings; links hover **green**; social icons hover blue‑tint; newsletter `btn-primary`; bottom bar mono with green "Made with AI."; dynamic `© {getFullYear()}`.
- **`CookieBanner`** — dark glass (`rgba(15,23,42,.97)`, blur 20); green link; `btn-primary` accept.
- **`ScrollProgress`** — **green→blue→violet** gradient bar.
- **`ArticleLayout`** — dark; green Oswald H2s; `text-2` prose; green left‑border callouts; green back link.
- **`Resources`** — dark hub; featured card on green‑tint gradient; article cards `--surface-2` → `--surface-3` hover; green category tags; **brand‑blue active filter pill**.
- **`About`** — dark narrative sections; founder quote card (blue tint, brand‑blue left border); values tiles (**green** "01–04" numbers); **new 2‑column bento "What Venakan Is / Is Not"** (off‑white ✕ marks left, **green ✓ marks + green callout** right — replaces the old red/green cards); "Founded **2018**" stat.
- **`Contact`** — dark; `glass` form card; info cards on `--surface`; mock submit.
- **Legal** (Privacy/Terms/Disclaimer) — dark hero band + prose.

---

## 9. Positioning Language (current, stress‑tested)

No "first and only" claims. Three approved lines, applied by context:
- **Primary** — *"Built exclusively for AI. No legacy IT practice. No generalist consulting. Just AI — from day one."* → About Is/Is‑Not callout + (formerly footer blurb).
- **Secondary** — *"The only Midwest firm covering the full AI spectrum — R&D, Strategy, Training, Development, and Staffing — under one roof."* → hero Card 2 + About hero subhead.
- **Market position** — *"Enterprise AI for organizations that global consulting firms price out and local IT firms underqualify for."* → About intro + Resources hero + hero Card 2.

> **Legal note:** Named‑competitor references were removed — "McKinsey prices out…" → generic **"global consulting firms"**; the "McKinsey State of AI" citation → **"Industry State of AI research, 2024."** Two non‑company citations remain on About (*MIT Sloan Management Review, 2024*; *National Foundation for American Policy, 2023*).

---

## 10. Brand Constants

- **Tagline:** "Pure AI. Research to Results." (Old "We Don't Adopt AI. We Build It." is permanently retired.)
- **Five service lines:** AI R&D · AI Strategy · AI Training · AI Development · AI Staffing.
- **Logo:** `src/assets/venakan-logo.png` is the **BLACK** wordmark. On the dark theme it is displayed **white** via CSS `filter: brightness(0) invert(1)` — currently applied **only in the Navbar**. (See Known Issues for the un‑inverted instances.)
- **Social/contact:** LinkedIn `linkedin.com/company/venakaninfo` · X `twitter.com/venakaninfo` · `info@venakaninfo.com`.
- **Meta (`index.html`):** title "Venakan Info Solutions | Pure AI. Research to Results."; description = AI‑only company blurb; canonical `https://venakaninfo.com`; **`theme-color #0F172A`**; og:image `…/logos/Venakan_Logo-02.png`.

### Content rules (still in force)
1. **No immigration/visa language** — use "workforce compliance verification", "employment eligibility", "HR compliance".
2. **No fake social proof** — no invented logos/testimonials/avatar rows.
3. **No named‑competitor disparagement** (see §9).
4. Compliance content carries: *"This is for engagement planning only. It is not legal advice."*

---

## 11. Known Issues / Open Items

- **Logo invisible in two spots:** the black logo `<img>` in **`Home.tsx` (final‑CTA, ~line 719)** and **`About.tsx` (~line 785)** does **not** apply the `brightness(0) invert(1)` filter, so it renders near‑invisible on the dark bg. Add the same filter (or use a white logo asset) there.
- **Contact / hero forms are front‑end mocks** — no backend (Formspree ID still a placeholder per old `CLAUDE.md`). Not wired.
- **"Schedule a Call" / Calendly** — real booking link still needed.
- **Founder headshot** — About uses a placeholder; `public/images/arvind-kandula.jpg` not present.
- **Dead `bg-navy*` / no‑op color utility class names** remain in markup (harmless; left to minimize churn).
- **Bundle size** — JS chunk >500 kB (Framer Motion); Vite prints a chunk‑size *warning* (not an error).
- **Strict‑3‑color variant not applied** — a "green is the only accent, strip all blue/violet" redesign was specced but **not** executed; the current system still uses brand blue for CTAs and a green→blue→violet `gradient-text`. Revisit if that direction is chosen.

---

## 12. Recent Change History (most‑recent first, branch `claude/amazing-hypatia-7v2lT`)

1. Removed the footer top logo+tagline banner.
2. **Redesign → Real‑Time Monitoring dark system** (full token rewrite; Oswald; layered hero bg; bento capabilities + new Is/Is‑Not bento; green=status / blue=CTA discipline; `theme-color #0F172A`; `text-white`→white).
3. Hero rotates every **2 s**; removed McKinsey/named‑competitor references.
4. **Dynamic rotating hero** (5 cards, Framer Motion) + stress‑tested **positioning language**.
5. Corrected **founding year to 2018**.
6. Black logo + removed **all eyebrow** labels.
7. Dark → light mode conversion (since superseded by #2).
8. Varied section headers; removed hero mouse‑spotlight; reduced hero bg treatments; differentiated scroll‑reveals; corrected meta tags.

---

## 13. Working Agreement / Deploy

- Develop locally, verify with `npm run build` (zero TS errors) before pushing.
- Push → Vercel auto‑deploys to production in ~60s. **Never push untested to `main`.**
- DNS (GoDaddy) and email (Microsoft 365 MX/SPF) records are configured — **do not touch**.
- Do not change without being asked: meta tags, DNS, `dist/`, `.gitignore`, Vercel build settings.
