# PRD-010: MQTT Client Implementation

## Overview

### The Problem
The device has no way to publish sensor data to Home Assistant or other MQTT brokers. Without MQTT, users cannot integrate the device into their smart home systems.

### Why It Matters
- **User Impact**: MQTT is the primary integration method for Home Assistant users
- **Business Impact**: Home Assistant integration is a key feature for the target audience
- **Technical Impact**: MQTT provides real-time push updates vs polling REST API

### Context
MQTT is a lightweight publish/subscribe protocol ideal for IoT devices. Home Assistant supports MQTT Discovery for automatic entity creation. The device should publish telemetry, availability, and discovery payloads.

## Out of Scope

The following are explicitly NOT part of this issue:
- REST API implementation (separate PRD)
- Home Assistant configuration (documentation task)
- MQTT broker setup (user responsibility)
- Secure MQTT (TLS) - future enhancement

## Solution

### Approach
1. Integrate lightweight MQTT client library (lwMQTT or WICED MQTT)
2. Implement broker connection with configurable address/port
3. Implement username/password authentication
4. Implement telemetry publishing on configurable interval
5. Implement availability (online/offline) publishing
6. Implement Last Will Testament for offline detection
7. Implement Home Assistant MQTT Discovery payloads
8. Add QoS 1 support for reliable delivery
9. Implement reconnection logic on broker disconnect

### User Stories
- **US-1**: As a user, I want sensor data in Home Assistant automatically
- **US-2**: As a user, I want to know when my device goes offline

### Key Implementation Notes
- Topic format: `openawair/{deviceId}/telemetry`, `openawair/{deviceId}/availability`
- Discovery topic: `homeassistant/sensor/{deviceId}_{sensor}/config`
- Telemetry payload: JSON with all sensor readings
- Publish interval: configurable, default 60 seconds
- LWT message: "offline" on `openawair/{deviceId}/availability`

## Technical Requirements

### Constraints
- **Must use**: Lightweight MQTT library suitable for embedded systems
- **Must support**: QoS 0 and QoS 1
- **Must implement**: Last Will Testament
- **Must implement**: Home Assistant MQTT Discovery format
- **Must implement**: Automatic reconnection

### Dependencies
- **Blocked by**: Wi-Fi driver (PRD-007), Sensor drivers (PRD-004)
- **Blocks**: Home Assistant integration
- **Related**: REST server (PRD-011)

### Code References
- Files to create: `firmware/src/network/mqtt.c`, `firmware/include/network/mqtt.h`
- Files to create: `firmware/src/network/ha_discovery.c`
- TypeScript reference: `host/src/firmware/networking/mqtt.ts`

## Acceptance Criteria

- [ ] MQTT client connects to broker with configurable address:port
- [ ] Username/password authentication works
- [ ] Telemetry published to `openawair/{deviceId}/telemetry`
- [ ] Telemetry JSON includes: temperature, humidity, voc, eco2, (co2, pm25 for Element)
- [ ] Availability published to `openawair/{deviceId}/availability` ("online"/"offline")
- [ ] Last Will Testament configured for "offline" on disconnect
- [ ] QoS 1 delivery confirmed for availability messages
- [ ] Home Assistant Discovery payloads published on first connect
- [ ] All sensors appear automatically in Home Assistant
- [ ] Device entity created with manufacturer "OpenAwair" and model name
- [ ] Reconnection works after broker restart (test by restarting Mosquitto)
- [ ] Publish interval configurable (default 60s)
- [ ] Broker configuration stored in flash

## Open Questions

- **Q1**: Should we support MQTT over TLS?
  - Status: To determine
  - Decision: Not for MVP; add as future enhancement

- **Q2**: What publish interval provides good balance of freshness vs traffic?
  - Status: Determined
  - Decision: 60 seconds default, configurable down to 10 seconds

---

## AI Metadata

```json
{
  "taskId": "PRD-010",
  "complexity": "moderate",
  "phase": 2,
  "isBlocking": true,
  "estimatedEffort": "3-4 days",
  "category": "networking",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
