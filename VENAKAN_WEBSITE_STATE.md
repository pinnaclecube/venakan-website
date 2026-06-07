# Venakan Info Solutions — Website Current State

> **Purpose of this document:** A single source of truth describing the *current* state of the Venakan marketing website, suitable for uploading to Claude as project knowledge. It reflects the codebase as of the latest work and **supersedes the older `CLAUDE.md` wherever they disagree.**

_Last updated: 2026‑06 · Branch: `claude/amazing-hypatia-7v2lT` · Live: https://venakaninfo.com_

> **Theme status:** The site runs a **strict three‑colour dark system**:
> - **`#0F172A`** near‑black (backgrounds/surfaces; with `#1E293B` and `#263348` as the two raised depths)
> - **`#34D399`** emerald green — the **only accent** (all CTAs, active states, highlights, links, tags, stat values, status dots)
> - **`#F1F5F9`** off‑white (all text + low‑opacity borders)
>
> **No blue, no violet, no gradients on UI elements, no light/white surfaces.** (Theme history: dark‑navy → light‑white → blue‑accent "RTM" → this green‑only system. Ignore any lingering blue/violet or light‑mode assumptions in older notes.)

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

## 5. Design System — **STRICT 3‑COLOUR DARK** (current)

All tokens live in `src/index.css`. **Rule: three colours only — near‑black, emerald green, off‑white.** Green is the single accent; it is *not* split into "status vs CTA" anymore (that was the previous blue‑accent system). No blue/violet, no UI gradients, no light surfaces.

### Palette
| Token | Value | Use |
|-------|-------|-----|
| `--black` / `--bg` / `--surface` / `--bg-surface` | `#0F172A` | base background, deep surfaces |
| `--black-mid` / `--bg-base` | `#1E293B` | raised surface / even sections / cards |
| `--black-light` / `--bg-inset` | `#263348` | hover depth / inset |
| `--green` | `#34D399` | **the only accent** — CTAs, active, links, tags, stat values, status dots, highlights |
| `--green-dim` / `--green-border` | `rgba(52,211,153,.10 / .20)` | green tints/borders |
| `--off-white` / `--white` / `--text-1` / `--ink-primary` | `#F1F5F9` | primary text |
| `--text-2` / `--ink-secondary` | `rgba(241,245,249,.70)` | body text |
| `--text-3` / `--ink-tertiary` | `rgba(241,245,249,.42)` | labels/muted, the `✕` marks |
| `--text-4` | `rgba(241,245,249,.18)` | inactive dots |
| `--border` / `--border-mid` | `rgba(241,245,249,.08 / .14)` | borders |

**Legacy aliases are remapped onto the 3 colours so old inline styles flip automatically:** `--brand-blue`, `--brand-violet`, `--cyan`, `--color-brand-blue`, `--color-brand-violet`, `--color-blue-bright`, `--color-violet-bright`, `--color-cyan` **all = `#34D399`**; `--color-navy/-mid/-light` = the three blacks; `--white-dim/-muted` = off‑white at .70/.42; `--light-base/-surface/-ink*` remapped to dark (no light surfaces). **`--color-white = #F1F5F9`** (drives the `text-white` utility → off‑white).

### ⚠️ Critical build wiring (Tailwind v4 — read before editing colours)
No `tailwind.config.js`; colours are wired through `:root` + `@theme inline`.
1. **`text-white` / `text-white/NN` render OFF‑WHITE** (`--color-white: #F1F5F9`). Existing `className="text-white"` / `text-white/70` is correct on the dark bg. `bg-white/10`, `border-white/20` become subtle off‑white tints — also correct. **Do not "fix" these.** (Any old note saying "text‑white renders dark ink" is **stale** and must be ignored.)
2. **`bg-navy`, `text-brand-blue`, `text-blue-bright`, `border-border-mid`, `text-cyan` are NO‑OP utilities** (never registered in `@theme`; emit no CSS). Accents come from inline `style={{…var(--…)}}`, the global classes below, and the legacy aliases.
3. shadcn `@theme` tokens map to the palette via direct `var(--…)` (e.g. `--color-primary: var(--green)`, `--color-primary-foreground: var(--black)`).

### Global component classes (in `index.css`)
- **`.btn-primary`** — **solid green** (`var(--green)`) with **black text**, JetBrains‑Mono 11px uppercase, radius 8; hover = opacity 0.88 + lift. **No gradient.**
- **`.btn-ghost`** — transparent, `1px var(--border-mid)`, off‑white text; hover → green border/text + `green-dim` bg.
- **`.gradient-text`** — **solid green** (not an actual gradient; `color/-webkit-text-fill-color: var(--green)`). Used on hero/service H1 line 2 → renders solid green.
- **`.glass`** — dark card: `background var(--black-mid)`, `1px var(--border)`, radius 8, blur 16; hover green border.
- **`.tag` / `.tag-blue|green|violet|amber` / `.section-label`** — **all collapse to the same green pill** (mono uppercase). `.section-tag` — green mono kicker.
- **`.badge-active`** (green) / **`.badge-pending`** (amber `#FCD34D` — the *one* sanctioned non‑palette colour, for "pending/research" status) / **`.badge-neutral`** (off‑white).
- **`.bento-grid` / `.bento-cell`** — hairline‑bordered grid; cells `var(--black-mid)`, hover `var(--black-light)`.
- **`.grid-bg` / `.grid-bg-fine`** — green dot/line grid, `rgba(52,211,153,0.05)`, 48px.
- **`.section-dark` (#0F172A) / `.section-deep` (#1E293B) / `.section-light`** (neutralised → `#1E293B`; **no light surfaces exist**).
- **`.form-input` / `.form-label` / `.divider`** — dark form helpers (green focus).
- Scrollbar: **solid green** thumb. **Keyframes:** `meshDrift`, `livePulse`/`pulse` (status‑dot), `scrollCue`, `orgPanelIn`; `.reveal` respects reduced‑motion.

### Typography
Google Fonts in **both** `index.html` and `index.css`: **Oswald** (display/headings — `--font-display`/`--oswald`), **Inter** (body — `--font`), **JetBrains Mono** (labels/buttons/tags — `--mono`). `h1–h4` are Oswald 500 globally.

### Motion
- **`Reveal`** (`ui/Reveal.tsx`) — scroll‑reveal variants `heading`/`body`/`card`; respects reduced‑motion.
- **`NeuralCanvas`** (`ui/NeuralCanvas.tsx`) — **green‑only** particle network (node `rgba(52,211,153,0.4)`, glow `0.08`, green lines, max line opacity 0.12). **Homepage hero only**, `opacity={0.45}`.

---

## 6. Homepage Hero (`src/pages/Home.tsx`)

Layout: **left ~65% / right ~35%**, grid `lg:grid-cols-[1.85fr_1fr]`, collapses to 1 column at `max-width: 860px`.

### Layered dark background
Absolutely‑positioned layers behind the content: **Layer 1** green ambient‑glow radial gradients + `var(--surface)` (`meshDrift` animation), **Layer 2** green dot grid (28px), **Layer 3** faint green scan‑lines, **Layer 4** green `NeuralCanvas` @0.45. Content sits at `z-index 1`.

### Left panel = auto‑rotating 5‑card carousel
- **Framer Motion `AnimatePresence` (`mode="wait"`)** crossfade; reduced‑motion → 0.2s opacity.
- **Auto‑advances every 2 s**; **pauses on hover**; **dot indicators** (active = **green** 24×6 pill, inactive = 6px `--text-4` dot) jump + reset the timer.
- **Live‑status pill** above the H1: pulsing green dot (`livePulse`) + mono "Pure AI · Research to Results".
- Per card: H1 line 1 (Oswald, off‑white), **H1 line 2 (`gradient-text` → solid green)**, Oswald‑light subheading, 3‑stat row (**green values**, mono labels, dividers), `btn-primary` (solid green/black) + `btn-ghost`.
- **The 5 cards:** ① "Pure AI." / "Research to Results." → /contact,/rd · ② "Enterprise AI." / "Built for the Midwest." → /strategy,/rd · ③ "AI Strategy." / "That Actually Ships." → /strategy · ④ "We Build AI." / "End to End." → /development · ⑤ "AI Talent." / "Vetted Against Real Delivery." → /staffing.

### Right panel — contact form card
Dark glass, **green 2px top border**, header with green "live" badge, green interest chips (active), `btn-primary` submit. **Local‑state mock** (fake delay → success); not wired to a backend.

### Sections below the hero
Two depths only (`--black` ↔ `--black-mid`); the former "Organization Spectrum" light section is now dark, its role accents all green. Capabilities use a **bento‑grid** with a **green featured cell** (AI R&D, black text). Article preview cards on `--black-mid`, green category tags.

---

## 7. Section Headers / Eyebrows — **REMOVED**

All eyebrow kickers were removed and the `.section-label` markup is gone (the CSS class still exists but renders as a green pill if ever used). `ServiceHero` has **no `eyebrow` prop / no breadcrumb / no card numbers**. Invariants: `grep section-label` → 0 (in markup), `grep eyebrow` → 0, `grep "AI-First. Always."` → 0. **Kept** (content): R&D status badges, interest chips, Resources filter pills, blog category tags, the hero "Live" badge.

---

## 8. Pages & Key Components (current green‑only styling)

- **`ServiceHero`** (RD/Strategy/Training/Development/Staffing/About). Props: `h1Line1`, `h1Line2` (`gradient-text` → green), `subhead`, `chips?` (green), `primaryCta` (→ /contact), `secondaryCta?`+`secondaryCtaTo?`, `rightPanel?` (hidden < 860px), `stats?` (**count‑up, green values**). Layered green‑glow hero bg + `grid-bg-fine`; dark right‑panel card with green top accent. **No eyebrow / no card number.**
- **`StrategyProcessFlow`** — interactive stepper (Strategy page), inline `<style>{spfCss}</style>`, fully dark with green accents.
- **`Navbar`** — 56px frosted dark bar; **white logo** (`brightness(0) invert(1)`); hairline separator; mono‑uppercase links (active = green); **solid‑green "Let's Talk AI →" CTA (black text, hover opacity)**; Oswald mobile overlay.
- **`Footer`** — dark `var(--surface)`; **no top logo/tagline banner** (removed); Oswald column headings; links hover **green**; green newsletter `btn-primary`; green "Made with AI."; dynamic `© {getFullYear()}`.
- **`CookieBanner`** — dark glass; green link; green `btn-primary` accept.
- **`ScrollProgress`** — **solid green** bar (no gradient).
- **`ArticleLayout`** — dark; green Oswald H2s; `text-2` prose; green left‑border callouts; green back link.
- **`Resources`** — dark hub; green‑tint featured card; article cards `--black-mid` → `--black-light` hover; green category tags; **solid‑green active filter pill (black text)**.
- **`About`** — dark sections; founder quote card (green tint + green left border); values tiles (green "01–04"); **2‑column bento "What Venakan Is / Is Not"** — off‑white `✕` marks (no red) on the left, **green `✓` + green callout** on the right; "Founded **2018**" stat.
- **`Contact`** — dark; `glass` form card; green success state; mock submit.
- **Legal** (Privacy/Terms/Disclaimer) — dark hero band + prose; green H2s.

---

## 9. Positioning Language (current, stress‑tested)

No "first and only" claims. Three approved lines, applied by context:
- **Primary** — *"Built exclusively for AI. No legacy IT practice. No generalist consulting. Just AI — from day one."* → About Is/Is‑Not callout + hero Card 1.
- **Secondary** — *"The only Midwest firm covering the full AI spectrum — R&D, Strategy, Training, Development, and Staffing — under one roof."* → hero Card 2 + About hero subhead.
- **Market position** — *"Enterprise AI for organizations that global consulting firms price out and local IT firms underqualify for."* → About intro + Resources hero + hero Card 2.

> **Legal note:** Named‑competitor references were removed — "McKinsey prices out…" → generic **"global consulting firms"**; the "McKinsey State of AI" citation → **"Industry State of AI research, 2024."** Two non‑company citations remain on About (*MIT Sloan Management Review, 2024*; *National Foundation for American Policy, 2023*).

---

## 10. Brand Constants

- **Tagline:** "Pure AI. Research to Results." (Old "We Don't Adopt AI. We Build It." is permanently retired.)
- **Five service lines:** AI R&D · AI Strategy · AI Training · AI Development · AI Staffing.
- **Logo:** `src/assets/venakan-logo.png` is the **BLACK** wordmark, displayed **white** via CSS `filter: brightness(0) invert(1)`. Applied in **all three** render sites: **Navbar**, **Home final‑CTA**, and **About** (the previously‑invisible instances are now fixed). The footer logo banner was removed.
- **Social/contact:** LinkedIn `linkedin.com/company/venakaninfo` · X `twitter.com/venakaninfo` · `info@venakaninfo.com`.
- **Meta (`index.html`):** title "Venakan Info Solutions | Pure AI. Research to Results."; description = AI‑only company blurb; canonical `https://venakaninfo.com`; **`theme-color #0F172A`**; og:image `…/logos/Venakan_Logo-02.png`.

### Content rules (still in force)
1. **No immigration/visa language** — use "workforce compliance verification", "employment eligibility", "HR compliance".
2. **No fake social proof** — no invented logos/testimonials/avatar rows.
3. **No named‑competitor disparagement** (see §9).
4. Compliance content carries: *"This is for engagement planning only. It is not legal advice."*

---

## 11. Known Issues / Open Items

- **Contact / hero forms are front‑end mocks** — no backend (Formspree ID still a placeholder per old `CLAUDE.md`). Not wired.
- **"Schedule a Call" / Calendly** — real booking link still needed.
- **Founder headshot** — About uses a placeholder; `public/images/arvind-kandula.jpg` not present.
- **Dead no‑op color utility class names** (`bg-navy*`, `text-brand-blue`, etc.) remain in markup (harmless; left to minimize churn).
- **shadcn `toast` primitive** still carries its default red "destructive" styling (`ui/toast.tsx`); it is never triggered on the site, so it was left as‑is. Strictly, it's the one component that could still show a non‑palette colour.
- **About "Is / Is Not" bento** keeps its existing heading strings/structure (already off‑white ✕ / green ✓ / green callout); the spec's exact heading copy was not swapped in.
- **Bundle size** — JS chunk >500 kB (Framer Motion); Vite prints a chunk‑size *warning* (not an error).

---

## 12. Recent Change History (most‑recent first, branch `claude/amazing-hypatia-7v2lT`)

1. **Strict green‑only colour discipline** — 3 colours site‑wide (near‑black / emerald / off‑white); solid‑green buttons & `gradient-text`; every blue/violet literal swept to green; negative ✕ marks → off‑white; `NeuralCanvas` green‑only. **+ fixed the two invisible logos** (Home CTA, About) with the white invert filter.
2. Removed the footer top logo+tagline banner.
3. Real‑Time Monitoring **dark** redesign (Oswald, layered hero bg, bento; *blue* accent — since superseded by #1).
4. Hero rotates every **2 s**; removed McKinsey/named‑competitor references.
5. Dynamic rotating hero (5 cards, Framer Motion) + stress‑tested positioning language.
6. Corrected **founding year to 2018**; removed all eyebrow labels.
7. Earlier: light‑mode conversion, varied section headers, hero background cleanup, differentiated scroll‑reveals, corrected meta tags (all superseded by the dark/green systems).

---

## 13. Working Agreement / Deploy

- Develop locally, verify with `npm run build` (zero TS errors) before pushing.
- Push → Vercel auto‑deploys to production in ~60s. **Never push untested to `main`.**
- DNS (GoDaddy) and email (Microsoft 365 MX/SPF) records are configured — **do not touch**.
- Do not change without being asked: meta tags, DNS, `dist/`, `.gitignore`, Vercel build settings.
- **Colour rule going forward:** three colours only — `#0F172A`, `#34D399`, `#F1F5F9`. No blue/violet, no UI gradients, no light surfaces. (The amber `badge-pending` is the single sanctioned exception, for pending/research status.)
