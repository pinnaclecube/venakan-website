# CLAUDE.md — Venakan Info Solutions Website
# Read this file at the start of every session before making any changes.

---

## Project Identity

**What this is:** Marketing website for Venakan Info Solutions LLC  
**Live URL:** https://venakaninfo.com  
**GitHub:** https://github.com/pinnaclecube/venakan-website  
**Vercel:** venakan-main-website / venakan-website project  
**Deploy:** Every push to `main` auto-deploys to venakaninfo.com via Vercel (~60 seconds)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vite + React 18 + TypeScript |
| Routing | Wouter (not React Router) |
| Styling | Tailwind CSS v4 + shadcn/ui components |
| Animation | Framer Motion |
| Icons | Lucide React |
| Forms | React Hook Form + Zod validation |
| Build output | dist/ |
| Node | 20.x |

**Critical:** This is NOT Create React App. It is a Vite project.  
Build command: `npm run build`  
Output directory: `dist`  
Dev command: `npm run dev`

---

## Repository Structure

```
/
├── public/
│   ├── logos/
│   │   ├── Venakan_Logo-01.png   ← V mark icon only (favicon, hero)
│   │   ├── Venakan_Logo-02.png   ← Full lockup V + wordmark ← PRIMARY
│   │   ├── Venakan_Logo-03.png   ← White V + wordmark (backup)
│   │   └── Venakan_Logo-04.png   ← Wordmark only
│   └── images/
│       └── arvind-kandula.jpg    ← Founder headshot (MISSING — needs upload)
├── src/
│   ├── main.tsx                  ← Entry point
│   ├── App.tsx                   ← Router + layout
│   ├── index.css                 ← Global styles + CSS variables
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── NeuralCanvas.tsx      ← Animated canvas background
│   │   ├── Reveal.tsx            ← Scroll animation wrapper
│   │   ├── CookieBanner.tsx
│   │   ├── ScrollProgress.tsx
│   │   └── ServiceHero.tsx       ← Reusable hero for service pages
│   └── pages/
│       ├── Home.tsx
│       ├── RD.tsx
│       ├── Strategy.tsx
│       ├── Training.tsx
│       ├── Development.tsx
│       ├── Staffing.tsx
│       ├── Resources.tsx         ← Blog hub + 6 article components
│       ├── About.tsx
│       ├── Contact.tsx
│       ├── Privacy.tsx
│       ├── Disclaimer.tsx
│       └── Terms.tsx
├── index.html                    ← Meta tags live here
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .gitignore
```

---

## Routes

```
/                    Home
/rd                  AI R&D
/strategy            AI Strategy
/training            AI Training
/development         AI Development
/staffing            AI Staffing
/resources           Resources hub
/about               About
/contact             Contact
/privacy             Privacy Policy
/disclaimer          Disclaimer
/terms               Terms of Use

/resources/why-ai-strategies-fail
/resources/ai-readiness-scorecard
/resources/agentic-vs-automation
/resources/workforce-compliance-talent
/resources/llm-production-survival
/resources/responsible-ai
```

---

## Brand — Never Deviate From These

### Tagline
**"Pure AI. Research to Results."**  
Old tagline "We Don't Adopt AI. We Build It." is permanently retired. Never reintroduce it.

### Eyebrow tag
**"AI-First. Always."**

### Colors
```css
--navy:          #06070F   /* page background */
--navy-mid:      #0B0E1A
--navy-light:    #111626
--brand-blue:    #3B4BCC
--brand-violet:  #6B3FA8
--blue-bright:   #60A5FA
--violet-bright: #A78BFA
--cyan:          #06B6D4
--white:         #EEF2FF
--white-dim:     rgba(238,242,255,0.70)
--white-muted:   rgba(238,242,255,0.38)
--border:        rgba(238,242,255,0.07)
--border-mid:    rgba(238,242,255,0.13)
```

### Typography
```
Display / Headings:  Syne 700 or 800
Body:                Space Grotesk 300 / 400 / 500 / 600
Labels / Mono:       JetBrains Mono
```
All loaded via Google Fonts in index.html.

---

## Key Design Patterns

### Glass card
```css
background: rgba(11,14,26,0.55);
border: 1px solid rgba(238,242,255,0.07);
backdrop-filter: blur(24px);
border-radius: 16px;
```

### Gradient text
```css
background: linear-gradient(135deg, #7DA3F8 0%, #9B7FEA 45%, #C084FC 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

### Primary button
```css
background: linear-gradient(135deg, #3B4BCC, #6B3FA8);
color: white;
border-radius: 8px;
padding: 14px 32px;
```

### Ghost button
```css
border: 1px solid rgba(238,242,255,0.13);
border-radius: 8px;
background: transparent;
color: #EEF2FF;
```

### Section padding
```css
section { padding: 72px 0; }
@media (max-width: 768px) { section { padding: 48px 0; } }
```

### Two-column grid
```css
display: grid;
grid-template-columns: 1fr 1fr;
gap: 48px;
/* collapses at 700px */
@media (max-width: 700px) {
  grid-template-columns: 1fr;
  gap: 40px;
}
```

---

## Homepage Hero — Critical Specs

- **Layout:** 65% left (headline + content) / 35% right (contact form card)
- **H1 line 1** "Pure AI." — `clamp(32px, 7vw, 104px)` — white — intentionally LARGER than line 2
- **H1 line 2** "Research to Results." — `clamp(26px, 5.5vw, 80px)` — gradient-text class
- **Grid collapses** to 1 column at `max-width: 860px`
- **Right panel** (contact form) hidden on mobile below 860px
- **paddingTop:** 120px desktop → 80px tablet → 72px mobile

---

## ServiceHero Component

All six service pages (RD, Strategy, Training, Development, Staffing, About) use the
`ServiceHero` component. Props:

```typescript
eyebrow: string
h1Line1: string
h1Line2: string          // renders in gradient-text
subhead: string
chips: string[]          // max 3 proof/feature tags
primaryCta: string       // always links to /contact
secondaryCta: string     // ghost button
secondaryCtaTo: string   // internal route or anchor
rightPanel: ReactNode    // hidden on mobile
stats: { value: string, label: string }[]  // count-up on scroll
```

Layout: 58% left / 42% right. Collapses at 860px. Right panel hidden on mobile.

---

## Meta Tags — CONFIRMED LIVE AND CORRECT

These are already fixed in index.html and live on the site. Do not change them
unless specifically asked:

```html
<title>Venakan Info Solutions | Pure AI. Research to Results.</title>
<meta name="description" content="Venakan Info Solutions is an AI-only company
  specializing in R&D, Strategy, Training, Development, and Staffing.
  We build the AI capability your organization runs on — from research to production.">
<meta property="og:title" content="Venakan Info Solutions | Pure AI. Research to Results.">
<meta property="og:url" content="https://venakaninfo.com">
<meta property="og:image" content="https://venakaninfo.com/logos/Venakan_Logo-02.png">
<meta name="twitter:site" content="@venakaninfo">
<meta name="theme-color" content="#06070F">
<link rel="canonical" href="https://venakaninfo.com">
```

---

## Outstanding Items (fix in this order)

### CRITICAL — affects every visitor right now
- [ ] **Calendly URL** — every "Schedule a Call" button links to `https://calendly.com`
      (the Calendly homepage, not Arvind's booking link). Find all instances in
      Contact.tsx, About.tsx, and any CTA sections. Replace with real URL.
      Real URL: [Arvind to provide from calendly.com account]

- [ ] **Formspree form ID** — Contact form has `YOUR_FORM_ID` placeholder.
      Go to formspree.io → create account → New Form → copy ID.
      Replace in Contact.tsx: `https://formspree.io/f/YOUR_FORM_ID`

### HIGH — fix this week
- [ ] **Hero social proof** — avatar row with fake initials (AK, RJ, MS, PL).
      Replace entire row with:
      `"Currently accepting new strategy and development engagements."`
      Font: JetBrains Mono 12px, color white-muted. No avatar circles.

- [ ] **Article publish dates + author** — all 6 articles have no date or byline.
      Add to each: `"Arvind Kandula · Venakan Research · May 2025"`
      Style: font-mono 11px white-muted, below the article title.

- [ ] **About page headshot** — showing "AK" initials circle.
      Upload photo to `public/images/arvind-kandula.jpg`
      Update About.tsx to use `<img src="/images/arvind-kandula.jpg">`

### MEDIUM — fix this month
- [ ] **Homepage hero subheading** — still somewhat generic.
      Replace with: "Most organizations have an AI strategy. Very few have an AI
      capability. Venakan builds the capability — from the research that tells you
      what's possible to the engineering that makes it run in production."

- [ ] **"What Happens Next" section** — missing on all service pages.
      Add above footer CTA on each service page:
      Step 1: "We review your inquiry and respond within 1 business day."
      Step 2: "30-minute AI readiness conversation — no slides, no pitch."
      Step 3: "We share a proposed engagement scope within 5 business days."

- [ ] **Engagement Models section** — missing on service pages.
      Add 3 tiers: Diagnostic (fixed scope), Advisory (retainer), Enterprise (custom).
      No dollar amounts needed — just the structure.

- [ ] **LinkedIn company page** — not yet activated.
      linkedin.com/company/venakaninfo needs to be set up and active.
      Post all 6 blog articles there.

- [ ] **Article share buttons** — no LinkedIn/X share buttons on articles.
      Add at the bottom of each article.

- [ ] **Blog article dates** — confirmed missing. See HIGH priority above.

---

## Content Rules — Always Follow

1. **No immigration/visa language anywhere** — no H-1B, LCA, I-9, OPT, visa,
   immigration, work authorization. Use instead:
   - "workforce compliance verification"
   - "employment eligibility"
   - "compliance-sensitive talent"
   - "HR compliance"

2. **No fake social proof** — no invented client logos, case studies, testimonials,
   or avatar rows with made-up initials.

3. **White text on dark backgrounds** — use `#EEF2FF` (--white), never opacity-reduced
   text for main content. Muted text uses --white-muted for secondary/label content only.

4. **Regulatory disclaimer** — any compliance-related content must include:
   *"This is for engagement planning only. It is not legal advice."*

5. **Tagline consistency** — "Pure AI. Research to Results." everywhere.
   Never "We Don't Adopt AI. We Build It." — that is permanently retired.

---

## Deployment Workflow

```bash
# Make changes locally
npm run dev          # preview at localhost:5173

# Ship to production
git add .
git commit -m "Description of what changed"
git push             # Vercel auto-deploys, live in ~60 seconds
```

**Never push directly to main without testing locally first.**  
Use `npm run build` to catch TypeScript errors before pushing.

---

## DNS (GoDaddy — confirmed working — do not touch)

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| A | @ | 76.76.21.21 | Vercel |
| CNAME | www | cname.vercel-dns.com | Vercel www |
| TXT | _vercel | vc-domain-verify=... | Vercel ownership |
| MX | @ | Microsoft 365 | Email — NEVER TOUCH |
| TXT | @ | v=spf1 ... | Email SPF — NEVER TOUCH |

---

## Venakan Company Context

**Five service lines:**
1. AI R&D — proprietary products across healthcare, legal, HR, finance, logistics, compliance
2. AI Strategy — AI roadmaps that lead to deployed systems, not just presentations
3. AI Training — role-specific from executive boardroom to developer sprint teams
4. AI Development — AI-native apps, pipelines, agentic systems, documented handoffs
5. AI Staffing — practitioners vetted against Venakan's own delivery benchmarks

**Founder:** Arvind Kandula — Founder & CEO, Venakan Info Solutions LLC  
Also founder of DevCare Solutions and Pinnacle Cube.  
LinkedIn: https://linkedin.com/in/arvindkandula

**Social:**
- LinkedIn: https://linkedin.com/company/venakaninfo
- Twitter/X: https://twitter.com/venakaninfo
- Email: info@venakaninfo.com

---

## What NOT to Change Without Being Asked

- Meta tags in index.html (already correct and live)
- DNS records
- The `dist/` build output (generated automatically)
- The `.gitignore` file
- Vercel build settings (Framework: Vite, Output: dist, Root: ./)

---

*Last updated: June 2026 — post Replit → Vercel migration*
*Repo: github.com/pinnaclecube/venakan-website*
