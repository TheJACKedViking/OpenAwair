import { crc32 } from '../../shared/crc32';

export interface DfuProgress {
  readonly sentBytes: number;
  readonly totalBytes: number;
  readonly percentage: number;
}

export interface DfuTransport {
  writeChunk(chunk: Uint8Array): Promise<void>;
}

export class DfuClient {
  private readonly transport: DfuTransport;
  private readonly chunkSize: number;

  public constructor(transport: DfuTransport, chunkSize = 128) {
    this.transport = transport;
    this.chunkSize = chunkSize;
  }

  public async upload(image: Uint8Array, onProgress: (progress: DfuProgress) => void): Promise<number> {
    let sent = 0;
    while (sent < image.length) {
      const chunk = image.slice(sent, sent + this.chunkSize);
      await this.transport.writeChunk(chunk);
      sent += chunk.length;
      onProgress({
        sentBytes: sent,
        totalBytes: image.length,
        percentage: Math.round((sent / image.length) * 100)
      });
    }
    return crc32(image);
  }
}
