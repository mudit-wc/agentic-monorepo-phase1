/** Shapes of the Azure DevOps Service Hook payloads this function consumes. */

export interface AdoIdentity {
  displayName?: string;
  uniqueName?: string;
  id?: string;
}

/** Identity fields arrive as objects or as "Display Name <email>" strings. */
export type AdoFieldValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | AdoIdentity;

export interface FieldChange {
  oldValue?: AdoFieldValue;
  newValue?: AdoFieldValue;
}

export interface AdoRelation {
  rel: string;
  url: string;
  attributes?: Record<string, unknown>;
}

export interface WorkItemRevision {
  id: number;
  rev: number;
  fields: Record<string, AdoFieldValue>;
  url?: string;
}

/** `workitem.updated` resource — a WorkItemUpdate. */
export interface WorkItemUpdatedResource {
  id: number;
  workItemId: number;
  rev: number;
  revisedBy?: AdoIdentity;
  revisedDate?: string;
  fields?: Record<string, FieldChange>;
  relations?: {
    added?: AdoRelation[];
    removed?: AdoRelation[];
    updated?: AdoRelation[];
  };
  revision?: WorkItemRevision;
  url?: string;
}

/** `workitem.created` resource — the WorkItem itself. */
export type WorkItemCreatedResource = WorkItemRevision;

export interface ServiceHookEvent<TResource = unknown> {
  id: string;
  eventType: string;
  publisherId: string;
  resource: TResource;
  resourceContainers?: {
    project?: { id: string; baseUrl?: string };
    account?: { id: string; baseUrl?: string };
    collection?: { id: string; baseUrl?: string };
  };
  createdDate?: string;
}

export type WorkItemUpdatedEvent = ServiceHookEvent<WorkItemUpdatedResource>;
export type WorkItemCreatedEvent = ServiceHookEvent<WorkItemCreatedResource>;
