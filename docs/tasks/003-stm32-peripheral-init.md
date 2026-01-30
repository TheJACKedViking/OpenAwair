# PRD-003: STM32 Peripheral Initialization

## Overview

### The Problem
The STM32F412 MCU requires proper initialization of its clock tree, GPIO pins, I²C buses, UART ports, and PWM timers before any sensors or outputs can be used. Without this foundation, no hardware communication is possible.

### Why It Matters
- **User Impact**: No sensor readings or device control possible without peripheral init
- **Business Impact**: Critical dependency for all hardware-interfacing features
- **Technical Impact**: Clock configuration affects all peripheral timing; incorrect setup causes silent failures

### Context
The Glow C and Element devices use I²C for temperature/humidity and VOC sensors, UART for CO₂ and PM2.5 sensors, GPIO for motion sensor input and relay control, and PWM for RGB LED brightness. All must be properly initialized.

## Out of Scope

The following are explicitly NOT part of this issue:
- Sensor driver implementation (separate PRDs)
- Application logic for sensors
- Network stack initialization
- Bootloader code

## Solution

### Approach
1. Configure STM32F412 clock tree for stable operation (HSE/HSI selection, PLL configuration)
2. Initialize I²C1 bus for sensor communication (400kHz standard)
3. Initialize UART for T6703 and HPMA115S0 sensors (9600 baud)
4. Configure GPIO pins for PIR motion sensor input (Glow C)
5. Configure GPIO/PWM for RGB LED output with PWM capability (Glow C)
6. Configure GPIO for relay control with pull-down for default-OFF state (Glow C)
7. Set up SysTick for delay functions and RTOS tick
8. Create HAL abstraction layer for portability

### User Stories
- **US-1**: As a firmware developer, I want initialized I²C so I can communicate with sensors
- **US-2**: As a firmware developer, I want GPIO configured so I can control outputs safely

### Key Implementation Notes
- Use STM32 HAL or LL libraries for peripheral access
- Relay GPIO must have external pull-down or be configured as push-pull with default LOW
- I²C should support clock stretching for sensor compatibility
- UART RX should use DMA or interrupts to avoid data loss

## Technical Requirements

### Constraints
- **Must use**: STM32 HAL or LL peripheral libraries
- **Must configure**: I²C at 400kHz for sensor compatibility
- **Must configure**: UART at 9600 8N1 for HPMA115S0
- **Must ensure**: Relay defaults to OFF state on any reset condition

### Dependencies
- **Blocked by**: Development environment setup (PRD-002)
- **Blocks**: All sensor drivers, device features
- **Related**: Sensor driver implementation (PRD-004 through PRD-009)

### Code References
- Files to create: `firmware/src/hal/clock.c`, `firmware/src/hal/gpio.c`
- Files to create: `firmware/src/hal/i2c.c`, `firmware/src/hal/uart.c`
- Files to create: `firmware/src/hal/pwm.c`
- Files to create: `firmware/include/hal/*.h`

## Acceptance Criteria

- [ ] Clock tree configured and running at target frequency (verify with scope or debugger)
- [ ] I²C1 initialized at 400kHz, responds to device scan
- [ ] UART initialized at 9600 8N1, can send/receive test bytes
- [ ] GPIO for PIR configured as input with interrupt capability
- [ ] GPIO for relay configured as output, defaults to LOW on reset
- [ ] PWM channels for RGB LED initialized, can set duty cycle 0-100%
- [ ] SysTick providing 1ms resolution for delays
- [ ] HAL abstraction allows easy testing and portability
- [ ] All type checks passing (`npm run typecheck` for any TypeScript wrappers)
- [ ] Code documented with pin assignments and clock frequencies

## Open Questions

- **Q1**: Which I²C bus is connected to sensors on the PCB?
  - Status: To investigate during hardware validation
  - Decision: TBD - assume I2C1

- **Q2**: What are the exact GPIO pin assignments for relay and LEDs?
  - Status: To investigate during hardware validation
  - Decision: TBD - will need PCB tracing

---

## AI Metadata

```json
{
  "taskId": "PRD-003",
  "complexity": "moderate",
  "phase": 1,
  "isBlocking": true,
  "estimatedEffort": "2-3 days",
  "category": "firmware-bringup",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
