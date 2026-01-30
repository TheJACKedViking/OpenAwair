# PRD-008: Wi-Fi Provisioning

## Overview

### The Problem
New devices have no Wi-Fi credentials stored. Users need a way to configure Wi-Fi SSID and password without requiring a computer or serial connection. BLE-based provisioning from a mobile app is the preferred solution.

### Why It Matters
- **User Impact**: Users need a simple way to connect their device to Wi-Fi
- **Business Impact**: Poor setup experience would discourage adoption
- **Technical Impact**: First-time setup flow is critical for user onboarding

### Context
The device has BLE capability via CYW4343W. A BLE GATT service can accept Wi-Fi credentials from a mobile app. AP mode (captive portal) can serve as a fallback for devices without BLE apps.

## Out of Scope

The following are explicitly NOT part of this issue:
- Mobile app development (separate host tooling task)
- Web-based configuration after Wi-Fi connected
- Enterprise Wi-Fi (802.1X)
- Multiple network profiles

## Solution

### Approach
1. Define BLE GATT service for Wi-Fi provisioning
2. Implement GATT characteristics for SSID, password, and status
3. Create provisioning state machine: idle → advertising → connected → credentials received → connecting → result
4. Implement AP fallback mode with captive portal
5. Add credential validation before storage
6. Implement timeout and error feedback via LED
7. Support credential update without full reflash

### User Stories
- **US-1**: As a user, I want to configure Wi-Fi from my phone without opening the device
- **US-2**: As a user, I want to know if my credentials are wrong via LED feedback

### Key Implementation Notes
- BLE advertising starts automatically when no Wi-Fi credentials stored
- Advertise device name like "OpenAwair-XXXX" (last 4 of MAC)
- GATT service UUID should be custom (documented in PRD-009)
- Credentials transmitted in clear text over BLE (acceptable for local setup)
- LED: blinking blue during provisioning, solid green on success, red on failure

## Technical Requirements

### Constraints
- **Must use**: BLE GATT for primary provisioning method
- **Must implement**: Timeout (5 minutes) if no credentials received
- **Must provide**: LED feedback for provisioning status
- **Must support**: Credential update (re-provisioning)

### Dependencies
- **Blocked by**: BLE stack integration (PRD-009), Storage (PRD-005)
- **Blocks**: First-time device setup
- **Related**: Wi-Fi driver (PRD-007), Host provisioning client (PRD-019)

### Code References
- Files to create: `firmware/src/provisioning/ble_provision.c`
- Files to create: `firmware/src/provisioning/ap_provision.c` (fallback)
- Files to create: `firmware/include/provisioning/provision.h`

## Acceptance Criteria

- [ ] BLE advertising starts when no Wi-Fi credentials stored
- [ ] Device name includes last 4 digits of MAC address
- [ ] GATT service accepts SSID (up to 32 chars) and password (up to 64 chars)
- [ ] Credentials validated (SSID not empty, password >= 8 chars for WPA2)
- [ ] Device attempts Wi-Fi connection after receiving credentials
- [ ] Success/failure status sent back via BLE notification
- [ ] Credentials stored in flash on successful connection
- [ ] LED shows blinking blue during provisioning
- [ ] LED shows solid green on success
- [ ] LED shows red on failure (wrong password, network not found)
- [ ] Provisioning times out after 5 minutes of inactivity
- [ ] Re-provisioning works (button hold or BLE command to clear credentials)
- [ ] AP fallback mode works when BLE not available

## Open Questions

- **Q1**: Should credentials be encrypted during BLE transmission?
  - Status: Determined
  - Decision: No - BLE pairing provides sufficient security for local setup

- **Q2**: How does user trigger re-provisioning?
  - Status: To determine
  - Decision: Suggest 10-second button hold to clear credentials and restart provisioning

---

## AI Metadata

```json
{
  "taskId": "PRD-008",
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
