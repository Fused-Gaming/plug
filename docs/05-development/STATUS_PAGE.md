# Project Status Page

A public, machine-readable snapshot of where the project stands: what has
shipped, what is in progress, and what is planned.

- **URL:** <https://plug.vln.gg/status/>
- **Page:** `public/status/index.html` (served verbatim by Vite from `public/`)
- **Styles:** `public/styles/status.css` (page composition only; shared pieces
  live in `public/styles/tokens.css` and `public/styles/components.css`)
- **Data:** `public/data/status.json` (fetched at runtime by the page; also
  usable directly by tooling at <https://plug.vln.gg/data/status.json>)

## How to update the status

1. Edit `public/data/status.json` — bump `updated`, adjust `version` /
   `milestone` after a release, and change phase `status` values as work moves
   from `planned` to `in_progress` to `done`.
2. Open a PR against the default branch and get it reviewed like any other
   change (see the branching & release process docs).
3. Merge. The GitHub Pages deploy workflow republishes the site and the status
   page picks up the new JSON automatically — no HTML changes needed unless a
   phase is added or removed (the page renders whatever phases the JSON lists,
   so even that usually needs no HTML edit).

The HTML contains static fallback values for the summary row (version,
milestone, last updated). Keep those in sync with the JSON when you change it,
so users without JavaScript still see current numbers.

## JSON schema

```jsonc
{
  "updated":   "YYYY-MM-DD",           // date of last status edit
  "version":   "2.0.0",                // latest shipped release (no "v" prefix)
  "milestone": "v2.1.0 — Community Data Pipeline", // next milestone label
  "phases": [
    {
      "id":     "design-system",       // stable slug, kebab-case, unique
      "name":   "Design system & landing page", // human-readable phase name
      "status": "done",                // one of: done | in_progress | planned
      "detail": "One-sentence summary of scope or outcome."
    }
  ]
}
```

Status rendering on the page:

| `status`      | Badge               | Meaning                        |
| ------------- | ------------------- | ------------------------------ |
| `done`        | Shipped (green)     | Released in a tagged version   |
| `in_progress` | In progress (amber) | Actively being worked on       |
| `planned`     | Planned (neutral)   | Committed but not yet started  |

Unknown `status` values fall back to the neutral "Planned" style.

## Keep phases in sync with planning docs

The pipeline milestone phases (`osint-etl`, `submissions`, `email`,
`data-hygiene`) mirror the plans in `docs/02-project-scope/` (goals, roadmap,
constraints). When those planning docs change scope, ordering, or naming, the
corresponding entries in `public/data/status.json` **must** be updated in the
same PR so the public status page never contradicts the written plan.
