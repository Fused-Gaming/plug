# Development

Development process, AI collaboration, and debugging guides.

## What's Here

- **[Prompt History](prompt-history.md)** — Key prompts and development narrative
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

1. Start with [Prompt History](prompt-history.md) to see development narrative
2. Reference [AI Collaboration](ai-collaboration.md) for how human-AI worked together
3. Check [Debugging Guide](debugging-guide.md) for interesting problems and solutions

---

**[← Back to Index](../INDEX.md)**
