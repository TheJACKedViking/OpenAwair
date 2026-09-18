import { parseModel, report, type Model } from './evidence.js';

const DEVICE_INFO = '0000180a-0000-1000-8000-00805f9b34fb';
const PROPERTIES = ['broadcast', 'read', 'writeWithoutResponse', 'write', 'notify', 'indicate', 'authenticatedSignedWrites', 'reliableWrite', 'writableAuxiliaries'];
interface Characteristic { uuid: string; properties: Record<string, boolean>; }
interface Service { uuid: string; getCharacteristics(): Promise<Characteristic[]>; }
interface Gatt {
  connect(): Promise<Gatt>;
  disconnect(): void;
  getPrimaryServices(): Promise<Service[]>;
}
export interface BluetoothApi {
  requestDevice(options: { acceptAllDevices: true; optionalServices: string[] }): Promise<{ gatt?: Gatt }>;
}

export function normalizeServices(values: string[]): string[] {
  if (!Array.isArray(values) || values.length > 16) throw new Error('Optional service grant limit is 16 UUIDs.');
  const normalized = values.map(value => {
    if (typeof value !== 'string') throw new Error('Service UUID must be text.');
    const lower = value.trim().toLowerCase();
    if (/^[a-f0-9]{4}$/.test(lower)) return `0000${lower}-0000-1000-8000-00805f9b34fb`;
    if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(lower)) return lower;
    throw new Error('Service UUID must be four hexadecimal digits or a canonical 128-bit UUID.');
  });
  return [...new Set([DEVICE_INFO, ...normalized])];
}

function timeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Bluetooth operation timed out; do not reset the device.')), milliseconds);
    promise.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}

/** Enumerates metadata only: no characteristic reads, writes, subscriptions or pairing. */
export async function inventoryBluetooth(api: BluetoothApi | undefined, model: Model,
  additionalServices: string[] = [], timeoutMs = 30000) {
  parseModel(model);
  const optionalServices = normalizeServices(additionalServices);
  if (!api || typeof api.requestDevice !== 'function') {
    throw new Error('Web Bluetooth is unavailable. Use the native metadata collector; do not reset the device.');
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000) throw new Error('Invalid Bluetooth timeout.');
  // The chooser is an explicit user action. No first-device/strongest-signal selection.
  const device = await timeout(api.requestDevice({ acceptAllDevices: true, optionalServices }), timeoutMs);
  const gatt = device.gatt;
  if (!gatt) throw new Error('Selected device has no accessible GATT server.');
  let finished = false;
  const deadline = Date.now() + timeoutMs;
  const wait = <T>(promise: Promise<T>) => timeout(promise, Math.max(1, deadline - Date.now()));
  const disconnect = () => { try { gatt.disconnect(); } catch { /* best effort, including late connections */ } };
  try {
    const connecting = gatt.connect();
    void connecting.then(() => { if (finished) disconnect(); }, () => {});
    await wait(connecting);
    const services = await wait(gatt.getPrimaryServices());
    if (services.length > 64) throw new Error('Bluetooth service metadata limit exceeded.');
    const inventory: Array<{ uuid: string; characteristics: Array<{ uuid: string; properties: string[] }> }> = [];
    for (const service of services) {
      if (Date.now() > deadline) throw new Error('Bluetooth operation timed out.');
      const characteristics = await wait(service.getCharacteristics());
      if (characteristics.length > 256) throw new Error('Bluetooth characteristic metadata limit exceeded.');
      inventory.push({
        uuid: service.uuid,
        characteristics: characteristics.map(c => ({ uuid: c.uuid, properties: PROPERTIES.filter(p => c.properties[p] === true) }))
      });
    }
    return report('ble-inventory', model, {
      coverage: 'browser-permission-limited', requestedServices: optionalServices, services: inventory
    }, [
      'Only browser-permitted services are visible; an empty result does not prove that DFU is absent.',
      'A service UUID or writable characteristic does not prove a firmware-update protocol exists.',
      'No characteristic values, device name/address, manufacturer payloads or notification subscriptions were collected.',
      'Use native OS-level discovery for additional UUIDs, then grant those services explicitly.'
    ]);
  } finally { finished = true; disconnect(); }
}
