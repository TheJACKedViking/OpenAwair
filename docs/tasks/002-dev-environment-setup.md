# PRD-002: Development Environment Setup

## Overview

### The Problem
No development environment exists for building firmware for the STM32F412 + CYW4343W platform. Without a working toolchain, board support package, and build system, no firmware code can be compiled or tested.

### Why It Matters
- **User Impact**: Delays all firmware features until environment is ready
- **Business Impact**: Critical path item - blocks all C/C++ development
- **Technical Impact**: Choice of SDK (WICED vs ModusToolbox) affects all future code structure

### Context
The Laird Sterling-EWB module is compatible with Cypress WICED SDK, but WICED is marked NRFD (Not Recommended for New Designs). ModusToolbox is the successor but may require additional porting effort. The RTOS choice (ThreadX vs FreeRTOS) also impacts code architecture.

## Out of Scope

The following are explicitly NOT part of this issue:
- Implementing any peripheral drivers
- Writing application code
- Sensor integration
- Network stack configuration

## Solution

### Approach
1. Install ModusToolbox and STM32CubeIDE
2. Create new project targeting STM32F412 MCU
3. Configure board support for Sterling-EWB module
4. Set up linker scripts with bootloader/application flash layout
5. Configure ARM GCC toolchain and CMake/Makefile build system
6. Create SWD debug configuration with serial output
7. Verify basic "blink LED" or serial output program compiles and runs
8. Select and configure RTOS (FreeRTOS recommended)

### Key Implementation Notes
- ModusToolbox may need custom board definition for Sterling-EWB
- Flash layout: 64-128KB bootloader region, remainder for application
- Serial debug output via UART for development logging
- Consider using STM32CubeIDE for MCU peripheral configuration, export to ModusToolbox

## Technical Requirements

### Constraints
- **Must use**: ARM GCC toolchain (arm-none-eabi-gcc)
- **Must use**: SWD for programming and debugging
- **Must support**: Both debug and release build configurations
- **Must preserve**: Compatibility with WICED SDK libraries for Wi-Fi/BLE

### Dependencies
- **Blocked by**: Hardware validation (PRD-001) - need confirmed SWD access
- **Blocks**: All firmware implementation tasks
- **Related**: STM32 peripheral initialization (PRD-003)

### Code References
- Files to create: `firmware/CMakeLists.txt` or `firmware/Makefile`
- Files to create: `firmware/linker/STM32F412.ld`
- Files to create: `firmware/src/startup_stm32f412.s`
- Output: Working build system that produces `.bin` and `.elf` files

## Acceptance Criteria

- [ ] ModusToolbox or equivalent IDE installed and configured
- [ ] STM32F412 target board support package configured
- [ ] Linker script defines bootloader region (64-128KB) and application region
- [ ] ARM GCC toolchain compiles C/C++ code without errors
- [ ] CMake or Makefile build system produces `.bin` and `.elf` outputs
- [ ] Debug configuration allows SWD connection and breakpoints
- [ ] Serial output (UART) working for debug logging
- [ ] Basic test program (LED blink or serial "Hello World") runs on hardware
- [ ] FreeRTOS or ThreadX integrated with basic task creation
- [ ] Build instructions documented in `firmware/README.md`

## Open Questions

- **Q1**: Should we use ModusToolbox or fall back to pure STM32CubeIDE?
  - Status: To investigate based on WICED SDK compatibility
  - Decision: TBD - prefer ModusToolbox for Wi-Fi/BLE library access

- **Q2**: FreeRTOS or ThreadX (WICED default)?
  - Status: To investigate
  - Decision: Lean toward FreeRTOS for open-source compatibility

---

## AI Metadata

```json
{
  "taskId": "PRD-002",
  "complexity": "complex",
  "phase": 1,
  "isBlocking": true,
  "estimatedEffort": "3-5 days",
  "category": "firmware-bringup",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
