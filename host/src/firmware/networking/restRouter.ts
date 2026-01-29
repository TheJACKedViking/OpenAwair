import type { RestEndpoint } from './rest';

export interface RestRequest {
  readonly method: RestEndpoint['method'];
  readonly path: string;
}

export interface RestResponse {
  readonly status: number;
  readonly body: string;
}

export class RestRouter {
  private readonly endpoints = new Map<string, RestEndpoint>();

  public register(endpoint: RestEndpoint): void {
    const key = `${endpoint.method}:${endpoint.path}`;
    this.endpoints.set(key, endpoint);
  }

  public async handle(request: RestRequest): Promise<RestResponse> {
    const key = `${request.method}:${request.path}`;
    const endpoint = this.endpoints.get(key);
    if (!endpoint) {
      return { status: 404, body: JSON.stringify({ error: 'Not found' }) };
    }

    const body = await endpoint.handle();
    return { status: 200, body };
  }
}
