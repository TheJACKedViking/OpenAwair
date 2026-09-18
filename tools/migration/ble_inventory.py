#!/usr/bin/env python3
"""Metadata-only discovery for one owner-selected BLE device; no characteristic I/O."""
import argparse
import asyncio
from datetime import datetime, timezone
import json
import math
import sys
import uuid

MODELS = ('glow-c', 'element', 'v1', 'glow')
PROPERTIES = {
    'broadcast': 'broadcast', 'read': 'read',
    'write-without-response': 'writeWithoutResponse', 'write': 'write',
    'notify': 'notify', 'indicate': 'indicate',
    'authenticated-signed-writes': 'authenticatedSignedWrites',
    'reliable-write': 'reliableWrite', 'writable-auxiliaries': 'writableAuxiliaries',
}


def parse_arguments(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    select = parser.add_mutually_exclusive_group(required=True)
    select.add_argument('--list', action='store_true', help='Show nearby identifiers locally. Do NOT share this private scan.')
    select.add_argument('--address', help='Exact selected OS identifier from --list; macOS uses a UUID, not a MAC address.')
    parser.add_argument('--model', choices=MODELS)
    parser.add_argument('--timeout', type=float, default=15, help='Scan/collection timeout, 1-60 seconds (default 15).')
    args = parser.parse_args(argv)
    if not math.isfinite(args.timeout) or not 1 <= args.timeout <= 60:
        parser.error('--timeout must be finite and between 1 and 60 seconds')
    if not args.list and not args.model:
        parser.error('--address requires an explicit --model')
    if args.address is not None and (not args.address.strip() or len(args.address) > 128):
        parser.error('invalid --address')
    return args


async def collect(client, model, timeout=15):
    """Collect only service/characteristic UUIDs and property flags; client is injectable."""
    if model not in MODELS:
        raise ValueError('Unsupported model')
    if not math.isfinite(timeout) or not 0 < timeout <= 60:
        raise ValueError('Invalid timeout')

    async def inventory():
        try:
            async with client:
                services = []
                for service in client.services:
                    if len(services) >= 64:
                        raise ValueError('Service metadata limit exceeded')
                    characteristics = []
                    for characteristic in service.characteristics:
                        if len(characteristics) >= 256:
                            raise ValueError('Characteristic metadata limit exceeded')
                        characteristics.append({
                            'uuid': str(uuid.UUID(characteristic.uuid)),
                            'properties': [value for key, value in PROPERTIES.items() if key in characteristic.properties],
                        })
                    services.append({'uuid': str(uuid.UUID(service.uuid)), 'characteristics': characteristics})
                return services
        finally:
            # Also attempt cleanup if cancellation happened during __aenter__.
            cleanup = getattr(client, 'disconnect', None)
            if callable(cleanup):
                try:
                    await asyncio.wait_for(cleanup(), timeout=3)
                except Exception:
                    pass

    services = await asyncio.wait_for(inventory(), timeout=timeout)
    return {
        'schemaVersion': 1, 'toolVersion': '0.1.0', 'kind': 'ble-inventory',
        'model': model, 'modelSource': 'user-supplied',
        'collectedAt': datetime.now(timezone.utc).isoformat(),
        'stockMigration': 'unverified', 'deviceWriteOperations': 0,
        'verification': {
            'stockImageAcceptance': 'unknown', 'serverIdentityValidation': 'unknown',
            'bootVerification': 'unknown',
        },
        'observations': {'coverage': 'os-exposed', 'services': services},
        'limits': [
            'OS-exposed services are not proof of the complete hardware or firmware interface.',
            'No characteristic reads, writes, descriptor reads, pairing or notification subscriptions were requested.',
            'Device names/addresses, advertisement payloads and characteristic values are omitted.',
            'A service UUID or writable property is not proof of DFU support. Do not factory-reset the device.',
        ],
    }


async def main(args):
    # Lazy import keeps --help and hardware-free tests usable without optional dependencies.
    try:
        from bleak import BleakClient, BleakScanner
    except ImportError:
        raise RuntimeError('Install tools/migration/requirements-ble.txt in a Python virtual environment') from None
    if args.list:
        discovered = await BleakScanner.discover(timeout=args.timeout, return_adv=True)
        devices = []
        for identifier, (device, advertisement) in sorted(discovered.items()):
            name = advertisement.local_name or device.name or '(unnamed)'
            devices.append({
                'identifier': identifier,
                'name': ''.join(c for c in name[:100] if c.isprintable()),
                'services': advertisement.service_uuids[:64],
            })
        return {'privateScan': True, 'warning': 'Do not share this scan. Select only your own device; do not reset it.', 'devices': devices}
    device = await BleakScanner.find_device_by_address(args.address, timeout=args.timeout)
    if device is None:
        raise RuntimeError('Selected device is not advertising. Do not factory-reset it to make discovery work')
    return await collect(BleakClient(device, timeout=args.timeout, pair=False), args.model, args.timeout)


if __name__ == '__main__':
    arguments = parse_arguments()
    try:
        print(json.dumps(asyncio.run(main(arguments)), indent=2))
    except KeyboardInterrupt:
        print('openawair: Discovery cancelled; no device writes were requested.', file=sys.stderr)
        sys.exit(130)
    except Exception as error:
        message = str(error) if isinstance(error, RuntimeError) else type(error).__name__
        print(f'openawair: {message}. Check Bluetooth permissions/availability; do not reset the Awair.', file=sys.stderr)
        sys.exit(1)
