import { parseModel, report, type Model } from './evidence.js';

export const MAX_FIRMWARE_BYTES = 16 * 1024 * 1024;
const MARKERS: ReadonlyArray<readonly [string, string]> = [
  ['ota.awair.is', 'ota.awair.is'], ['WICED', 'WICED'],
  ['http-url', 'http://'], ['https-url', 'https://'],
  ['mqtt-tls-url', 'mqtts://'], ['UPGR', 'UPGR'], ['FNOW', 'FNOW'],
  ['certificate-pem', '-----BEGIN CERTIFICATE-----'],
  ['public-key-pem', '-----BEGIN PUBLIC KEY-----'],
  ['private-key-pem', '-----BEGIN PRIVATE KEY-----'],
  ['rsa-private-key-pem', '-----BEGIN RSA PRIVATE KEY-----'],
  ['ec-private-key-pem', '-----BEGIN EC PRIVATE KEY-----'],
  ['mbedtls', 'mbedtls'], ['ECDSA', 'ECDSA'], ['secure-boot-text', 'secure_boot']
];

/** Static hints only. Does not decode signed/encrypted packages or invoke a downloader. */
export async function analyzeFirmware(bytes: Uint8Array, model: Model) {
  parseModel(model);
  if (!(bytes instanceof Uint8Array)) throw new Error('Firmware must be a byte array.');
  if (bytes.byteLength === 0) throw new Error('Firmware input is empty.');
  if (bytes.byteLength > MAX_FIRMWARE_BYTES) throw new Error('Firmware exceeds the 16 MiB input limit.');
  // Copy the supplied view so the digest excludes unrelated backing-buffer bytes.
  const snapshot = new Uint8Array(bytes);
  const digest = await crypto.subtle.digest('SHA-256', snapshot);
  const sha256 = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('');
  const text = new TextDecoder('latin1').decode(snapshot);
  const markers: Array<{ name: string; matches: number; offsets: number[] }> = [];
  for (const [name, needle] of MARKERS) {
    let offset = text.indexOf(needle);
    let matches = 0;
    const offsets: number[] = [];
    while (offset !== -1) {
      matches++;
      if (offsets.length < 16) offsets.push(offset);
      offset = text.indexOf(needle, offset + needle.length);
    }
    if (matches) markers.push({ name, matches, offsets });
  }
  const view = new DataView(snapshot.buffer);
  const candidateVectors: Array<{ offset: number; initialStackPointer: string; resetVector: string }> = [];
  const hex = (n: number) => `0x${n.toString(16).padStart(8, '0')}`;
  for (let offset = 0; offset + 8 <= Math.min(bytes.byteLength, 4096); offset += 4) {
    const sp = view.getUint32(offset, true);
    const reset = view.getUint32(offset + 4, true);
    if (sp >= 0x20000000 && sp <= 0x20080000 && sp % 8 === 0 &&
        reset >= 0x08000001 && reset < 0x08200000 && (reset & 1) === 1) {
      if (candidateVectors.length < 32) candidateVectors.push({ offset, initialStackPointer: hex(sp), resetVector: hex(reset) });
    }
  }
  return report('firmware-static', model, {
    size: bytes.byteLength, sha256, markers, candidateVectors, layoutVerified: false
  }, [
    'Marker offsets are ASCII hints, not executable-code analysis or proof of verification policy.',
    'No matching marker does not mean unsigned firmware, absent TLS validation, or absent secure boot.',
    'Vector candidates examine only the first 4096 bytes using broad STM32-style address hints.',
    'A CRC, hash, key or certificate string does not establish accepted package format or signing policy.',
    'No firmware bytes, URLs, filenames, credentials or key material are included in this report.'
  ]);
}
