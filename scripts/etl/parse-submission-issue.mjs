/**
 * Parses a GitHub Issue body created by the PLUG GitHub App (issue #42:
 * account-free outlet submissions) into a normalized venue submission
 * record.
 *
 * Unlike scripts/etl/submissions.js (which parses the human-filled GitHub
 * Issue Form at .github/ISSUE_TEMPLATE/location.yml), these issues are
 * created programmatically by an upstream "verification function" running
 * behind the org's own web form -- there is no GitHub account involved on
 * the submitter's side. That function is expected to embed exactly one
 * fenced ```json code block in the issue body, shaped like:
 *
 *   ### Structured submission data
 *
 *   ```json
 *   {
 *     "submissionId": "sub_9f8e2c1a4b7d",
 *     "name": "Oakland Main Library",
 *     "address": "125 14th St, Oakland",
 *     "area": "Downtown",
 *     "lat": 37.8011,
 *     "lon": -122.2648,
 *     "category": "library",
 *     "indoor": true,
 *     "access": "public",
 *     "hours": "Mo-Sa 10:00-18:00",
 *     "amenities": ["Outlets", "Wi-Fi", "Restrooms"],
 *     "notes": "Outlets along the wall by the reading tables.",
 *     "submittedByHash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d"
 *   }
 *   ```
 *
 * Everything else in the body (a human-readable summary for issue-list
 * skimmability, App disclaimers, etc.) is ignored by this parser.
 *
 * IMPORTANT -- this is a proposed contract, not yet implemented upstream:
 * `category` and `access` MUST already be normalized to the same enum
 * values the `venues` table and scripts/etl/submissions.js's CATEGORY_MAP
 * use ('library' | 'community_centre' | 'device_charging_station' | 'cafe'
 * | 'other' for category; 'public' | 'customer' for access) -- the App is
 * expected to do its own free-text-to-enum mapping upstream (e.g. from its
 * own web form's dropdowns) so this parser never has to guess at natural
 * language. `lat`/`lon` are optional (address-only submissions are allowed,
 * per db.js's comment) but if present must both be present and numeric.
 *
 * This function deliberately does NOT sanitize free text and does NOT
 * enforce business rules (length limits, geofence, category enum
 * membership, duplicate detection) -- that is validate-submission.mjs's
 * job, which runs on the output of this parser before anything touches
 * SQL or the filesystem. This function only throws on STRUCTURAL problems:
 * no JSON block, invalid JSON, or a payload missing fields so basic that
 * there's nothing sensible to validate.
 */

const JSON_BLOCK_RE = /```json\s*\n([\s\S]*?)```/;

// Fields without which there's no submission to reason about at all. Every
// other field is optional at the parse layer -- validate-submission.mjs
// enforces the rest (lengths, ranges, enum membership).
const REQUIRED_KEYS = ['submissionId', 'name', 'category', 'access'];

function toStringOrNull(value) {
  return value === undefined || value === null ? null : String(value);
}

/** Returns a finite number, null (absent), or NaN (present but not numeric --
 * a sentinel the validator can flag with a clear message instead of a crash). */
function toNumberOrNullOrNaN(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return n;
}

/**
 * @param {string} body - Raw GitHub Issue body (markdown).
 * @param {number} issueNumber - The GitHub Issue number this body came from.
 * @returns {{
 *   name: string, address: string|null, area: string|null,
 *   lat: number|null, lon: number|null, category: string, indoor: boolean|null,
 *   access: string, hours: string|null, amenities: string[], notes: string|null,
 *   submissionId: string, submittedByHash: string|null, sourceIssue: number,
 * }}
 */
export function parseSubmissionIssue(body, issueNumber) {
  if (!Number.isInteger(issueNumber)) {
    throw new Error('parseSubmissionIssue: issueNumber must be an integer.');
  }

  const match = JSON_BLOCK_RE.exec(String(body ?? ''));
  if (!match) {
    throw new Error(
      `Issue #${issueNumber}: no \`\`\`json structured-data block found in the issue body. ` +
        'Expected the submission App to embed one under a "Structured submission data" heading.',
    );
  }

  let data;
  try {
    data = JSON.parse(match[1]);
  } catch (err) {
    throw new Error(`Issue #${issueNumber}: structured-data block is not valid JSON (${err.message}).`);
  }

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`Issue #${issueNumber}: structured-data block must be a JSON object.`);
  }

  const missing = REQUIRED_KEYS.filter((key) => data[key] === undefined || data[key] === null || data[key] === '');
  if (missing.length) {
    throw new Error(`Issue #${issueNumber}: structured-data block is missing required field(s): ${missing.join(', ')}.`);
  }

  return {
    submissionId: String(data.submissionId),
    name: String(data.name),
    address: toStringOrNull(data.address),
    area: toStringOrNull(data.area),
    lat: toNumberOrNullOrNaN(data.lat),
    lon: toNumberOrNullOrNaN(data.lon),
    category: String(data.category),
    indoor: data.indoor === undefined || data.indoor === null ? null : Boolean(data.indoor),
    access: String(data.access),
    hours: toStringOrNull(data.hours),
    amenities: Array.isArray(data.amenities) ? data.amenities.map(String) : [],
    notes: toStringOrNull(data.notes),
    submittedByHash: toStringOrNull(data.submittedByHash),
    sourceIssue: issueNumber,
  };
}
