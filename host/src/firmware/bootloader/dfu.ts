import { crc32 } from '../../shared/crc32';

export interface FirmwareChunk {
  readonly offset: number;
  readonly data: Uint8Array;
}

export interface FirmwareImage {
  readonly bytes: Uint8Array;
  readonly crc: number;
}

export const createFirmwareImage = (bytes: Uint8Array): FirmwareImage => {
  return { bytes, crc: crc32(bytes) };
};

export class DfuSession {
  private readonly expectedCrc: number;
  private readonly size: number;
  private readonly buffer: Uint8Array;
  private received = 0;

  public constructor(expectedCrc: number, size: number) {
    this.expectedCrc = expectedCrc;
    this.size = size;
    this.buffer = new Uint8Array(size);
  }

  public acceptChunk(chunk: FirmwareChunk): void {
    if (chunk.offset + chunk.data.length > this.size) {
      throw new Error('Chunk exceeds firmware size');
    }
    this.buffer.set(chunk.data, chunk.offset);
    this.received += chunk.data.length;
  }

  public isComplete(): boolean {
    return this.received >= this.size;
  }

  public verify(): boolean {
    if (!this.isComplete()) {
      return false;
    }
    return crc32(this.buffer) === this.expectedCrc;
  }

  public getImage(): FirmwareImage {
    if (!this.verify()) {
      throw new Error('Firmware CRC mismatch');
    }
    return { bytes: this.buffer, crc: this.expectedCrc };
  }
}
