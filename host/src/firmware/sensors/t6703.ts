import type { SensorDriver } from './sensor';
import type { SensorReading } from '../../shared/telemetry';

export class T6703Sensor implements SensorDriver {
  public readonly name = 'T6703';
  public readonly sampleIntervalMs = 30000;

  public async read(): Promise<SensorReading> {
    return {
      timestamp: new Date(),
      co2Ppm: 560
    };
  }
}
