/**
 * Ephemeral confirmation endpoint for Phase C email verification.
 *
 * Usage (from GitHub Actions):
 *   node scripts/api/confirm-submission.mjs --token=<TOKEN> --db=data/venues.db
 *
 * Validates the token against our submission_confirmations table and marks the
 * venue as email_confirmed if valid. Returns JSON response.
 */

import { parseArgs } from 'node:util';
import { openDb } from '../etl/db.js';
import { validateConfirmationToken, markConfirmed } from '../etl/resend.js';

const options = {
  token: { type: 'string' },
  db: { type: 'string', default: 'data/venues.db' },
  verbose: { type: 'boolean', default: false },
};

const { values } = parseArgs({ options, strict: true });

async function confirmSubmission() {
  if (!values.token) {
    console.error('Error: --token is required');
    process.exit(1);
  }

  try {
    const db = openDb(values.db);
    const validation = await validateConfirmationToken(db, values.token);

    if (!validation.ok) {
      const response = { ok: false, error: validation.error };
      console.log(JSON.stringify(response));
      process.exit(validation.error === 'Token expired' ? 1 : 1);
    }

    markConfirmed(db, validation.venueId, validation.submissionId);
    db.close();

    const response = {
      ok: true,
      message: 'Submission confirmed successfully',
      submissionId: validation.submissionId,
      venueId: validation.venueId,
    };

    console.log(JSON.stringify(response));
    process.exit(0);
  } catch (err) {
    console.error('Error during confirmation:', err.message);
    console.log(JSON.stringify({ ok: false, error: err.message }));
    process.exit(1);
  }
}

confirmSubmission();
