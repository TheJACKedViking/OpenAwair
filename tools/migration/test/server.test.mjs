import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';

function get(port, path = '/', headers = {}, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path, method, headers }, res => {
      let body = '';
      res.setEncoding('utf8'); res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject); req.end();
  });
}

test('workbench is loopback-only and serves an explicit asset list', async t => {
  const { startServer } = await import('../server.mjs');
  const server = await startServer(0);
  t.after(() => new Promise(resolve => server.close(resolve)));
  assert.equal(server.address().address, '127.0.0.1');
  const port = server.address().port;
  const page = await get(port);
  assert.equal(page.status, 200);
  assert.match(page.body, /not a flasher/i);
  assert.match(page.headers['content-security-policy'], /connect-src 'none'/);
  assert.equal(page.headers['x-content-type-options'], 'nosniff');
  assert.equal(page.headers['cross-origin-resource-policy'], 'same-origin');
  assert.equal((await get(port, '/app.js')).status, 200);
  assert.equal((await get(port, '/build/ble.js')).status, 200);
  for (const path of ['/../../package.json', '/%2e%2e/package.json', '/.git/config', '/api/flash', '/build/evidence.d.ts']) {
    assert.equal((await get(port, path)).status, 404, path);
  }
  assert.equal((await get(port, '/', {}, 'POST')).status, 405);
  assert.equal((await get(port, '/', { host: 'attacker.example' })).status, 403);
  assert.equal((await get(port, '/', { origin: 'https://attacker.example' })).status, 403);
  assert.equal((await get(port, '/', { 'sec-fetch-site': 'cross-site' })).status, 403);
  assert.equal((await get(port, '/', {}, 'HEAD')).body, '');
});
