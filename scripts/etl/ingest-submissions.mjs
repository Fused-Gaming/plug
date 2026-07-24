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
import {
  generateToken,
  storeConfirmationRecord,
  sendConfirmationEmail,
  extractContactEmail,
  cleanupExpiredTokens,
} from './resend.js';

const ROOT = new URL('../..', import.meta.url).pathname;
const DB_PATH = join(ROOT, 'data/locations.db');
const JSON_PATH = join(ROOT, 'public/data/locations.json');

const REPO = process.env.GITHUB_REPOSITORY || 'Fused-Gaming/plug';
const API = `https://api.github.com/repos/${REPO}`;
const TOKEN = process.env.GITHUB_TOKEN;

// Phase C: Resend email confirmation
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@resend.app';
const CONFIRMATION_ENDPOINT = process.env.CONFIRMATION_ENDPOINT || 'https://plug.vln.gg/api/confirm-submission';

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

    // Phase C: Send confirmation email if Resend is configured
    if (RESEND_API_KEY && issue.user?.email) {
      try {
        const token = generateToken();
        const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Store confirmation record (pending email verification)
        storeConfirmationRecord(db, today, result.venue.id, issue.user.email, token, expiryDate);

        // Send confirmation email via Resend
        const emailResult = await sendConfirmationEmail(
          { email: issue.user.email, replyTo: 'support@vln.gg' },
          result.venue,
          token,
          RESEND_API_KEY,
          RESEND_FROM_EMAIL,
          CONFIRMATION_ENDPOINT,
        );

        if (emailResult.ok) {
          console.log(`confirmation email sent to ${issue.user.email} for #${issue.number}`);
        } else {
          console.warn(`failed to send confirmation email for #${issue.number}: ${emailResult.error}`);
        }
      } catch (err) {
        console.warn(`error sending confirmation email for #${issue.number}: ${err.message}`);
      }
    }

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

// Clean up expired confirmation tokens (optional, can be run periodically)
if (RESEND_API_KEY) {
  const expired = cleanupExpiredTokens(db);
  if (expired > 0) {
    console.log(`cleaned up ${expired} expired confirmation token(s)`);
  }
}

const payload = publishFromDb(db, JSON_PATH);
db.close();
console.log(`ingest complete: ${ingested} ingested, ${flagged} flagged, ${skipped} skipped; published ${payload.meta.count} venues`);
