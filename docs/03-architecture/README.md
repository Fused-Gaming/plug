# Architecture

Technical decisions, deployment pipeline, and data flow diagrams.

## What's Here

- **[Technical Decisions](technical-decisions.md)** — Why React + Vite + GitHub Pages
- **[Deployment Pipeline](deployment-pipeline.md)** — How CI/CD works
- **[Data Flow](data-flow.md)** — How data moves through the application

## TL;DR

**Tech Stack:**
- Frontend: React 18 + Vite 5
- Mapping: MapLibre GL (open-source)
- Styling: CSS 3 (mobile-first)
- Deployment: GitHub Actions → GitHub Pages
- Hosting: plug.vln.gg (custom domain)

**Key Insight:**
React pre-compiles to static HTML/CSS/JS (dist/) → GitHub Pages serves static files → browser loads and runs React with full interactivity.

This proves you don't need a backend to have an interactive SPA on GitHub Pages.

## Document Navigation

1. Start with [Technical Decisions](technical-decisions.md) for the "why"
2. Reference [Deployment Pipeline](deployment-pipeline.md) for "how it works"
3. Check [Data Flow](data-flow.md) to understand component communication

---

**[← Back to Index](../INDEX.md)**
