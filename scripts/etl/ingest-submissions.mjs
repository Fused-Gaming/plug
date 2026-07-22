#!/usr/bin/env node
/**
 * Phase B community-submission ingest (issue #21). Reads open GitHub issues
 * labeled `submission` (created via .github/ISSUE_TEMPLATE/location.yml),
 * validates and sanitizes them (scripts/etl/submissions.js is the trust
 * boundary), records valid ones as community-tier venues, republishes
 * public/data/locations.json, and labels the issues:
 *
 *   valid   -> label `ingested` (issue stays open for volunteer review)
 *   invalid -> label `needs-info` + one comment listing the problems
 *
 *   node scripts/etl/ingest-submissions.mjs                  # live (needs GITHUB_TOKEN)
 *   node scripts/etl/ingest-submissions.mjs --fixture f.json # local test, no API writes
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { addEvidence, openDb, publishFromDb, upsertVenue } from './db.js';
import { parseIssueForm, validateSubmission } from './submissions.js';

const ROOT = new URL('../..', import.meta.url).pathname;
const DB_PATH = join(ROOT, 'data/locations.db');
const JSON_PATH = join(ROOT, 'public/data/locations.json');

const REPO = process.env.GITHUB_REPOSITORY || 'Fused-Gaming/plug';
const API = `https://api.github.com/repos/${REPO}`;
const TOKEN = process.env.GITHUB_TOKEN;

const fixtureFlag = process.argv.indexOf('--fixture');
const fixturePath = fixtureFlag !== -1 ? process.argv[fixtureFlag + 1] : null;

async function gh(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`${options.method || 'GET'} ${path} -> HTTP ${res.status}`);
  return res.status === 204 ? null : res.json();
}

async function listSubmissionIssues() {
  if (fixturePath) return JSON.parse(readFileSync(fixturePath, 'utf8'));
  if (!TOKEN) throw new Error('GITHUB_TOKEN is required outside --fixture mode');
  return gh('/issues?labels=submission&state=open&per_page=100');
}

async function label(issueNumber, name) {
  if (fixturePath) return;
  await gh(`/issues/${issueNumber}/labels`, { method: 'POST', body: JSON.stringify({ labels: [name] }) });
}

async function comment(issueNumber, body) {
  if (fixturePath) return;
  await gh(`/issues/${issueNumber}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
}

const issues = await listSubmissionIssues();
const today = new Date().toISOString().slice(0, 10);
const db = openDb(DB_PATH);

let ingested = 0;
let flagged = 0;
let skipped = 0;

for (const issue of issues) {
  const labels = (issue.labels || []).map((l) => (typeof l === 'string' ? l : l.name));
  if (issue.pull_request) continue;
  if (labels.includes('ingested')) {
    skipped++;
    continue;
  }

  const fields = parseIssueForm(issue.body);
  const result = validateSubmission(fields, issue.number);

  if (result.ok) {
    upsertVenue(db, result.venue, today);
    addEvidence(db, result.venue.id, 'submission', today, 'reported', {
      issue: issue.number,
      category: result.venue.category,
    });
    await label(issue.number, 'ingested');
    ingested++;
    console.log(`ingested #${issue.number}: ${result.venue.name}`);
  } else if (!labels.includes('needs-info')) {
    await label(issue.number, 'needs-info');
    await comment(
      issue.number,
      'Thanks for the suggestion! The automated ingest could not accept it yet:\n\n' +
        result.problems.map((p) => `- ${p}`).join('\n') +
        '\n\nEdit the issue description above to fix these and it will be picked up on the next hourly run.',
    );
    flagged++;
    console.log(`flagged #${issue.number}: ${result.problems.length} problem(s)`);
  } else {
    skipped++; // already flagged, unchanged
  }
}

const payload = publishFromDb(db, JSON_PATH);
db.close();
console.log(`ingest complete: ${ingested} ingested, ${flagged} flagged, ${skipped} skipped; published ${payload.meta.count} venues`);
