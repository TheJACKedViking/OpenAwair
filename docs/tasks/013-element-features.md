# PRD-013: Element Device Features

## Overview

### The Problem
The Awair Element has unique hardware features (dot-matrix LED display, ambient light sensor) that are not yet implemented. Without these features, users cannot see air quality information directly on the device.

### Why It Matters
- **User Impact**: The display is a key feature that shows air quality at a glance
- **Business Impact**: Display functionality differentiates Element from other monitors
- **Technical Impact**: Display driver requires understanding the specific LED matrix controller

### Context
The Awair Element is a tabletop monitor with:
- Dot-matrix LED display showing air quality scores and values
- Ambient light sensor for automatic brightness adjustment
- Additional sensors (PM2.5, CO₂) compared to Glow C

## Out of Scope

The following are explicitly NOT part of this issue:
- Glow C-specific features (relay, PIR, RGB nightlight)
- Sensor driver implementation (separate PRD)
- Network features
- Complex animations or graphics

## Solution

### Approach
1. Identify and implement display driver for the LED matrix controller
2. Create basic character/number rendering
3. Implement display rendering for air quality scores
4. Implement ambient light sensor driver
5. Add automatic brightness adjustment based on ambient light
6. Implement display sleep mode for nighttime

### User Stories
- **US-1**: As a user, I want to see my air quality score on the display
- **US-2**: As a user, I want the display to dim automatically at night

### Key Implementation Notes
- Display likely uses a common LED matrix controller (investigation needed)
- Simple numeric display for scores and values is MVP
- Ambient light sensor determines display brightness
- Sleep mode: display off or minimal between configurable hours
- Consider showing individual sensor values in rotation

## Technical Requirements

### Constraints
- **Must identify**: Specific LED matrix controller IC
- **Must implement**: At least numeric rendering (0-9)
- **Must implement**: Brightness control (0-100%)
- **Must implement**: Auto-brightness based on ambient light

### Dependencies
- **Blocked by**: Hardware validation (PRD-001), STM32 peripheral init (PRD-003)
- **Blocks**: Full Element functionality
- **Related**: Sensor drivers (PRD-004), Shared features (PRD-014)

### Code References
- Files to create: `firmware/src/device/display.c`, `firmware/src/device/ambient_light.c`
- Files to create: `firmware/include/device/display.h`

## Acceptance Criteria

### Ambient Light Sensor
- [ ] Light sensor driver reads ambient light level
- [ ] Light level mapped to 0-100% brightness value
- [ ] Sensor readings available via API

### Display Driver
- [ ] Display controller identified and initialized
- [ ] Can clear display
- [ ] Can set individual pixels (if dot-matrix)
- [ ] Brightness controllable via PWM or controller register

### Display Rendering
- [ ] Numbers 0-9 rendered correctly
- [ ] Air quality score displayed (0-100 or similar)
- [ ] Individual sensor values can be shown (temp, humidity, VOC, CO₂, PM2.5)
- [ ] Value rotation mode: cycle through readings every few seconds

### Auto Brightness
- [ ] Display brightness adjusts based on ambient light
- [ ] Minimum brightness setting (not completely off in dark)
- [ ] Update rate appropriate (not flickering)

### Sleep Mode
- [ ] Display can be put to sleep (off or minimal)
- [ ] Sleep hours configurable (e.g., 10pm - 6am)
- [ ] Manual wake via button or motion (if sensor available)

## Open Questions

- **Q1**: What LED matrix controller does the Element use?
  - Status: To investigate during hardware validation
  - Decision: TBD - may need oscilloscope/logic analyzer

- **Q2**: Should we support custom display messages?
  - Status: To determine
  - Decision: Nice to have for future; not MVP

---

## AI Metadata

```json
{
  "taskId": "PRD-013",
  "complexity": "complex",
  "phase": 5,
  "isBlocking": false,
  "estimatedEffort": "4-5 days",
  "category": "device-features",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
