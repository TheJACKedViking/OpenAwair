import type { MqttMessage } from './mqtt';

export interface DiscoveryDevice {
  readonly identifiers: string[];
  readonly name: string;
  readonly model: string;
  readonly manufacturer: string;
}

export interface DiscoverySensor {
  readonly name: string;
  readonly uniqueId: string;
  readonly stateTopic: string;
  readonly unitOfMeasurement?: string;
  readonly deviceClass?: string;
  readonly valueTemplate?: string;
}

export const buildDiscoveryMessages = (
  device: DiscoveryDevice,
  sensors: DiscoverySensor[]
): MqttMessage[] => {
  if (device.identifiers.length === 0) {
    throw new Error('Device identifiers are required for discovery messages');
  }

  const baseId = device.identifiers[0];

  return sensors.map((sensor) => {
    const payload = {
      name: sensor.name,
      uniq_id: sensor.uniqueId,
      stat_t: sensor.stateTopic,
      unit_of_meas: sensor.unitOfMeasurement,
      dev_cla: sensor.deviceClass,
      val_tpl: sensor.valueTemplate,
      dev: {
        ids: device.identifiers,
        name: device.name,
        mdl: device.model,
        mf: device.manufacturer
      }
    };

    return {
      topic: `homeassistant/sensor/${baseId}/${sensor.uniqueId}/config`,
      payload: JSON.stringify(payload)
    };
  });
};
