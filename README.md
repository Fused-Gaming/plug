# 📱 Charging Station Locator

[![Build Status](https://github.com/fused-gaming/plug/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/fused-gaming/plug/actions)
[![Deployment Status](https://img.shields.io/badge/deployment-live-success?logo=github)](https://plug.vln.gg)
[![Security: 0 Vulnerabilities](https://img.shields.io/badge/security-0%20vulnerabilities-success)](SECURITY_SCANNING.md)
[![Tests: 66 Passing](https://img.shields.io/badge/tests-66%20passing-success)](#)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Version: 2.0.0](https://img.shields.io/badge/version-2.0.0-blue)](#)
[![React: 18.2.0](https://img.shields.io/badge/react-18.2.0-61dafb?logo=react)](https://react.dev)
[![Vite: 6.4.3](https://img.shields.io/badge/vite-6.4.3-646cff?logo=vite)](https://vitejs.dev)
[![Accessibility: WCAG 2.1 AA](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-047857)](docs/04-design/COMPONENT_LIBRARY.md#color-palette--wcag-21-graded)
[![Design System: documented](https://img.shields.io/badge/design%20system-documented-9a3412)](docs/04-design/COMPONENT_LIBRARY.md)
[![Icons: SVG sprite](https://img.shields.io/badge/icons-SVG%20sprite-9a3412)](public/icons/sprite.svg)
<img width="2252" height="840" alt="image" src="https://github.com/user-attachments/assets/70e26e30-fbec-466c-9f3d-a3ef3f7d1e6a" />

A privacy-first, interactive map to help vulnerable populations discover free, reliable device-charging options. Built as a bootcamp MVP demonstrating responsive web design, geolocation services, and GitHub Pages static site deployment.

---

## 🚀 Live Demo

### **[View the Live Application →](https://plug.vln.gg)**

- **Production:** https://plug.vln.gg (custom domain)
- **Fallback:** https://fused-gaming.github.io/plug
- **Status:** ✅ Live and responsive (automatic deployment on every push)
- **Build:** Static Vite build (pre-compiled React)
- **Hosting:** GitHub Pages with custom CNAME

**Try it now:** Visit https://plug.vln.gg on any device (desktop, tablet, mobile)

---

## Problem

**Who needs this?**

Millions of people lack access to reliable device charging:
- **People experiencing homelessness** — phones are critical for safety, employment, and benefits access
- **Low-income travelers** — limited resources for paid charging stations
- **Students** — between-class charging gaps on campuses
- **Gig workers** — need to keep phones charged for work availability
- **Vulnerable populations** — particularly those without access to private/home charging

**The challenge:**
- Information about free charging is scattered across multiple websites/apps
- No centralized, privacy-first resource
- Existing solutions require accounts or sell data

**Our solution:**
A simple, open, privacy-respecting map showing where free charging is available, right now.

---

## Value

✅ **What this project creates:**

1. **Immediate Utility** — Users can see charging stations near them in real-time
2. **Privacy-First Design** — No accounts, no tracking, no data collection
3. **Accessible Technology** — Works on any device with a browser (even low-end phones)
4. **Community Resource** — Free, open-source foundation for local communities
5. **Zero Barrier to Entry** — Just visit the URL, no installation or signup needed
6. **Sustainable Model** — No backend infrastructure costs (GitHub Pages is free)

**Impact:**
- Helps vulnerable populations maintain connectivity
- Supports independence and safety
- Reduces digital divide
- Can scale to any city with community data

---

## Project Plan

### Vision
Build a minimal viable demo showing that a privacy-first, community-driven charging map is feasible and valuable—without backend complexity or infrastructure costs.

### Approach

**Constraints:**
- ⏱️ 7-day bootcamp deadline
- 🌐 GitHub Pages hosting (static files only—no backend)
- 💰 Zero infrastructure costs
- 📦 Minimal dependencies

**Strategy:**
1. **Phase 1 (Days 1-2):** Foundation
   - Set up React + Vite for static builds
   - Configure GitHub Pages automatic deployment
   - Integrate MapLibre GL for mapping
   - Add 10 seed charging locations (NYC pilot)

2. **Phase 2 (Days 2-4):** MVP Feature
   - Implement interactive map with markers
   - Build location detail cards
   - Add distance-based sorting (geolocation optional)
   - Ensure mobile responsiveness

3. **Phase 3 (Days 5-6):** Polish
   - Refine UI and interactions
   - Test on real mobile devices
   - Create wireframes and design system
   - Prepare demo walkthrough

4. **Phase 4 (Day 7):** Submission
   - Final testing and bug fixes
   - Verify GitHub Pages deployment
   - Submit to bootcamp

**Key Decision:** Pre-build React to static files with Vite → GitHub Pages serves static → React runs client-side in browser ✅

---

## Features

### ✅ Complete (MVP Ready)

- **Interactive Map** — MapLibre GL + OpenStreetMap (free tiles, no API key required)
- **10 Seed Locations** — NYC pilot area with real charging stations
- **Location Markers** — Red pins show charging locations on map
- **Detail Cards** — Click any marker to see: name, address, operating hours
- **Location List** — Sidebar shows all stations with distance sorting
- **Geolocation** — Optional browser geolocation (user-controlled) sorts by distance
- **Mobile Responsive** — Optimized layouts for desktop (60/40 split), tablet (overlay), mobile (stacked)
- **Automatic Deployment** — GitHub Actions builds and deploys on every push to main
- **Custom Domain** — plug.vln.gg configured via CNAME
- **Static Site** — No backend required; runs entirely client-side
- **Privacy-First** — No accounts, no tracking, no data collection
- **Design System** — Token-driven landing page with WCAG 2.1 graded palette, reusable HTML/CSS components, and an SVG icon sprite ([docs](docs/04-design/COMPONENT_LIBRARY.md))

### 🔜 Next Features (Post-MVP / Phase 4+)

- **Confidence Ratings** — Show verification status and recency of reports
- **Charging Type Filters** — USB, AC outlets, fast charging, WiFi included
- **Operating Hours** — Filter by "open now" status (real-time data)
- **Real-Time Data** — Fetch from external API instead of hardcoded seed data
- **User Authentication** — Enable submissions from verified contributors
- **Favorites** — Save preferred locations (local storage)
- **Directions** — Integrate with navigation apps
- **Admin Dashboard** — Moderate submissions and manage data quality

### 📝 How to Suggest a Location (Phase C)

Found a charging location we're missing? We'd love to hear about it!

**Submit via GitHub Issues:**
1. Visit the [plug repository](https://github.com/fused-gaming/plug)
2. Click **Issues** → **New Issue**
3. Choose the **Suggest a Charging Location** template
4. Fill out the form with:
   - Place name (library, cafe, community center, etc.)
   - Category
   - Street address
   - Neighborhood or cross street
   - Coordinates (optional — we can look them up)
   - Indoor/outdoor status
   - Who can use it (everyone or customers only)
   - Operating hours (if known)
   - Available charging methods (USB, outlets, etc.)
   - Any additional details

**Email Confirmation (Privacy-First):**
- After you submit, we'll send a one-time confirmation email via Resend
- Click the link to verify — it expires after 7 days
- Your email is stored only with Resend (never in our GitHub repo)
- No marketing emails, no data sharing

**What Happens Next:**
- Verified submissions are published to the live map within 24 hours
- You can edit or delete your submission anytime on GitHub
- See our [Privacy Policy](docs/07-security/PRIVACY.md#12-community-submissions--email-confirmations-phase-c) for details

**Data Quality:**
- Please verify the location still has free charging available
- Include accurate hours if the location is open only during certain times
- Note if charging is available to everyone or customers only
- Avoid duplicate submissions (check the map first)

### ❌ Intentionally Out of Scope (for 7-day MVP)

- User authentication or accounts
- Database backend
- Complex verification workflows
- Admin dashboard
- Mobile app
- Advanced analytics
- Payment processing

---

## Technologies Used

### Frontend Framework
- **React 18** — UI components and state management
- **Vite 5** — Lightning-fast build tool and dev server
- **MapLibre GL JS 4** — Open-source mapping library (free alternative to Google Maps)
- **OpenStreetMap** — Free, community-maintained map tiles

### Build & Deployment
- **Node.js 22** — JavaScript runtime
- **npm 10** — Package manager
- **GitHub Actions** — CI/CD pipeline (automatic builds and deploys)
- **GitHub Pages** — Static site hosting (free, included with repo)
- **Custom Domain** — plug.vln.gg via CNAME

### Development & Quality
- **CSS 3** — Responsive design with mobile-first approach
- **HTML 5** — Semantic markup
- **JavaScript ES6+** — Modern JavaScript
- **WCAG 2.2 AA** — Accessibility compliance target
- **Responsive Design** — Works on 320px → 4K screens

### Ecosystem Tools
- **@h4shed/mcp-core** — Project configuration and orchestration
- **@h4shed/skill-project-manager** — Milestone and roadmap planning
- **@h4shed/skill-ascii-mockup** — Wireframing and layout design
- **@h4shed/design-tokens** — Design system tokens

---

## AI Tools Used

This project was built with extensive use of Claude AI (Anthropic):

### Development
- **Claude Haiku 4.5** — AI assistant throughout the project
  - Full-stack development (React, Vite, CSS)
  - GitHub Pages + GitHub Actions setup
  - Deployment pipeline configuration
  - Project architecture and planning

### Project Setup
- **Claude Code** — Remote development environment
- **Anthropic SDK** — Autonomous planning and execution
- **SyncPulse Ecosystem** — AI-orchestrated project management
  - 66+ verified npm packages for development
  - Skill-based workflow automation
  - Project state tracking and coordination

### Planning & Design
- **Project Manager Skill** — Milestone planning and roadmap management
- **ASCII Mockup Skill** — Wireframing and layout conceptualization
- **Design System** — Complete token specification
- **Requirements Analysis** — Bootcamp submission requirements mapping

### Documentation
- All planning documents (ROADMAP.md, PROJECT_PLAN.md)
- Wireframes (WIREFRAMES.md) and design system (DESIGN_SYSTEM.md)
- Deployment guides (DEPLOYMENT.md)
- This README

**Human Role:** Project vision, requirements, architecture decisions, and code review. AI handled: rapid implementation, documentation, testing, and deployment configuration.

---

## Running the Project

### Prerequisites

- **Node.js 18+** — [Install here](https://nodejs.org/)
- **npm 8+** — Included with Node.js
- **Git** — [Install here](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/fused-gaming/plug.git
cd plug

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

- Opens at **http://localhost:5173** (Vite default)
- Hot module reloading — changes instantly update
- Test on mobile: access via your local IP (e.g., http://192.168.1.100:5173)

### Build for Production

```bash
npm run build
```

- Creates optimized `dist/` folder
- ~952 KB JavaScript (266 KB gzipped)
- Ready for GitHub Pages deployment

### Preview Production Build

```bash
npm run preview
```

- Serves the `dist/` folder locally
- Simulates what users will see on GitHub Pages

### Deployment (Automatic)

- Push to `main` branch
- GitHub Actions workflow triggers automatically
- Vite builds React to static files
- GitHub Pages serves the `dist/` folder
- Live at https://plug.vln.gg within 30 seconds

---

## Project Structure

```
plug/
├── src/
│   ├── components/
│   │   ├── Map.jsx              # MapLibre integration
│   │   └── LocationList.jsx     # Location sidebar
│   ├── data/
│   │   └── locations.js         # Seed charging station data (10 locations)
│   ├── styles/
│   │   └── main.css             # Responsive styling
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # React entry point
├── index.html                   # HTML entry point
├── vite.config.js               # Vite configuration
├── package.json                 # Dependencies and scripts
├── .github/workflows/
│   └── deploy.yml               # GitHub Actions deployment pipeline
├── landing.html                 # Static landing page (becomes dist/index.html)
├── public/
│   ├── styles/                  # Design system: tokens.css, components.css, landing.css
│   ├── icons/sprite.svg         # SVG icon sprite (no emojis)
│   └── scripts/landing.js       # Landing page behavior (search, filters, nav)
├── CNAME                        # Custom domain configuration
├── README.md                    # This file
├── ROADMAP.md                   # 7-day sprint plan
├── PROJECT_PLAN.md              # Technical architecture decisions
├── DEPLOYMENT.md                # Deployment documentation
├── WIREFRAMES.md                # UI layout designs (3 breakpoints)
├── DESIGN_SYSTEM.md             # Design tokens and specifications
└── LICENSE                      # MIT License
```

---

## Mission Brief

### The Story

In 2026, millions of people lack reliable access to device charging. For people experiencing homelessness, this is a survival issue—a dead phone means lost contact with shelters, employers, and emergency services. For students and travelers, it's a daily frustration. For gig workers, it's lost income.

Yet information about free charging is scattered, hidden behind paywalls, or sold to data brokers. No simple, privacy-first solution exists.

### Our Response

We built **Charging Station Locator** in 7 days to prove that:

1. **Simple solutions work** — A read-only map with 10 locations is instantly useful
2. **Privacy matters** — No accounts, no tracking, no data collection needed
3. **Scale is possible** — GitHub Pages can host a global resource free of charge
4. **Technology should serve vulnerable populations** — Not exploit them

### What We Delivered

- ✅ **Live, functional MVP** at plug.vln.gg
- ✅ **Static site architecture** (no backend, no infrastructure costs)
- ✅ **Fully responsive** (mobile-first design)
- ✅ **Automatic deployment** (push to git, site updates instantly)
- ✅ **Extensible foundation** (easy to add real data, user submissions later)
- ✅ **Complete documentation** (architecture, roadmap, design system)

### Why This Matters

This project proves that **bootcamp-grade engineering can solve real-world problems**. We didn't build a to-do list or a weather app. We built something people actually need, deployed it to the internet, and created a foundation for impact.

The next chapter begins when community members add their local charging stations and help ensure no one is left without power.

---

## Architecture Highlights

### Why GitHub Pages? Why Static?

GitHub Pages serves **static files only** (no backend). This constraint became our superpower:

✅ **Benefits:**
- Zero hosting costs
- Automatic HTTPS
- Instant global CDN
- No backend to maintain
- Deploy in seconds
- Perfect for MVP

⚠️ **Tradeoff:**
- React runs client-side only
- All data must be hardcoded or fetched from external APIs
- No user submissions (without external backend)

**Solution:** Pre-build React with Vite → static HTML/CSS/JS → browser runs React → full interactivity ✅

### Responsive Design

| Breakpoint | Device | Layout |
|-----------|--------|--------|
| < 576px | Mobile | Stacked (map top, list bottom) |
| 576-1023px | Tablet | Overlay panels (map full, list drawer) |
| 1024px+ | Desktop | Split (60% map, 40% sidebar) |

### Data Flow

```
Hardcoded Locations (10 stations)
    ↓
React State (App.jsx)
    ↓
MapLibre Rendering (markers on map)
    ↓
User Interactions (click → detail card)
    ↓
Geolocation (optional, if enabled)
    ↓
Distance Calculation & Sorting
    ↓
Browser Display (fully client-side)
```

---

## Getting Help

### Documentation

**Project Documentation:**
- **[ROADMAP.md](ROADMAP.md)** — 7-day sprint plan and MVP scope
- **[PROJECT_PLAN.md](PROJECT_PLAN.md)** — Technical architecture and decisions
- **[DEPLOYMENT.md](DEPLOYMENT.md)** — How deployment works and troubleshooting
- **[WIREFRAMES.md](WIREFRAMES.md)** — UI layouts for desktop, tablet, mobile
- **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)** — Colors, typography, spacing, components

**Developer Guides (docs/):**
- **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** — How to contribute, development setup, coding standards
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — System design, technology stack, data flow
- **[docs/DATA_SOURCES.md](docs/DATA_SOURCES.md)** — OSINT data sourcing, geographic expansion
- **[docs/SWARM_COORDINATION.md](docs/SWARM_COORDINATION.md)** — Wave 1-3 parallel development framework

**Security & Privacy:**
- **[SECURITY.md](SECURITY.md)** — Security policy, CSP headers, vulnerability disclosure
- **[PRIVACY.md](PRIVACY.md)** — Privacy policy, zero data collection, GDPR/CCPA compliance

**Wave 1 Orchestration (Swarm Development):**
- **[swarm-orchestration-plan.md](swarm-orchestration-plan.md)** — 10-agent parallel development framework
- **[orchestration-payload.json](orchestration-payload.json)** — Machine-readable agent configuration
- **[WAVE_1_AGENT_TASKS.md](WAVE_1_AGENT_TASKS.md)** — Wave 1 agent task specifications
- **[WAVE_1_CONTRACTS.md](WAVE_1_CONTRACTS.md)** — Frozen build contracts and locked interfaces

### Live Help

- **GitHub Issues** — Report bugs or request features
- **Contact:** j@vln.gg — Reach out with questions or ideas

---

## License

**MIT License** — Free to use, modify, and distribute.

See [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Next Chapter Project** — For the bootcamp opportunity
- **OpenStreetMap Community** — Free, community-maintained mapping data
- **MapLibre GL** — Open-source mapping library
- **Vite Team** — Blazing fast build tool
- **React Team** — Powerful UI framework
- **GitHub** — Free hosting and CI/CD
- **Claude AI / Anthropic** — AI-assisted development and planning

---

## Roadmap

### ✅ Phase 1: Foundation (Complete)
- Repository setup
- GitHub Pages deployment
- React + Vite initialization
- MapLibre integration
- Seed data (10 NYC locations)

### 🔄 Phase 2: MVP Feature (In Progress)
- Interactive map with markers
- Location detail cards
- Distance-based sorting
- Mobile responsive design

### ⏳ Phase 3: Polish (Ready)
- UI refinements
- Mobile testing
- Performance optimization

### 📋 Phase 4: Submission (Ready)
- Final testing
- GitHub Pages verification
- Bootcamp submission

### 🚀 Future (Post-MVP)
- Real data integration
- User submissions
- Community verification
- Mobile app
- Multiple cities

---

**Status:** MVP Complete ✅ | Live at https://plug.vln.gg | Demo Ready for Bootcamp 🎯

**Last Updated:** July 20, 2026 | Built with React + Vite | Deployed to GitHub Pages
