# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Branching strategy and release process documentation
  ([docs/05-development/BRANCHING_STRATEGY.md](docs/05-development/BRANCHING_STRATEGY.md),
  [docs/05-development/RELEASE_PROCESS.md](docs/05-development/RELEASE_PROCESS.md))
- This changelog

### Planned

- Automated data pipeline (v2.1.0): scheduled GitHub Action refreshing
  `data/locations.db` and `public/data/*.json` via direct `data:` commits to `main`
- `/status` page reporting data freshness and deployment health

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
