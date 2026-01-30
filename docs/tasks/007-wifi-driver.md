# PRD-007: CYW4343W Wi-Fi Driver Integration

## Overview

### The Problem
The device has no Wi-Fi connectivity. The CYW4343W chip requires driver integration from the WICED SDK to enable network communication for MQTT and REST API functionality.

### Why It Matters
- **User Impact**: Without Wi-Fi, device cannot publish data to Home Assistant or any network service
- **Business Impact**: Network connectivity is essential for the core use case
- **Technical Impact**: Wi-Fi driver is foundation for all network features (MQTT, REST, provisioning)

### Context
The CYW4343W is a Cypress/Infineon Wi-Fi/BLE combo chip included in the Laird Sterling-EWB module. The WICED SDK provides drivers, but it's marked NRFD. ModusToolbox successor should have compatible libraries.

## Out of Scope

The following are explicitly NOT part of this issue:
- BLE functionality (separate PRD)
- Wi-Fi provisioning UI/flow (separate PRD)
- MQTT or HTTP application layer
- Captive portal implementation

## Solution

### Approach
1. Integrate CYW4343W Wi-Fi driver from WICED SDK or ModusToolbox
2. Implement Wi-Fi station mode initialization
3. Implement connection to AP using stored credentials
4. Integrate DHCP client for IP address acquisition
5. Add static IP configuration option
6. Implement reconnection logic with exponential backoff
7. Add Wi-Fi status monitoring and event callbacks

### User Stories
- **US-1**: As a user, I want my device to connect to my home Wi-Fi network
- **US-2**: As a user, I want my device to automatically reconnect after router restarts

### Key Implementation Notes
- Use WICED Wi-Fi APIs or equivalent from ModusToolbox
- Store Wi-Fi credentials in flash storage (PRD-005)
- Implement connection state machine: disconnected → connecting → connected
- Status LED feedback during connection attempts
- Support WPA2-PSK (most common home networks)

## Technical Requirements

### Constraints
- **Must use**: WICED SDK Wi-Fi driver or ModusToolbox equivalent
- **Must support**: WPA2-PSK authentication
- **Must support**: DHCP and static IP configuration
- **Must implement**: Automatic reconnection on disconnect

### Dependencies
- **Blocked by**: Development environment setup (PRD-002), Storage (PRD-005)
- **Blocks**: MQTT client, REST server, Wi-Fi provisioning
- **Related**: BLE stack integration (PRD-009)

### Code References
- Files to create: `firmware/src/network/wifi.c`, `firmware/include/network/wifi.h`
- WICED reference: `wiced_wifi_*` APIs
- lwIP integration for TCP/IP stack

## Acceptance Criteria

- [ ] Wi-Fi driver initialized without errors
- [ ] Device connects to WPA2-PSK protected network
- [ ] DHCP client obtains IP address successfully
- [ ] Static IP configuration works as alternative
- [ ] Device reconnects automatically after disconnect (test by rebooting router)
- [ ] Exponential backoff prevents connection spam (1s, 2s, 4s, 8s, max 60s)
- [ ] Connection status available via API
- [ ] Connection events trigger LED feedback
- [ ] Wi-Fi credentials loaded from flash storage
- [ ] Memory usage for Wi-Fi stack documented
- [ ] Works with common home routers (test with 2-3 different brands)

## Open Questions

- **Q1**: Does ModusToolbox provide compatible Wi-Fi drivers?
  - Status: To investigate during dev environment setup
  - Decision: TBD - fall back to WICED SDK if needed

- **Q2**: Should we support WPA3?
  - Status: To investigate
  - Decision: Nice to have, not required for MVP

---

## AI Metadata

```json
{
  "taskId": "PRD-007",
  "complexity": "complex",
  "phase": 2,
  "isBlocking": true,
  "estimatedEffort": "3-5 days",
  "category": "networking",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
