# 🚀 My Page Agent — Landing Page Architecture Plan

> **@FE Agent | Phase: SPEC + PLAN (no code yet)**  
> This document is the master architecture blueprint for the landing page.  
> All building work will reference this as the single source of truth.

---

## 1. Product Vision

### What Are We Building?

A **premium, high-conversion landing page** for **My Page Agent** — an AI-powered browser extension that automates web tasks using natural language commands.

### Target Audience

| Segment | Description | Key Message |
|---------|-------------|-------------|
| **Developers** | Want to automate repetitive browser tasks | "Your AI pair programmer for the browser" |
| **Power Users** | Non-technical but want automation | "Just tell it what to do, in plain English" |
| **Teams** | Looking for workflow automation tools | "Automate browser workflows across your team" |

### Core Goals

1. **Explain** what the extension does in ≤ 5 seconds
2. **Demonstrate** the agent in action (live/animated demo)
3. **Convert** visitors → Chrome Web Store installs
4. **Establish trust** — open-source, local LLM, privacy-first

---

## 2. Page Sections (Top → Bottom)

### Section 1: Hero

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR  [Logo]  Features  How It Works  Pricing  [CTA] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Your AI Co-pilot                                      │
│   for the Browser                                       │
│                                                         │
│   Tell it what to do. Watch it work.                    │
│   [Install Free] [Watch Demo →]                         │
│                                                         │
│   ┌───────────────────────────────────────┐              │
│   │  ▶ Animated browser mockup showing    │              │
│   │    agent typing, clicking, navigating │              │
│   └───────────────────────────────────────┘              │
│                                                         │
│   Trusted by 2,000+ developers                          │
│   [GitHub Stars] [Chrome Users] [Rating]                │
└─────────────────────────────────────────────────────────┘
```

**Components needed:**
- `<Navbar />` — sticky, glassmorphic, blur-on-scroll
- `<HeroSection />` — gradient text, animated CTA buttons
- `<BrowserMockup />` — animated demo of agent working
- `<TrustBar />` — social proof metrics

**Animations:**
- Hero text: staggered fade-up on load (Framer Motion)
- Browser mockup: auto-playing step-by-step agent demo
- Trust metrics: count-up numbers on scroll-into-view

---

### Section 2: Features Grid

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│           What Can It Do?                              │
│                                                        │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│   │ 🌐       │  │ 🤖       │  │ 🔒       │            │
│   │ Multi-Tab│  │ Natural  │  │ Privacy  │            │
│   │ Control  │  │ Language │  │ First    │            │
│   └──────────┘  └──────────┘  └──────────┘            │
│                                                        │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│   │ ⚡       │  │ 🔧       │  │ 📊       │            │
│   │ Fast     │  │ Custom   │  │ Smart    │            │
│   │ Setup    │  │ Tools    │  │ Context  │            │
│   └──────────┘  └──────────┘  └──────────┘            │
└────────────────────────────────────────────────────────┘
```

**Features to highlight:**

| # | Icon | Title | Description |
|---|------|-------|-------------|
| 1 | 🌐 | Multi-Tab Control | Navigate, open, close, and switch between multiple tabs simultaneously |
| 2 | 🤖 | Natural Language | Just describe your task in plain English — no coding required |
| 3 | 🔒 | Privacy First | Runs entirely on your machine with Ollama. No data sent to the cloud |
| 4 | ⚡ | One-Click Setup | Install the extension, run Ollama, and you're ready in 60 seconds |
| 5 | 🔧 | Custom LLM Support | Bring your own model — OpenAI, Anthropic, Groq, or any OpenAI-compatible API |
| 6 | 📊 | Smart Page Reading | Understands page structure, forms, buttons — sees what you see |

**Components needed:**
- `<SectionHeading />` — reusable, with subtitle support
- `<FeatureCard />` — icon + title + description, hover lift effect
- `<FeaturesGrid />` — 3x2 responsive grid

---

### Section 3: Live Demo / Video

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│           See It In Action                             │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │                                                │   │
│   │    Interactive demo or embedded video           │   │
│   │    showing the agent completing a real task     │   │
│   │                                                │   │
│   └────────────────────────────────────────────────┘   │
│                                                        │
│   "Book a flight"  "Fill this form"  "Compare prices"  │
│   ↑ Clickable use-case tabs                            │
└────────────────────────────────────────────────────────┘
```

**Components needed:**
- `<DemoSection />` — container with use-case tab switcher
- `<DemoPlayer />` — video/animation player with controls
- `<UseCaseTabs />` — horizontal tab selector for different demos

---

### Section 4: How It Works

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│           How It Works                                 │
│                                                        │
│   ①──────────── ②──────────── ③──────────── ④         │
│                                                        │
│   Install       Tell it       Watch it      Done!      │
│   Extension     what to do    work                     │
│                                                        │
│   Add from      Type your     Agent reads   Task       │
│   Chrome Web    task in the   the page,     complete.  │
│   Store + run   side panel    clicks, types Review     │
│   Ollama                      & navigates   results.   │
└────────────────────────────────────────────────────────┘
```

**Components needed:**
- `<StepsSection />` — horizontal stepper with connecting line
- `<StepCard />` — step number + icon + title + description

**Animation:** Steps animate in sequentially on scroll, with a progress line filling between them.

---

### Section 5: Open Source Banner

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│           100% Free. 100% Open Source.                 │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │                                                │   │
│   │  ✅ Full multi-tab agent         MIT License   │   │
│   │  ✅ Local LLM (Ollama)           Forever free  │   │
│   │  ✅ Custom LLM support           No telemetry  │   │
│   │  ✅ All features included        No paywall    │   │
│   │                                                │   │
│   │  [⭐ Star on GitHub]  [Install Extension]      │   │
│   │                                                │   │
│   └────────────────────────────────────────────────┘   │
│                                                        │
│   GitHub Stars: ███   Contributors: ██   Forks: ██     │
└────────────────────────────────────────────────────────┘
```

**Components needed:**
- `<OpenSourceSection />` — single centered card with feature checklist
- `<GitHubStats />` — live stats from GitHub API (stars, forks, contributors)

---

### Section 6: Testimonials / Social Proof

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│   "This replaced 3 browser automation tools for me."   │
│    — Developer, GitHub                                 │
│                                                        │
│   [◀]  Testimonial carousel  [▶]                       │
│                                                        │
│   ⭐⭐⭐⭐⭐ 4.9/5 on Chrome Web Store                │
└────────────────────────────────────────────────────────┘
```

**Components needed:**
- `<TestimonialsSection />`
- `<TestimonialCard />` — avatar, quote, name, role
- `<Carousel />` — auto-scroll with manual controls

---

### Section 7: Final CTA

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │                                                │   │
│   │   Ready to automate your browser?              │   │
│   │                                                │   │
│   │   [Install Free — Chrome Web Store]            │   │
│   │   [⭐ Star on GitHub]                          │   │
│   │                                                │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

**Components needed:**
- `<CTASection />` — gradient background, centered text, two buttons

---

### Section 8: Footer

```
┌────────────────────────────────────────────────────────┐
│  Logo    Product      Resources     Connect            │
│          Features     Docs          GitHub             │
│          Pricing      Blog          Twitter            │
│          Changelog    FAQ           Discord            │
│                                                        │
│  © 2026 My Page Agent. Open Source under MIT.          │
└────────────────────────────────────────────────────────┘
```

**Components needed:**
- `<Footer />` — 4-column responsive grid
- `<FooterColumn />` — title + links list

---

## 3. Component Architecture

### Component Tree

```
<App>
├── <Navbar />
│   ├── <Logo />
│   ├── <NavLinks />
│   └── <CTAButton variant="nav" />
│
├── <HeroSection />
│   ├── <GradientText />
│   ├── <HeroButtons />
│   │   ├── <CTAButton variant="primary" />
│   │   └── <CTAButton variant="secondary" />
│   ├── <BrowserMockup />
│   │   └── <AgentAnimation />
│   └── <TrustBar />
│       └── <TrustMetric /> ×3
│
├── <FeaturesSection />
│   ├── <SectionHeading />
│   └── <FeaturesGrid />
│       └── <FeatureCard /> ×6
│
├── <DemoSection />
│   ├── <SectionHeading />
│   ├── <UseCaseTabs />
│   └── <DemoPlayer />
│
├── <HowItWorksSection />
│   ├── <SectionHeading />
│   └── <StepsList />
│       ├── <StepConnector />
│       └── <StepCard /> ×4
│
├── <OpenSourceSection />
│   ├── <SectionHeading />
│   ├── <OpenSourceCard />
│   └── <GitHubStats />
│
├── <TestimonialsSection />
│   ├── <SectionHeading />
│   └── <Carousel />
│       └── <TestimonialCard /> ×N
│
├── <CTASection />
│   ├── <GradientText />
│   └── <HeroButtons />
│
└── <Footer />
    ├── <Logo />
    ├── <FooterColumn /> ×4
    └── <FooterBottom />
```

### Shared/Reusable Components

| Component | Props | States | Used In |
|-----------|-------|--------|---------|
| `<CTAButton>` | `variant`, `href`, `children`, `icon` | `hover`, `loading` | Hero, Navbar, CTA, Pricing |
| `<SectionHeading>` | `title`, `subtitle`, `align` | — | Features, Demo, Steps, Pricing, Testimonials |
| `<GradientText>` | `children`, `from`, `to` | — | Hero, CTA |
| `<Logo>` | `size` | — | Navbar, Footer |

---

## 4. Tech Stack Decision

| Choice | Technology | Rationale |
|--------|-----------|-----------|
| **Framework** | Next.js 14 (App Router) | SSG for performance, SEO, image optimization |
| **Language** | TypeScript (strict) | Per @FE constraints — no `any` types |
| **Styling** | CSS Modules + CSS custom properties | No external CSS framework dependency, full control |
| **Animations** | Framer Motion + **Lottie React** | Scroll-triggered FX (Framer) + agent demo animations (Lottie `.json` files) |
| **Icons** | Lucide React | Already in the project's dependencies |
| **Fonts** | Inter (Google Fonts) | Clean, modern, variable weight |
| **Deployment** | **Vercel** | SSG + edge network + preview deploys + custom domain |
| **Analytics** | Plausible (privacy-first) | Aligns with the product's privacy-first messaging |
| **Demo Assets** | Lottie files (`.json`) + demo video (`.webm`) | Lightweight vector animations for agent mockup |

---

## 5. Design System Tokens

### Colors — "Obsidian Ember" Theme

```css
/* ─── Obsidian Backgrounds (warm-tinted near-blacks) ─── */
--color-bg-primary:       #0f0f0f;        /* Obsidian — main background */
--color-bg-secondary:     #161616;        /* Slightly lighter obsidian — section alt */
--color-bg-elevated:      #1c1c1c;        /* Elevated cards, navbar */
--color-bg-surface:       #222222;        /* Input fields, hover states */

/* ─── Orange Accents ─── */
--color-accent-primary:   #f97316;        /* Vibrant orange — primary brand */
--color-accent-secondary: #fb923c;        /* Lighter orange — hover states */
--color-accent-dark:      #ea580c;        /* Deep orange — pressed states */
--color-accent-glow:      #fdba74;        /* Soft orange — glow effects */

/* ─── Text ─── */
--color-text-primary:     #fafafa;        /* Near-white — headings */
--color-text-secondary:   #a3a3a3;        /* Warm gray — body text */
--color-text-tertiary:    #737373;        /* Muted — captions */
--color-text-on-accent:   #0f0f0f;        /* Dark text on orange buttons */

/* ─── Semantic ─── */
--color-success:          #22c55e;        /* Green */
--color-warning:          #eab308;        /* Yellow */
--color-error:            #ef4444;        /* Red */

/* ─── Gradients ─── */
--gradient-hero:          linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fdba74 100%);
--gradient-card:          linear-gradient(145deg, rgba(249,115,22,0.08) 0%, rgba(251,146,60,0.03) 100%);
--gradient-cta:           linear-gradient(135deg, #f97316 0%, #ea580c 100%);
--gradient-bg-radial:     radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.12) 0%, transparent 60%);
```

### Glassmorphism System

```css
/* ─── Glass Card (primary glassmorphic surface) ─── */
--glass-bg:               rgba(22, 22, 22, 0.6);           /* Semi-transparent obsidian */
--glass-bg-hover:         rgba(28, 28, 28, 0.75);          /* Slightly more opaque on hover */
--glass-blur:             blur(16px);                       /* Backdrop blur intensity */
--glass-border:           1px solid rgba(255, 255, 255, 0.06);  /* Subtle white edge */
--glass-border-accent:    1px solid rgba(249, 115, 22, 0.15);   /* Orange-tinted edge */
--glass-shadow:           0 8px 32px rgba(0, 0, 0, 0.4);        /* Depth shadow */

/* ─── Glass Navbar ─── */
--glass-nav-bg:           rgba(15, 15, 15, 0.7);
--glass-nav-blur:         blur(20px);
--glass-nav-border:       1px solid rgba(255, 255, 255, 0.04);

/* ─── Glass Input ─── */
--glass-input-bg:         rgba(34, 34, 34, 0.5);
--glass-input-border:     1px solid rgba(255, 255, 255, 0.08);
--glass-input-focus:      1px solid rgba(249, 115, 22, 0.4);
```

### Typography

```css
--font-family:            'Inter', system-ui, -apple-system, sans-serif;

--font-size-hero:         clamp(2.5rem, 5vw, 4.5rem);     /* 40px → 72px */
--font-size-h2:           clamp(1.75rem, 3vw, 2.5rem);    /* 28px → 40px */
--font-size-h3:           clamp(1.25rem, 2vw, 1.5rem);    /* 20px → 24px */
--font-size-body:         1rem;                             /* 16px */
--font-size-small:        0.875rem;                         /* 14px */
--font-size-caption:      0.75rem;                          /* 12px */

--font-weight-bold:       700;
--font-weight-semibold:   600;
--font-weight-medium:     500;
--font-weight-regular:    400;
```

### Spacing

```css
--space-section:          clamp(80px, 10vw, 140px);   /* Between sections */
--space-lg:               64px;
--space-md:               32px;
--space-sm:               16px;
--space-xs:               8px;
```

### Animation Tokens

```css
--ease-out-expo:          cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out:            cubic-bezier(0.4, 0, 0.2, 1);
--duration-fast:          150ms;
--duration-normal:        300ms;
--duration-slow:          500ms;
--duration-section:       800ms;
```

### Shadows & Effects

```css
--shadow-card:            0 4px 24px rgba(0, 0, 0, 0.4);
--shadow-card-hover:      0 8px 40px rgba(249, 115, 22, 0.12);
--shadow-glow:            0 0 80px rgba(249, 115, 22, 0.2);
--shadow-glow-sm:         0 0 30px rgba(249, 115, 22, 0.15);
--shadow-cta:             0 4px 20px rgba(249, 115, 22, 0.3);
--shadow-cta-hover:       0 6px 30px rgba(249, 115, 22, 0.45);
```

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|-----------|-------|----------------|
| **Mobile** | < 640px | Single column, stacked cards, hamburger nav |
| **Tablet** | 640–1024px | 2-column grids, compact hero |
| **Desktop** | 1024–1440px | Full layout, 3-column grids |
| **Wide** | > 1440px | Max-width container (1280px), centered |

---

## 7. Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| **LCP** | < 2.5s | SSG, optimized hero image, font preload |
| **FID** | < 100ms | Minimal JS on initial load, deferred animations |
| **CLS** | < 0.1 | Reserved image dimensions, font-display: swap |
| **Bundle** | < 150KB (gzipped) | Tree-shaking, lazy load below-fold sections |
| **Lighthouse** | ≥ 95 (all categories) | Semantic HTML, ARIA, contrast ratios |

---

## 8. Accessibility Requirements (WCAG 2.1 AA)

- [ ] All images have descriptive `alt` text
- [ ] Color contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text
- [ ] All interactive elements are keyboard-navigable
- [ ] Focus indicators are visible and styled
- [ ] Skip-to-content link at top of page
- [ ] Semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`)
- [ ] ARIA labels on icon-only buttons
- [ ] Reduced motion support via `prefers-reduced-motion`
- [ ] Form inputs have associated labels

---

## 9. File Structure (inside same repo)

```
my-page-agent-ext/
├── agent/                              ← Existing extension code
├── entrypoints/                        ← Existing extension entrypoints
├── assets/                             ← Existing extension assets
├── public/                             ← Existing extension public
├── package.json                        ← Extension package.json
├── wxt.config.ts                       ← Extension config
│
└── landing/                            ← NEW: Landing page (separate Next.js app)
    ├── public/
    │   ├── fonts/
    │   │   └── Inter-Variable.woff2
    │   ├── images/
    │   │   ├── og-image.png            (1200×630 Open Graph)
    │   │   └── hero-browser-mockup.webp
    │   ├── lottie/                     ← Lottie animation JSON files
    │   │   ├── agent-typing.json
    │   │   ├── agent-clicking.json
    │   │   └── agent-navigating.json
    │   ├── videos/
    │   │   └── demo.webm               (Fallback demo video)
    │   └── favicon.ico
    │
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   └── globals.css
    │   │
    │   ├── components/
    │   │   ├── ui/                      (Shared primitives)
    │   │   │   ├── CTAButton.tsx
    │   │   │   ├── SectionHeading.tsx
    │   │   │   ├── GradientText.tsx
    │   │   │   ├── Logo.tsx
    │   │   │   └── Carousel.tsx
    │   │   │
    │   │   ├── sections/                (Page sections)
    │   │   │   ├── Navbar.tsx
    │   │   │   ├── HeroSection.tsx
    │   │   │   ├── FeaturesSection.tsx
    │   │   │   ├── DemoSection.tsx
    │   │   │   ├── HowItWorksSection.tsx
    │   │   │   ├── OpenSourceSection.tsx
    │   │   │   ├── TestimonialsSection.tsx
    │   │   │   ├── CTASection.tsx
    │   │   │   └── Footer.tsx
    │   │   │
    │   │   └── demo/                    (Lottie + agent demo)
    │   │       ├── BrowserMockup.tsx
    │   │       ├── LottiePlayer.tsx     ← Lottie wrapper component
    │   │       └── DemoPlayer.tsx
    │   │
    │   ├── hooks/
    │   │   ├── useScrollAnimation.ts
    │   │   └── useCountUp.ts
    │   │
    │   └── lib/
    │       ├── constants.ts
    │       └── types.ts
    │
    ├── next.config.ts
    ├── tsconfig.json
    ├── package.json                    ← Separate deps from extension
    ├── vercel.json                     ← Vercel deploy config
    └── README.md
```

---

## 10. SEO Strategy

| Element | Value |
|---------|-------|
| **Title** | `My Page Agent — AI Browser Automation Extension` |
| **Meta Description** | `Automate any browser task with natural language. Open-source Chrome extension powered by local AI. No cloud, no data sharing.` |
| **OG Image** | Custom 1200×630 branded card |
| **Structured Data** | `SoftwareApplication` schema (JSON-LD) |
| **Canonical URL** | `https://mypageagent.dev` (TBD) |
| **Sitemap** | Auto-generated via Next.js |
| **robots.txt** | Allow all, reference sitemap |

---

## 11. Implementation Roadmap (GSD Decomposition)

### Phase 1: Foundation (Setup + Design System)
| Task | Description | Est. |
|------|-------------|------|
| 1.1 | Initialize Next.js 14 project with TypeScript strict | 10 min |
| 1.2 | Set up `globals.css` with all design tokens from §5 | 20 min |
| 1.3 | Configure fonts (Inter Variable) | 10 min |
| 1.4 | Create `<CTAButton>`, `<SectionHeading>`, `<GradientText>` | 30 min |
| 1.5 | Create `<Logo>` component | 10 min |

### Phase 2: Core Sections (Above the Fold)
| Task | Description | Est. |
|------|-------------|------|
| 2.1 | Build `<Navbar>` — sticky, glassmorphic, responsive | 30 min |
| 2.2 | Build `<HeroSection>` — text, buttons, trust bar | 40 min |
| 2.3 | Build `<BrowserMockup>` with agent animation | 60 min |
| 2.4 | Build `<FeaturesSection>` — 3×2 grid with cards | 30 min |

### Phase 3: Below the Fold
| Task | Description | Est. |
|------|-------------|------|
| 3.1 | Build `<DemoSection>` with Lottie player + video fallback | 45 min |
| 3.2 | Build `<HowItWorksSection>` — 4-step stepper | 30 min |
| 3.3 | Build `<OpenSourceSection>` — feature checklist + GitHub stats | 25 min |
| 3.4 | Build `<TestimonialsSection>` with carousel | 40 min |
| 3.5 | Build `<CTASection>` — final conversion block | 15 min |
| 3.6 | Build `<Footer>` — 4-column grid | 20 min |

### Phase 4: Polish
| Task | Description | Est. |
|------|-------------|------|
| 4.1 | Add scroll-triggered animations (Framer Motion) | 45 min |
| 4.2 | Responsive testing + fixes (Mobile/Tablet/Desktop) | 30 min |
| 4.3 | Accessibility audit + fixes | 30 min |
| 4.4 | Performance audit (Lighthouse ≥ 95) | 20 min |
| 4.5 | SEO: metadata, OG image, structured data, sitemap | 20 min |

### Phase 5: Deploy to Vercel
| Task | Description | Est. |
|------|-------------|------|
| 5.1 | Configure `vercel.json` for `landing/` subfolder deploy | 15 min |
| 5.2 | Connect custom domain in Vercel dashboard | 10 min |
| 5.3 | Final smoke test on production URL | 15 min |

**Total estimated time: ~10 hours**

---

## 12. Key Design Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| **Dark theme by default** | Targets developers; matches the extension's dark UI; feels premium |
| **CSS Modules over Tailwind** | Per @FE spec — full control, no class bloat, works with Next.js out of the box |
| **Framer Motion** | Best-in-class React animation library, tree-shakeable, supports scroll-triggered animations |
| **No headless CMS** | Landing page is static content — hardcoded data in `constants.ts` is simpler and faster |
| **Next.js over plain Vite** | SSG + image optimization + SEO + easy deployment. The extension itself uses WXT/Vite; the landing page is a separate project |
| **Separate from extension codebase** | Landing page lives in `landing/` folder — different build, different deploy target, no coupling to extension code |

---

## 13. Decisions — LOCKED IN ✅

| # | Question | Decision |
|---|----------|----------|
| 1 | Domain | ✅ Own domain (to be connected in Vercel) |
| 2 | Demo | ✅ Animated mockup — **Lottie files** + demo video fallback |
| 3 | Pricing | ✅ **Fully open source** — no pricing tiers, single "Free Forever" message |
| 4 | Branding | ⏳ Not decided — **proposal below** |
| 5 | Copy | ⏳ Not decided — **draft copy below** |
| 6 | Location | ✅ Same repo → `landing/` folder inside `my-page-agent-ext` |
| 7 | Deploy | ✅ **Vercel** (subfolder deploy from `landing/`) |

---

## 14. Branding — LOCKED IN ✅ "Obsidian Ember"

- **Primary Accent:** `#f97316` (Vibrant Orange) — energy, automation, action
- **Background:** `#0f0f0f` (Obsidian) — premium, deep, warm-tinted near-black
- **Effect:** Full **glassmorphism** — frosted glass cards, blurred backgrounds, subtle orange-tinted borders
- **Logo concept:** Stylized browser tab icon with orange ember glow
- **Mood:** Premium dark, bold orange accents, frosted glass depth

### Glassmorphism Application Guide
| Element | Glass Treatment |
|---------|----------------|
| **Navbar** | Fixed, `blur(20px)`, `rgba(15,15,15,0.7)` bg, thin white border-bottom |
| **Feature Cards** | `blur(16px)`, `rgba(22,22,22,0.6)` bg, orange-tinted border on hover |
| **Demo Player** | Frosted container, inner glow from orange accent |
| **Open Source Card** | Centered glass card with orange gradient border |
| **CTA Section** | Solid orange buttons on glass background |
| **Footer** | Subtle glass bg, separator line with orange gradient |

---

## 15. Marketing Copy Draft

### Hero
- **Headline:** `Your AI Co-pilot for the Browser`
- **Subheadline:** `Tell it what to do. Watch it work. Open source & privacy-first.`
- **CTA Primary:** `Install Free`
- **CTA Secondary:** `Watch Demo →`

### Features Section
- **Heading:** `Everything you need to automate the web`
- **Subheading:** `No coding. No cloud. Just natural language.`

### Demo Section
- **Heading:** `See it in action`
- **Subheading:** `Watch the agent complete real tasks — autonomously.`

### How It Works
- **Heading:** `Up and running in 60 seconds`
- **Step 1:** Install → `Add from Chrome Web Store. One click.`
- **Step 2:** Connect → `Run Ollama locally — your AI, your machine.`
- **Step 3:** Command → `Type what you want in the side panel.`
- **Step 4:** Done → `Watch the agent work. Review results.`

### Open Source Section
- **Heading:** `Free forever. Open source always.`
- **Subheading:** `No paywalls. No telemetry. No vendor lock-in. MIT licensed.`

### Final CTA
- **Heading:** `Ready to put your browser on autopilot?`
- **CTA Primary:** `Install Free — Chrome Web Store`
- **CTA Secondary:** `⭐ Star on GitHub`

> **These are drafts** — tell me what to change and I'll refine.

---

> **Next step:** Say **"start building"** and I'll execute **GSD Phase 1** — initialize the Next.js project in `landing/` and set up the design system.
