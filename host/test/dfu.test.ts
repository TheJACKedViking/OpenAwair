import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createFirmwareImage, DfuSession } from '../src/firmware/bootloader/dfu';

const toChunk = (bytes: Uint8Array, offset: number, length: number) => ({
  offset,
  data: bytes.slice(offset, offset + length)
});

describe('DfuSession', () => {
  it('accepts chunks and validates CRC', () => {
    const image = new Uint8Array([10, 11, 12, 13, 14, 15]);
    const firmware = createFirmwareImage(image);
    const session = new DfuSession(firmware.crc, image.length);

    session.acceptChunk(toChunk(image, 0, 3));
    session.acceptChunk(toChunk(image, 3, 3));

    assert.strictEqual(session.isComplete(), true);
    assert.strictEqual(session.verify(), true);
    assert.strictEqual(session.getImage().crc, firmware.crc);
  });
});
