import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const load = name => import(`../build/${name}.js`);
const encode = value => new TextEncoder().encode(value);
const packet = layers => ({ _source: { layers } });
const ip = (src = '192.168.1.50', dst = '8.8.8.8') => ({ 'ip.src': src, 'ip.dst': dst });

function assertUnverified(result) {
  assert.equal(result.stockMigration, 'unverified');
  assert.equal(result.modelSource, 'user-supplied');
  assert.equal(result.deviceWriteOperations, 0);
  assert.deepEqual(result.verification, {
    stockImageAcceptance: 'unknown', serverIdentityValidation: 'unknown', bootVerification: 'unknown'
  });
}

test('models are explicit, separate and all remain unverified', async () => {
  const { parseModel, compatibility } = await load('evidence');
  for (const model of ['glow-c', 'element', 'v1', 'glow']) {
    assert.equal(parseModel(model), model);
    assertUnverified(compatibility(model));
  }
  for (const value of ['', undefined, 'esp32', 'Glow C', {}, '__proto__']) {
    assert.throws(() => parseModel(value), /model/i);
  }
});

test('firmware hashing and markers do not establish authenticity or compatibility', async () => {
  const { analyzeFirmware } = await load('firmware');
  const bytes = encode('WICED\0https://ota.awair.is/fw?token=secret\0-----BEGIN CERTIFICATE-----\0ECDSA\0UPGR\0');
  const before = bytes.slice();
  const result = await analyzeFirmware(bytes, 'glow-c');
  assertUnverified(result);
  assert.equal(result.observations.sha256, createHash('sha256').update(bytes).digest('hex'));
  assert.equal(result.observations.size, bytes.length);
  assert.ok(result.observations.markers.some(m => m.name === 'ota.awair.is' && m.offsets[0] === 14));
  assert.ok(result.observations.markers.some(m => m.name === 'certificate-pem'));
  assert.equal(JSON.stringify(result).includes('secret'), false);
  assert.equal(JSON.stringify(result).includes('/fw?'), false);
  assert.deepEqual(bytes, before);
});

test('firmware rejects empty, oversized and non-byte input', async () => {
  const { analyzeFirmware, MAX_FIRMWARE_BYTES } = await load('firmware');
  await assert.rejects(() => analyzeFirmware(new Uint8Array(), 'v1'), /empty/i);
  await assert.rejects(() => analyzeFirmware(new Uint8Array(MAX_FIRMWARE_BYTES + 1), 'v1'), /limit/i);
  await assert.rejects(() => analyzeFirmware('binary', 'v1'), /byte/i);
});

test('vector candidates are only hints, support byte-offset views and require Thumb/alignment', async () => {
  const { analyzeFirmware } = await load('firmware');
  const backing = new Uint8Array(80);
  const bytes = backing.subarray(8, 72);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  view.setUint32(0, 0x20020000, true);
  view.setUint32(4, 0x0800c101, true);
  view.setUint32(16, 0x20020001, true); // unaligned stack
  view.setUint32(20, 0x0800c101, true);
  view.setUint32(32, 0x20020000, true);
  view.setUint32(36, 0x0800c100, true); // no Thumb bit
  const result = await analyzeFirmware(bytes, 'v1');
  assertUnverified(result);
  assert.deepEqual(result.observations.candidateVectors.map(v => v.offset), [0]);
  assert.equal(result.observations.layoutVerified, false);
});

test('many firmware markers are counted but exported offsets are bounded', async () => {
  const { analyzeFirmware } = await load('firmware');
  const result = await analyzeFirmware(encode('WICED\0'.repeat(100)), 'element');
  const marker = result.observations.markers.find(m => m.name === 'WICED');
  assert.equal(marker.matches, 100);
  assert.equal(marker.offsets.length, 16);
  assertUnverified(result);
});

test('absence of firmware markers is not evidence of an unsigned image', async () => {
  const { analyzeFirmware } = await load('firmware');
  const result = await analyzeFirmware(new Uint8Array([1, 2, 3]), 'glow-c');
  assert.deepEqual(result.observations.markers, []);
  assertUnverified(result);
});

test('capture scopes target packets and minimizes DNS/TLS/HTTP data', async () => {
  const { summarizeCapture } = await load('capture');
  const input = [
    packet({ ip: ip(), dns: { 'dns.flags.response': '0', queries: { a: { 'dns.qry.name': 'OTA.AWAIR.IS.' } } } }),
    packet({ ip: ip(), tls: { 'tls.record': { 'tls.handshake': { 'tls.handshake.extensions_server_name': 'ota.awair.is' } } } }),
    packet({ ip: ip(), http: { 'http.host': 'ota.awair.is:80', 'http.request.uri': '/x?token=private', 'http.authorization': 'Bearer secret' } }),
    packet({ ip: ip('8.8.8.8', '192.168.1.50'), tls: { 'tls.alert_message.desc': '42' } }),
    packet({ ip: ip('192.168.1.99'), dns: { 'dns.flags.response': '0', 'dns.qry.name': 'other-person.example' } }),
    packet({ ip: ip(), dns: { 'dns.flags.response': '0', 'dns.qry.name': 'private-device.example' } })
  ];
  const result = summarizeCapture(input, '192.168.1.50', 'glow-c');
  assertUnverified(result);
  assert.equal(result.observations.targetPackets, 5);
  assert.equal(result.observations.tlsPackets, 2);
  assert.equal(result.observations.plaintextHttpPackets, 1);
  assert.deepEqual(result.observations.tlsAlertCodes, ['42']);
  assert.deepEqual(result.observations.knownHosts, [{ hostname: 'ota.awair.is', via: ['dns', 'http-host', 'tls-sni'] }]);
  assert.equal(result.observations.omittedHostnameCount, 1);
  for (const secret of ['192.168.1.50', '192.168.1.99', 'other-person', 'private-device', 'Bearer', 'token=', 'secret']) {
    assert.equal(JSON.stringify(result).includes(secret), false, secret);
  }
});

test('DNS replies do not masquerade as queries and server SNI is not counted outbound', async () => {
  const { summarizeCapture } = await load('capture');
  const result = summarizeCapture([
    packet({ ip: ip('8.8.8.8', '192.168.1.50'), dns: { 'dns.flags.response': '1', 'dns.qry.name': 'ota.awair.is' } }),
    packet({ ip: ip('8.8.8.8', '192.168.1.50'), tls: { 'tls.handshake.extensions_server_name': 'ota.awair.is' } })
  ], '192.168.1.50', 'glow-c');
  assert.equal(result.observations.dnsQueries, 0);
  assert.deepEqual(result.observations.knownHosts, []);
});

test('capture canonicalizes IPv6 and accepts repeated TLS records', async () => {
  const { summarizeCapture } = await load('capture');
  const result = summarizeCapture([packet({
    ipv6: { 'ipv6.src': 'fd00:0:0:0:0:0:0:50', 'ipv6.dst': '2001:4860:4860::8888' },
    tls: [ { 'tls.record': { 'tls.handshake.extensions_server_name': ['ota.awair.is'] } }, { 'tls.record': {} } ]
  })], 'fd00::50', 'element');
  assert.equal(result.observations.targetPackets, 1);
  assert.equal(result.observations.tlsPackets, 1);
  assert.equal(result.observations.knownHosts[0].hostname, 'ota.awair.is');
});

test('capture refuses malformed envelopes, invalid addresses and packet limits', async () => {
  const { summarizeCapture, MAX_PACKETS } = await load('capture');
  for (const bad of [{}, [null], [{ layers: {} }]]) {
    assert.throws(() => summarizeCapture(bad, '192.168.1.50', 'glow-c'), /TShark/i);
  }
  for (const address of ['', 'example.com', '127.1', '192.168.1.999', '1.2.3.4/path', '1.2.3.4:80', '[fd00::50]', 'fe80::1%en0']) {
    assert.throws(() => summarizeCapture([], address, 'glow-c'), /IP address/i);
  }
  assert.throws(() => summarizeCapture(new Array(MAX_PACKETS + 1), '192.168.1.50', 'glow-c'), /limit/i);
});

test('no matching packets remains an empty observation, not a compatibility conclusion', async () => {
  const { summarizeCapture } = await load('capture');
  const result = summarizeCapture([packet({ ip: ip('192.168.1.99') })], '192.168.1.50', 'glow-c');
  assert.equal(result.observations.targetPackets, 0);
  assertUnverified(result);
});

test('capture bounds deeply nested dissections and ignores invalid hostnames', async () => {
  const { summarizeCapture } = await load('capture');
  let nested = { 'dns.qry.name': 'ota.awair.is' };
  for (let i = 0; i < 30; i++) nested = { child: nested };
  assert.throws(() => summarizeCapture([packet({ ip: ip(), dns: nested })], '192.168.1.50', 'glow-c'), /depth/i);
  const result = summarizeCapture([packet({ ip: ip(), http: { 'http.host': 'ota.awair.is.evil.example/path?secret' } })], '192.168.1.50', 'glow-c');
  assert.deepEqual(result.observations.knownHosts, []);
});

test('firmware hashes and analyzes one snapshot even when caller mutates the input', async () => {
  const { analyzeFirmware } = await load('firmware');
  const bytes = encode('WICED\0ota.awair.is');
  const hash = createHash('sha256').update(bytes).digest('hex');
  const pending = analyzeFirmware(bytes, 'glow-c');
  bytes.fill(0);
  const result = await pending;
  assert.equal(result.observations.sha256, hash);
  assert.ok(result.observations.markers.some(marker => marker.name === 'WICED'));
});
