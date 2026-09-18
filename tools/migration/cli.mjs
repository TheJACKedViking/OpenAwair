#!/usr/bin/env node
import { constants } from 'node:fs';
import { lstat, open } from 'node:fs/promises';
import { compatibility, parseModel } from './build/evidence.js';
import { analyzeFirmware, MAX_FIRMWARE_BYTES } from './build/firmware.js';
import { summarizeCapture } from './build/capture.js';
import { startServer } from './server.mjs';

const HELP = `OpenAwair migration research toolkit (not a flasher)

  status --model glow-c|element|v1|glow
  firmware FILE --model MODEL
  capture TSHARK_JSON --model MODEL --device-ip IP
  serve [--port 8765]

All device discovery is metadata-only. Firmware and capture analysis are offline.
No reset, firmware upload, DNS override, or device-write command is implemented.
Reports go to stdout; errors go to stderr. Capture exit 3 means no target packets.
Run the browser workbench with serve. Native BLE: python tools/migration/ble_inventory.py --help
`;

function argumentsFor(args) {
  const command = args[0];
  const allowed = { status: ['model'], firmware: ['model'], capture: ['model', 'device-ip'], serve: ['port'] }[command];
  if (!allowed) throw new Error('Unknown command. This toolkit has no flash/reset/write command. Use --help.');
  const options = Object.create(null);
  const positional = [];
  for (let i = 1; i < args.length; i++) {
    const token = args[i];
    if (!token.startsWith('-')) { positional.push(token); continue; }
    const name = token.slice(2);
    if (!token.startsWith('--') || !allowed.includes(name)) throw new Error(`Unknown option: ${token}`);
    if (Object.hasOwn(options, name)) throw new Error(`Duplicate option: ${token}`);
    const value = args[++i];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${token}`);
    options[name] = value;
  }
  const expected = command === 'firmware' || command === 'capture' ? 1 : 0;
  if (positional.length !== expected) throw new Error(`${command} requires ${expected} file arguments. Use --help.`);
  return { command, options, file: positional[0] };
}

/** Bounded regular-file reads; refuse symlinks and special files rather than following them. */
export async function readBoundedFile(path, limit) {
  const info = await lstat(path);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error('Input must be a regular file, not a symlink or directory.');
  const handle = await open(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0));
  try {
    const current = await handle.stat();
    if (!current.isFile()) throw new Error('Input is not a regular file.');
    if (current.size > limit) throw new Error('Input exceeds the file size limit.');
    const chunks = [];
    let total = 0;
    while (true) {
      const chunk = Buffer.alloc(Math.min(65536, limit + 1 - total));
      const { bytesRead } = await handle.read(chunk, 0, chunk.length, null);
      if (bytesRead === 0) break;
      total += bytesRead;
      if (total > limit) throw new Error('Input grew beyond the file size limit while reading.');
      chunks.push(chunk.subarray(0, bytesRead));
    }
    return Buffer.concat(chunks, total);
  } finally { await handle.close(); }
}

async function main(args) {
  if (args.length === 0 || (args.length === 1 && args[0] === '--help')) { process.stdout.write(HELP); return; }
  const { command, options, file } = argumentsFor(args);
  if (command === 'serve') {
    const port = options.port === undefined ? 8765 : Number(options.port);
    if (!/^\d+$/.test(options.port ?? '8765') || !Number.isInteger(port) || port < 1024 || port > 65535) {
      throw new Error('Port must be an integer from 1024 through 65535.');
    }
    const server = await startServer(port);
    process.stdout.write(`OpenAwair read-only workbench: http://127.0.0.1:${port}\nPress Ctrl+C to stop. No device-write API is exposed.\n`);
    process.once('SIGINT', () => server.close());
    process.once('SIGTERM', () => server.close());
    return;
  }
  const model = parseModel(options.model);
  let result;
  if (command === 'status') result = compatibility(model);
  else if (command === 'firmware') result = await analyzeFirmware(await readBoundedFile(file, MAX_FIRMWARE_BYTES), model);
  else {
    if (!options['device-ip']) throw new Error('capture requires --device-ip to exclude unrelated devices.');
    const bytes = await readBoundedFile(file, 32 * 1024 * 1024);
    let input;
    try { input = JSON.parse(bytes.toString('utf8')); } catch { throw new Error('Input is not valid TShark JSON.'); }
    result = summarizeCapture(input, options['device-ip'], model);
    if (result.observations.targetPackets === 0) {
      process.exitCode = 3;
      process.stderr.write('openawair: No matching target packets. Check the capture position and device IP; do not reset the device.\n');
    }
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main(process.argv.slice(2)).catch(error => {
  // Do not echo JSON parser snippets, absolute paths, or firmware data in error reports.
  const message = error?.code ? `Input/server operation failed (${error.code}). Check the file, permissions or port.` : error.message;
  process.stderr.write(`openawair: ${message}\n`);
  process.exitCode = 1;
});
