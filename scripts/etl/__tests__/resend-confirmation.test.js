/**
 * Unit tests for Phase C Resend email confirmation workflow
 *
 * Tests token generation, validation, email building, and database operations
 * for the email confirmation pipeline.
 */

import { beforeEach, afterEach } from '@jest/globals';
import Database from 'better-sqlite3';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import {
  generateToken,
  isTokenExpired,
  extractContactEmail,
  buildEmailBody,
  sendConfirmationEmail,
  validateConfirmationToken,
  markConfirmed,
  storeConfirmationRecord,
  cleanupExpiredTokens,
} from '../resend.js';
import { openDb } from '../db.js';

describe('Phase C: Resend Confirmation Workflow', () => {
  let db;
  let dbPath;
  let tempDir;

  beforeEach(() => {
    tempDir = mkdtempSync('/tmp/test-resend-');
    dbPath = join(tempDir, 'test.db');
    db = openDb(dbPath);
  });

  afterEach(() => {
    if (db) db.close();
    if (tempDir) rmSync(tempDir, { recursive: true });
  });

  describe('generateToken', () => {
    it('generates a unique 40+ character token', () => {
      const token = generateToken();
      // Token format: 32-char hex random + base36 timestamp
      expect(token).toMatch(/^[a-z0-9]+$/);
      expect(token.length).toBeGreaterThanOrEqual(40);
    });

    it('generates different tokens each time', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('isTokenExpired', () => {
    it('returns true for null/undefined', () => {
      expect(isTokenExpired(null)).toBe(true);
      expect(isTokenExpired(undefined)).toBe(true);
    });

    it('returns false for future dates', () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      expect(isTokenExpired(future)).toBe(false);
    });

    it('returns true for past dates', () => {
      const past = new Date(Date.now() - 1000).toISOString();
      expect(isTokenExpired(past)).toBe(true);
    });
  });

  describe('extractContactEmail', () => {
    it('extracts email from issue.user.email', () => {
      const issue = {
        number: 123,
        user: { email: 'contributor@example.com' },
      };
      expect(extractContactEmail(issue)).toBe('contributor@example.com');
    });

    it('falls back to placeholder if user.email missing', () => {
      const issue = { number: 456, user: {} };
      expect(extractContactEmail(issue)).toBe('issue-456@github.invalid');
    });

    it('falls back to placeholder if user missing', () => {
      const issue = { number: 789 };
      expect(extractContactEmail(issue)).toBe('issue-789@github.invalid');
    });
  });

  describe('buildEmailBody', () => {
    it('includes confirmation link', () => {
      const token = 'test-token-xyz';
      const submission = { name: 'Test Library', id: 'sub/123' };
      const endpoint = 'https://plug.vln.gg/api/confirm-submission';

      const body = buildEmailBody(submission, token, endpoint);

      expect(body).toContain('https://plug.vln.gg/api/confirm-submission?token=test-token-xyz');
      expect(body).toContain('plug.vln.gg');
    });

    it('includes privacy statement', () => {
      const token = generateToken();
      const submission = { name: 'Community Center' };
      const endpoint = 'https://plug.vln.gg/api/confirm';

      const body = buildEmailBody(submission, token, endpoint);

      expect(body).toContain('privacy');
      expect(body).toContain('Resend');
      expect(body).toContain('GitHub repository');
    });

    it('encodes token in URL properly', () => {
      const token = 'token+with/special=chars';
      const submission = { name: 'Test' };
      const body = buildEmailBody(submission, token, 'https://example.com/confirm');

      expect(body).toContain(encodeURIComponent(token));
    });
  });

  describe('sendConfirmationEmail', () => {
    it('returns error if RESEND_API_KEY missing', async () => {
      const result = await sendConfirmationEmail(
        { email: 'test@example.com' },
        { name: 'Test' },
        'token',
        null,
        'noreply@resend.app',
        'https://example.com',
      );

      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/RESEND_API_KEY/);
    });

    it('returns error if RESEND_FROM_EMAIL missing', async () => {
      const result = await sendConfirmationEmail(
        { email: 'test@example.com' },
        { name: 'Test' },
        'token',
        'test-key',
        null,
        'https://example.com',
      );

      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/RESEND_FROM_EMAIL/);
    });

    it('calls Resend API with correct payload', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email_123' }),
      });
      global.fetch = fetchMock;

      const contact = { email: 'user@example.com', replyTo: 'support@vln.gg' };
      const submission = { name: 'Library', id: 'sub/001' };
      const token = 'abc123def456';

      await sendConfirmationEmail(
        contact,
        submission,
        token,
        're_testkey',
        'sender@vln.gg',
        'https://plug.vln.gg/confirm',
      );

      expect(fetchMock).toHaveBeenCalled();
      const call = fetchMock.mock.calls[0];
      const body = JSON.parse(call[1].body);

      expect(body.to).toBe('user@example.com');
      expect(body.from).toBe('sender@vln.gg');
      expect(body.reply_to).toBe('support@vln.gg');
      expect(body.subject).toContain('Confirm');
    });

    it('handles Resend API errors gracefully', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Invalid email' }),
      });
      global.fetch = fetchMock;

      const result = await sendConfirmationEmail(
        { email: 'invalid@' },
        { name: 'Test' },
        'token',
        're_key',
        'from@vln.gg',
        'https://example.com',
      );

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Invalid email');
    });
  });

  describe('storeConfirmationRecord', () => {
    it('stores confirmation record in database', () => {
      const today = '2026-07-24';
      const venueId = 'sub/123';
      const email = 'user@example.com';
      const token = generateToken();
      const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // First insert a venue
      db.prepare(`
        INSERT INTO venues (id, name, category, indoor, access, tier, amenities, first_seen)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(venueId, 'Test Venue', 'library', 1, 'public', 'community', '[]', today);

      const id = storeConfirmationRecord(db, today, venueId, email, token, expiryDate);

      const row = db
        .prepare('SELECT * FROM submission_confirmations WHERE id = ?')
        .get(id);

      expect(row).toBeDefined();
      expect(row.venue_id).toBe(venueId);
      expect(row.contact_email).toBe(email);
      expect(row.resend_token).toBe(token);
      expect(row.token_expires).toBe(expiryDate.toISOString());
      expect(row.confirmed_at).toBeNull();
    });
  });

  describe('validateConfirmationToken', () => {
    let validToken;
    let venueId;

    beforeEach(function() {
      const today = '2026-07-24';
      venueId = 'sub/999';

      db.prepare(`
        INSERT INTO venues (id, name, category, indoor, access, tier, amenities, first_seen)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(venueId, 'Test Venue', 'library', 1, 'public', 'community', '[]', today);

      const token = generateToken();
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      db.prepare(`
        INSERT INTO submission_confirmations (id, venue_id, contact_email, resend_token, token_expires, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(`confirm/${venueId}`, venueId, 'user@example.com', token, futureDate.toISOString(), today);

      validToken = token;
    });

    it('returns ok=true for valid, non-expired token', async () => {
      const result = await validateConfirmationToken(db, validToken);

      expect(result.ok).toBe(true);
      expect(result.venueId).toBe(venueId);
      expect(result.submissionId).toContain('confirm/');
    });

    it('returns error for invalid token format', async () => {
      const result = await validateConfirmationToken(db, 'short');
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/Invalid token/);
    });

    it('returns error for non-existent token', async () => {
      const result = await validateConfirmationToken(db, 'a'.repeat(48));
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/not found/);
    });

    it('returns error if token already used', async () => {
      // First validation should succeed
      const first = await validateConfirmationToken(db, validToken);
      expect(first.ok).toBe(true);

      // Mark as confirmed
      markConfirmed(db, venueId, first.submissionId);

      // Second validation should fail (already used)
      const second = await validateConfirmationToken(db, validToken);
      expect(second.ok).toBe(false);
      expect(second.error).toMatch(/already used/);
    });
  });

  describe('markConfirmed', () => {
    it('updates both submission_confirmations and venues tables', () => {
      const today = '2026-07-24';
      const venueId = 'sub/777';
      const submissionId = `confirm/${venueId}`;

      // Insert venue
      db.prepare(`
        INSERT INTO venues (id, name, category, indoor, access, tier, amenities, first_seen, email_confirmed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(venueId, 'Test', 'library', 1, 'public', 'community', '[]', today, 0);

      // Insert confirmation record
      db.prepare(`
        INSERT INTO submission_confirmations (id, venue_id, contact_email, resend_token, token_expires, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(submissionId, venueId, 'user@example.com', 'token', '2026-08-01', today);

      markConfirmed(db, venueId, submissionId);

      // Verify submission_confirmations was updated
      const submission = db.prepare('SELECT * FROM submission_confirmations WHERE id = ?').get(submissionId);
      expect(submission.confirmed_at).not.toBeNull();

      // Verify venues was updated
      const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(venueId);
      expect(venue.email_confirmed).toBe(1);
      expect(venue.confirmed_at).not.toBeNull();
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('deletes expired, unconfirmed tokens', () => {
      const today = '2026-07-24';
      const venueId = 'sub/555';

      // Insert venue
      db.prepare(`
        INSERT INTO venues (id, name, category, indoor, access, tier, amenities, first_seen)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(venueId, 'Test', 'library', 1, 'public', 'community', '[]', today);

      // Insert expired confirmation (timestamp in past, e.g. year 2020)
      const expiredTimestamp = '2020-01-01T00:00:00.000Z';
      db.prepare(`
        INSERT INTO submission_confirmations (id, venue_id, contact_email, resend_token, token_expires, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(`confirm/${venueId}`, venueId, 'user@example.com', 'token', expiredTimestamp, today);

      const deleted = cleanupExpiredTokens(db);

      expect(deleted).toBe(1);

      const row = db
        .prepare('SELECT * FROM submission_confirmations WHERE venue_id = ?')
        .get(venueId);
      expect(row).toBeUndefined();
    });

    it('does not delete confirmed tokens', () => {
      const today = '2026-07-24';
      const venueId = 'sub/444';

      // Insert venue
      db.prepare(`
        INSERT INTO venues (id, name, category, indoor, access, tier, amenities, first_seen)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(venueId, 'Test', 'library', 1, 'public', 'community', '[]', today);

      // Insert confirmed token (even if expired)
      const pastDate = new Date(Date.now() - 1000).toISOString();
      db.prepare(`
        INSERT INTO submission_confirmations (id, venue_id, contact_email, resend_token, token_expires, confirmed_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(`confirm/${venueId}`, venueId, 'user@example.com', 'token', pastDate, pastDate, today);

      const deleted = cleanupExpiredTokens(db);

      expect(deleted).toBe(0);

      const row = db
        .prepare('SELECT * FROM submission_confirmations WHERE venue_id = ?')
        .get(venueId);
      expect(row).toBeDefined(); // Should still exist
    });
  });
});
