# PRD-014: Shared Device Features

## Overview

### The Problem
Both Glow C and Element need common functionality like air quality score calculation, configurable alert thresholds, and thermal validation. These features apply across device models.

### Why It Matters
- **User Impact**: Air quality score provides easy-to-understand summary
- **Business Impact**: Consistent behavior across models simplifies support
- **Technical Impact**: Shared code reduces maintenance burden

### Context
Both devices share the need for:
- Calculated air quality score from raw sensor values
- Configurable thresholds for alerts
- Validated thermal behavior for always-on operation
- Consistent state management

## Out of Scope

The following are explicitly NOT part of this issue:
- Device-specific features (LED, display, relay)
- Network implementation
- Sensor drivers
- Bootloader

## Solution

### Approach
1. Design air quality score algorithm based on industry standards (AQI or similar)
2. Implement configurable thresholds for each sensor type
3. Create alert trigger system for threshold violations
4. Validate thermal behavior during extended operation
5. Implement device state machine (boot, provisioning, normal, error)

### User Stories
- **US-1**: As a user, I want a simple score that tells me if air quality is good or bad
- **US-2**: As a user, I want alerts when specific sensors exceed my thresholds

### Key Implementation Notes
- Score calculation can follow EPA AQI or simplified scale (0-100)
- Thresholds stored in flash configuration
- Alerts published via MQTT and/or trigger LED color
- Thermal testing ensures device doesn't overheat in enclosure

## Technical Requirements

### Constraints
- **Must support**: Configurable thresholds per sensor type
- **Must implement**: Consistent state machine across models
- **Should implement**: AQI-compatible score calculation

### Dependencies
- **Blocked by**: Sensor drivers (PRD-004), Storage (PRD-005)
- **Blocks**: Alert features, display score rendering
- **Related**: Glow C features (PRD-012), Element features (PRD-013)

### Code References
- Files to create: `firmware/src/device/aqi.c`, `firmware/src/device/alerts.c`
- Files to create: `firmware/src/device/state.c`
- Files to create: `firmware/include/device/aqi.h`, `firmware/include/device/state.h`

## Acceptance Criteria

### Air Quality Score
- [ ] Score calculated from available sensors (VOC primary, PM2.5 if available)
- [ ] Score range defined (e.g., 0-100 or EPA AQI categories)
- [ ] Score calculation documented with formula
- [ ] Score included in telemetry payload

### Configurable Thresholds
- [ ] Thresholds configurable for: temperature, humidity, VOC, CO₂, PM2.5
- [ ] Default thresholds based on health guidelines
- [ ] Thresholds stored in flash
- [ ] Thresholds configurable via MQTT or REST API

### Alert System
- [ ] Alerts triggered when sensor exceeds threshold
- [ ] Alerts published to MQTT topic `openawair/{id}/alerts`
- [ ] Alert includes sensor name, value, and threshold
- [ ] Hysteresis prevents alert flapping (e.g., 10% band)

### Device State Machine
- [ ] States: BOOT, PROVISIONING, CONNECTING, NORMAL, ERROR
- [ ] State transitions logged
- [ ] Current state available via REST API
- [ ] State reflected in LED status (where applicable)

### Thermal Validation
- [ ] Device operates continuously for 72+ hours without overheating
- [ ] Internal temperature (if measurable) stays within safe range
- [ ] No thermal throttling or sensor drift observed

## Open Questions

- **Q1**: Should we use EPA AQI or a simplified 0-100 scale?
  - Status: To determine
  - Decision: Suggest simplified scale with mapping to AQI categories

- **Q2**: What are appropriate default thresholds?
  - Status: To research health guidelines
  - Decision: TBD based on WHO/EPA recommendations

---

## AI Metadata

```json
{
  "taskId": "PRD-014",
  "complexity": "moderate",
  "phase": 5,
  "isBlocking": false,
  "estimatedEffort": "2-3 days",
  "category": "device-features",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
