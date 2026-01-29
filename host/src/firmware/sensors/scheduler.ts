import type { SensorDriver } from './sensor';
import { mergeReadings } from './sensor';
import type { SensorReading } from '../../shared/telemetry';

export class SensorScheduler {
  private readonly drivers: SensorDriver[];

  public constructor(drivers: SensorDriver[]) {
    this.drivers = drivers;
  }

  public async sampleAll(): Promise<SensorReading> {
    const readings = await Promise.all(this.drivers.map((driver) => driver.read()));
    return mergeReadings(readings);
  }
}
