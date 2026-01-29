# Firmware (C/C++)

This directory is reserved for the embedded firmware that will run on the STM32F412-based Awair devices.
The firmware implementation is intended to be written in C/C++ using ARM GCC and the ModusToolbox/WICED
SDK to access Wi-Fi/BLE drivers and peripherals.

## Recommended layout

- `include/`: Public headers for firmware modules.
- `src/`: Firmware source files (bootloader, sensors, networking, device logic).

## Next steps

- Initialize a ModusToolbox workspace and import the WICED SDK.
- Add board-specific configuration (pin maps, peripheral init, linker scripts).
- Implement sensor drivers and MQTT/REST endpoints.
