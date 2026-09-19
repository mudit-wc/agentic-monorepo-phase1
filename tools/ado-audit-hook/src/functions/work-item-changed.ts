import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions';
import { AdoClient } from '../lib/ado-client';
import { isAuthorised } from '../lib/auth';
import { handleEvent } from '../lib/handle-event';
import type { ServiceHookEvent } from '../lib/types';

export async function workItemChanged(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  if (
    !isAuthorised(
      request.headers.get('authorization'),
      process.env['WEBHOOK_SECRET'],
    )
  ) {
    context.warn('Rejected request: invalid or missing webhook secret');
    return { status: 401, jsonBody: { error: 'unauthorised' } };
  }

  const orgUrl = process.env['ADO_ORG_URL'];
  const pat = process.env['ADO_PAT'];
  if (!orgUrl || !pat) {
    context.error('ADO_ORG_URL / ADO_PAT app settings are not configured');
    return { status: 500, jsonBody: { error: 'server not configured' } };
  }

  let event: ServiceHookEvent;
  try {
    event = (await request.json()) as ServiceHookEvent;
  } catch {
    return { status: 400, jsonBody: { error: 'body is not JSON' } };
  }
  if (!event?.eventType || !event.resource) {
    return { status: 400, jsonBody: { error: 'not a service hook payload' } };
  }

  try {
    const outcome = await handleEvent(event, {
      client: new AdoClient({ orgUrl, pat }),
      log: (m) => context.log(m),
    });
    return {
      status: outcome.status === 'posted' ? 200 : 202,
      jsonBody: outcome,
    };
  } catch (err) {
    context.error('Failed to process work item event', err);
    // 500 makes ADO retry the delivery
    return { status: 500, jsonBody: { error: (err as Error).message } };
  }
}

app.http('work-item-changed', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'ado/work-item-changed',
  handler: workItemChanged,
});
