# Remaining Tasks for OpenAwair

This checklist captures the remaining work needed to fully deliver the custom firmware and host-side tooling objectives described in the project plan.

**Legend:** Tasks marked with ⚠️ are blocking dependencies for other work.

---

## Firmware Bring-up (C/C++)

### Hardware Validation
- [ ] ⚠️ Validate SWD access on Glow C device and document test pad locations
- [ ] Check MCU readout protection status; document erase procedure if protected
- [ ] Establish board-specific flashing procedures with ST-Link or J-Link
- [ ] Photograph PCB and create pinout reference for community documentation
- [ ] Verify 3.3V power rail access for bench testing without mains power

### Development Environment Setup
- [ ] ⚠️ Initialize ModusToolbox/WICED workspace with Sterling-EWB board support
- [ ] Configure linker scripts for flash layout (64-128KB bootloader + application)
- [ ] Set up ARM GCC toolchain and build system (CMake or Makefile)
- [ ] Create debug configuration for SWD with serial output
- [ ] Establish RTOS selection (WICED ThreadX or FreeRTOS) and basic task structure

### STM32 Peripheral Initialization
- [ ] ⚠️ Implement clock tree configuration for STM32F412
- [ ] Initialize I²C bus for sensor communication (SHTC3/SHT30, SGP30)
- [ ] Initialize UART for T6703 CO₂ and HPMA115S0 PM2.5 sensors
- [ ] Configure GPIO for PIR motion sensor input (Glow C)
- [ ] Configure GPIO/PWM for RGB LED output (Glow C)
- [ ] Configure GPIO for relay control with default-OFF state (Glow C)
- [ ] Set up system tick and delay functions

### Sensor Driver Implementation
- [ ] ⚠️ Implement SHTC3 I²C driver with temperature/humidity read (Glow C)
- [ ] ⚠️ Implement SHT30 I²C driver with temperature/humidity read (Element)
- [ ] ⚠️ Implement SGP30 I²C driver with TVOC and eCO₂ read
- [ ] Implement SGP30 baseline calibration read/write (save every ~12 hours)
- [ ] Implement T6703 UART/I²C driver for CO₂ readings (Element)
- [ ] Implement HPMA115S0 UART driver for PM2.5 readings (Element)
- [ ] Add HPMA115S0 fan control and warm-up period handling
- [ ] Add sensor error detection and retry logic for I²C/UART failures
- [ ] Implement device model auto-detection by probing for CO₂ sensor

### Storage and Configuration
- [ ] ⚠️ Implement flash storage driver for STM32F412 internal flash
- [ ] Create key-value storage abstraction with wear leveling
- [ ] Implement SGP30 baseline persistence (critical for VOC accuracy)
- [ ] Store Wi-Fi credentials in flash
- [ ] Store MQTT broker configuration
- [ ] Store device metadata (name, location, custom settings)
- [ ] Add flash corruption detection and recovery

### Real-time Scheduler
- [ ] Build RTOS-based task scheduler for sensor sampling
- [ ] Implement staggered sensor polling to prevent I/O bus contention
- [ ] Configure sampling intervals: temp/humidity ~1s, VOC 2-10s, CO₂ 2s
- [ ] Implement telemetry aggregation task
- [ ] Add watchdog timer for crash recovery

---

## Networking Stack Integration

### CYW4343W Wi-Fi Driver
- [ ] ⚠️ Integrate CYW4343W Wi-Fi driver from WICED SDK
- [ ] Implement Wi-Fi station mode connection with stored credentials
- [ ] Implement DHCP client for IP address acquisition
- [ ] Add static IP configuration option
- [ ] Implement Wi-Fi reconnection logic with exponential backoff
- [ ] Add Wi-Fi status monitoring and error handling

### Wi-Fi Provisioning
- [ ] ⚠️ Implement BLE-based Wi-Fi provisioning service
- [ ] Define BLE GATT characteristics for SSID/password input
- [ ] Implement AP fallback mode (captive portal) for headless provisioning
- [ ] Add credential validation before storage
- [ ] Implement provisioning timeout and error feedback via LED
- [ ] Support credential update without full reflash

### BLE Stack Integration
- [ ] ⚠️ Integrate CYW4343W BLE driver from WICED SDK
- [ ] Implement BLE advertising for DFU mode and provisioning
- [ ] Define custom GATT service UUIDs for OpenAwair
- [ ] Implement BLE connection management and security

### MQTT Client
- [ ] ⚠️ Integrate lightweight MQTT client library (e.g., lwMQTT or WICED MQTT)
- [ ] Implement broker connection with configurable address/port
- [ ] Implement username/password authentication
- [ ] Implement telemetry publishing to `openawair/{deviceId}/telemetry`
- [ ] Implement availability publishing to `openawair/{deviceId}/availability`
- [ ] Implement Last Will Testament for offline detection
- [ ] Add QoS 1 support for reliable delivery
- [ ] Implement reconnection logic on broker disconnect
- [ ] Publish Home Assistant MQTT Discovery payloads on first connect

### REST/HTTP Server
- [ ] Integrate lightweight HTTP server (e.g., WICED httpd or lwIP httpd)
- [ ] Implement `GET /air-data/latest` endpoint (Awair-compatible JSON format)
- [ ] Implement `GET /api/v1/metrics` endpoint with full sensor data
- [ ] Implement `POST /api/v1/relay` endpoint for relay control (Glow C)
- [ ] Implement `GET /api/v1/status` endpoint for device health
- [ ] Add optional HTTP Basic Auth for local network security
- [ ] Implement request/response logging for debugging

---

## Device Features

### Glow C Specific
- [ ] Implement RGB LED color control (green/yellow/red for air quality)
- [ ] Implement LED brightness control via PWM
- [ ] Add LED status indicators: blinking blue (provisioning), solid green (normal), red (error)
- [ ] Implement relay control with safety rate limiting (max toggles/minute)
- [ ] Enforce relay default-OFF state on boot
- [ ] Implement PIR motion sensor polling
- [ ] Add nightlight automation: LED on when motion detected in dark
- [ ] Expose relay as controllable switch via MQTT and REST

### Element Specific
- [ ] Implement ambient light sensor driver
- [ ] Implement dot-matrix LED display driver
- [ ] Create display rendering for air quality score or sensor values
- [ ] Add display brightness control based on ambient light
- [ ] Implement display sleep mode for nighttime

### Shared Features
- [ ] Implement air quality score calculation algorithm (optional)
- [ ] Add configurable sensor thresholds for alerts
- [ ] Validate thermal behavior for always-on operation
- [ ] Implement low-power standby mode (if applicable)

---

## Bootloader and OTA Updates

### Bootloader Implementation (C)
- [ ] ⚠️ Create bootloader project with separate flash region (64-128KB)
- [ ] Implement boot decision logic: check DFU flag or button hold
- [ ] Implement jump-to-application code
- [ ] Add firmware validity check (CRC or signature) before boot
- [ ] Implement fail-safe recovery: stay in DFU if app corrupted

### BLE DFU Protocol (Device Side)
- [ ] ⚠️ Implement BLE DFU GATT service with control and data characteristics
- [ ] Implement "start DFU" command handler
- [ ] Implement chunked firmware reception (~512 byte chunks)
- [ ] Write received chunks to application flash region
- [ ] Implement CRC32 verification after complete transfer
- [ ] Implement "validate & reboot" command handler
- [ ] Add transfer timeout and abort handling
- [ ] Implement retry mechanism for failed chunks

### Firmware Validation
- [ ] Add firmware version header format
- [ ] Implement version compatibility check before flash
- [ ] Consider firmware signature verification (optional security)
- [ ] Implement rollback support: keep previous firmware as backup

---

## Host-side Tooling (TypeScript)

### Replace Stub Implementations
- [ ] Note: TypeScript sensor stubs exist for contract testing only
- [ ] Document that real sensor I/O happens in C firmware, not TypeScript
- [ ] Update TypeScript stubs to match actual firmware behavior when available

### BLE Transport Implementation
- [ ] ⚠️ Implement DfuTransport interface with CoreBluetooth (macOS/iOS)
- [ ] Implement DfuTransport interface with Web Bluetooth (browser)
- [ ] Add device discovery and filtering by service UUID
- [ ] Implement BLE connection management and error handling
- [ ] Add connection timeout and retry logic
- [ ] Implement MTU negotiation for optimal chunk size

### Wi-Fi Provisioning Client
- [ ] Implement WifiProvisioner interface with BLE transport
- [ ] Add SSID scanning support (if device exposes this)
- [ ] Implement credential encryption for BLE transmission (optional)
- [ ] Add provisioning status feedback and error messages

### MQTT Integration (Host)
- [ ] Integrate MQTT client library (e.g., mqtt.js)
- [ ] Implement subscription to device telemetry for monitoring
- [ ] Add device status dashboard component
- [ ] Implement relay control commands via MQTT

### CLI Application
- [ ] Create CLI entry point with command structure
- [ ] Implement `flash` command for BLE DFU firmware upload
- [ ] Implement `provision` command for Wi-Fi setup
- [ ] Implement `status` command to query device via REST
- [ ] Implement `config` command for device settings
- [ ] Add progress bars and user-friendly output
- [ ] Package as standalone executable (pkg or similar)

### Desktop/Mobile UI (Optional)
- [ ] Design simple UI for device discovery and management
- [ ] Implement firmware file selection and upload
- [ ] Implement Wi-Fi configuration form
- [ ] Add device status monitoring view
- [ ] Consider Electron (desktop) or React Native (mobile)

---

## Testing

### Unit Tests (TypeScript)
- [ ] Add DFU session error scenario tests (CRC mismatch, incomplete transfer)
- [ ] Add MQTT availability message tests
- [ ] Add REST router error handling tests
- [ ] Add scheduler timing tests
- [ ] Add bootloader decision logic tests
- [ ] Add DfuClient retry and timeout tests

### Integration Tests
- [ ] Create mock BLE transport for DfuClient testing
- [ ] Add end-to-end provisioning flow tests
- [ ] Add MQTT client integration tests with test broker
- [ ] Add REST endpoint integration tests

### Firmware Tests
- [ ] Set up Unity or similar C test framework
- [ ] Add sensor driver unit tests with I²C/UART mocks
- [ ] Add flash storage read/write tests
- [ ] Add scheduler timing verification tests
- [ ] Add bootloader CRC validation tests

### Hardware Validation
- [ ] Create sensor accuracy validation procedure
- [ ] Compare readings with reference sensors
- [ ] Perform multi-day burn-in stability tests
- [ ] Test Wi-Fi reconnection after router restart
- [ ] Test MQTT reconnection after broker restart
- [ ] Test DFU recovery after interrupted transfer
- [ ] Validate relay and LED functionality
- [ ] Test motion sensor response (Glow C)

---

## Documentation

### Technical Documentation
- [ ] Document flash memory map and partition layout
- [ ] Document BLE service and characteristic UUIDs
- [ ] Document MQTT topic structure and payload formats
- [ ] Document REST API endpoints and response schemas
- [ ] Create firmware build instructions for contributors

### User Documentation
- [ ] Create hardware teardown guide with photos
- [ ] Document SWD connection points and flashing procedure
- [ ] Write initial setup guide (flash + provision + HA integration)
- [ ] Create Home Assistant configuration examples
- [ ] Write troubleshooting guide (LED codes, common issues)
- [ ] Create FAQ for community questions

### Community
- [ ] Prepare GitHub release with pre-built binaries
- [ ] Write announcement post for Home Assistant Community forum
- [ ] Write announcement post for r/Awair subreddit
- [ ] Create issue templates for bug reports and feature requests
- [ ] Set up discussions for community support

---

## Implementation Priority

### Phase 1: Firmware Foundation (Blocking)
1. Hardware validation and SWD access
2. ModusToolbox/WICED environment setup
3. STM32 peripheral initialization
4. At least one sensor driver working (SHTC3 or SHT30)
5. Serial debug output for development

### Phase 2: Connectivity
1. Wi-Fi driver integration and connection
2. Basic MQTT publishing (hardcoded broker)
3. BLE provisioning for Wi-Fi credentials
4. REST endpoint for sensor data

### Phase 3: Full Sensor Support
1. All sensor drivers implemented
2. SGP30 baseline persistence
3. Sensor scheduler with proper timing
4. Home Assistant MQTT Discovery

### Phase 4: Bootloader and OTA
1. Bootloader with BLE DFU
2. Host BLE transport implementation
3. CLI for flashing and provisioning
4. Recovery mode testing

### Phase 5: Polish and Release
1. Device features (LED, relay, display)
2. Comprehensive testing
3. Documentation
4. Community release

---

## Technical Reference

### Development Environment Notes

**WICED SDK Status:** The WICED platform is marked as NRFD (Not Recommended for New Designs) by Infineon. Consider using:
- [ModusToolbox](https://www.infineon.com/cms/en/design-support/tools/sdk/modustoolbox-software/) with STM32CubeIDE for MCU configuration
- The [Cypress BTSTACK](https://community.infineon.com/t5/AIROC-Bluetooth/Classic-bluetooth-api-using-cyw4343w-in-LAIRD-EWB/td-p/357523) can be ported to STM32 hosts
- CYW4343W and CYW43438 are the same chip in different packages

### SGP30 Calibration Requirements

Based on [Sensirion's driver integration guide](https://github.com/Sensirion/embedded-sgp):
- **Initial calibration:** 12 hours of continuous operation before baseline is valid
- **Measurement interval:** Must read every 1 second for dynamic baseline compensation
- **Baseline storage:** Save approximately once per hour after initial calibration
- **Baseline validity:** Stored baseline valid for maximum 7 days when sensor is off
- **Startup behavior:** First 15 seconds return fixed values (400ppm CO₂eq, 0ppb TVOC)
- **Humidity compensation:** Use `sgp30_set_absolute_humidity()` for improved accuracy

### HPMA115S0 UART Protocol

Based on [Honeywell datasheet](https://prod-edam.honeywell.com/content/dam/honeywell-edam/sps/siot/en-us/products/sensors/particulate-matter-sensors-hpm-series/documents/sps-siot-particulate-hpm-series-datasheet-32322550-ciid-165855.pdf) and [community drivers](https://github.com/felixgalindo/HPMA115S0):
- **Serial:** UART 9600 8N1 3.3V TTL
- **Pinout:** Pin 6 = TX, Pin 7 = RX (1.25mm PicoBlade connector)
- **Output:** PM2.5 and PM10 as unsigned short integers
- **Checksum:** `sum(message[3:-1]) % 0x100`
- **Accuracy:** ±15% for PM2.5, 10-year service life

### BLE DFU Service UUIDs

Based on [Nordic Secure DFU specification](https://infocenter.nordicsemi.com/topic/com.nordic.infocenter.sdk5.v15.0.0/lib_dfu_transport_ble.html):
- **Secure DFU Service UUID:** `0xFE59` (Bluetooth SIG registered)
- **DFU Control Point:** UUID `0x0001` on Nordic base
- **DFU Packet:** UUID `0x0002` on Nordic base
- **Maximum MTU:** 256 bytes (253 bytes usable for DFU Packet)
- **Byte order:** Little endian (LSB first)

### Home Assistant MQTT Discovery

Based on [Home Assistant MQTT Discovery documentation](https://www.home-assistant.io/integrations/mqtt/):
- **Topic format:** `<prefix>/<component>/[<node_id>/]<object_id>/config`
- **Default prefix:** `homeassistant`
- **Required fields:** `unique_id` (must be unique across all entities)
- **Payload:** JSON dictionary with component-specific configuration
- **Retain:** Discovery messages should use retain flag

**Example sensor config topic:** `homeassistant/sensor/openawair_ABC123_temperature/config`

**Example payload:**
```json
{
  "name": "Temperature",
  "unique_id": "openawair_ABC123_temp",
  "device_class": "temperature",
  "unit_of_measurement": "°C",
  "state_topic": "openawair/ABC123/telemetry",
  "value_template": "{{ value_json.temperature }}",
  "device": {
    "identifiers": ["openawair_ABC123"],
    "name": "OpenAwair Glow C",
    "manufacturer": "OpenAwair",
    "model": "Glow C"
  }
}
```

### Useful Resources

- [Sensirion embedded-sgp drivers](https://github.com/Sensirion/embedded-sgp) - Official C drivers for SGP30
- [HPMA115S0 Arduino library](https://github.com/felixgalindo/HPMA115S0) - Reference for UART protocol
- [Nordic DFU documentation](https://infocenter.nordicsemi.com/topic/com.nordic.infocenter.sdk5.v17.1.0/lib_dfu_transport_ble.html) - BLE DFU protocol details
- [Infineon WICED forums](https://community.infineon.com/t5/Wi-Fi-Combo/ct-p/702) - CYW4343W development help
- [Laird Sterling-EWB documentation](https://www.ezurio.com/wireless-modules/wifi-modules-bluetooth/sterling-ewb-iot-module) - Module specifications
