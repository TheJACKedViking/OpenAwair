# OpenAwair contributor guidance

## Current status, not aspirational behavior

OpenAwair aims to restore owner-controlled local MQTT/REST access to Awair devices
and qualify a no-opening/no-extra-hardware end-user migration. As of 2026-09-18,
there is **no verified stock-to-custom installation path** for Glow C or Element,
and `firmware/src/main.c` is a bring-up stub. Do not call host-side simulations,
unit tests, proposed GATT UUIDs, or a browser UI working device firmware.

Read `docs/research/2026-09-18-stock-migration.md` and the closed-device runbook
before suggesting any installation, reset, flash layout, or hardware operation.
Those evidence-qualified documents supersede unsupported statements in the
January 2026 plans, including their PDF copy and old task specifications.

## Model separation and evidence

- Awair's 2022 sunset notice covers V1, Glow and Glow C, not Element.
- Rewair targets V1's EMW3165 / STM32F411 communications module. Its initial SWD
  bootstrap is separate from its subsequent custom browser OTA support.
- Glow C and Element chip identities, revisions, pins, sensors, flash geometry,
  protection state and stock update behavior need model-specific confirmation.
  Earlier STM32F412 / Sterling-EWB statements are planning assumptions until
  backed by a board/device observation. Do not infer one model from another.
- `ota.awair.is`, TLS on 443, hourly checks and DNS/static-IP fallback are
  documented for Element. Glow C documentation specifies ports 8883 and 443,
  but does not establish the same updater or host. Do not assume equivalence.
- Certificate validation, image authentication and boot-time verification are
  independent unknowns. An ASCII string, CRC or successful download proves none.
- BLE provisioning is not BLE DFU. A writable characteristic is not an updater.
  Nordic service UUID 0xFE59 is not a discovered stock Awair protocol.

## Safety and privacy

Do not factory-reset legacy Awair devices for discovery. No unverified flash,
DNS interception, update delivery, protection changes or mass erase may be
presented as routine onboarding. The migration research toolkit intentionally
has no write transport. Do not wire it to the simulated DFU client.

Never promise "no brick risk." First installation needs separate recovery and
power-loss qualification. A future Glow C implementation must define safe relay
behavior throughout migration and rollback. Do not give unverified mains-power,
programmer-power or pinout instructions.

Raw firmware/captures may contain credentials and keys. Keep them under
`tools/migration/private/` (ignored) and outside public issues. Do not commit
stock images, device identities, Wi-Fi credentials or unsanitized packets. A
minimized report is not a guarantee of anonymity; review before sharing.

## Code layout and commands

- `firmware/`: C/C++ stub and future target-specific firmware.
- `host/`: older TypeScript behavioral interfaces/tests; no real transport yet.
- `tools/migration/src/`: pure TypeScript report, capture, firmware and BLE modules.
- `tools/migration/cli.mjs`, `server.mjs`: Node standard-library entrypoints.
- `tools/migration/web/`: static workbench, no network API or third-party assets.
- `tools/migration/ble_inventory.py`: optional OS-exposed metadata collector.

```sh
npm run typecheck
npm run lint
npm test
npm run migration:build
npm run migration:test
python3 -m unittest discover -s tools/migration/test -p 'test_*.py'
```

The migration build is intentionally separate from the old CommonJS host build;
its ES modules also run in browsers. Node 22+ is required. TypeScript is the only
Node dependency. Native BLE additionally uses `requirements-ble.txt`; imports are
lazy so hardware-free tests do not require Bleak or a Bluetooth adapter.

Optional UI smoke test (requires Playwright and Chromium):

```sh
python3 tools/migration/test/browser_smoke.py
```

`CHROMIUM_EXECUTABLE` may select a preinstalled test browser. Never bypass an
administrator's browser/network restrictions to run this test; record the
limitation and rely on an authorized CI runner.

## Testing and release rules

Write failing tests first. Keep synthetic fixtures visibly synthetic. Test
bounds, hostile/malformed input, cancellation, disconnect cleanup and report data
minimization. Unknown hardware and unknown verification remain unknown in every
report. Browser GATT discovery is permission-limited, not exhaustive.

Do not claim a target or platform is tested from mocks alone. A flashing release
requires evidence of stock acceptance, successful boot, retained device data,
recovery through interrupted operations, and repeatable enclosure-closed use on
each exact model/revision/stock-version combination.

No Rewair source is vendored in this change. Resolve upstream licensing and SDK/
radio-blob redistribution before importing code or distributing firmware.
