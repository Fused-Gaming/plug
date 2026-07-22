# Release Process

PLUG follows [Semantic Versioning 2.0.0](https://semver.org/) (`MAJOR.MINOR.PATCH`) and keeps a human-curated [CHANGELOG.md](../../CHANGELOG.md) at the repository root in [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

Because every merge to `main` deploys automatically (see [BRANCHING_STRATEGY.md](BRANCHING_STRATEGY.md)), a "release" here is a **versioned checkpoint** — a tagged, documented state of `main` — rather than a separate deployment event.

## Version Numbering

| Bump | When | Example |
|------|------|---------|
| **MAJOR** | Breaking changes to the data schema (e.g. `public/data/*.json` shape, `data/locations.db` structure) or to public URLs/routes | `2.x.x` → `3.0.0` |
| **MINOR** | New features, backwards-compatible | `2.0.0` → `2.1.0` (data pipeline) |
| **PATCH** | Bug fixes, content updates, small corrections | `2.1.0` → `2.1.1` |

Notes:

- **Data-refresh bot commits do NOT bump versions.** The scheduled data-sync Action commits refreshed data to `main` with the `data:` prefix; these are content updates within the current version, not releases.
- Documentation-only and chore changes accumulate under `[Unreleased]` in the changelog and ship with the next release; they rarely justify a release on their own.

## Cutting a Release

### 1. Open a release PR

Branch from `main` (e.g. `chore/release-2.1.0`) and in that single PR:

1. **Update [CHANGELOG.md](../../CHANGELOG.md):** move the relevant `[Unreleased]` entries into a new `[X.Y.Z] - YYYY-MM-DD` section (newest first).
2. **Bump `version` in `package.json`** to `X.Y.Z`.
3. **Update the version badge in `README.md`** to match — the badge and `package.json` must never disagree.

### 2. Merge

Squash-merge the release PR into `main` like any other PR (CI must pass). The merge auto-deploys the site.

### 3. Tag the release commit on `main`

```bash
git checkout main
git pull origin main
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin v2.1.0
```

Tags use the `vX.Y.Z` format and always point at a commit on `main`.

### 4. Create the GitHub Release

Create a GitHub Release from the tag, using the matching changelog section as the release notes:

```bash
gh release create v2.1.0 --title "v2.1.0" --notes-file <(sed -n '/## \[2.1.0\]/,/## \[/p' CHANGELOG.md | sed '$d')
```

Or via the GitHub UI: Releases → "Draft a new release" → choose the `v2.1.0` tag → paste the `[2.1.0]` changelog section as the notes.

## Hotfix Path

Urgent fixes follow the same flow, just faster:

1. Branch from `main`: `fix/<slug>`.
2. Fix, open a PR, let CI pass, squash-merge (this deploys the fix).
3. If the fix warrants a versioned checkpoint, follow the release steps above with a **PATCH** bump (changelog entry, `package.json`, README badge, tag, GitHub Release).

There are no release branches or backports — `main` is the only deployed line.

## Release History

| Version | Date | Highlights |
|---------|------|------------|
| 2.0.0 | 2026-07-22 | Design-system rebuild, community field guide landing page redesign |
| 1.x | 2026 (pre-2.0) | Map MVP, GitHub Pages deployment pipeline, initial docs |

Keep this table in sync with [CHANGELOG.md](../../CHANGELOG.md); the changelog is the authoritative record.

## Checklist

- [ ] `[Unreleased]` entries moved to a dated `[X.Y.Z]` section in CHANGELOG.md
- [ ] `package.json` `version` bumped
- [ ] README.md version badge updated in the same PR
- [ ] Release PR squash-merged, CI green, deploy succeeded
- [ ] Annotated tag `vX.Y.Z` pushed to `main`
- [ ] GitHub Release created with changelog section as notes
- [ ] Release History table above updated

---

**[← Back to Development](README.md)**
