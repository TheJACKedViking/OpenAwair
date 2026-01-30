import type { DeviceMetrics } from '../../shared/telemetry';

export interface MqttMessage {
  readonly topic: string;
  readonly payload: string;
}

export class MqttPublisher {
  public buildTelemetryMessage(metrics: DeviceMetrics): MqttMessage {
    return {
      topic: `openawair/${metrics.deviceId}/telemetry`,
      payload: JSON.stringify(metrics)
    };
  }

  public buildAvailabilityMessage(deviceId: string, available: boolean): MqttMessage {
    return {
      topic: `openawair/${deviceId}/availability`,
      payload: available ? 'online' : 'offline'
    };
  }
}
