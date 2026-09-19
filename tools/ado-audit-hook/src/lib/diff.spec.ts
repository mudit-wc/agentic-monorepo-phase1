import { diffCreation, diffUpdate, formatValue, wordCount } from './diff';
import type { WorkItemUpdatedResource } from './types';

describe('diffUpdate', () => {
  it('ignores system-maintained fields and reports empty', () => {
    const result = diffUpdate({
      id: 1,
      workItemId: 1,
      rev: 3,
      fields: {
        'System.Rev': { oldValue: '2', newValue: '3' },
        'System.ChangedDate': {
          oldValue: '2026-09-16T04:00:00Z',
          newValue: '2026-09-16T05:00:00Z',
        },
        'System.CommentCount': { oldValue: 1, newValue: 2 },
      },
    });
    expect(result.isEmpty).toBe(true);
    expect(result.rows).toEqual([]);
  });

  it('reports state, priority and date changes with friendly names', () => {
    const { rows } = diffUpdate({
      id: 1,
      workItemId: 1,
      rev: 2,
      fields: {
        'System.State': { oldValue: 'To Do', newValue: 'Doing' },
        'Microsoft.VSTS.Common.Priority': { oldValue: 2, newValue: 1 },
        'Microsoft.VSTS.Scheduling.TargetDate': {
          oldValue: '2026-09-30T00:00:00Z',
          newValue: '2026-10-07T00:00:00Z',
        },
      },
    });
    expect(rows).toEqual([
      { field: 'State', before: 'To Do', after: 'Doing' },
      { field: 'Priority', before: '2', after: '1' },
      { field: 'Target Date', before: '2026-09-30', after: '2026-10-07' },
    ]);
  });

  it('splits tag additions and removals', () => {
    const { rows } = diffUpdate({
      id: 1,
      workItemId: 1,
      rev: 2,
      fields: {
        'System.Tags': {
          oldValue: 'mcp; phase-1',
          newValue: 'phase-1; urgent',
        },
      },
    });
    expect(rows).toEqual([
      { field: 'Tags (added)', before: '—', after: 'urgent' },
      { field: 'Tags (removed)', before: 'mcp', after: '—' },
    ]);
  });

  it('summarises long text fields by word count instead of quoting them', () => {
    const { rows } = diffUpdate({
      id: 1,
      workItemId: 1,
      rev: 2,
      fields: {
        'System.Description': {
          oldValue: '<p>one two three</p>',
          newValue: '<h2>Goal</h2><p>one two three four five six</p>',
        },
      },
    });
    expect(rows).toEqual([
      { field: 'Description', before: '~3 words', after: '~7 words' },
    ]);
  });

  it('shows identity display names for both object and string forms', () => {
    const { rows } = diffUpdate({
      id: 1,
      workItemId: 1,
      rev: 2,
      fields: {
        'System.AssignedTo': {
          oldValue: 'Jane Doe <jane@contoso.com>',
          newValue: { displayName: 'mudit bajpai', uniqueName: 'm@x.com' },
        },
      },
    });
    expect(rows).toEqual([
      { field: 'Assigned To', before: 'Jane Doe', after: 'mudit bajpai' },
    ]);
  });

  it('describes added and removed links', () => {
    const resource: WorkItemUpdatedResource = {
      id: 1,
      workItemId: 1,
      rev: 2,
      relations: {
        added: [
          {
            rel: 'System.LinkTypes.Hierarchy-Forward',
            url: 'https://dev.azure.com/o/_apis/wit/workItems/7',
          },
          {
            rel: 'ArtifactLink',
            url: 'vstfs:///GitHub/PullRequest/abc%2f12',
            attributes: { name: 'GitHub Pull Request' },
          },
        ],
        removed: [
          {
            rel: 'AttachedFile',
            url: 'https://dev.azure.com/o/_apis/wit/attachments/x',
            attributes: { name: 'spec.pdf' },
          },
        ],
      },
    };
    const { rows } = diffUpdate(resource);
    expect(rows).toEqual([
      { field: 'Link added', before: '—', after: 'Child → #7' },
      {
        field: 'Link added',
        before: '—',
        after: 'Artifact link → GitHub Pull Request',
      },
      { field: 'Link removed', before: 'Attachment → spec.pdf', after: '—' },
    ]);
  });

  it('escapes pipe characters so the markdown table is not broken', () => {
    const { rows } = diffUpdate({
      id: 1,
      workItemId: 1,
      rev: 2,
      fields: { 'System.Title': { oldValue: 'A | B', newValue: 'C' } },
    });
    expect(rows[0].before).toBe('A \\| B');
  });
});

describe('diffCreation', () => {
  it('lists initial non-empty fields, skipping system and project fields', () => {
    const { rows } = diffCreation({
      'System.WorkItemType': 'Epic',
      'System.Title': 'Agentic Workflow Phase 1',
      'System.State': 'To Do',
      'System.TeamProject': 'agentic-workflow',
      'System.CreatedBy': { displayName: 'mudit bajpai' },
      'System.Rev': 1,
      'System.Description': '<p>one two</p>',
      'Microsoft.VSTS.Scheduling.StoryPoints': null,
    });
    expect(rows).toEqual([
      { field: 'Work Item Type', before: '—', after: 'Epic' },
      { field: 'Title', before: '—', after: 'Agentic Workflow Phase 1' },
      { field: 'State', before: '—', after: 'To Do' },
      { field: 'Description', before: '—', after: '~2 words' },
    ]);
  });
});

describe('helpers', () => {
  it('formatValue renders timestamps with time when not midnight', () => {
    expect(formatValue('Custom.When', '2026-09-16T04:28:00.85Z')).toBe(
      '2026-09-16 04:28:00 UTC',
    );
  });

  it('wordCount handles empty and html input', () => {
    expect(wordCount(undefined)).toBe(0);
    expect(wordCount('<ul><li>a</li><li>b &amp; c</li></ul>')).toBe(4);
  });
});
