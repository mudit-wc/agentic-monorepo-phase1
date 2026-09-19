/** System-maintained fields that change on every save and carry no user intent. */
export const IGNORED_FIELDS: ReadonlySet<string> = new Set([
  'System.Rev',
  'System.ChangedDate',
  'System.ChangedBy',
  'System.AuthorizedDate',
  'System.AuthorizedAs',
  'System.RevisedDate',
  'System.Watermark',
  'System.PersonId',
  'System.CommentCount',
  'System.History',
  'System.IterationId',
  'System.AreaId',
  'System.IterationLevel1',
  'System.IterationLevel2',
  'System.IterationLevel3',
  'System.AreaLevel1',
  'System.AreaLevel2',
  'System.AreaLevel3',
  'System.NodeName',
  'System.BoardColumnDone',
  'Microsoft.VSTS.Common.StateChangeDate',
  'Microsoft.VSTS.Common.ActivatedDate',
  'Microsoft.VSTS.Common.ActivatedBy',
  'Microsoft.VSTS.Common.ResolvedDate',
  'Microsoft.VSTS.Common.ResolvedBy',
  'Microsoft.VSTS.Common.ClosedDate',
  'Microsoft.VSTS.Common.ClosedBy',
]);

/** Fields whose values are long rich text; summarised rather than quoted. */
export const LONG_TEXT_FIELDS: ReadonlySet<string> = new Set([
  'System.Description',
  'Microsoft.VSTS.Common.AcceptanceCriteria',
  'Microsoft.TCM.ReproSteps',
  'Microsoft.TCM.SystemInfo',
  'Microsoft.VSTS.CMMI.Analysis',
  'Microsoft.VSTS.TCM.Steps',
]);

export const DATE_FIELDS: ReadonlySet<string> = new Set([
  'Microsoft.VSTS.Scheduling.StartDate',
  'Microsoft.VSTS.Scheduling.TargetDate',
  'Microsoft.VSTS.Scheduling.FinishDate',
  'Microsoft.VSTS.Scheduling.DueDate',
  'System.CreatedDate',
]);

const FRIENDLY_NAMES: Readonly<Record<string, string>> = {
  'System.Title': 'Title',
  'System.State': 'State',
  'System.Reason': 'Reason',
  'System.AssignedTo': 'Assigned To',
  'System.Tags': 'Tags',
  'System.AreaPath': 'Area Path',
  'System.IterationPath': 'Iteration Path',
  'System.Description': 'Description',
  'System.WorkItemType': 'Work Item Type',
  'System.Parent': 'Parent',
  'System.BoardColumn': 'Board Column',
  'System.BoardLane': 'Board Lane',
  'System.CreatedBy': 'Created By',
  'System.CreatedDate': 'Created Date',
  'System.TeamProject': 'Team Project',
  'Microsoft.VSTS.Common.Priority': 'Priority',
  'Microsoft.VSTS.Common.Severity': 'Severity',
  'Microsoft.VSTS.Common.ValueArea': 'Value Area',
  'Microsoft.VSTS.Common.Risk': 'Risk',
  'Microsoft.VSTS.Common.BusinessValue': 'Business Value',
  'Microsoft.VSTS.Common.TimeCriticality': 'Time Criticality',
  'Microsoft.VSTS.Common.AcceptanceCriteria': 'Acceptance Criteria',
  'Microsoft.VSTS.Common.ResolvedReason': 'Resolved Reason',
  'Microsoft.VSTS.Common.Activity': 'Activity',
  'Microsoft.VSTS.Scheduling.StoryPoints': 'Story Points',
  'Microsoft.VSTS.Scheduling.Effort': 'Effort',
  'Microsoft.VSTS.Scheduling.Size': 'Size',
  'Microsoft.VSTS.Scheduling.RemainingWork': 'Remaining Work',
  'Microsoft.VSTS.Scheduling.OriginalEstimate': 'Original Estimate',
  'Microsoft.VSTS.Scheduling.CompletedWork': 'Completed Work',
  'Microsoft.VSTS.Scheduling.StartDate': 'Start Date',
  'Microsoft.VSTS.Scheduling.TargetDate': 'Target Date',
  'Microsoft.VSTS.Scheduling.FinishDate': 'Finish Date',
  'Microsoft.VSTS.Scheduling.DueDate': 'Due Date',
  'Microsoft.TCM.ReproSteps': 'Repro Steps',
  'Microsoft.TCM.SystemInfo': 'System Info',
  'Microsoft.VSTS.Build.FoundIn': 'Found In',
  'Microsoft.VSTS.Build.IntegrationBuild': 'Integration Build',
};

export function friendlyFieldName(refName: string): string {
  const known = FRIENDLY_NAMES[refName];
  if (known) return known;
  // Custom.MyField -> "My Field"
  const leaf = refName.split('.').pop() ?? refName;
  return leaf.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

const RELATION_NAMES: Readonly<Record<string, string>> = {
  'System.LinkTypes.Hierarchy-Forward': 'Child',
  'System.LinkTypes.Hierarchy-Reverse': 'Parent',
  'System.LinkTypes.Related': 'Related',
  'System.LinkTypes.Dependency-Forward': 'Successor',
  'System.LinkTypes.Dependency-Reverse': 'Predecessor',
  'System.LinkTypes.Duplicate-Forward': 'Duplicate',
  'System.LinkTypes.Duplicate-Reverse': 'Duplicate Of',
  'Microsoft.VSTS.Common.TestedBy-Forward': 'Tested By',
  'Microsoft.VSTS.Common.TestedBy-Reverse': 'Tests',
  AttachedFile: 'Attachment',
  ArtifactLink: 'Artifact link',
  Hyperlink: 'Hyperlink',
};

export function friendlyRelationName(rel: string): string {
  return RELATION_NAMES[rel] ?? rel;
}
