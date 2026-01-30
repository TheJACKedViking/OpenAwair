import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crc32 } from '../src/shared/crc32';

describe('crc32', () => {
  it('computes a stable checksum for known data', () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    assert.strictEqual(crc32(data), 0x470b99f4);
  });
});
