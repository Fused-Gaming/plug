/**
 * Pure functions for Phase B community-submission ingest (issue #21).
 *
 * Parses GitHub Issue Form bodies (the "### Heading\n\nvalue" markdown that
 * .github/ISSUE_TEMPLATE/location.yml produces), validates and sanitizes them
 * into community-tier venue records. This module is the pipeline's XSS and
 * data-poisoning boundary: everything downstream (SQLite, published JSON, the
 * landing page renderer) treats its output as plain text.
 */

import { inServiceArea } from './lib.js';

const CATEGORY_MAP = {
  Library: 'library',
  'Community center': 'community_centre',
  'Public charging station': 'device_charging_station',
  'Cafe or restaurant (customers only)': 'cafe',
  'Other public space': 'other',
};

const FEATURE_AMENITIES = {
  'Wall outlets': 'Outlets',
  'USB ports': 'USB charging',
  'Wi-Fi': 'Wi-Fi',
  'Wheelchair accessible': 'Accessible',
  Restrooms: 'Restrooms',
};

/** Sanitize text from community submissions to prevent XSS and injection attacks.
 *
 * Strips control characters, markup, and URLs; collapses whitespace; caps length.
 * Defense in depth: renderer also uses textContent, but sanitized storage keeps
 * the DB and JSON clean for all downstream consumers.
 *
 * Transformation sequence:
 * 1. Unicode control/invisible/bidi → spaces (prevent hidden content)
 * 2. Markup/injection chars (<, >, `, |, \) → removed
 * 3. Markdown links/images → plain text (e.g., "[label](url)" → "label")
 * 4. HTTP(S) URLs → removed entirely (add no value, pose phishing risk)
 * 5. Collapse spaces, trim, truncate to maxLen
 */
export function sanitizeText(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001f\u007f-\u009f\u00ad\u200b-\u200f\u2028\u2029\u202a-\u202e\u2060\ufeff]/g, ' ') // control/invisible/bidi chars
    .replace(/[<>`|\\]/g, '') // markup/injection metachars
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // markdown links/images -> label
    .replace(/https?:\S+/gi, '') // bare URLs add nothing but risk
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen)
    .trim();
}

/** Parse GitHub Issue Form body into structured { label: value } object.
 *
 * GitHub's issue form (YAML template) produces markdown like:
 *   ### Place name
 *   Test Library
 *
 *   ### Hours (if known)
 *   Mon-Fri 10am-6pm
 *
 * Checkbox groups ("What is available") become arrays of checked labels.
 * "_No response_" (GitHub's placeholder for empty fields) becomes empty string.
 */
export function parseIssueForm(body) {
  const fields = {};
  const sections = String(body || '').split(/\n(?=### )/);
  for (const section of sections) {
    const match = section.match(/^### (.+)\n+([\s\S]*)$/);
    if (!match) continue;
    const label = match[1].trim();
    const raw = match[2].trim();
    if (/^- \[[ x]\]/m.test(raw)) {
      fields[label] = [...raw.matchAll(/^- \[x\] (.+)$/gim)].map((m) => m[1].trim());
    } else {
      fields[label] = raw === '_No response_' ? '' : raw;
    }
  }
  return fields;
}

/** Validate parsed issue form fields into a community venue record.
 *
 * Returns { ok: true, venue } on success, { ok: false, problems: [...] } on failure.
 * All text is sanitized; coordinates are validated against service area boundary.
 * Category must match CATEGORY_MAP; access must be explicit ("everyone" or "customers").
 *
 * Returns venue object with fields: id, name, lat, lon, category, indoor, access,
 * hours, address, amenities, notes, source, tier.
 */
export function validateSubmission(fields, issueNumber) {
  const problems = [];

  const name = sanitizeText(fields['Place name'], 80);
  if (name.length < 3) problems.push('Place name is required (at least 3 characters).');

  const category = CATEGORY_MAP[String(fields['Category'] || '').trim()];
  if (!category) problems.push('Category must be one of the dropdown options.');

  const address = sanitizeText(fields['Street address'], 120);
  if (address.length < 5) problems.push('Street address is required (at least 5 characters).');

  const area = sanitizeText(fields['Neighborhood or cross street'], 80);

  let lat = null;
  let lon = null;
  const rawLat = String(fields['Latitude (optional)'] || '').trim();
  const rawLon = String(fields['Longitude (optional)'] || '').trim();
  if (rawLat || rawLon) {
    lat = Number(rawLat);
    lon = Number(rawLon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      problems.push('Latitude and longitude must both be plain decimal numbers (or both left blank).');
      lat = lon = null;
    } else if (!inServiceArea(lat, lon)) {
      problems.push('Coordinates fall outside the Oakland service area.');
      lat = lon = null;
    } else {
      lat = Number(lat.toFixed(6));
      lon = Number(lon.toFixed(6));
    }
  }

  const setting = String(fields['Indoor or outdoor'] || '').trim();
  if (setting !== 'Indoor' && setting !== 'Outdoor') problems.push('Indoor or outdoor is required.');

  const accessRaw = String(fields['Who can use it'] || '').trim();
  if (accessRaw !== 'Open to everyone' && accessRaw !== 'Customers only') {
    problems.push('"Who can use it" is required.');
  }

  const hours = sanitizeText(fields['Hours (if known)'], 60) || null;
  const notes = sanitizeText(fields['Anything else worth knowing'], 280) || null;

  const amenities = (Array.isArray(fields['What is available']) ? fields['What is available'] : [])
    .map((label) => FEATURE_AMENITIES[label])
    .filter(Boolean);
  if (accessRaw === 'Open to everyone') amenities.unshift('Free');

  if (problems.length) return { ok: false, problems };

  return {
    ok: true,
    venue: {
      id: `sub/${issueNumber}`,
      name,
      lat,
      lon,
      category,
      indoor: setting === 'Indoor',
      access: accessRaw === 'Customers only' ? 'customer' : 'public',
      hours,
      address: area ? `${address} (${area})` : address,
      amenities,
      notes,
      source: 'submission',
      tier: 'community',
    },
  };
}
