import type { AdoClient } from './ado-client';
import { auditMarker, headlineFor, renderComment, summaryFor } from './comment';
import { diffCreation, diffUpdate, formatValue } from './diff';
import type {
  ServiceHookEvent,
  WorkItemCreatedResource,
  WorkItemUpdatedResource,
} from './types';

export type HandleOutcome =
  | { status: 'posted'; workItemId: number; rev: number; commentId: number }
  | { status: 'skipped'; workItemId?: number; rev?: number; reason: string };

export interface HandlerDeps {
  client: Pick<AdoClient, 'listComments' | 'addComment'>;
  log?: (message: string) => void;
}

interface Normalised {
  workItemId: number;
  rev: number;
  project: string;
  changedBy: string;
  changedAt?: string;
  workItemType?: string;
  created: boolean;
  resource: WorkItemUpdatedResource | WorkItemCreatedResource;
}

function normalise(event: ServiceHookEvent): Normalised | undefined {
  const projectId = event.resourceContainers?.project?.id;

  if (event.eventType === 'workitem.created') {
    const r = event.resource as WorkItemCreatedResource;
    const project = projectId ?? String(r.fields['System.TeamProject'] ?? '');
    return {
      workItemId: r.id,
      rev: r.rev,
      project,
      changedBy: formatValue('System.CreatedBy', r.fields['System.CreatedBy']),
      changedAt:
        typeof r.fields['System.CreatedDate'] === 'string'
          ? r.fields['System.CreatedDate']
          : undefined,
      workItemType: String(r.fields['System.WorkItemType'] ?? ''),
      created: true,
      resource: r,
    };
  }

  if (event.eventType === 'workitem.updated') {
    const r = event.resource as WorkItemUpdatedResource;
    const revFields = r.revision?.fields ?? {};
    const project = projectId ?? String(revFields['System.TeamProject'] ?? '');
    return {
      workItemId: r.workItemId,
      rev: r.rev,
      project,
      changedBy:
        r.revisedBy?.displayName ??
        formatValue('System.ChangedBy', revFields['System.ChangedBy']),
      changedAt:
        r.revisedDate ??
        (typeof revFields['System.ChangedDate'] === 'string'
          ? revFields['System.ChangedDate']
          : undefined),
      workItemType: String(revFields['System.WorkItemType'] ?? ''),
      created: false,
      resource: r,
    };
  }

  return undefined;
}

export async function handleEvent(
  event: ServiceHookEvent,
  deps: HandlerDeps,
): Promise<HandleOutcome> {
  const log = deps.log ?? (() => undefined);
  const n = normalise(event);
  if (!n)
    return {
      status: 'skipped',
      reason: `unsupported eventType '${event.eventType}'`,
    };
  if (!n.project)
    return {
      status: 'skipped',
      workItemId: n.workItemId,
      rev: n.rev,
      reason: 'project could not be determined',
    };

  const diff = n.created
    ? diffCreation((n.resource as WorkItemCreatedResource).fields)
    : diffUpdate(n.resource as WorkItemUpdatedResource);

  if (diff.isEmpty) {
    log(`#${n.workItemId} rev ${n.rev}: no user-visible changes, skipping`);
    return {
      status: 'skipped',
      workItemId: n.workItemId,
      rev: n.rev,
      reason: 'no user-visible field or link changes',
    };
  }

  const marker = auditMarker(n.rev);
  const existing = await deps.client.listComments(n.project, n.workItemId);
  if (existing.some((c) => c.text.includes(marker))) {
    log(
      `#${n.workItemId} rev ${n.rev}: audit comment already present, skipping`,
    );
    return {
      status: 'skipped',
      workItemId: n.workItemId,
      rev: n.rev,
      reason: 'audit comment already exists',
    };
  }

  const markdown = renderComment({
    rev: n.rev,
    headline: headlineFor(diff.rows, n.created, n.workItemType),
    changedBy: n.changedBy,
    changedAt: n.changedAt,
    rows: diff.rows,
    summary: summaryFor(diff.rows, n.created, n.workItemType),
  });

  const comment = await deps.client.addComment(
    n.project,
    n.workItemId,
    markdown,
  );
  log(`#${n.workItemId} rev ${n.rev}: posted audit comment ${comment.id}`);
  return {
    status: 'posted',
    workItemId: n.workItemId,
    rev: n.rev,
    commentId: comment.id,
  };
}
