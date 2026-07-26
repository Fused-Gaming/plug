/**
 * Validates a parsed submission (see parse-submission-issue.mjs) before it
 * is allowed to touch SQLite or the filesystem. This is issue #42's trust
 * boundary for App-created issues -- the same role scripts/etl/submissions.js's
 * validateSubmission() plays for the manual issue-form pipeline. Never
 * interpolate the issue body/App payload into SQL or a shell command
 * without going through this first.
 *
 * Returns { valid: true, venue } on success (venue is ready to pass to
 * insertSubmittedVenue()) or { valid: false, reason } on an expected
 * validation failure. Only throws for programmer errors (missing/malformed
 * arguments) -- never for attacker-controlled input.
 */

import { sanitizeText } from './submissions.js';
import { inServiceArea, SERVICE_AREA } from './lib.js';
import { findVenueBySourceIssue, findVenueBySubmissionId } from './db.js';

// Must match the enum values scripts/etl/submissions.js's CATEGORY_MAP
// produces and the `venues` table already contains, so community
// submissions from either pipeline stay consistent.
const CATEGORIES = new Set(['library', 'community_centre', 'device_charging_station', 'cafe', 'other']);
const ACCESS_VALUES = new Set(['public', 'customer']);

const LIMITS = {
  name: 80,
  address: 120,
  area: 80,
  hours: 60,
  notes: 280,
  amenity: 40,
};
const MAX_AMENITIES = 10;

// Explicit reject (not silent-strip) for anything that looks like it's
// trying to execute in a browser context. sanitizeText() below still runs
// as defense in depth on whatever survives this check.
const DANGEROUS_MARKUP_RE = /<\s*\/?\s*(script|iframe|object|embed|svg|img|link|style)\b|on\w+\s*=|javascript\s*:/i;

function hasDangerousMarkup(...values) {
  return values.some((v) => typeof v === 'string' && DANGEROUS_MARKUP_RE.test(v));
}

function tooLong(value, limit) {
  return typeof value === 'string' && value.length > limit;
}

/**
 * @param {import('better-sqlite3').Database} db
 * @param {ReturnType<typeof import('./parse-submission-issue.mjs').parseSubmissionIssue>} submission
 * @returns {{ valid: true, venue: object } | { valid: false, reason: string }}
 */
export function validateSubmission(db, submission) {
  if (!db) {
    throw new Error('validateSubmission: db is required (see openDb in scripts/etl/db.js).');
  }
  if (!submission || typeof submission !== 'object') {
    throw new Error('validateSubmission: submission must be an object (see parseSubmissionIssue).');
  }

  const { submissionId, sourceIssue, name, address, area, category, indoor, access, hours, notes, amenities, lat, lon } =
    submission;

  if (!submissionId || typeof submissionId !== 'string') {
    return { valid: false, reason: 'Missing or invalid submissionId.' };
  }
  if (!Number.isInteger(sourceIssue)) {
    return { valid: false, reason: 'Missing or invalid sourceIssue.' };
  }

  // Duplicate detection -- re-processing the same GitHub Issue or the same
  // signed submission token must never create a second venue row.
  if (findVenueBySourceIssue(db, sourceIssue)) {
    return { valid: false, reason: `Issue #${sourceIssue} was already ingested as a venue.` };
  }
  if (findVenueBySubmissionId(db, submissionId)) {
    return { valid: false, reason: `Submission ${submissionId} was already ingested as a venue.` };
  }

  if (hasDangerousMarkup(name, address, notes)) {
    return { valid: false, reason: 'Submission contains disallowed HTML/script markup.' };
  }

  if (typeof name !== 'string' || tooLong(name, LIMITS.name)) {
    return { valid: false, reason: `Place name must be ${LIMITS.name} characters or fewer.` };
  }
  const sanitizedName = sanitizeText(name, LIMITS.name);
  if (sanitizedName.length < 3) {
    return { valid: false, reason: 'Place name is required (at least 3 characters).' };
  }

  if (!CATEGORIES.has(category)) {
    return { valid: false, reason: `Category must be one of: ${[...CATEGORIES].join(', ')}.` };
  }

  if (!ACCESS_VALUES.has(access)) {
    return { valid: false, reason: `Access must be one of: ${[...ACCESS_VALUES].join(', ')}.` };
  }

  if (indoor !== true && indoor !== false) {
    return { valid: false, reason: 'Indoor/outdoor setting is required.' };
  }

  // address is required unless coordinates were supplied (db.js: lat/lon
  // are nullable specifically to allow address-only community submissions,
  // but a submission needs at least one way to locate the venue).
  const hasCoords = lat !== null || lon !== null;
  if (tooLong(address, LIMITS.address)) {
    return { valid: false, reason: `Street address must be ${LIMITS.address} characters or fewer.` };
  }
  const sanitizedAddress = address ? sanitizeText(address, LIMITS.address) : null;
  if (!hasCoords && (!sanitizedAddress || sanitizedAddress.length < 5)) {
    return { valid: false, reason: 'Street address is required when coordinates are not provided.' };
  }

  if (tooLong(area, LIMITS.area)) {
    return { valid: false, reason: `Neighborhood/area must be ${LIMITS.area} characters or fewer.` };
  }
  const sanitizedArea = area ? sanitizeText(area, LIMITS.area) : null;

  let finalLat = null;
  let finalLon = null;
  if (hasCoords) {
    if (Number.isNaN(lat) || Number.isNaN(lon) || lat === null || lon === null) {
      return { valid: false, reason: 'Latitude and longitude must both be present and numeric (or both omitted).' };
    }
    if (lat < -90 || lat > 90) {
      return { valid: false, reason: 'Latitude must be between -90 and 90.' };
    }
    if (lon < -180 || lon > 180) {
      return { valid: false, reason: 'Longitude must be between -180 and 180.' };
    }
    if (!inServiceArea(lat, lon)) {
      return {
        valid: false,
        reason: `Coordinates fall outside the service area (lat ${SERVICE_AREA.south}-${SERVICE_AREA.north}, lon ${SERVICE_AREA.west}-${SERVICE_AREA.east}).`,
      };
    }
    finalLat = Number(lat.toFixed(6));
    finalLon = Number(lon.toFixed(6));
  }

  if (tooLong(hours, LIMITS.hours)) {
    return { valid: false, reason: `Hours must be ${LIMITS.hours} characters or fewer.` };
  }
  const sanitizedHours = hours ? sanitizeText(hours, LIMITS.hours) || null : null;

  if (tooLong(notes, LIMITS.notes)) {
    return { valid: false, reason: `Notes must be ${LIMITS.notes} characters or fewer.` };
  }
  const sanitizedNotes = notes ? sanitizeText(notes, LIMITS.notes) || null : null;

  if (!Array.isArray(amenities) || amenities.length > MAX_AMENITIES) {
    return { valid: false, reason: `Amenities must be a list of ${MAX_AMENITIES} items or fewer.` };
  }
  const sanitizedAmenities = amenities.map((a) => sanitizeText(a, LIMITS.amenity)).filter(Boolean);

  const finalAddress = sanitizedArea && sanitizedAddress ? `${sanitizedAddress} (${sanitizedArea})` : sanitizedAddress;

  return {
    valid: true,
    venue: {
      id: `sub/${sourceIssue}`,
      name: sanitizedName,
      lat: finalLat,
      lon: finalLon,
      category,
      indoor,
      access,
      hours: sanitizedHours,
      address: finalAddress,
      amenities: sanitizedAmenities,
      notes: sanitizedNotes,
      sourceIssue,
      submissionId,
      submittedByHash: submission.submittedByHash ?? null,
    },
  };
}
