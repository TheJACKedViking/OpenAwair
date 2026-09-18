import test from 'node:test';
import assert from 'node:assert/strict';
const load = () => import('../build/ble.js');
const UUID = '0000180a-0000-1000-8000-00805f9b34fb';
const deny = () => { throw new Error('Device read/write/subscription forbidden'); };

function fakeDevice({ fail = false, late = 0 } = {}) {
  let disconnected = 0;
  const characteristic = {
    uuid: '00002a26-0000-1000-8000-00805f9b34fb',
    properties: { read: true, write: true, notify: true },
    readValue: deny, writeValue: deny, writeValueWithResponse: deny, startNotifications: deny
  };
  const gatt = {
    async connect() { if (late) await new Promise(r => setTimeout(r, late)); return this; },
    disconnect() { disconnected++; },
    async getPrimaryServices() {
      if (fail) throw new Error('Synthetic disconnect');
      return [{ uuid: UUID, async getCharacteristics() { return [characteristic]; } }];
    }
  };
  return { device: { id: 'secret-device-id', name: 'private-device-name', gatt }, disconnected: () => disconnected };
}

test('browser BLE requests permission and exports only metadata', async () => {
  const { inventoryBluetooth } = await load();
  const fake = fakeDevice();
  let request;
  const api = { async requestDevice(options) { request = options; return fake.device; } };
  const report = await inventoryBluetooth(api, 'glow-c', [], 100);
  assert.deepEqual(request.optionalServices, [UUID]);
  assert.equal(request.acceptAllDevices, true); // user chooses; never auto-connect by proximity
  assert.equal(report.stockMigration, 'unverified');
  assert.equal(report.observations.coverage, 'browser-permission-limited');
  assert.deepEqual(report.observations.services[0].characteristics[0].properties, ['read', 'write', 'notify']);
  assert.equal(fake.disconnected(), 1);
  assert.equal(JSON.stringify(report).includes('secret-device-id'), false);
  assert.equal(JSON.stringify(report).includes('private-device-name'), false);
});

test('browser BLE validates UUIDs, deduplicates and refuses excess grants', async () => {
  const { normalizeServices } = await load();
  assert.deepEqual(normalizeServices(['180a', UUID, UUID.toUpperCase()]), [UUID]);
  for (const bad of [['garbage'], ['0xFE59'], ['http://example.com'], new Array(40).fill(UUID)]) {
    assert.throws(() => normalizeServices(bad), /UUID|limit/i);
  }
});

test('browser BLE reports unsupported browsers and always disconnects on an error', async () => {
  const { inventoryBluetooth } = await load();
  await assert.rejects(() => inventoryBluetooth(undefined, 'glow-c'), /Web Bluetooth/i);
  const fake = fakeDevice({ fail: true });
  await assert.rejects(() => inventoryBluetooth({ requestDevice: async () => fake.device }, 'glow-c'), /disconnect/i);
  assert.equal(fake.disconnected(), 1);
});

test('late BLE connection completion after timeout is disconnected too', async () => {
  const { inventoryBluetooth } = await load();
  const fake = fakeDevice({ late: 50 });
  await assert.rejects(() => inventoryBluetooth({ requestDevice: async () => fake.device }, 'glow-c', [], 5), /timed out/i);
  await new Promise(resolve => setTimeout(resolve, 70));
  assert.ok(fake.disconnected() >= 2);
});

test('cancelled chooser never attempts a connection', async () => {
  const { inventoryBluetooth } = await load();
  await assert.rejects(() => inventoryBluetooth({ requestDevice: async () => { throw new Error('Cancelled'); } }, 'glow-c'), /Cancelled/);
});
