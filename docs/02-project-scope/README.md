# Project Scope

Understand the project vision, goals, constraints, and how we prioritized the MVP.

## What's Here

- **[Goals & Value](goals-and-value.md)** — Problem statement and value proposition
- **[Roadmap](roadmap.md)** — 7-day sprint plan (shipped) and the v2.1.0 Community Data Pipeline milestone
- **[Data Pipeline Plan](DATA_PIPELINE_PLAN.md)** — v2.1.0 plan: OSINT ETL, evidence-based trust tiers, community submissions, email flow, phased rollout
- **[Constraints](constraints.md)** — GitHub Pages limitation and architectural mitigation

## TL;DR

**Problem:** Millions of vulnerable people (homeless, students, travelers) lack access to free device charging.

**Solution:** Privacy-first map showing free charging locations near you. No accounts, no tracking, no data collection.

**Timeline:** 7 days. Ruthlessly cut 8-phase roadmap to MVP: read-only map with 10 seed locations. The MVP shipped (v2.0.0 is live); next up is the v2.1.0 Community Data Pipeline.

**Value:** Demonstrate that simple solutions work, privacy matters, and GitHub Pages can host full React apps.

## Key Decisions

- **Scope:** Phase 3 MVP only (map interface, no submissions/verification/admin)
- **Architecture:** React pre-built to static files via Vite → GitHub Pages
- **Constraint:** GitHub Pages serves static files only (no backend)
- **Result:** Zero hosting costs, instant deployment, full client-side interactivity

## Document Navigation

1. Start with [Goals & Value](goals-and-value.md) to understand the problem
2. Read [Roadmap](roadmap.md) to see the shipped 7-day plan and what comes next
3. Dive into the [Data Pipeline Plan](DATA_PIPELINE_PLAN.md) for the v2.1.0 methodology
4. Reference [Constraints](constraints.md) when asking "why GitHub Pages?"

---

**[← Back to Index](../INDEX.md)**
