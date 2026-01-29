import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildDiscoveryMessages } from '../src/firmware/networking/mqttDiscovery';

describe('buildDiscoveryMessages', () => {
  it('builds Home Assistant discovery payloads', () => {
    const messages = buildDiscoveryMessages(
      {
        identifiers: ['awair-01'],
        name: 'Awair Glow C',
        model: 'Glow C',
        manufacturer: 'Awair'
      },
      [
        {
          name: 'Temperature',
          uniqueId: 'awair-01-temp',
          stateTopic: 'openawair/awair-01/telemetry',
          unitOfMeasurement: '°C',
          deviceClass: 'temperature',
          valueTemplate: '{{ value_json.sensors.temperatureC }}'
        }
      ]
    );

    assert.strictEqual(messages.length, 1);
    assert.ok(messages[0].topic.includes('homeassistant/sensor/awair-01/awair-01-temp/config'));
    assert.ok(messages[0].payload.includes('Temperature'));
  });
});
