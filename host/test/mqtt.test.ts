import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MqttPublisher } from '../src/firmware/networking/mqtt';

const metrics = {
  deviceId: 'awair-01',
  model: 'AwairGlowC' as const,
  sensors: {
    timestamp: new Date('2024-01-01T00:00:00.000Z'),
    temperatureC: 22.2
  }
};

describe('MqttPublisher', () => {
  it('builds telemetry payloads', () => {
    const publisher = new MqttPublisher();
    const message = publisher.buildTelemetryMessage(metrics);

    assert.strictEqual(message.topic, 'openawair/awair-01/telemetry');
    assert.ok(message.payload.includes('AwairGlowC'));
  });
});
