import type { SensorDriver } from './sensor';
import type { SensorReading } from '../../shared/telemetry';

export class Sht30Sensor implements SensorDriver {
  public readonly name = 'SHT30';
  public readonly sampleIntervalMs = 5000;

  public async read(): Promise<SensorReading> {
    return {
      timestamp: new Date(),
      temperatureC: 22.9,
      humidityPercent: 44.5
    };
  }
}
