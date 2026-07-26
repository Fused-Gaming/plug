#!/usr/bin/env node
/**
 * Issue #42: per-issue runner invoked by
 * .github/workflows/process-location-submissions.yml when the PLUG GitHub
 * App opens (or labels) a `submission` issue. Chains:
 *
 *   parseSubmissionIssue -> validateSubmission -> createSubmissionPr
 *
 * On success: comments the PR link on the issue and closes it.
 * On a parse/validation failure: labels the issue `needs-info` and leaves a
 * comment listing what needs fixing, mirroring
 * scripts/etl/ingest-submissions.mjs's existing needs-info convention for
 * the manual issue-form pipeline (but never closes the issue).
 *
 * Reads the triggering issue from GITHUB_EVENT_PATH (standard Actions
 * event payload) so this can run for both `opened` and `labeled` events
 * without re-fetching the issue.
 *
 *   node scripts/etl/process-submission-issue.mjs                # live (needs GITHUB_TOKEN, GITHUB_EVENT_PATH)
 *   node scripts/etl/process-submission-issue.mjs --fixture f.json  # local test, no API writes; f.json = { number, body }
 */

import { readFileSync } from 'node:fs';
import { Octokit } from '@octokit/rest';
import { openDb } from './db.js';
import { parseSubmissionIssue } from './parse-submission-issue.mjs';
import { validateSubmission } from './validate-submission.mjs';
import { createSubmissionPr } from './create-submission-pr.mjs';

const ROOT = new URL('../..', import.meta.url).pathname;
const DB_PATH = `${ROOT}data/locations.db`;

const [OWNER, REPO] = (process.env.GITHUB_REPOSITORY || 'Fused-Gaming/plug').split('/');
const TOKEN = process.env.GITHUB_TOKEN;

const fixtureFlag = process.argv.indexOf('--fixture');
const fixturePath = fixtureFlag !== -1 ? process.argv[fixtureFlag + 1] : null;

function loadIssue() {
  if (fixturePath) return JSON.parse(readFileSync(fixturePath, 'utf8'));
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) throw new Error('GITHUB_EVENT_PATH is required outside --fixture mode.');
  const event = JSON.parse(readFileSync(eventPath, 'utf8'));
  if (!event.issue) throw new Error('Event payload has no `issue` -- was this triggered by an `issues` event?');
  return event.issue;
}

async function main() {
  const issue = loadIssue();
  const octokit = fixturePath ? null : new Octokit({ auth: TOKEN });

  let venue;
  try {
    const parsed = parseSubmissionIssue(issue.body, issue.number);
    const db = openDb(DB_PATH);
    let result;
    try {
      result = validateSubmission(db, parsed);
    } finally {
      db.close();
    }
    if (!result.valid) throw new Error(result.reason);
    venue = result.venue;
  } catch (err) {
    console.log(`flagged #${issue.number}: ${err.message}`);
    if (octokit) {
      await octokit.issues.addLabels({ owner: OWNER, repo: REPO, issue_number: issue.number, labels: ['needs-info'] });
      await octokit.issues.createComment({
        owner: OWNER,
        repo: REPO,
        issue_number: issue.number,
        body:
          'Thanks for the suggestion! The automated submission workflow could not accept it yet:\n\n' +
          `- ${err.message}\n\n` +
          'This issue was created by the submission App on your behalf, so please reply here (or resubmit ' +
          'via the web form) and a maintainer will take another look.',
      });
    }
    process.exitCode = 1;
    return;
  }

  const { pr } = await createSubmissionPr(venue, octokit ? { octokit } : {});
  console.log(`opened ${pr.html_url} for #${issue.number}: ${venue.name}`);

  if (octokit) {
    await octokit.issues.createComment({
      owner: OWNER,
      repo: REPO,
      issue_number: issue.number,
      body: `Thanks for the submission! Opened ${pr.html_url} to add **${venue.name}** to the map. ` +
        'It will go live once the automated checks pass and the PR merges.',
    });
    await octokit.issues.update({
      owner: OWNER,
      repo: REPO,
      issue_number: issue.number,
      state: 'closed',
      state_reason: 'completed',
    });
  }
}

await main();
