# Venakan Website — Project & UI/UX Guide

> **Single source of truth** for the Venakan Info Solutions marketing site. Upload this to Claude as project knowledge. It describes the **current** state of the codebase — project facts, tech stack, routes, the full UI/UX design system, page/component specs, content rules, known issues, and deploy process.
>
> _Last updated: 2026‑07 · Branch: `claude/amazing-hypatia-7v2lT` · Live: https://venakaninfo.com_

> **Theme in one line:** a **strict three‑colour dark system** — near‑black `#0F172A`, emerald green `#34D399` (the only accent), off‑white `#F1F5F9`. No blue, no violet, no UI gradients, no light/white surfaces. (Theme history: dark‑navy → light‑white → blue‑accent "RTM" → this green‑only system. Ignore any lingering blue/violet or light‑mode assumptions in older notes.)

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
| Forms | React Hook Form `^7.55` + Zod `^3.25` (hero + Contact forms are local‑state mocks, see §12) |
| Data | TanStack Query `^5.90` (provider mounted; minimal usage) |
| Build out | `dist/` |
| Node | 20.x |

**Commands:** `npm run dev` (localhost:5173) · `npm run build` (production, also catches TS errors) · `npx tsc -p tsconfig.json --noEmit` (typecheck). This is a **Vite** project, not CRA.

---

## 3. Repository Structure

```
/
├── index.html                     ← meta tags + Google Fonts live here
├── vercel.json                    ← SPA rewrite (see §11)
├── public/                        ← favicon.svg, robots.txt, opengraph.jpg, images/
├── api/                           ← serverless functions: apply.ts, openings.ts
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
│       ├── Resources, About, Careers, Contact
│       ├── Privacy, Disclaimer, Terms, not-found
│       └── resources/Article1..6.tsx
```

> Layout components live under `src/components/layout/` and UI primitives under `src/components/ui/`.

---

## 4. Routes

```
/                Home
/rd /strategy /training /development /staffing   Service pages
/resources       Resources hub
/about /careers /contact
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

# UI/UX DESIGN SYSTEM

## 5. The One Rule

**Three colours only, dark theme only.**

| | Hex | Role |
|---|---|---|
| Near‑black | `#0F172A` | Backgrounds & surfaces |
| Emerald green | `#34D399` | The **single** accent — everything highlighted |
| Off‑white | `#F1F5F9` | All text and hairline borders |

**No blue. No violet. No UI gradients. No light/white surfaces. No red** (the one sanctioned exception is amber `#FCD34D`, used *only* for the "pending/research" status badge).

If a design instinct calls for a second accent colour, a light card, or a gradient button — it is wrong for this site. Express hierarchy with **depth** (three near‑black shades), **opacity** (off‑white steps), and **the green accent**, not with new hues. Green is a *single* accent — it is not split into "status vs CTA" (that was the previous blue‑accent system).

---

## 6. Colour Tokens

All tokens live in `:root` in `src/index.css`. Use these variables via inline `style={{ … var(--…) }}` or the global classes in §9 — **do not hard‑code hex values** in components.

### Surfaces (three depths of near‑black)
| Token | Value | Use |
|---|---|---|
| `--black` / `--bg` / `--surface` / `--bg-surface` | `#0F172A` | Base page background, deepest surface |
| `--black-mid` / `--bg-base` | `#1E293B` | Raised surface — cards, alternating sections |
| `--black-light` / `--bg-inset` | `#263348` | Hover depth / inset |

### Accent (green — the only one)
| Token | Value | Use |
|---|---|---|
| `--green` | `#34D399` | CTAs, active states, links, tags, stat values, status dots, focus rings, highlights |
| `--green-dim` | `rgba(52,211,153,0.10)` | Green tint fills (hover, chips, callouts) |
| `--green-border` | `rgba(52,211,153,0.20)` | Green hairline borders |

### Text (off‑white at four opacities)
| Token | Value | Use |
|---|---|---|
| `--text-1` / `--ink-primary` / `--white` | `#F1F5F9` | Primary text, headings |
| `--text-2` / `--ink-secondary` | `rgba(241,245,249,0.70)` | Body copy |
| `--text-3` / `--ink-tertiary` | `rgba(241,245,249,0.42)` | Labels, muted text, negative `✕` marks |
| `--text-4` | `rgba(241,245,249,0.18)` | Inactive dots / disabled |

### Borders
| Token | Value | Use |
|---|---|---|
| `--border` | `rgba(241,245,249,0.08)` | Default hairline |
| `--border-mid` | `rgba(241,245,249,0.14)` | Stronger hairline / inputs |

### ⚠️ Tailwind v4 wiring — read before touching colours
There is **no `tailwind.config.js`**. Colours are wired through `:root` + `@theme inline` in `index.css`.
1. **`text-white` renders OFF‑WHITE.** `--color-white` is remapped to `#F1F5F9`, so existing `className="text-white"` / `text-white/70` and `bg-white/10`, `border-white/20` are **correct on the dark background — do not "fix" them.** (Any old note saying "text‑white renders dark ink" is stale.)
2. **Legacy accent utilities are no‑ops.** `bg-navy`, `text-brand-blue`, `text-blue-bright`, `text-cyan`, `border-border-mid` emit no CSS (never registered in `@theme`). Real accents come from inline `style` vars and the global classes in §9. These dead class names remain in markup harmlessly — leave them to minimise churn.
3. **Legacy aliases all collapse to the 3 colours** so old inline styles auto‑convert: `--brand-blue`, `--brand-violet`, `--cyan`, `--color-blue-bright`, `--color-violet-bright` → all `#34D399`; `--color-navy*` → the three blacks; `--white-dim/-muted` → off‑white @ .70/.42; `--light-base/-surface/-ink*` → remapped to dark (no light surfaces).
4. shadcn tokens map straight through: `--color-primary: var(--green)`, `--color-primary-foreground: var(--black)`, `--color-ring: var(--green)`.

---

## 7. Typography

Fonts are loaded in **both** `index.html` and `index.css`.

| Family | Token | Role |
|---|---|---|
| **Oswald** (300–600) | `--oswald` / `--font-display` | Display & all headings (`h1–h4` are Oswald 500 globally) |
| **Inter** (300–700) | `--font` / `--font-body` | Body copy, subheadings |
| **JetBrains Mono** (400/600) | `--mono` | Labels, buttons, tags, badges, kickers, stat labels |

**Heading defaults** (`h1–h4`): Oswald, weight 500, `letter-spacing: -0.01em`, `text-wrap: balance`, colour `--text-1`.

**The mono micro‑label pattern** (buttons, tags, form labels, section kickers): JetBrains Mono, ~9–11px, weight 600–700, `letter-spacing: 0.08–0.12em`, `text-transform: uppercase`, colour green (or `--text-3` for muted labels). This is the site's signature "technical" texture — reach for it on any small metadata label.

**Hero H1 two‑line pattern:** line 1 in off‑white (`--text-1`), line 2 in **`.gradient-text` (solid green)**. The green line carries the emphasis/differentiator. Both lines Oswald, tight tracking (`-0.04em`), `line-height: 1.05`.

---

## 8. Layout, Spacing & Motion

| Element | Spec |
|---|---|
| Container | `.container` — `max-width: 1200px`, side padding `48px` (→ `24px` ≤768px) |
| Section rhythm | `section { padding: 72px 0 }` (→ `48px` ≤768px) |
| Hero top padding | `.hero-home` / `.hero-service` → `120px` top (→ `80px` ≤860px, `72px` ≤480px) |
| Two‑column | `.two-col` grid, `gap: 64px`; variants `.two-col-55-45`, `.two-col-45-55`; collapses to 1 col + `gap: 32px` ≤700px |
| Radius | `--r: 8px` (cards, buttons, inputs); pills use `9999px` |
| Breakpoints | **860px** (hero grids → 1 col, hero right‑panel hidden), **768px** (container/section padding), **700px** (two‑col collapse), **480px** (hero line‑height) |
| Scrollbar | 3px track (`--black`), **solid‑green** thumb |

**Motion:**
- **`Reveal`** (`components/ui/Reveal.tsx`) — scroll‑reveal wrapper with variants `heading` / `body` / `card`. Use it to stagger content into view. Respects `prefers-reduced-motion`.
- **Framer Motion** drives the hero card crossfade (`AnimatePresence mode="wait"`) and `PageTransition`.
- **`NeuralCanvas`** (`components/ui/NeuralCanvas.tsx`) — **green‑only** particle network (node `rgba(52,211,153,0.4)`, glow `0.08`, green lines, max line opacity 0.12). **Homepage hero only**, `opacity={0.45}`.
- **Keyframes** in `index.css`: `orbDriftSimple` / `shimmer` (hero bg), `livePulse` / `pulse` (status dots), `scrollCue`, `orgPanelIn`, `meshDrift`.
- **Reduced motion:** hero background animations stop; `.reveal` collapses to a 0.2s opacity fade with no transform. Always honour this when adding motion.

---

## 9. Component Specs (global classes in `index.css`)

Prefer these classes over ad‑hoc styling so the system stays consistent.

### Buttons
- **`.btn-primary`** — **solid green** background, **black** text, JetBrains Mono 11px/700 uppercase, `letter-spacing: 0.08em`, padding `12px 22px`, radius 8. Hover: `opacity: 0.88` + `translateY(-1px)`. **Never a gradient.** The primary CTA everywhere ("Start the Conversation →", nav "Let's Talk AI →").
- **`.btn-ghost`** — transparent, `1px solid var(--border-mid)`, off‑white text, same mono label style. Hover: green border + green text + `--green-dim` fill.

### Cards
- **`.glass`** — the default card: `background var(--black-mid)`, `1px solid var(--border)`, radius 8, `backdrop-filter: blur(16px)`. Hover: border → `--green-border`.
- **`.bento-grid` / `.bento-cell`** — hairline‑separated grid (1px gaps over `--border`); cells `--black-mid`, hover `--black-light`. Featured cells can invert to **solid green with black text**.

### Tags, badges & kickers
- **`.tag` and every legacy variant** (`.tag-blue`, `.tag-green`, `.tag-violet`, `.tag-amber`, `.section-label`) all render the **same green pill**: `--green-dim` fill, `--green-border`, green mono 9px uppercase, radius pill.
- **`.section-tag`** — green mono kicker (9px, `letter-spacing: 0.12em`), block, used above section headings.
- **`.badge-active`** — green pill (live/active status).
- **`.badge-pending`** — **amber `#FCD34D`** pill — the *only* sanctioned non‑palette colour, reserved for "pending / in‑research" status.
- **`.badge-neutral`** — off‑white pill (`--border` fill, `--text-3` text).

### Forms
- **`.form-input`** — `rgba(241,245,249,0.05)` fill, `1px --border-mid`, radius 6, 13px Inter. Focus: green border, `--green-dim` fill, `box-shadow: 0 0 0 3px rgba(52,211,153,0.08)`. Placeholder `--text-3`.
- **`.form-label`** — mono 9px uppercase, `--text-3`, `letter-spacing: 0.12em`.

### Backgrounds & structure
- **`.grid-bg` / `.grid-bg-fine`** — faint green line/dot grid (`rgba(52,211,153,0.05)`, 48px).
- **`.section-dark` (`#0F172A`) / `.section-deep` (`#1E293B`)** — the two‑depth section alternation. **`.section-light` is neutralised to `#1E293B`** — there are no light surfaces.
- **`.divider`** — 1px `--border` rule.
- **`.gradient-text`** — despite the name, renders **solid green** (`color` + `-webkit-text-fill-color: var(--green)`). Used for hero/service H1 line 2.

---

## 10. Homepage Hero (`src/pages/Home.tsx`)

**Layout:** left ~65% / right ~35% (`lg:grid-cols-[1.85fr_1fr]`); collapses to one column at ≤860px, where the right panel is hidden.

**Layered dark background** (absolutely positioned, behind content):
1. Green ambient‑glow radials + base (`.hero-orbs`, `orbDriftSimple` 20s)
2. Green dot grid 28px (`.hero-dotgrid`)
3. Diagonal green shimmer sweep (`.hero-shimmer`, 12s)
4. Vignette (`.hero-vignette`); optional photographic `.hero-image` (neural network) with a green‑tinted overlay; plus green `NeuralCanvas` @0.45.

**Left panel — auto‑rotating 5‑card carousel:**
- Framer Motion `AnimatePresence mode="wait"` crossfade (reduced‑motion → 0.2s opacity).
- **Auto‑advances every 2s; pauses on hover.** Dot indicators: active = green `24×6` pill, inactive = 6px `--text-4` dot; clicking a dot jumps and resets the timer.
- A pulsing green **live‑status pill** sits above the H1.
- Each card renders: **H1 line 1** (Oswald, off‑white) + **H1 line 2** (`.gradient-text`, solid green), an Oswald‑light subheading, a **3‑stat row** (green values, mono labels, hairline dividers), and `.btn-primary` + `.btn-ghost`.

**The 5 cards (line 1 / line 2 → CTAs):**
1. **"Get AI-ready" / "before you spend a dollar building it."** → /contact, /rd  *(latest copy; green line carries the "before you spend" differentiator)*
2. "Enterprise AI." / "Built for the Midwest." → /strategy, /rd
3. "AI Strategy." / "That Actually Ships." → /strategy
4. "We Build AI." / "End to End." → /development
5. "AI Talent." / "Vetted Against Real Delivery." → /staffing

> Card 1 is shown on load, then the hero rotates 1→5 every 2s. When editing hero copy, change only the `HERO_CARDS` string values — the markup, timing, animation, and dot logic stay untouched.

**Right panel — contact form card:** dark `.glass` with a **green 2px top border**, a green "live" badge header, green interest chips (active state), `.btn-primary` submit. Currently a **local‑state mock** (fake delay → success), not wired to a backend.

**Sections below the hero:** two depths only (`--black` ↔ `--black-mid`). Capabilities use a **bento‑grid** with a green featured cell (AI R&D, black text). Article preview cards on `--black-mid`, green category tags.

---

## 11. Pages & Shared Components

### Section headers / eyebrows — REMOVED
All eyebrow kickers were removed site‑wide. `ServiceHero` has **no `eyebrow` prop, no breadcrumb, no card numbers**. Invariants: no `section-label`/`eyebrow` in markup. **Kept** (content): R&D status badges, interest chips, Resources filter pills, blog category tags, the hero "Live" badge.

### Shared chrome
- **Navbar** (`layout/Navbar.tsx`) — 56px frosted dark bar; **white logo** (black wordmark inverted via `filter: brightness(0) invert(1)`); hairline bottom separator; mono‑uppercase links (active = green); solid‑green **"Let's Talk AI →"** CTA (black text, hover opacity); Oswald mobile overlay.
- **Footer** — dark (`--black`); Oswald column headings; links hover green; green newsletter `.btn-primary`; green "Made with AI."; dynamic `© {year}`. (No top logo/tagline banner — removed.)
- **ScrollProgress** — **solid‑green** top bar (no gradient).
- **CookieBanner** — dark glass, green link, green accept `.btn-primary`.
- **ArticleLayout** — dark; green Oswald H2s; `text-2` prose; green left‑border callouts; green back link.

### Pages
- **`ServiceHero`** (RD/Strategy/Training/Development/Staffing/About). Props: `h1Line1`, `h1Line2` (green), `subhead`, `chips?` (green), `primaryCta` (→ /contact), `secondaryCta?` + `secondaryCtaTo?`, `rightPanel?` (hidden ≤860px), `stats?` (count‑up, green values). Layered green‑glow hero bg + `grid-bg-fine`; dark right‑panel card with green top accent. **No eyebrow / no card number.**
- **`StrategyProcessFlow`** — interactive stepper (Strategy page), inline `<style>{spfCss}</style>`, fully dark with green accents.
- **Resources** — dark hub; green‑tint featured card; article cards `--black-mid` → `--black-light` hover; green category tags; **solid‑green active filter pill (black text)**.
- **About** — dark sections; founder quote card (green tint + green left border); values tiles (green "01–04"); **2‑column bento "What Venakan Is / Is Not"** — off‑white `✕` marks (no red) on the left, **green `✓` + green callout** on the right; "Founded **2018**" stat.
- **Careers** — job openings + application flow; backed by `api/openings.ts` and `api/apply.ts`.
- **Contact** — dark; `glass` form card; green success state; mock submit.
- **Legal** (Privacy/Terms/Disclaimer) — dark hero band + prose; green H2s.

### Routing note (SPA deep links)
The site is a client‑side SPA (Wouter). `vercel.json` contains an SPA rewrite so direct URLs / refreshes on deep routes (e.g. `/careers`, `/about`) resolve to `index.html` and the router renders them — without it, only in‑app navigation works and direct hits 404. The rewrite **excludes `/api/*`** so serverless functions still resolve:

```json
{ "rewrites": [ { "source": "/((?!api/).*)", "destination": "/index.html" } ] }
```

Leave this in place; a missing SPA fallback is the usual cause of "works from the menu, 404 on direct link."

---

## 12. Positioning Language (current, stress‑tested)

No "first and only" claims. Three approved lines, applied by context:
- **Primary** — *"Built exclusively for AI. No legacy IT practice. No generalist consulting. Just AI — from day one."* → About Is/Is‑Not callout + hero.
- **Secondary** — *"The only Midwest firm covering the full AI spectrum — R&D, Strategy, Training, Development, and Staffing — under one roof."* → hero Card 2 + About hero subhead.
- **Market position** — *"Enterprise AI for organizations that global consulting firms price out and local IT firms underqualify for."* → About intro + Resources hero + hero Card 2.

> **Legal note:** Named‑competitor references were removed — "McKinsey prices out…" → generic **"global consulting firms"**; the "McKinsey State of AI" citation → **"Industry State of AI research, 2024."** Two non‑company citations remain on About (*MIT Sloan Management Review, 2024*; *National Foundation for American Policy, 2023*).

---

## 13. Brand Constants & Content Rules

- **Tagline:** "Pure AI. Research to Results." (Old "We Don't Adopt AI. We Build It." is permanently retired.)
- **Five service lines:** AI R&D · AI Strategy · AI Training · AI Development · AI Staffing.
- **Logo:** `src/assets/venakan-logo.png` is the **BLACK** wordmark, displayed **white** via CSS `filter: brightness(0) invert(1)`. Applied in Navbar, Home final‑CTA, and About. The footer logo banner was removed.
- **Social/contact:** LinkedIn `linkedin.com/company/venakaninfo` · X `twitter.com/venakaninfo` · `info@venakaninfo.com`.
- **Meta (`index.html`):** title "Venakan Info Solutions | Pure AI. Research to Results."; AI‑only description; canonical `https://venakaninfo.com`; **`theme-color #0F172A`**.

**Content rules (in force):**
1. **No immigration/visa language** — use "workforce compliance verification", "employment eligibility", "HR compliance".
2. **No fake social proof** — no invented logos/testimonials/avatar rows.
3. **No named‑competitor disparagement** (see §12).
4. Compliance content carries: *"This is for engagement planning only. It is not legal advice."*

---

## 14. Design Do / Don't

**Do**
- Build hierarchy from the three near‑black depths + off‑white opacity steps + the green accent.
- Reuse the global classes (`.btn-primary`, `.glass`, `.tag`, `.form-input`, …) and CSS tokens.
- Use the mono‑uppercase micro‑label for any small metadata/label.
- Keep the hero H1 two‑line pattern (off‑white line 1, green line 2).
- Honour `prefers-reduced-motion` on anything animated.

**Don't**
- Introduce a second accent colour, a gradient on a UI element, a light/white surface, or red.
- Hard‑code hex values in components — use the tokens.
- "Fix" `text-white` / `bg-white/10` (they render off‑white on purpose) or add utilities for the no‑op legacy class names.
- Re‑add eyebrow kickers, breadcrumbs, or hero card numbers.
- Change hero timing, animation, or dot logic when only the copy needs to change.

---

## 15. Known Issues / Open Items

- **Contact / hero forms are front‑end mocks** — no backend wired (Formspree ID still a placeholder). The Careers apply flow uses `api/apply.ts`.
- **"Schedule a Call" / Calendly** — real booking link still needed.
- **Founder headshot** — About uses a placeholder; `public/images/arvind-kandula.jpg` not present.
- **Dead no‑op colour utility class names** (`bg-navy*`, `text-brand-blue`, etc.) remain in markup (harmless; left to minimise churn).
- **shadcn `toast` primitive** still carries its default red "destructive" styling (`ui/toast.tsx`); never triggered on the site, so left as‑is — strictly the one component that could show a non‑palette colour.
- **Bundle size** — JS chunk >500 kB (Framer Motion); Vite prints a chunk‑size *warning* (not an error).

---

## 16. Working Agreement / Deploy

- Develop locally, verify with `npm run build` (zero TS errors) before pushing.
- Push → Vercel auto‑deploys to production in ~60s. **Never push untested to `main`.**
- DNS (GoDaddy) and email (Microsoft 365 MX/SPF) records are configured — **do not touch**.
- Do not change without being asked: meta tags, DNS, `dist/`, `.gitignore`, Vercel build settings.
- **Colour rule going forward:** three colours only — `#0F172A`, `#34D399`, `#F1F5F9`. No blue/violet, no UI gradients, no light surfaces. (The amber `badge-pending` is the single sanctioned exception.)
