export interface AdoComment {
  id: number;
  text: string;
}

export interface AdoClientOptions {
  orgUrl: string;
  pat: string;
  fetchImpl?: typeof fetch;
}

const API_VERSION = '7.1-preview.4';

/** Minimal Azure DevOps Work Item Comments client (PAT, Basic auth). */
export class AdoClient {
  private readonly orgUrl: string;
  private readonly authHeader: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: AdoClientOptions) {
    this.orgUrl = options.orgUrl.replace(/\/+$/, '');
    this.authHeader = `Basic ${Buffer.from(`:${options.pat}`).toString('base64')}`;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async listComments(
    project: string,
    workItemId: number,
  ): Promise<AdoComment[]> {
    const all: AdoComment[] = [];
    let url: string | undefined =
      `${this.commentsUrl(project, workItemId)}?$top=200&api-version=${API_VERSION}`;
    while (url) {
      const res = await this.fetchImpl(url, {
        headers: { Authorization: this.authHeader },
      });
      if (!res.ok)
        throw new Error(
          `listComments failed: ${res.status} ${await res.text()}`,
        );
      const body = (await res.json()) as {
        comments?: AdoComment[];
        nextPage?: string;
      };
      all.push(...(body.comments ?? []));
      url = body.nextPage;
    }
    return all;
  }

  async addComment(
    project: string,
    workItemId: number,
    markdown: string,
  ): Promise<AdoComment> {
    const url = `${this.commentsUrl(project, workItemId)}?format=markdown&api-version=${API_VERSION}`;
    const res = await this.fetchImpl(url, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: markdown }),
    });
    if (!res.ok)
      throw new Error(`addComment failed: ${res.status} ${await res.text()}`);
    return (await res.json()) as AdoComment;
  }

  private commentsUrl(project: string, workItemId: number): string {
    return `${this.orgUrl}/${encodeURIComponent(project)}/_apis/wit/workItems/${workItemId}/comments`;
  }
}
