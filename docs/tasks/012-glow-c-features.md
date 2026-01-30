# PRD-012: Glow C Device Features

## Overview

### The Problem
The Glow C has unique hardware features (RGB LED, relay, PIR motion sensor) that are not yet implemented. Without these features, the device cannot provide its full functionality as a smart nightlight and air quality-triggered smart plug.

### Why It Matters
- **User Impact**: Users expect the nightlight and smart plug features that made Glow C unique
- **Business Impact**: Full feature restoration increases value proposition
- **Technical Impact**: GPIO control and PWM are foundation for device interaction

### Context
The Glow C is a compact plug-in unit with:
- RGB LED nightlight (color indicates air quality, motion-triggered)
- Relay for smart plug control (can power on/off connected device)
- PIR motion sensor (triggers nightlight in dark conditions)

## Out of Scope

The following are explicitly NOT part of this issue:
- Element-specific features (display, ambient light sensor)
- Network features (MQTT, REST)
- Sensor driver implementation
- Bootloader functionality

## Solution

### Approach
1. Implement RGB LED color control using PWM
2. Implement LED brightness control
3. Add LED status patterns (provisioning, normal, error)
4. Implement relay control with safety rate limiting
5. Enforce relay default-OFF state on boot
6. Implement PIR motion sensor polling
7. Add nightlight automation (LED on when motion + dark)
8. Expose relay and LED as controllable via MQTT and REST

### User Stories
- **US-1**: As a user, I want the LED color to show air quality at a glance
- **US-2**: As a user, I want the nightlight to turn on when I walk by
- **US-3**: As a user, I want to control the smart plug from Home Assistant

### Key Implementation Notes
- RGB colors: Green (good), Yellow (moderate), Red (poor air quality)
- Status LED: Blinking blue (provisioning), solid green (normal), red (error)
- Relay rate limiting: max 10 toggles per minute to prevent damage
- Motion + ambient light logic for nightlight (may need light sensor or time-based)
- MQTT topic: `openawair/{deviceId}/relay/set` for control
- REST endpoint: `POST /api/v1/relay`

## Technical Requirements

### Constraints
- **Must implement**: PWM for LED brightness (not just on/off)
- **Must implement**: Relay rate limiting for safety
- **Must enforce**: Relay OFF state on any boot/reset
- **Must expose**: Relay as Home Assistant switch entity

### Dependencies
- **Blocked by**: STM32 peripheral init (PRD-003), MQTT (PRD-010), REST (PRD-011)
- **Blocks**: Full Glow C functionality
- **Related**: Shared device features (PRD-014)

### Code References
- Files to create: `firmware/src/device/led.c`, `firmware/src/device/relay.c`
- Files to create: `firmware/src/device/motion.c`, `firmware/src/device/nightlight.c`
- Files to create: `firmware/include/device/*.h`

## Acceptance Criteria

### RGB LED
- [ ] PWM control for R, G, B channels
- [ ] Brightness adjustable 0-100%
- [ ] Color mapping: Green (VOC < 100), Yellow (100-300), Red (> 300)
- [ ] Status patterns: blink blue (provisioning), solid green (connected), red (error)
- [ ] LED controllable via MQTT (`openawair/{id}/led/set` with `{"color": "#RRGGBB", "brightness": 0-100}`)
- [ ] LED controllable via REST (`POST /api/v1/led`)

### Relay
- [ ] Relay toggles connected load on/off
- [ ] Default state is OFF on boot (verified with multimeter)
- [ ] Rate limiting: max 10 toggles per minute
- [ ] MQTT control: `openawair/{id}/relay/set` with `{"state": "on"|"off"}`
- [ ] REST control: `POST /api/v1/relay` with `{"state": "on"|"off"}`
- [ ] Home Assistant discovers relay as switch entity
- [ ] Relay state reported in telemetry

### Motion Sensor
- [ ] PIR sensor polling detects motion
- [ ] Motion events trigger callback
- [ ] Debounce prevents rapid triggering (1 second cooldown)

### Nightlight
- [ ] LED turns on when motion detected
- [ ] Nightlight respects ambient light (only activates in dark) or time-based
- [ ] Auto-off after configurable timeout (default 30 seconds)
- [ ] Nightlight can be disabled via configuration

## Open Questions

- **Q1**: Is there an ambient light sensor on Glow C, or should we use time-based logic?
  - Status: To investigate during hardware validation
  - Decision: TBD - use time-based as fallback

- **Q2**: What PWM frequency is appropriate for the LED?
  - Status: To determine
  - Decision: 1kHz suggested for smooth dimming

---

## AI Metadata

```json
{
  "taskId": "PRD-012",
  "complexity": "moderate",
  "phase": 5,
  "isBlocking": false,
  "estimatedEffort": "3-4 days",
  "category": "device-features",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
