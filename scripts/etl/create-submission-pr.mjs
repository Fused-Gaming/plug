#!/usr/bin/env node
/**
 * Issue #42 (account-free outlet submissions): given a *validated* venue
 * (see validate-submission.mjs), opens a branch + PR that adds it to the
 * database instead of committing straight to main. This is the one part of
 * the submission pipeline that differs from the hourly
 * scripts/etl/ingest-submissions.mjs sibling on purpose -- App-created
 * submissions land as review-gated PRs (issue #42 asks for "automatically
 * merge after all required checks pass", not a direct commit), while the
 * manual issue-form pipeline still writes straight to main.
 *
 * Flow: branch off main -> insertSubmittedVenue + publishFromDb ->
 * commit data/locations.db + public/data/locations.json -> push -> open PR
 * into main -> request auto-merge (squash) so
 * .github/workflows/validate-location-data.yml gates the merge.
 *
 * Needs GITHUB_TOKEN (same convention as scripts/api/submit-venue.mjs) with
 * `contents: write` and `pull-requests: write`.
 *
 *   node scripts/etl/create-submission-pr.mjs --venue venue.json
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Octokit } from '@octokit/rest';
import { openDb, insertSubmittedVenue, publishFromDb } from './db.js';

const ROOT = new URL('../..', import.meta.url).pathname;
const DB_PATH = join(ROOT, 'data/locations.db');
const JSON_PATH = join(ROOT, 'public/data/locations.json');

const [OWNER, REPO] = (process.env.GITHUB_REPOSITORY || 'Fused-Gaming/plug').split('/');

/** Turn a venue name into a short, URL/branch-safe slug. Falls back to
 * "venue" if the name sanitizes away to nothing (e.g. all-emoji/CJK names
 * survive here as empty since we only keep ascii alnum -- the branch name
 * doesn't need to be pretty, just unique and free of shell metacharacters). */
export function slugify(name) {
  const slug = String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
  return slug || 'venue';
}

export function branchNameFor(issueNumber, venueName) {
  return `submission/${issueNumber}-${slugify(venueName)}`;
}

export function buildPrBody(venue) {
  const coords = venue.lat !== null && venue.lon !== null ? `${venue.lat}, ${venue.lon}` : '(none provided)';
  return [
    `Adds a community-submitted venue from issue #${venue.sourceIssue}, opened by the PLUG GitHub App (account-free submission, issue #42).`,
    '',
    '### Venue',
    `- **Name:** ${venue.name}`,
    `- **Address:** ${venue.address ?? '(none provided)'}`,
    `- **Coordinates:** ${coords}`,
    `- **Category:** ${venue.category}`,
    `- **Indoor:** ${venue.indoor ? 'yes' : 'no'}`,
    `- **Access:** ${venue.access}`,
    `- **Amenities:** ${venue.amenities?.length ? venue.amenities.join(', ') : '(none listed)'}`,
    '',
    '### What changed',
    '- `data/locations.db`: one new row in `venues`, tier `community`.',
    '- `public/data/locations.json`: republished from the database.',
    '',
    `Closes #${venue.sourceIssue}.`,
    '',
    '_Opened automatically by scripts/etl/create-submission-pr.mjs. Auto-merge is requested; ' +
      '.github/workflows/validate-location-data.yml is the required check that gates it._',
  ].join('\n');
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

/**
 * @param {object} venue - Output of validateSubmission()'s `venue` field.
 * @param {object} [options]
 * @param {Octokit} [options.octokit] - Injectable for tests; defaults to a
 *   real client authed with GITHUB_TOKEN.
 * @param {string} [options.today] - YYYY-MM-DD; defaults to now (UTC).
 */
export async function createSubmissionPr(venue, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token && !options.octokit) {
    throw new Error('createSubmissionPr: GITHUB_TOKEN env var is required.');
  }
  const octokit = options.octokit ?? new Octokit({ auth: token });
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  const branch = branchNameFor(venue.sourceIssue, venue.name);

  git(['fetch', 'origin', 'main']);
  git(['checkout', '-B', branch, 'origin/main']);

  const db = openDb(DB_PATH);
  let payload;
  try {
    insertSubmittedVenue(db, venue, today);
    payload = publishFromDb(db, JSON_PATH);
  } finally {
    db.close();
  }

  git(['add', 'data/locations.db', 'public/data/locations.json']);
  git(['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com',
    'commit', '-m', `data: add community submission "${venue.name}" (#${venue.sourceIssue})`]);
  git(['push', '-u', 'origin', branch]);

  const pr = await octokit.pulls.create({
    owner: OWNER,
    repo: REPO,
    title: `data: add "${venue.name}" (community submission #${venue.sourceIssue})`,
    head: branch,
    base: 'main',
    body: buildPrBody(venue),
  });

  await enableAutoMerge(octokit, pr.data.node_id);

  return { pr: pr.data, publishedCount: payload.meta.count, branch };
}

/** GitHub's REST API has no "enable auto-merge" endpoint; it's GraphQL-only.
 * `gh pr merge --auto --squash` is the CLI equivalent of this mutation. */
async function enableAutoMerge(octokit, pullRequestNodeId) {
  await octokit.graphql(
    `mutation($pullRequestId: ID!) {
      enablePullRequestAutoMerge(input: { pullRequestId: $pullRequestId, mergeMethod: SQUASH }) {
        pullRequest { autoMergeRequest { enabledAt } }
      }
    }`,
    { pullRequestId: pullRequestNodeId },
  );
}

// CLI entry point: `node scripts/etl/create-submission-pr.mjs --venue venue.json`
if (import.meta.url === `file://${process.argv[1]}`) {
  const venueFlag = process.argv.indexOf('--venue');
  if (venueFlag === -1) {
    console.error('Usage: node scripts/etl/create-submission-pr.mjs --venue <path-to-venue.json>');
    process.exit(1);
  }
  const venue = JSON.parse(readFileSync(process.argv[venueFlag + 1], 'utf8'));
  const result = await createSubmissionPr(venue);
  console.log(`opened ${result.pr.html_url} (published ${result.publishedCount} venues)`);
}
