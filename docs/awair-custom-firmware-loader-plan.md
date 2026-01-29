# Plan for Developing Custom Firmware and Loader for Awair Glow C and Awair Element

## Overview
Awair Glow C and Awair Element air quality monitors lost cloud and app support in 2022. This plan describes
how to restore their functionality by creating open-source firmware that exposes local sensor data over
MQTT or REST, plus a Bluetooth-based firmware loader for iOS and macOS. The goal is to enable fully
local, offline use of these devices.

## Hardware analysis and preparation

### Microcontroller and connectivity
* **Awair Element**: Laird Sterling-EWB module with an STM32F412 MCU and CYW4343W Wi-Fi/BLE chip.
* **Awair Glow C**: Likely the same or similar STM32F412 + CYW4343W architecture based on FCC listings.

### Onboard sensors and peripherals
**Awair Glow C**
* Sensirion SHTC3 temperature/humidity sensor (I²C)
* Sensirion SGP30 VOC sensor (I²C)
* PIR motion sensor (GPIO)
* RGB LED (GPIO/PWM)
* Relay for smart plug control (GPIO)

**Awair Element**
* Sensirion SHT30 temperature/humidity sensor (I²C)
* Sensirion SGP30 VOC sensor (I²C)
* Honeywell HPMA115S0 PM2.5 sensor (UART)
* Telaire T6703 CO₂ sensor (UART or I²C)
* Ambient light sensor and LED display

### Physical access and programming
* Carefully open the device and locate SWD pads for the STM32F412 (SWDIO, SWDCLK, NRST, GND, 3.3V).
* Connect an ST-Link/J-Link and verify whether readout protection is enabled.
* Use 3.3V power from the programmer or bench supply for safe, isolated flashing.

## Firmware development environment

### Recommended platform
* Use ModusToolbox/WICED SDK for Wi-Fi/BLE to avoid re-implementing wireless drivers.
* Application code in C/C++ using ARM GCC toolchain.

### Project layout
* **Bootloader** (64–128 KB): BLE DFU, recovery, validation
* **Main application**: sensors, networking, MQTT/REST, device logic

### Sensor drivers
* Use Sensirion reference drivers for SHTC3/SHT30 and SGP30.
* Implement UART drivers for HPMA115S0 and T6703 with proper warm-up and polling.
* Save SGP30 baseline in flash periodically (e.g., every ~12 hours).

## Device functionality

### Local sensor readings
* Gather sensor data on schedules appropriate to each sensor.
* Optionally compute AQI or publish raw values.

### Outputs and controls
* Glow C relay exposed as a controllable switch.
* RGB LED used for AQI or user-configurable states.
* Motion sensor logic can replicate the nightlight behavior.

### Networking
* Wi-Fi provisioning via BLE or AP fallback.
* DHCP by default, static config optional.

### Local APIs
* **MQTT**: publish individual topics and JSON payloads; support Home Assistant discovery.
* **REST**: lightweight read-only JSON endpoints for latest data and basic controls.

## Development timeline
1. Bring up board and Wi-Fi.
2. Implement sensors with UART/I²C drivers.
3. Add MQTT and REST server.
4. Integrate, stabilize, and validate.
5. Polish features (LEDs, relay logic, OTA flow).

## Firmware loader and OTA update

### Bootloader behavior
* Bootloader decides between main app or DFU mode (button or flash flag).
* BLE DFU service with custom GATT characteristics.
* Transfer firmware chunks, verify CRC, and boot into the new app.

### iOS/macOS loader app
* Built with Swift + CoreBluetooth, optionally using Mac Catalyst.
* Scan for DFU devices and upload firmware with progress UI.
* Support Wi-Fi provisioning post-flash via BLE.

### Initial flashing options
* **SWD flashing**: most reliable initial method.
* **OTA hijack**: possible but unreliable due to inactive servers.
* **BLE setup exploit**: requires reverse engineering, not guaranteed.

## Testing and validation
* Bench-test sensors and relay behavior.
* Run multi-day stability tests with Wi-Fi and MQTT reliability checks.
* Validate Home Assistant integration and MQTT discovery.
* Test DFU failure scenarios and Wi-Fi provisioning.
* Coordinate with community owners for Awair Element testing.

## Documentation and community release
* Publish firmware and loader source code, binaries, and flashing instructions.
* Provide step-by-step documentation for opening devices and SWD connections.
* Share Home Assistant configuration examples and troubleshooting guidance.
* Encourage community testing for additional Awair models and future features.

## Future enhancements
* Add full LED display support on Awair Element.
* Support additional Awair models with similar MCU architecture.
* Explore Matter/Thread support if feasible.

## Sources
* Awair discontinuation notice and community reports.
* Sensirion sensor specs (SHTC3/SHT30/SGP30).
* Sterling-EWB module specifications.
* Awair Glow C FCC filings and teardown notes.
* Awair Element community hardware docs.
* Awair Glow C disassembly guidance.
