# Development

Development process, AI collaboration, and debugging guides.

## What's Here

- **[Branching Strategy](BRANCHING_STRATEGY.md)** — GitHub Flow: protected `main`, short-lived branches, squash-merge PRs
- **[Release Process](RELEASE_PROCESS.md)** — Semantic Versioning, changelog, tagging, and GitHub Releases
- **[Prompt History](prompt-history.md)** — Key prompts and development narrative
- **[Prompt Archive](prompt-archive/README.md)** — Auto-generated, 8,000-character-capped chunks of the curated history plus the full commit prompt trail (instructor deliverable; regenerated every push by `.github/workflows/prompt-archive.yml`)
- **[Status Page](STATUS_PAGE.md)** — How the public `/status/` page works and how to update `public/data/status.json`
- **[AI Collaboration](ai-collaboration.md)** — How AI assisted development
- **[Debugging Guide](debugging-guide.md)** — Interesting bugs and solutions

## TL;DR

**Process:** 7-day sprint with ruthless scope trimming (8 phases → 1 phase MVP).

**Collaboration:** Human vision + AI execution. Humans decided WHAT to build; AI implemented HOW.

**Planning Cycle:**
1. Identify constraint (GitHub Pages static-only)
2. AI proposes solution (pre-build React static)
3. Human questions assumption (GitHub Pages + React incompatible?)
4. AI verifies solution (tests static build)
5. Team validates (documented and committed)

**Key Bugs Encountered:**
- package-lock.json Git conflicts → Solution: track it for reproducibility
- GitHub Actions build path confusion → Solution: verified Vite dist/ output
- Initial GitHub Pages + React skepticism → Solution: demonstrated static build pipeline

## Document Navigation

1. Read [Branching Strategy](BRANCHING_STRATEGY.md) and [Release Process](RELEASE_PROCESS.md) before opening a PR or cutting a release
2. Start with [Prompt History](prompt-history.md) to see development narrative
3. Reference [AI Collaboration](ai-collaboration.md) for how human-AI worked together
4. Check [Debugging Guide](debugging-guide.md) for interesting problems and solutions

---

**[← Back to Index](../INDEX.md)**
