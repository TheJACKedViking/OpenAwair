import type { DeviceMetrics } from '../shared/telemetry';
import { SensorScheduler } from './sensors/scheduler';
import type { SensorDriver } from './sensors/sensor';

export class AwairDevice {
  private readonly scheduler: SensorScheduler;
  private relayEnabled = false;

  public constructor(drivers: SensorDriver[]) {
    this.scheduler = new SensorScheduler(drivers);
  }

  public async collectMetrics(deviceId: string, model: DeviceMetrics['model']): Promise<DeviceMetrics> {
    const sensors = await this.scheduler.sampleAll();
    return {
      deviceId,
      model,
      sensors,
      motionDetected: false
    };
  }

  public toggleRelay(): void {
    this.relayEnabled = !this.relayEnabled;
  }

  public getRelayState(): boolean {
    return this.relayEnabled;
  }
}
