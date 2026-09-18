import { compatibility } from '/build/evidence.js';
import { analyzeFirmware, MAX_FIRMWARE_BYTES } from '/build/firmware.js';
import { summarizeCapture } from '/build/capture.js';
import { inventoryBluetooth } from '/build/ble.js';

const element = id => document.getElementById(id);
let lastReport;
let busy = false;
const bluetoothAvailable = Boolean(globalThis.isSecureContext && navigator.bluetooth);

function refreshControls() {
  for (const control of document.querySelectorAll('button, input, select')) control.disabled = busy;
  element('download').disabled = busy || !lastReport;
  element('bluetooth').disabled = busy || !bluetoothAvailable || !element('consent').checked;
}

async function perform(operation) {
  if (busy) return;
  busy = true; lastReport = undefined;
  element('report').textContent = 'Collecting local observations…';
  element('message').textContent = 'No firmware or device-write operation is being performed.';
  refreshControls();
  try {
    lastReport = await operation();
    element('report').textContent = JSON.stringify(lastReport, null, 2);
    element('message').textContent = lastReport.kind === 'network-observations' && lastReport.observations.targetPackets === 0
      ? 'No matching device packets. Check the capture position and IP. This is not evidence of device behavior.'
      : 'Report ready. Stock migration remains unverified. Review the minimized report before sharing.';
  } catch (error) {
    element('report').textContent = 'No report produced.';
    element('message').textContent = `Unable to complete this operation: ${error.message}`;
  } finally { busy = false; refreshControls(); }
}

function selectedFile(id, limit) {
  const file = element(id).files[0];
  if (!file) throw new Error('Select a local file first.');
  if (file.size === 0) throw new Error('The selected file is empty.');
  if (file.size > limit) throw new Error('The selected file exceeds the input size limit.');
  return file;
}

element('bluetooth-support').textContent = bluetoothAvailable
  ? 'Only Device Information (180a) and explicitly added service UUIDs are permitted. Choose only your own device.'
  : 'Web Bluetooth is unavailable here. Use the native collector for BLE discovery. Local-file analysis is still available in a secure context.';
element('consent').addEventListener('change', refreshControls);
element('model').addEventListener('change', () => { lastReport = undefined; element('report').textContent = 'Model changed. Collect a new report.'; refreshControls(); });
element('status').addEventListener('click', () => perform(() => compatibility(element('model').value)));
element('bluetooth').addEventListener('click', () => perform(() => {
  const services = element('services').value.split(',').map(v => v.trim()).filter(Boolean);
  return inventoryBluetooth(navigator.bluetooth, element('model').value, services);
}));
element('analyze-firmware').addEventListener('click', () => perform(async () => {
  const file = selectedFile('firmware', MAX_FIRMWARE_BYTES);
  return analyzeFirmware(new Uint8Array(await file.arrayBuffer()), element('model').value);
}));
element('analyze-capture').addEventListener('click', () => perform(async () => {
  const file = selectedFile('capture', 32 * 1024 * 1024);
  let input;
  try { input = JSON.parse(await file.text()); } catch { throw new Error('The file is not valid TShark JSON.'); }
  return summarizeCapture(input, element('device-ip').value.trim(), element('model').value);
}));
element('download').addEventListener('click', () => {
  if (!lastReport) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(lastReport, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `openawair-${lastReport.model}-${lastReport.kind}-report.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
refreshControls();
