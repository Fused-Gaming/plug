/**
 * Unit tests for issue #42's App-submission validator (validate-submission.mjs).
 */

import { beforeEach, afterEach } from '@jest/globals';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { openDb, insertSubmittedVenue } from '../db.js';
import { validateSubmission } from '../validate-submission.mjs';

function parsedSubmission(overrides = {}) {
  return {
    submissionId: 'sub_9f8e2c1a4b7d',
    name: 'Oakland Main Library',
    address: '125 14th St, Oakland',
    area: 'Downtown',
    lat: 37.8011,
    lon: -122.2648,
    category: 'library',
    indoor: true,
    access: 'public',
    hours: 'Mo-Sa 10:00-18:00',
    amenities: ['Outlets', 'Wi-Fi'],
    notes: 'Outlets along the wall.',
    submittedByHash: 'a'.repeat(64),
    sourceIssue: 101,
    ...overrides,
  };
}

describe('validateSubmission', () => {
  let db;
  let tempDir;

  beforeEach(() => {
    tempDir = mkdtempSync('/tmp/test-validate-submission-');
    db = openDb(join(tempDir, 'test.db'));
  });

  afterEach(() => {
    if (db) db.close();
    if (tempDir) rmSync(tempDir, { recursive: true });
  });

  it('accepts a well-formed submission and returns a venue ready for insertSubmittedVenue', () => {
    const result = validateSubmission(db, parsedSubmission());
    expect(result.valid).toBe(true);
    expect(result.venue).toMatchObject({
      id: 'sub/101',
      name: 'Oakland Main Library',
      lat: 37.8011,
      lon: -122.2648,
      category: 'library',
      indoor: true,
      access: 'public',
      hours: 'Mo-Sa 10:00-18:00',
      address: '125 14th St, Oakland (Downtown)',
      amenities: ['Outlets', 'Wi-Fi'],
      notes: 'Outlets along the wall.',
      sourceIssue: 101,
      submissionId: 'sub_9f8e2c1a4b7d',
      submittedByHash: 'a'.repeat(64),
    });
    // The returned venue should insert cleanly (no thrown constraint errors).
    expect(() => insertSubmittedVenue(db, result.venue, '2026-07-26')).not.toThrow();
  });

  it('accepts an address-only submission with no coordinates', () => {
    const result = validateSubmission(db, parsedSubmission({ lat: null, lon: null, area: null }));
    expect(result.valid).toBe(true);
    expect(result.venue.lat).toBeNull();
    expect(result.venue.lon).toBeNull();
  });

  it('rejects a submission missing an address when coordinates are also absent', () => {
    const result = validateSubmission(db, parsedSubmission({ address: null, lat: null, lon: null }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/address is required/i);
  });

  it('rejects a name that is too short', () => {
    const result = validateSubmission(db, parsedSubmission({ name: 'AB' }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/place name/i);
  });

  it('rejects a name over the length limit', () => {
    const result = validateSubmission(db, parsedSubmission({ name: 'A'.repeat(81) }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/80 characters/);
  });

  it('rejects notes over the length limit', () => {
    const result = validateSubmission(db, parsedSubmission({ notes: 'A'.repeat(281) }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/280 characters/);
  });

  it('rejects latitude out of range', () => {
    const result = validateSubmission(db, parsedSubmission({ lat: 91, lon: -122.2648 }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/latitude/i);
  });

  it('rejects longitude out of range', () => {
    const result = validateSubmission(db, parsedSubmission({ lat: 37.8, lon: -181 }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/longitude/i);
  });

  it('rejects coordinates outside the Oakland service area', () => {
    // San Francisco, well outside SERVICE_AREA from lib.js.
    const result = validateSubmission(db, parsedSubmission({ lat: 37.7749, lon: -122.4194 }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/service area/i);
  });

  it('rejects lat present without lon', () => {
    const result = validateSubmission(db, parsedSubmission({ lat: 37.8, lon: null }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/latitude and longitude/i);
  });

  it('rejects an unknown category', () => {
    const result = validateSubmission(db, parsedSubmission({ category: 'restaurant' }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/category/i);
  });

  it('rejects an unknown access value', () => {
    const result = validateSubmission(db, parsedSubmission({ access: 'members-only' }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/access/i);
  });

  it('rejects a missing indoor/outdoor value', () => {
    const result = validateSubmission(db, parsedSubmission({ indoor: null }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/indoor/i);
  });

  it('rejects a script tag in the name', () => {
    const result = validateSubmission(db, parsedSubmission({ name: '<script>alert(1)</script>' }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/markup/i);
  });

  it('rejects an inline event handler in notes', () => {
    const result = validateSubmission(db, parsedSubmission({ notes: '<img src=x onerror=alert(1)>' }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/markup/i);
  });

  it('rejects a javascript: URL in the address', () => {
    const result = validateSubmission(db, parsedSubmission({ address: 'javascript:alert(1)' }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/markup/i);
  });

  it('rejects a duplicate by source issue', () => {
    insertSubmittedVenue(
      db,
      { id: 'sub/101', name: 'Existing', category: 'library', indoor: true, access: 'public', amenities: [], sourceIssue: 101, submissionId: 'sub_other' },
      '2026-07-25',
    );
    const result = validateSubmission(db, parsedSubmission({ sourceIssue: 101, submissionId: 'sub_new' }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/already ingested/i);
  });

  it('rejects a duplicate by submissionId', () => {
    insertSubmittedVenue(
      db,
      { id: 'sub/55', name: 'Existing', category: 'library', indoor: true, access: 'public', amenities: [], sourceIssue: 55, submissionId: 'sub_9f8e2c1a4b7d' },
      '2026-07-25',
    );
    const result = validateSubmission(db, parsedSubmission({ sourceIssue: 999, submissionId: 'sub_9f8e2c1a4b7d' }));
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/already ingested/i);
  });

  it('throws (not returns invalid) for programmer errors', () => {
    expect(() => validateSubmission(null, parsedSubmission())).toThrow(/db is required/);
    expect(() => validateSubmission(db, null)).toThrow(/submission must be an object/);
  });
});
