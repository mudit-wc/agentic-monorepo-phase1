import {
  DATE_FIELDS,
  friendlyFieldName,
  friendlyRelationName,
  IGNORED_FIELDS,
  LONG_TEXT_FIELDS,
} from './field-names';
import type {
  AdoFieldValue,
  AdoRelation,
  FieldChange,
  WorkItemUpdatedResource,
} from './types';

export interface DiffRow {
  field: string;
  before: string;
  after: string;
}

export interface RevisionDiff {
  rows: DiffRow[];
  /** True when nothing user-visible changed (only ignored system fields). */
  isEmpty: boolean;
}

const EMPTY = '—';

export function isIdentity(
  value: AdoFieldValue,
): value is { displayName?: string } {
  return typeof value === 'object' && value !== null;
}

export function formatValue(refName: string, value: AdoFieldValue): string {
  if (value === null || value === undefined || value === '') return EMPTY;
  if (isIdentity(value)) return value.displayName ?? value.uniqueName ?? EMPTY;
  if (typeof value === 'string') {
    // "Jane Doe <jane@contoso.com>" -> "Jane Doe"
    const identityMatch = /^(.+?)\s*<[^>]+>$/.exec(value);
    if (identityMatch) return identityMatch[1];
    if (DATE_FIELDS.has(refName) || /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return formatDate(value);
    }
    return escapeCell(value);
  }
  return String(value);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return escapeCell(iso);
  const date = d.toISOString().slice(0, 10);
  const time = d.toISOString().slice(11, 19);
  return time === '00:00:00' ? date : `${date} ${time} UTC`;
}

export function escapeCell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function wordCount(text: string | undefined | null): number {
  if (!text) return 0;
  const plain = stripHtml(String(text));
  return plain ? plain.split(' ').length : 0;
}

function summariseLongText(
  oldValue: AdoFieldValue,
  newValue: AdoFieldValue,
): DiffRow['before'][] {
  const before = wordCount(typeof oldValue === 'string' ? oldValue : undefined);
  const after = wordCount(typeof newValue === 'string' ? newValue : undefined);
  return [
    before ? `~${before} words` : EMPTY,
    after ? `~${after} words` : EMPTY,
  ];
}

function splitTags(value: AdoFieldValue): string[] {
  if (typeof value !== 'string' || !value.trim()) return [];
  return value
    .split(';')
    .map((t) => t.trim())
    .filter(Boolean);
}

function diffTags(oldValue: AdoFieldValue, newValue: AdoFieldValue): DiffRow[] {
  const before = new Set(splitTags(oldValue));
  const after = new Set(splitTags(newValue));
  const added = [...after].filter((t) => !before.has(t));
  const removed = [...before].filter((t) => !after.has(t));
  const rows: DiffRow[] = [];
  if (added.length)
    rows.push({
      field: 'Tags (added)',
      before: EMPTY,
      after: added.join('; '),
    });
  if (removed.length)
    rows.push({
      field: 'Tags (removed)',
      before: removed.join('; '),
      after: EMPTY,
    });
  return rows;
}

export function diffFields(
  fields: Record<string, FieldChange> | undefined,
): DiffRow[] {
  if (!fields) return [];
  const rows: DiffRow[] = [];
  for (const [refName, change] of Object.entries(fields)) {
    if (IGNORED_FIELDS.has(refName)) continue;
    const { oldValue, newValue } = change;
    if (isSame(oldValue, newValue)) continue;

    if (refName === 'System.Tags') {
      rows.push(...diffTags(oldValue, newValue));
      continue;
    }
    if (LONG_TEXT_FIELDS.has(refName)) {
      const [before, after] = summariseLongText(oldValue, newValue);
      rows.push({ field: friendlyFieldName(refName), before, after });
      continue;
    }
    rows.push({
      field: friendlyFieldName(refName),
      before: formatValue(refName, oldValue),
      after: formatValue(refName, newValue),
    });
  }
  return rows;
}

function isSame(a: AdoFieldValue, b: AdoFieldValue): boolean {
  const norm = (v: AdoFieldValue) =>
    isIdentity(v)
      ? (v.displayName ?? v.uniqueName ?? '')
      : v === undefined || v === null
        ? ''
        : String(v);
  return norm(a) === norm(b);
}

function describeRelation(rel: AdoRelation): string {
  const name = friendlyRelationName(rel.rel);
  const idMatch = /\/workItems\/(\d+)$/i.exec(rel.url);
  if (idMatch) return `${name} → #${idMatch[1]}`;
  const attrs = rel.attributes ?? {};
  const label = (attrs['name'] ?? attrs['comment']) as string | undefined;
  if (label) return `${name} → ${escapeCell(label)}`;
  // GitHub artifact links: vstfs:///GitHub/Commit/<repo>/<sha> etc.
  const artifact = /vstfs:\/\/\/GitHub\/(\w+)\//i.exec(rel.url);
  if (artifact) return `${name} → GitHub ${artifact[1]}`;
  return name;
}

export function diffRelations(
  relations: WorkItemUpdatedResource['relations'],
): DiffRow[] {
  if (!relations) return [];
  const rows: DiffRow[] = [];
  for (const r of relations.added ?? [])
    rows.push({
      field: 'Link added',
      before: EMPTY,
      after: describeRelation(r),
    });
  for (const r of relations.removed ?? [])
    rows.push({
      field: 'Link removed',
      before: describeRelation(r),
      after: EMPTY,
    });
  for (const r of relations.updated ?? [])
    rows.push({
      field: 'Link updated',
      before: describeRelation(r),
      after: describeRelation(r),
    });
  return rows;
}

export function diffUpdate(resource: WorkItemUpdatedResource): RevisionDiff {
  const rows = [
    ...diffFields(resource.fields),
    ...diffRelations(resource.relations),
  ];
  return { rows, isEmpty: rows.length === 0 };
}

/** For `workitem.created`: every non-empty, non-ignored field becomes a row. */
export function diffCreation(
  fields: Record<string, AdoFieldValue>,
): RevisionDiff {
  const rows: DiffRow[] = [];
  for (const [refName, value] of Object.entries(fields)) {
    if (
      IGNORED_FIELDS.has(refName) ||
      refName === 'System.TeamProject' ||
      refName === 'System.CreatedBy' ||
      refName === 'System.CreatedDate'
    )
      continue;
    if (value === null || value === undefined || value === '') continue;
    if (LONG_TEXT_FIELDS.has(refName)) {
      rows.push({
        field: friendlyFieldName(refName),
        before: EMPTY,
        after: `~${wordCount(String(value))} words`,
      });
      continue;
    }
    rows.push({
      field: friendlyFieldName(refName),
      before: EMPTY,
      after: formatValue(refName, value),
    });
  }
  return { rows, isEmpty: rows.length === 0 };
}
