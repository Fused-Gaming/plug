# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Phase A OSINT ETL (issue #20): `scripts/etl/` fetches OpenStreetMap Overpass
  data for the Oakland service area, normalizes/dedupes/scores it into
  `data/locations.db` (canonical SQLite) and `public/data/locations.json`
- Daily `data-sync` workflow committing refreshed data to `main` with the
  `data:` prefix, commit-on-diff only
- Auto-listed trust tier on the landing page: pipeline venues render with a
  neutral `Auto-listed` badge after the curated entries
- ODbL attribution in the site footer and `LICENSE-DATA`
- ETL unit tests (8 cases: normalization, geofence, dedupe, tier derivation,
  published-JSON stability)
- Branching strategy and release process documentation
  ([docs/05-development/BRANCHING_STRATEGY.md](docs/05-development/BRANCHING_STRATEGY.md),
  [docs/05-development/RELEASE_PROCESS.md](docs/05-development/RELEASE_PROCESS.md))
- `/status` page at plug.vln.gg/status driven by `public/data/status.json`
- Prompt archive generator and per-push workflow (instructor deliverable)
- This changelog

### Planned

- Socrata/BART corroboration sources completing the two-source auto-publish
  rule (issue #20), community submissions (#21), Resend confirmations (#22),
  staleness automation (#23), licensing/privacy completion (#24)

## [2.0.0] - 2026-07-22

### Added

- Landing page for plug.vln.gg (PR #18)

### Changed

- Design-system rebuild and community field guide redesign of the landing page (PR #19)
- README overhaul with project badges (PR #17)

## [1.x]

Pre-2.0 development, summarized:

- Charging station map MVP (React + Vite + MapLibre GL) with seed data for Oakland
- GitHub Pages deployment pipeline with security scanning, Jest test suite, and build gate
- Initial documentation set (architecture, design, security, contributing)

Granular pre-2.0 history lives in the git log.

[Unreleased]: https://github.com/fused-gaming/plug/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/fused-gaming/plug/releases/tag/v2.0.0
