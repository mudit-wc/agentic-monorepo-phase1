import type { DiffRow } from './diff';
import { formatDate } from './diff';

export const AUDIT_PREFIX = '[Copilot agent][audit]';

export function auditMarker(rev: number): string {
  return `${AUDIT_PREFIX} rev ${rev}`;
}

export interface CommentInput {
  rev: number;
  headline: string;
  changedBy: string;
  changedAt?: string;
  rows: DiffRow[];
  summary: string;
}

export function headlineFor(
  rows: DiffRow[],
  created: boolean,
  workItemType?: string,
): string {
  if (created) return `${workItemType ?? 'Work item'} created`;
  const names = [
    ...new Set(rows.map((r) => r.field.replace(/ \((added|removed)\)$/, ''))),
  ];
  if (names.length <= 3) return `${names.join(' + ')} changed`;
  return `${names.slice(0, 3).join(', ')} +${names.length - 3} more changed`;
}

export function summaryFor(
  rows: DiffRow[],
  created: boolean,
  workItemType?: string,
): string {
  if (created)
    return `${workItemType ?? 'Work item'} created with ${rows.length} field(s) set.`;
  const parts = rows
    .slice(0, 4)
    .map((r) => `${r.field}: ${r.before} → ${r.after}`);
  const more = rows.length > 4 ? ` (+${rows.length - 4} more)` : '';
  return `${parts.join('; ')}${more}.`;
}

export function renderComment(input: CommentInput): string {
  const when = input.changedAt ? formatDate(input.changedAt) : '—';
  const table = [
    '| Field | Before | After |',
    '| --- | --- | --- |',
    ...input.rows.map((r) => `| ${r.field} | ${r.before} | ${r.after} |`),
  ].join('\n');

  return [
    `${auditMarker(input.rev)} — ${input.headline}`,
    '',
    `**Changed by:** ${input.changedBy} · **When:** ${when}`,
    '',
    table,
    '',
    `_Summary:_ ${input.summary}`,
    '',
    '_Posted automatically by the ado-audit-hook Azure Function._',
  ].join('\n');
}
