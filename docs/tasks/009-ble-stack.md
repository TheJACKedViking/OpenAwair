# PRD-009: BLE Stack Integration

## Overview

### The Problem
The CYW4343W BLE capability is not initialized. BLE is required for Wi-Fi provisioning and firmware DFU (Device Firmware Update). Without BLE, users would need physical access for all configuration and updates.

### Why It Matters
- **User Impact**: BLE enables wireless setup and updates - no cable or device opening required
- **Business Impact**: Wireless updates are expected for modern IoT devices
- **Technical Impact**: BLE stack is foundation for provisioning and DFU features

### Context
The CYW4343W supports BLE 4.2. The WICED SDK provides BLE APIs including GATT server implementation. Custom services are needed for OpenAwair provisioning and DFU.

## Out of Scope

The following are explicitly NOT part of this issue:
- Wi-Fi provisioning application logic (PRD-008)
- DFU protocol implementation (PRD-015)
- BLE beaconing or mesh
- Classic Bluetooth

## Solution

### Approach
1. Integrate CYW4343W BLE driver from WICED SDK
2. Initialize BLE stack with GATT server role
3. Define custom service UUIDs for OpenAwair
4. Implement BLE advertising with configurable device name
5. Implement connection management (connect, disconnect, security)
6. Create GATT service registration framework
7. Implement notification/indication support

### User Stories
- **US-1**: As a user, I want to discover my device via BLE from my phone
- **US-2**: As a developer, I want to add custom BLE services easily

### Key Implementation Notes
- Use WICED BLE APIs or ModusToolbox equivalent
- OpenAwair Service UUID: Generate unique 128-bit UUID (document in code)
- DFU Service UUID: Use Nordic standard `0xFE59` for compatibility
- Advertising interval: 100-500ms for discoverability
- Support simultaneous Wi-Fi and BLE operation

## Technical Requirements

### Constraints
- **Must use**: WICED BLE stack or ModusToolbox equivalent
- **Must support**: GATT server role
- **Must support**: BLE 4.2 features
- **Must coexist**: With Wi-Fi operation (dual-mode chip)

### Dependencies
- **Blocked by**: Development environment setup (PRD-002)
- **Blocks**: Wi-Fi provisioning (PRD-008), BLE DFU (PRD-015)
- **Related**: Wi-Fi driver (PRD-007)

### Code References
- Files to create: `firmware/src/ble/ble_stack.c`, `firmware/src/ble/gatt_server.c`
- Files to create: `firmware/include/ble/ble_stack.h`, `firmware/include/ble/gatt_server.h`
- Files to create: `firmware/include/ble/service_uuids.h`

## Acceptance Criteria

- [ ] BLE stack initializes without errors
- [ ] Device advertises with name "OpenAwair-XXXX" (configurable)
- [ ] Device discoverable from iOS and Android phones
- [ ] GATT server accepts connections
- [ ] Custom service UUIDs registered and discoverable
- [ ] Connection events trigger callbacks
- [ ] Disconnection handled gracefully
- [ ] Multiple services can be registered (provisioning + DFU)
- [ ] Notifications work for status updates
- [ ] BLE and Wi-Fi operate simultaneously without interference
- [ ] Memory usage for BLE stack documented
- [ ] Service UUIDs documented in `docs/technical/ble-services.md`

## Open Questions

- **Q1**: Should we implement BLE pairing/bonding?
  - Status: To determine
  - Decision: Not required for MVP; can add later for security

- **Q2**: What advertising interval balances discoverability and power?
  - Status: To determine
  - Decision: 200ms suggested for good discoverability

---

## AI Metadata

```json
{
  "taskId": "PRD-009",
  "complexity": "complex",
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
