export type TemperatureCelsius = number;
export type RelativeHumidity = number;
export type VolatileOrganicCompounds = number;
export type ParticulateMatter = number;
export type CarbonDioxide = number;

export interface SensorReading {
  readonly timestamp: Date;
  readonly temperatureC?: TemperatureCelsius;
  readonly humidityPercent?: RelativeHumidity;
  readonly vocPpb?: VolatileOrganicCompounds;
  readonly pm25UgM3?: ParticulateMatter;
  readonly co2Ppm?: CarbonDioxide;
}

export interface DeviceMetrics {
  readonly deviceId: string;
  readonly model: 'AwairGlowC' | 'AwairElement';
  readonly sensors: SensorReading;
  readonly motionDetected?: boolean;
  readonly ambientLightLux?: number;
}
