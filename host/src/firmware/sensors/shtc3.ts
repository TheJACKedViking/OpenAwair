import type { SensorDriver } from './sensor';
import type { SensorReading } from '../../shared/telemetry';

export class Shtc3Sensor implements SensorDriver {
  public readonly name = 'SHTC3';
  public readonly sampleIntervalMs = 5000;

  public async read(): Promise<SensorReading> {
    return {
      timestamp: new Date(),
      temperatureC: 23.5,
      humidityPercent: 45.2
    };
  }
}
