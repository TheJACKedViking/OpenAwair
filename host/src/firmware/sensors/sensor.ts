import type { SensorReading } from '../../shared/telemetry';

export interface SensorDriver {
  readonly name: string;
  readonly sampleIntervalMs: number;
  read(): Promise<SensorReading>;
}

export const mergeReadings = (readings: SensorReading[]): SensorReading => {
  return readings.reduce<SensorReading>(
    (acc, reading) => ({
      ...acc,
      ...reading,
      timestamp: reading.timestamp ?? acc.timestamp
    }),
    { timestamp: new Date(0) }
  );
};
