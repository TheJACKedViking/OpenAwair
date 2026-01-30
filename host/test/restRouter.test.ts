import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RestRouter } from '../src/firmware/networking/restRouter';

const createEndpoint = () => ({
  path: '/api/v1/health',
  method: 'GET' as const,
  async handle() {
    return JSON.stringify({ ok: true });
  }
});

describe('RestRouter', () => {
  it('routes registered endpoints', async () => {
    const router = new RestRouter();
    router.register(createEndpoint());

    const response = await router.handle({ method: 'GET', path: '/api/v1/health' });
    assert.strictEqual(response.status, 200);
    assert.ok(response.body.includes('ok'));
  });

  it('returns 404 for unknown endpoints', async () => {
    const router = new RestRouter();
    const response = await router.handle({ method: 'GET', path: '/api/v1/missing' });
    assert.strictEqual(response.status, 404);
  });
});
