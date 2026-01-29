import type { SensorDriver } from './sensor';
import type { SensorReading } from '../../shared/telemetry';

export class Sgp30Sensor implements SensorDriver {
  public readonly name = 'SGP30';
  public readonly sampleIntervalMs = 10000;
  private baseline: number | null = null;

  public setBaseline(baseline: number): void {
    this.baseline = baseline;
  }

  public async read(): Promise<SensorReading> {
    const voc = this.baseline ?? 150;
    return {
      timestamp: new Date(),
      vocPpb: voc
    };
  }
}
