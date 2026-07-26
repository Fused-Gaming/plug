/**
 * Unit tests for issue #42's App-submission parser (parse-submission-issue.mjs).
 */

import { parseSubmissionIssue } from '../parse-submission-issue.mjs';

function bodyWithJson(obj, { includeSummary = true } = {}) {
  const summary = includeSummary ? '## Oakland Main Library\n\nSubmitted via the web form.\n\n' : '';
  return `${summary}### Structured submission data\n\n\`\`\`json\n${JSON.stringify(obj, null, 2)}\n\`\`\`\n`;
}

const VALID_PAYLOAD = {
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
  amenities: ['Outlets', 'Wi-Fi', 'Restrooms'],
  notes: 'Outlets along the wall by the reading tables.',
  submittedByHash: 'a'.repeat(64),
};

describe('parseSubmissionIssue', () => {
  it('parses a well-formed structured-data block', () => {
    const result = parseSubmissionIssue(bodyWithJson(VALID_PAYLOAD), 101);
    expect(result).toEqual({
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
      amenities: ['Outlets', 'Wi-Fi', 'Restrooms'],
      notes: 'Outlets along the wall by the reading tables.',
      submittedByHash: 'a'.repeat(64),
      sourceIssue: 101,
    });
  });

  it('ignores a human-readable summary before the JSON block', () => {
    const result = parseSubmissionIssue(bodyWithJson(VALID_PAYLOAD, { includeSummary: true }), 101);
    expect(result.name).toBe('Oakland Main Library');
  });

  it('defaults optional fields to null/empty when absent', () => {
    const minimal = {
      submissionId: 'sub_min',
      name: 'Corner Cafe',
      category: 'cafe',
      access: 'customer',
    };
    const result = parseSubmissionIssue(bodyWithJson(minimal), 5);
    expect(result.address).toBeNull();
    expect(result.area).toBeNull();
    expect(result.lat).toBeNull();
    expect(result.lon).toBeNull();
    expect(result.indoor).toBeNull();
    expect(result.hours).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.submittedByHash).toBeNull();
    expect(result.amenities).toEqual([]);
  });

  it('surfaces a present-but-non-numeric lat/lon as NaN for the validator to catch', () => {
    const result = parseSubmissionIssue(bodyWithJson({ ...VALID_PAYLOAD, lat: 'not-a-number' }), 101);
    expect(Number.isNaN(result.lat)).toBe(true);
  });

  it('throws when there is no ```json block', () => {
    expect(() => parseSubmissionIssue('Just some prose, no structured data.', 101)).toThrow(/structured-data block/);
  });

  it('throws on invalid JSON inside the block', () => {
    const body = '### Structured submission data\n\n```json\n{ not: valid }\n```\n';
    expect(() => parseSubmissionIssue(body, 101)).toThrow(/not valid JSON/);
  });

  it('throws when the JSON block is an array, not an object', () => {
    const body = '### Structured submission data\n\n```json\n[1, 2, 3]\n```\n';
    expect(() => parseSubmissionIssue(body, 101)).toThrow(/must be a JSON object/);
  });

  it('throws listing every missing required field', () => {
    const body = bodyWithJson({ submissionId: 'sub_1' });
    expect(() => parseSubmissionIssue(body, 101)).toThrow(/name, category, access/);
  });

  it('throws when issueNumber is not an integer', () => {
    expect(() => parseSubmissionIssue(bodyWithJson(VALID_PAYLOAD), 1.5)).toThrow(/issueNumber must be an integer/);
    expect(() => parseSubmissionIssue(bodyWithJson(VALID_PAYLOAD), '101')).toThrow(/issueNumber must be an integer/);
  });

  it('handles a missing/undefined body without crashing', () => {
    expect(() => parseSubmissionIssue(undefined, 101)).toThrow(/structured-data block/);
    expect(() => parseSubmissionIssue(null, 101)).toThrow(/structured-data block/);
  });
});
