import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const assets = new Map([
  ['/', ['web/index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['web/app.js', 'text/javascript; charset=utf-8']],
  ['/styles.css', ['web/styles.css', 'text/css; charset=utf-8']],
  ...['evidence', 'firmware', 'capture', 'ble'].map(name => [`/build/${name}.js`, [`build/${name}.js`, 'text/javascript; charset=utf-8']])
]);

/** A static loopback workbench, not a LAN proxy, update server or firmware receiver. */
export async function startServer(port = 8765) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid port.');
  const server = createServer(async (req, res) => {
    res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Permissions-Policy', 'bluetooth=(self)');
    const actualPort = server.address().port;
    const allowedHosts = [`127.0.0.1:${actualPort}`, `localhost:${actualPort}`];
    if (!allowedHosts.includes(req.headers.host) ||
        (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) ||
        req.headers['sec-fetch-site'] === 'cross-site') {
      res.writeHead(403); res.end('Local same-origin requests only.'); return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD'); res.writeHead(405); res.end('No write API.'); return;
    }
    const asset = assets.get(req.url);
    if (!asset) { res.writeHead(404); res.end('Not found.'); return; }
    try {
      const body = await readFile(new URL(asset[0], import.meta.url));
      res.setHeader('Content-Type', asset[1]);
      res.setHeader('Content-Length', body.length);
      res.writeHead(200); res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      res.writeHead(500); res.end('Workbench asset unavailable. Run the migration build.');
    }
  });
  server.requestTimeout = 10000;
  server.headersTimeout = 5000;
  server.keepAliveTimeout = 1000;
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return server;
}
