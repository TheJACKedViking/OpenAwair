# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenAwair restores local-first functionality to discontinued Awair Glow C and Awair Element air quality monitors. The devices lost cloud support in 2022, making them non-functional without custom firmware. The goal is fully offline operation with data accessible via MQTT or REST API for Home Assistant integration.

## Hardware

Both devices use the **Laird Sterling-EWB module** (STM32F412 ARM Cortex-M4 + Cypress CYW4343W Wi-Fi/BLE).

**Awair Glow C:**
- SHTC3 (temp/humidity, I²C)
- SGP30 (TVOC + eCO₂ estimate, I²C)
- PIR motion sensor (GPIO)
- RGB LED nightlight (GPIO/PWM)
- Relay for smart plug control (GPIO)

**Awair Element:**
- SHT30 (temp/humidity, I²C)
- SGP30 (TVOC, I²C)
- Honeywell HPMA115S0 (PM2.5, UART) - requires fan spin-up period
- Telaire T6703 (CO₂ NDIR, UART/I²C)
- Ambient light sensor
- Dot-matrix LED display

**Debug Interface:** SWD pins (SWDIO, SWDCLK, NRST, GND, 3.3V) on test pads. Board labeled "AWAIR-LITE-MAIN V2.0" on Element. Use ST-Link or J-Link programmer. MCU may be read-protected but can be erased for custom firmware.

## Repository Structure

- `firmware/` - C/C++ embedded firmware for STM32F412 (stub, to be implemented with ModusToolbox/WICED)
- `host/` - TypeScript host-side tooling for DFU, provisioning, and Home Assistant integration
- `docs/` - Project plan and remaining tasks checklist

## Build Commands

All commands run from repository root:

```bash
npm run typecheck   # Type check host TypeScript (no emit)
npm run lint        # Strict linting for unused vars/params
npm run test        # Compile and run tests
```

## Testing

Uses Node.js native `node:test` module with ESM-style imports:

```bash
npm run test                    # Run all tests
node --test dist/test/dfu.js    # Run single test file (after compile)
```

Test files are in `host/test/` and compiled to `dist/test/`.

## Architecture

### Host Tooling (TypeScript)

```
host/src/
├── firmware/           # Device abstractions
│   ├── device.ts       # AwairDevice controller
│   ├── bootloader/     # DFU session and boot logic
│   ├── networking/     # MQTT, REST, Wi-Fi provisioning
│   ├── sensors/        # Sensor interfaces and scheduler
│   └── storage/        # Flash key-value abstraction
├── loader/             # External tooling
│   ├── ble/            # BLE DFU client
│   └── wifi/           # Wi-Fi provisioning flow
└── shared/             # Utilities (CRC32, telemetry types)
```

**Key interfaces:**
- `SensorDriver`: Provides name, interval, and async read method
- `DfuSession`: Accepts firmware chunks, validates CRC32, returns complete image
- `MqttPublisher`: Formats telemetry for MQTT topics
- `RestRouter`: Routes requests to endpoint handlers

### Firmware (C/C++)

Currently stub code. Recommended approach: **WICED SDK or Infineon ModusToolbox** (provides Wi-Fi, BLE, RTOS). Alternative: FreeRTOS/Zephyr with ported CYW43 driver.

**Flash layout:**
- Bootloader region: 64-128KB (handles BLE DFU and recovery)
- Application region: main firmware with sensor tasks, networking, device logic

**Sensor timing:**
- Temp/humidity: ~1 second intervals
- VOC (SGP30): 2-10 second intervals, requires baseline save every ~12 hours to flash
- CO₂ (T6703): outputs every 2 seconds by default
- PM2.5 (HPMA115S0): active mode streaming, needs warm-up period

**Safety constraints:**
- Relay defaults to OFF on boot
- Implement relay toggle rate limiting to prevent rapid power cycling

## Bootloader and DFU

**DFU Mode Entry:** Button hold during reset, or flag set via loader app command.

**BLE DFU Protocol (modeled on Nordic Secure DFU):**
1. Bootloader advertises custom GATT service (e.g., "AwairDFU" UUID)
2. Loader sends "start DFU" command
3. Firmware streamed in ~512-byte chunks via BLE characteristic
4. Bootloader writes chunks to application flash region
5. CRC32 validation after transfer
6. "Validate & reboot" command triggers boot to new firmware
7. On failure: bootloader stays in DFU mode for retry (no brick risk)

**Initial Flash Options:**
1. SWD programmer (recommended) - requires opening device
2. DNS hijack of `ota.awair.is` (complex, unreliable)
3. BLE exploit in setup mode (requires reverse engineering)

## Loader App (iOS/Mac)

Recommended: **Swift/SwiftUI with Mac Catalyst** for single codebase covering iPhone and Mac via CoreBluetooth.

**Workflow:**
1. Scan for BLE advertisement ("GlowC-DFU" or custom UUID)
2. Connect and display device info/firmware version
3. Select firmware binary, stream in chunks with progress
4. Send validate & reboot command
5. After DFU: provision Wi-Fi credentials via BLE (device advertises Provisioning service on first boot)

## Integration Points

**MQTT Topics:**
- `openawair/{deviceId}/telemetry` - Sensor readings (JSON)
- `openawair/{deviceId}/availability` - Online/offline status
- `homeassistant/sensor/{id}/{sensor}/config` - HA MQTT Discovery

**REST Endpoints:**
- `GET /air-data/latest` - JSON with all sensor values (compatible with original Awair local API)
- Control endpoints for relay and LED color

**Home Assistant:** Firmware sends MQTT Discovery config messages on first connect for auto-entity creation.

## Development Notes

- TypeScript compiles to `dist/` as CommonJS
- Host abstractions define firmware behavior contracts before C implementation
- SGP30 requires ~24 hours to auto-calibrate; baseline must persist across reboots
- Firmware should auto-detect device type (Glow C vs Element) by probing for CO₂ sensor
- RGB LED can indicate status: blinking blue (Wi-Fi waiting), solid green (normal), red (error)

## Task Management

Tasks are managed as individual PRD (Product Requirements Document) files in `docs/tasks/`.

### Task Directory Structure

```
docs/tasks/
├── README.md           # Task index and workflow documentation
├── *.md                # Pending tasks (not yet started)
├── working/            # Tasks currently in progress
├── in-review/          # Tasks needing code review or manual validation
└── done/               # Completed tasks
```

### Task Lifecycle

1. **Pending** (`docs/tasks/`): Task defined but not started
2. **Working** (`docs/tasks/working/`): Task actively being implemented
3. **In Review** (`docs/tasks/in-review/`): Awaiting code review or validation
4. **Done** (`docs/tasks/done/`): Fully completed and verified

### PRD Format

Each task follows a standardized PRD format with sections:
- **Overview**: Problem, impact, context
- **Out of Scope**: What's explicitly NOT included
- **Solution**: Approach, user stories, implementation notes
- **Technical Requirements**: Constraints, dependencies, code references
- **Acceptance Criteria**: Checkbox success criteria
- **Open Questions**: Unknowns to investigate
- **AI Metadata**: Machine-readable task properties (complexity, phase, status)

### Task Index by Phase

**Phase 1 - Firmware Foundation (Blocking):**
- PRD-001 to PRD-006: Hardware validation, dev environment, peripherals, sensors, storage, scheduler

**Phase 2 - Networking:**
- PRD-007 to PRD-011: Wi-Fi driver, provisioning, BLE stack, MQTT, REST

**Phase 3 - Device Features:**
- PRD-012 to PRD-014: Glow C features, Element features, shared features

**Phase 4 - Bootloader & OTA:**
- PRD-015 to PRD-020: Bootloader, DFU protocol, firmware validation, host tooling

**Phase 5 - Polish & Release:**
- PRD-021 to PRD-022: Testing, documentation

See `docs/tasks/README.md` for the complete task index with dependency markers.

## Legacy Task Checklist

For a condensed checklist view, see `docs/remaining-tasks.md`.
