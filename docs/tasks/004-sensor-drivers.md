# PRD-004: Sensor Driver Implementation

## Overview

### The Problem
All five sensor types (SHTC3, SHT30, SGP30, T6703, HPMA115S0) currently have only stub implementations returning hardcoded values. Real I²C and UART drivers must be implemented to read actual environmental data from the hardware.

### Why It Matters
- **User Impact**: Users need accurate air quality readings - this is the core value proposition
- **Business Impact**: Without working sensors, the device provides no useful functionality
- **Technical Impact**: Sensor accuracy and calibration directly affect data quality and user trust

### Context
- **SHTC3** (Glow C): Temperature/humidity via I²C, Sensirion
- **SHT30** (Element): Temperature/humidity via I²C, Sensirion
- **SGP30** (Both): TVOC and eCO₂ via I²C, requires baseline calibration
- **T6703** (Element): CO₂ via UART or I²C, Telaire NDIR sensor
- **HPMA115S0** (Element): PM2.5/PM10 via UART, Honeywell, requires fan warm-up

## Out of Scope

The following are explicitly NOT part of this issue:
- Display rendering of sensor values
- MQTT/REST publishing of readings
- Home Assistant integration
- Air quality score calculation algorithms

## Solution

### Approach
1. Implement SHTC3 I²C driver with CRC validation
2. Implement SHT30 I²C driver with CRC validation
3. Implement SGP30 I²C driver with baseline read/write capability
4. Implement T6703 UART driver with CO₂ reading
5. Implement HPMA115S0 UART driver with PM2.5/PM10 readings
6. Add error detection and retry logic for I²C/UART failures
7. Implement device model auto-detection by probing for CO₂ sensor

### User Stories
- **US-1**: As a user, I want accurate temperature readings so I can monitor my environment
- **US-2**: As a user, I want VOC levels so I can know when to ventilate
- **US-3**: As a user, I want PM2.5 readings so I can monitor particulate air quality

### Key Implementation Notes
- SGP30 requires 1-second measurement interval for dynamic baseline compensation
- SGP30 baseline must be saved every ~12 hours and restored on boot
- HPMA115S0 needs fan spin-up period before accurate readings
- All sensors should support humidity compensation where applicable
- Use Sensirion's embedded-sgp reference drivers as starting point

## Technical Requirements

### Constraints
- **Must use**: I²C at 400kHz for Sensirion sensors
- **Must use**: UART 9600 8N1 for HPMA115S0
- **Must implement**: CRC validation for I²C reads
- **Must implement**: Baseline persistence for SGP30

### Dependencies
- **Blocked by**: STM32 peripheral initialization (PRD-003)
- **Blocks**: Telemetry publishing, Home Assistant integration
- **Related**: Storage and configuration (PRD-005), Real-time scheduler (PRD-006)

### Code References
- Files to create: `firmware/src/sensors/shtc3.c`, `firmware/src/sensors/sht30.c`
- Files to create: `firmware/src/sensors/sgp30.c`, `firmware/src/sensors/t6703.c`
- Files to create: `firmware/src/sensors/hpma115s0.c`
- Files to create: `firmware/include/sensors/*.h`
- Reference: [Sensirion embedded-sgp](https://github.com/Sensirion/embedded-sgp)
- Reference: [HPMA115S0 Arduino library](https://github.com/felixgalindo/HPMA115S0)

## Acceptance Criteria

### SHTC3 (Glow C)
- [ ] Reads temperature with ±0.2°C accuracy
- [ ] Reads humidity with ±2% RH accuracy
- [ ] CRC validation on all reads
- [ ] Returns error code on communication failure

### SHT30 (Element)
- [ ] Reads temperature with ±0.2°C accuracy
- [ ] Reads humidity with ±2% RH accuracy
- [ ] CRC validation on all reads
- [ ] Returns error code on communication failure

### SGP30 (Both)
- [ ] Reads TVOC in ppb range
- [ ] Reads eCO₂ estimate in ppm range
- [ ] Baseline read/write functions implemented
- [ ] Baseline automatically saved every 12 hours
- [ ] Baseline restored on boot if valid (<7 days old)
- [ ] Humidity compensation supported

### T6703 (Element)
- [ ] Reads CO₂ in ppm via UART
- [ ] Handles 2-second default output interval
- [ ] Returns error code on communication failure

### HPMA115S0 (Element)
- [ ] Reads PM2.5 in µg/m³
- [ ] Reads PM10 in µg/m³
- [ ] Fan control for warm-up period (if applicable)
- [ ] Checksum validation on UART packets

### General
- [ ] Device auto-detection identifies Glow C vs Element
- [ ] All drivers have consistent error handling interface
- [ ] Unit tests with mocked I²C/UART pass

## Open Questions

- **Q1**: Should we implement humidity compensation for SGP30 using SHTC3/SHT30 readings?
  - Status: Recommended by Sensirion
  - Decision: Yes, implement cross-sensor compensation

- **Q2**: Does T6703 use UART or I²C on the Element PCB?
  - Status: To investigate during hardware validation
  - Decision: TBD - implement both interfaces

---

## AI Metadata

```json
{
  "taskId": "PRD-004",
  "complexity": "complex",
  "phase": 3,
  "isBlocking": true,
  "estimatedEffort": "5-7 days",
  "category": "firmware-bringup",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
