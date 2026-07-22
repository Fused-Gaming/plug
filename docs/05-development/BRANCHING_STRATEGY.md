# Branching Strategy

PLUG uses **GitHub Flow**, kept deliberately simple: one long-lived branch (`main`), short-lived topic branches for everything else, and pull requests as the only path to production. Every merge to `main` deploys automatically to [plug.vln.gg](https://plug.vln.gg) via [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml).

## Principles

- **`main` is protected and always deployable.** If it is on `main`, it is live (or about to be). Never merge anything you would not want deployed immediately.
- **Branches are short-lived.** Branch from `main`, do one focused piece of work, open a PR, merge, delete. Days, not weeks.
- **History on `main` is linear.** PRs are squash-merged, so each merge lands as a single, well-titled commit.
- **Humans never commit directly to `main`.** The only direct commits to `main` come from the scheduled data-sync bot (see [Data-Sync Bot Exception](#data-sync-bot-exception)).

## Branch Naming

Create branches from an up-to-date `main`:

```bash
git fetch origin
git checkout main
git pull origin main
git checkout -b feat/short-descriptive-slug
```

| Prefix | Use for | Example |
|--------|---------|---------|
| `feat/<slug>` | New features and enhancements | `feat/charger-type-filter` |
| `fix/<slug>` | Bug fixes | `fix/geolocation-permission-error` |
| `docs/<slug>` | Documentation-only changes | `docs/branching-strategy` |
| `chore/<slug>` | Tooling, CI, dependencies, housekeeping | `chore/upgrade-vite` |
| `claude/<slug>` | AI-assisted session branches | `claude/landing-page-redesign` |

Keep slugs short, lowercase, and hyphenated. AI-assisted sessions keep their existing `claude/<slug>` convention; everything else follows the four standard prefixes.

## Pull Request Workflow

1. **Branch** from `main` (see above).
2. **Commit** focused changes. Individual commit messages on the branch matter less than the PR title, since the branch will be squashed.
3. **Push** and open a PR against `main` with a clear title — the PR title becomes the squash commit message on `main`.
4. **CI must pass.** The deploy workflow runs on every PR: security scan (npm audit), the Jest test suite, and a production build. All three gates are required.
5. **Squash-merge** once approved. This is the standard merge method — it keeps `main` history linear and one-commit-per-change.
6. **Delete the branch** after merge.

A merged branch is never reused. If follow-up work is needed, start a fresh branch from `main` — the squash-merge means your old branch's commits no longer match `main`'s history, and pushing more work to it will produce confusing diffs and conflicts.

## Data-Sync Bot Exception

A scheduled GitHub Action (planned for v2.1.0, see [RELEASE_PROCESS.md](RELEASE_PROCESS.md)) refreshes charging-station data on a cron and commits the generated files **directly to `main`**:

- **Paths:** only `data/**` (e.g. `data/locations.db`) and `public/data/**` (generated JSON).
- **Commit prefix:** `data:` (e.g. `data: refresh Oakland locations 2026-07-22`), so bot commits are easy to identify and filter in `git log`.
- **CI guards:** the deploy workflow uses `paths-ignore` for these data paths so bot commits do not retrigger the full CI pipeline and cause commit/deploy loops.

This is the **only** exception to the PR requirement. It applies exclusively to the bot and exclusively to generated data files. Humans changing anything — including files under `data/` or `public/data/` — go through a normal PR. Data-refresh commits do not bump the project version (see [RELEASE_PROCESS.md](RELEASE_PROCESS.md)).

## Parallel Swarm Work (Integration Branches)

Single-stream work follows plain GitHub Flow above. When a feature is built by **multiple agents in parallel** (a swarm), use the integration-branch workflow defined in [issue #3](https://github.com/Fused-Gaming/plug/issues/3):

- The coordinator branches `integration-<feature>` from `main`; every worker branches from that same integration commit as `agent/<nn>-<task>` (or `data/<nn>-<slug>` for the single SQLite owner).
- One task, one branch, one owner per shared file. SQLite has exactly one writer — binary databases cannot be merged.
- Worker PRs target the integration branch, never `main`, and merge one at a time through a serial queue with validation after every merge; failures spawn scoped `repair/<nn>-<slug>` branches.
- Only the validated integration branch opens the final PR into `main`.

Treat GitHub Flow as the default and the integration-branch model as the escalation path for genuinely parallel work — parallelism is only worth its coordination cost when ownership boundaries are real.

## Keeping a Branch Up to Date

If `main` moves while your branch is open, **rebase — do not merge `main` into your branch**:

```bash
git fetch origin
git rebase origin/main
```

Resolve any conflicts during the rebase, then push:

```bash
git push --force-with-lease
```

Rules for rewriting history:

- Always use `--force-with-lease`, never bare `--force`. It refuses to overwrite work you have not seen.
- Only force-push **your own** topic branches. Never force-push `main` or a branch someone else is working on.
- Since PRs are squashed anyway, rebasing is safe and keeps the PR diff clean against the current `main`.

## Quick Reference

```bash
# Start work
git checkout main && git pull origin main
git checkout -b feat/my-change

# Stay current
git fetch origin && git rebase origin/main
git push --force-with-lease

# After your PR is squash-merged
git checkout main && git pull origin main
git branch -D feat/my-change          # local cleanup (remote branch deleted on merge)
```

See also: [RELEASE_PROCESS.md](RELEASE_PROCESS.md) for versioning and tagging, and [CONTRIBUTING.md](../CONTRIBUTING.md) for the full contribution guide.

---

**[← Back to Development](README.md)**
