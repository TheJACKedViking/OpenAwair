import type { FlashStore } from '../storage/flash';
import { DfuSession, type FirmwareImage } from './dfu';

export type BootDecision = 'boot-app' | 'enter-dfu';

export interface BootConfig {
  readonly dfuFlagKey: string;
  readonly firmwareCrcKey: string;
  readonly firmwareSizeKey: string;
}

export class Bootloader {
  private readonly store: FlashStore;
  private readonly config: BootConfig;

  public constructor(store: FlashStore, config: BootConfig) {
    this.store = store;
    this.config = config;
  }

  public decideBoot(): BootDecision {
    const flag = this.store.read(this.config.dfuFlagKey);
    return flag === '1' ? 'enter-dfu' : 'boot-app';
  }

  public prepareDfuSession(): DfuSession {
    const crcValue = this.store.read(this.config.firmwareCrcKey);
    const sizeValue = this.store.read(this.config.firmwareSizeKey);

    if (!crcValue || !sizeValue) {
      throw new Error('Missing firmware metadata for DFU');
    }

    return new DfuSession(Number.parseInt(crcValue, 10), Number.parseInt(sizeValue, 10));
  }

  public commitFirmware(image: FirmwareImage): void {
    this.store.write(this.config.firmwareCrcKey, image.crc.toString(10));
    this.store.write(this.config.firmwareSizeKey, image.bytes.length.toString(10));
    this.store.write(this.config.dfuFlagKey, '0');
  }
}
