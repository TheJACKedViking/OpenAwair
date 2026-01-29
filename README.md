# OpenAwair

OpenAwair is an open-source project to restore local-first functionality to Awair Glow C and Awair Element devices. The repository is split into embedded firmware (C/C++) and host-side tooling (TypeScript) to reflect the device architecture.

## Structure

- `firmware/`: C/C++ firmware source for the STM32F412-based devices.
- `host/`: TypeScript tooling for Home Assistant integration, DFU flows, and configuration workflows.
- `docs/`: Project plan and remaining tasks.

## Host tooling scripts

```bash
npm run typecheck
npm run lint
npm run test
```

## Next steps

- Build the ModusToolbox/WICED-based firmware under `firmware/`.
- Integrate the host tooling with real BLE transport and MQTT connectivity.
- Work through the remaining tasks checklist in `docs/remaining-tasks.md`.
