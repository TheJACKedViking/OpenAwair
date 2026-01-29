import type { SensorDriver } from './sensor';
import type { SensorReading } from '../../shared/telemetry';

export class Hpma115s0Sensor implements SensorDriver {
  public readonly name = 'HPMA115S0';
  public readonly sampleIntervalMs = 30000;

  public async read(): Promise<SensorReading> {
    return {
      timestamp: new Date(),
      pm25UgM3: 8.4
    };
  }
}
