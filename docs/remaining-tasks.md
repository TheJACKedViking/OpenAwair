# Remaining Tasks for OpenAwair

This checklist captures the remaining work needed to fully deliver the custom firmware and host-side tooling objectives described in the project plan.

## Firmware bring-up (C/C++)

- [ ] Validate SWD access, readout protection status, and establish board-specific flashing procedures.
- [ ] Initialize ModusToolbox/WICED workspace with board configuration, linker scripts, and startup code.
- [ ] Replace stub sensor drivers with hardware I²C/UART implementations and calibrations.
- [ ] Implement persistent storage for sensor baselines (SGP30) and device configuration.
- [ ] Build real-time scheduler for sensor sampling, telemetry aggregation, and device state updates.

## Networking and local APIs

- [ ] Integrate Wi-Fi provisioning over BLE and/or AP fallback for initial setup.
- [ ] Implement MQTT client and publish telemetry, availability, and Home Assistant discovery payloads.
- [ ] Implement REST server endpoints with health, metrics, and control routes.
- [ ] Add local auth or device pairing flow if needed for secure access.

## Device features

- [ ] Implement LED and relay logic for Glow C.
- [ ] Implement display, ambient light, and PM/CO₂ sensor workflows for Element.
- [ ] Add motion sensor handling and nighttime automation logic.
- [ ] Validate power modes and thermal behavior for always-on operation.

## Bootloader and OTA update

- [ ] Finalize BLE DFU protocol, chunk verification, retries, and fail-safe recovery mode.
- [ ] Add firmware signature or version checks to prevent incompatible flashes.
- [ ] Support OTA updates from host tooling with progress and rollback.

## Host-side tooling (TypeScript)

- [ ] Build BLE DFU transport adapter (CoreBluetooth, Web Bluetooth, or native bridge).
- [ ] Implement configuration updater workflows (Wi-Fi, device metadata, relay control).
- [ ] Add MQTT client integration for Home Assistant and local dashboards.
- [ ] Provide CLI or desktop UI for flashing and provisioning.

## Validation and documentation

- [ ] Perform multi-day stability tests for sensors, MQTT, and Wi-Fi reconnection.
- [ ] Validate Home Assistant discovery integration with live devices.
- [ ] Publish hardware teardown guides, flashing instructions, and troubleshooting steps.
- [ ] Coordinate community beta testing and collect device-specific feedback.
