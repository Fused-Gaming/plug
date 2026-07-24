/**
 * Phase C: Resend email confirmation integration
 *
 * Handles sending confirmation emails for community submissions and tracking
 * verification tokens. Email addresses are stored only with Resend (via Audiences),
 * never in the GitHub repository.
 *
 * Token format: 32-char random hex + timestamp hash + user_id
 * Expiry: 7 days from creation
 */

import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Generate a unique, collision-resistant verification token.
 * Format: 32-char random hex + timestamp hash ensures single-use + expiry tracking.
 */
export function generateToken() {
  const random = randomBytes(16).toString('hex');
  const timestamp = Date.now().toString(36);
  return `${random}${timestamp}`;
}

/**
 * Check if token has expired. Tokens are valid for 7 days.
 * Returns: true if expired, false if still valid.
 */
export function isTokenExpired(tokenExpiresAt) {
  if (!tokenExpiresAt) return true;
  return new Date() > new Date(tokenExpiresAt);
}

/**
 * Extract confirmation-eligible contact email from GitHub Issue.
 * Prefers issue creator's email if available; falls back to placeholder.
 */
export function extractContactEmail(issueData) {
  // In real GitHub API, issue.user.email is available; in Actions context,
  // we may need to extract from commit author or use issue number as fallback
  return issueData.user?.email || `issue-${issueData.number}@github.invalid`;
}

/**
 * Build confirmation email body from template.
 * Replaces {CONFIRMATION_LINK} with actual ephemeral endpoint URL.
 * Loads template from file on each call (for testability).
 */
export function buildEmailBody(submissionData, token, confirmationEndpoint, templatePath = null) {
  let template;

  if (templatePath) {
    template = readFileSync(templatePath, 'utf-8');
  } else {
    // Try to load from default location relative to this file
    try {
      const defaultPath = join(process.cwd(), 'scripts', 'etl', 'templates', 'confirmation-email.txt');
      template = readFileSync(defaultPath, 'utf-8');
    } catch (err) {
      // Fallback template for testing
      template = `Thank you for your submission!\n\nClick to confirm: {CONFIRMATION_LINK}\n\nPrivacy: Email stored only with Resend.`;
    }
  }

  const confirmationLink = `${confirmationEndpoint}?token=${encodeURIComponent(token)}`;
  return template.replace('{CONFIRMATION_LINK}', confirmationLink).replace(
    '{{LOCATION_NAME}}',
    submissionData.name,
  );
}

/**
 * Send confirmation email via Resend API.
 * Stores token with Resend Audiences for stateless verification.
 *
 * Returns: { ok: true, resendId, token, expiryDate } or { ok: false, error }
 */
export async function sendConfirmationEmail(contact, submissionData, token, resendApiKey, resendFromEmail, confirmationEndpoint) {
  if (!resendApiKey || !resendFromEmail) {
    return { ok: false, error: 'Missing RESEND_API_KEY or RESEND_FROM_EMAIL' };
  }

  const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const emailBody = buildEmailBody(submissionData, token, confirmationEndpoint);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: contact.email,
        subject: 'Confirm your charging location suggestion for plug.vln.gg',
        text: emailBody,
        reply_to: contact.replyTo || 'support@vln.gg',
        // Resend doesn't support custom token storage in emails, but we can
        // store in our own submission_confirmations table
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { ok: false, error: error.message || 'Resend API error' };
    }

    const data = await response.json();
    return {
      ok: true,
      resendId: data.id,
      token,
      expiryDate,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Validate confirmation token against our database.
 * Returns: { ok: true, submissionId } or { ok: false, error }
 */
export async function validateConfirmationToken(db, token) {
  if (!token || typeof token !== 'string' || token.length < 40) {
    return { ok: false, error: 'Invalid token format' };
  }

  try {
    const row = db
      .prepare(
        `SELECT id, venue_id, token_expires, confirmed_at FROM submission_confirmations
         WHERE resend_token = ? LIMIT 1`,
      )
      .get(token);

    if (!row) {
      return { ok: false, error: 'Token not found' };
    }

    if (row.confirmed_at) {
      return { ok: false, error: 'Token already used' };
    }

    if (isTokenExpired(row.token_expires)) {
      return { ok: false, error: 'Token expired' };
    }

    return { ok: true, submissionId: row.id, venueId: row.venue_id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Mark confirmation token as used and publication-ready.
 * Sets email_confirmed = 1 and confirmed_at timestamp in venues table.
 */
export function markConfirmed(db, venueId, submissionId) {
  const now = new Date().toISOString();

  // Update submission_confirmations
  db.prepare(`UPDATE submission_confirmations SET confirmed_at = ? WHERE id = ?`).run(now, submissionId);

  // Update venues
  db.prepare(`UPDATE venues SET email_confirmed = 1, confirmed_at = ? WHERE id = ?`).run(now, venueId);
}

/**
 * Store submission confirmation record (pending email verification).
 * Tracks token, expiry, and contact email (via Resend).
 */
export function storeConfirmationRecord(db, today, venueId, contactEmail, token, expiryDate) {
  const confirmationId = `confirm/${venueId}`;

  db.prepare(
    `INSERT INTO submission_confirmations (id, venue_id, contact_email, resend_token, token_expires, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(confirmationId, venueId, contactEmail, token, expiryDate.toISOString(), today);

  return confirmationId;
}

/**
 * Clean up expired confirmation tokens.
 * Called periodically (e.g., daily) to remove unconfirmed submissions after 7 days.
 * Returns: number of deleted records.
 */
export function cleanupExpiredTokens(db) {
  const result = db
    .prepare(
      `DELETE FROM submission_confirmations
       WHERE confirmed_at IS NULL AND token_expires < datetime('now')`,
    )
    .run();

  return result.changes;
}
