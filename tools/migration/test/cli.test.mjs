import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, writeFile, truncate, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const cli = fileURLToPath(new URL('../cli.mjs', import.meta.url));
const run = args => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', timeout: 5000 });

for (const args of [[], ['--help']]) {
  test(`CLI help ${JSON.stringify(args)} is available`, () => {
    const result = run(args);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /not a flasher/i);
  });
}

for (const args of [
  ['flash', 'image.bin', '--model', 'glow-c'],
  ['status'], ['status', '--model', 'glow-c', '--force'],
  ['status', '--model', 'glow-c', '--model', 'v1'],
  ['status', '--model', 'glow-c', 'extra'],
  ['firmware', '--model', 'glow-c'],
  ['serve', '--port', '0'], ['serve', '--host', '0.0.0.0']
]) {
  test(`CLI rejects unsafe/invalid arguments ${JSON.stringify(args)}`, () => {
    const result = run(args);
    assert.equal(result.status, 1);
    assert.ok(result.stderr.startsWith('openawair:'), result.stderr);
    assert.equal(result.stdout, '');
  });
}

test('CLI status explicitly reports no stock flashing profile', () => {
  const result = run(['status', '--model', 'glow-c']);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.observations.flashAvailable, false);
  assert.equal(report.observations.qualifiedStockMigrationProfiles, 0);
});

test('CLI processes real local files without mutating them or echoing paths', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'openawair-test-'));
  try {
    const binary = join(directory, 'private-firmware.bin');
    await writeFile(binary, 'WICED\0ota.awair.is\0private-wifi-password');
    const firmware = run(['firmware', binary, '--model', 'glow-c']);
    assert.equal(firmware.status, 0, firmware.stderr);
    assert.equal(JSON.parse(firmware.stdout).kind, 'firmware-static');
    assert.equal(firmware.stdout.includes(directory), false);
    assert.equal(firmware.stdout.includes('private-wifi-password'), false);
    const capture = join(directory, 'capture.json');
    await writeFile(capture, '[]');
    const network = run(['capture', capture, '--device-ip', '192.168.1.50', '--model', 'glow-c']);
    assert.equal(network.status, 3);
    assert.equal(JSON.parse(network.stdout).observations.targetPackets, 0);
    assert.match(network.stderr, /no matching/i);
    await writeFile(capture, '{ private-secret-invalid-json }');
    const malformed = run(['capture', capture, '--device-ip', '192.168.1.50', '--model', 'glow-c']);
    assert.equal(malformed.status, 1);
    assert.equal(malformed.stderr.includes('private-secret'), false);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('CLI rejects symlinks, directories and files larger than the limit', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'openawair-test-'));
  try {
    const binary = join(directory, 'firmware.bin');
    await writeFile(binary, 'sample');
    const link = join(directory, 'link.bin');
    await symlink(binary, link);
    for (const path of [directory, link, join(directory, 'missing')]) {
      assert.equal(run(['firmware', path, '--model', 'glow-c']).status, 1);
    }
    await truncate(binary, 16 * 1024 * 1024 + 1);
    assert.equal(run(['firmware', binary, '--model', 'glow-c']).status, 1);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
