import { handleEvent } from './handle-event';
import type { ServiceHookEvent, WorkItemUpdatedEvent } from './types';

function updatedEvent(
  overrides: Partial<WorkItemUpdatedEvent['resource']> = {},
): WorkItemUpdatedEvent {
  return {
    id: 'evt-1',
    eventType: 'workitem.updated',
    publisherId: 'tfs',
    resourceContainers: { project: { id: 'proj-guid' } },
    resource: {
      id: 2,
      workItemId: 1,
      rev: 2,
      revisedBy: { displayName: 'mudit bajpai' },
      revisedDate: '2026-09-16T04:28:00Z',
      fields: {
        'System.Rev': { oldValue: '1', newValue: '2' },
        'System.State': { oldValue: 'To Do', newValue: 'Doing' },
      },
      revision: {
        id: 1,
        rev: 2,
        fields: {
          'System.WorkItemType': 'Epic',
          'System.TeamProject': 'agentic-workflow',
        },
      },
      ...overrides,
    },
  };
}

function fakeClient(existing: string[] = []) {
  return {
    listComments: jest
      .fn()
      .mockResolvedValue(existing.map((text, i) => ({ id: i + 1, text }))),
    addComment: jest.fn().mockResolvedValue({ id: 99, text: '' }),
  };
}

describe('handleEvent', () => {
  it('posts an audit comment for a user-visible update', async () => {
    const client = fakeClient();
    const outcome = await handleEvent(updatedEvent(), { client });

    expect(outcome).toEqual({
      status: 'posted',
      workItemId: 1,
      rev: 2,
      commentId: 99,
    });
    expect(client.addComment).toHaveBeenCalledWith(
      'proj-guid',
      1,
      expect.stringContaining('[Copilot agent][audit] rev 2 — State changed'),
    );
    const markdown = client.addComment.mock.calls[0][2] as string;
    expect(markdown).toContain('| State | To Do | Doing |');
    expect(markdown).toContain('**Changed by:** mudit bajpai');
  });

  it('skips when the revision already has an audit comment', async () => {
    const client = fakeClient(['[Copilot agent][audit] rev 2 — earlier']);
    const outcome = await handleEvent(updatedEvent(), { client });

    expect(outcome).toMatchObject({
      status: 'skipped',
      reason: 'audit comment already exists',
    });
    expect(client.addComment).not.toHaveBeenCalled();
  });

  it('skips revisions with only system field changes (prevents loops)', async () => {
    const client = fakeClient();
    const outcome = await handleEvent(
      updatedEvent({
        fields: {
          'System.Rev': { oldValue: '1', newValue: '2' },
          'System.CommentCount': { oldValue: 0, newValue: 1 },
        },
      }),
      { client },
    );

    expect(outcome).toMatchObject({
      status: 'skipped',
      reason: 'no user-visible field or link changes',
    });
    expect(client.listComments).not.toHaveBeenCalled();
  });

  it('handles workitem.created as a creation audit', async () => {
    const client = fakeClient();
    const event: ServiceHookEvent = {
      id: 'evt-2',
      eventType: 'workitem.created',
      publisherId: 'tfs',
      resourceContainers: { project: { id: 'proj-guid' } },
      resource: {
        id: 5,
        rev: 1,
        fields: {
          'System.WorkItemType': 'Task',
          'System.Title': 'Do thing',
          'System.CreatedBy': { displayName: 'mudit bajpai' },
          'System.CreatedDate': '2026-09-16T05:00:00Z',
        },
      },
    };
    const outcome = await handleEvent(event, { client });

    expect(outcome).toEqual({
      status: 'posted',
      workItemId: 5,
      rev: 1,
      commentId: 99,
    });
    const markdown = client.addComment.mock.calls[0][2] as string;
    expect(markdown).toContain('[Copilot agent][audit] rev 1 — Task created');
    expect(markdown).toContain('| Title | — | Do thing |');
  });

  it('ignores unsupported event types', async () => {
    const client = fakeClient();
    const outcome = await handleEvent(
      {
        id: 'x',
        eventType: 'build.complete',
        publisherId: 'tfs',
        resource: {},
      },
      { client },
    );

    expect(outcome).toMatchObject({ status: 'skipped' });
    expect(client.addComment).not.toHaveBeenCalled();
  });
});
