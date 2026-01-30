# PRD-018: Host BLE Transport Implementation

## Overview

### The Problem
The TypeScript host tooling has a `DfuTransport` interface but no actual BLE implementation. Without real BLE transport, the host cannot communicate with devices for firmware updates or provisioning.

### Why It Matters
- **User Impact**: Users need a working app to flash and configure their devices
- **Business Impact**: Host tooling is essential for user onboarding
- **Technical Impact**: BLE transport is foundation for all host-device communication

### Context
The host tools need to support multiple platforms:
- macOS/iOS via CoreBluetooth
- Web browsers via Web Bluetooth API
- Potentially Linux/Windows via native bridges

## Out of Scope

The following are explicitly NOT part of this issue:
- CLI application (separate PRD)
- Desktop UI (separate PRD)
- Wi-Fi-based communication
- Android native app (use Web Bluetooth instead)

## Solution

### Approach
1. Implement `DfuTransport` interface with CoreBluetooth (macOS/iOS)
2. Implement `DfuTransport` interface with Web Bluetooth (browser)
3. Add device discovery and filtering by service UUID
4. Implement BLE connection management
5. Add error handling and retry logic
6. Implement MTU negotiation for optimal transfer speed

### User Stories
- **US-1**: As a user, I want to flash firmware from my Mac
- **US-2**: As a user, I want to flash firmware from a web browser

### Key Implementation Notes
- CoreBluetooth implementation for native macOS/iOS apps
- Web Bluetooth for cross-platform browser-based tool
- Filter by DFU service UUID `0xFE59`
- Handle connection drops and automatic reconnection
- Implement progress callbacks for UI

## Technical Requirements

### Constraints
- **Must implement**: CoreBluetooth transport for macOS
- **Must implement**: Web Bluetooth transport for browsers
- **Must support**: DFU service UUID `0xFE59`
- **Must implement**: Connection timeout and retry

### Dependencies
- **Blocked by**: BLE DFU protocol on device (PRD-016)
- **Blocks**: CLI application, Desktop UI
- **Related**: Wi-Fi provisioning client (PRD-019)

### Code References
- Files to modify: `host/src/loader/ble/dfuClient.ts`
- Files to create: `host/src/loader/ble/coreBluetoothTransport.ts`
- Files to create: `host/src/loader/ble/webBluetoothTransport.ts`
- Interface: `DfuTransport` in existing code

## Acceptance Criteria

### Device Discovery
- [ ] Scans for BLE devices advertising DFU service
- [ ] Filters by service UUID `0xFE59`
- [ ] Returns device name and identifier
- [ ] Stops scan after timeout or device found

### Connection Management
- [ ] Connects to device by identifier
- [ ] Connection timeout: 10 seconds
- [ ] Automatic reconnection on drop (up to 3 attempts)
- [ ] Graceful disconnect handling
- [ ] Connection state events exposed to caller

### CoreBluetooth Implementation
- [ ] Works on macOS 12+
- [ ] Works on iOS 15+
- [ ] Handles Bluetooth permission requests
- [ ] Handles Bluetooth powered-off state

### Web Bluetooth Implementation
- [ ] Works in Chrome, Edge, Opera (Web Bluetooth support)
- [ ] Handles browser permission prompts
- [ ] Handles "Bluetooth not available" gracefully
- [ ] Works on supported mobile browsers

### Data Transfer
- [ ] Implements `DfuTransport` interface completely
- [ ] Writes to control point characteristic
- [ ] Writes to packet characteristic (write-without-response)
- [ ] Receives notifications from control point
- [ ] MTU negotiation for optimal chunk size

### Error Handling
- [ ] Timeout errors clearly reported
- [ ] Connection errors clearly reported
- [ ] Characteristic write failures reported
- [ ] All errors include actionable message

### Testing
- [ ] Unit tests with mock BLE transport
- [ ] Integration test with actual device (manual)
- [ ] Tested on macOS, iOS Safari, Chrome desktop

## Open Questions

- **Q1**: Should we support Linux via BlueZ?
  - Status: To determine based on user demand
  - Decision: Not for MVP; Web Bluetooth covers most cases

- **Q2**: How to handle iOS app distribution?
  - Status: To determine
  - Decision: TestFlight for beta, consider App Store later

---

## AI Metadata

```json
{
  "taskId": "PRD-018",
  "complexity": "complex",
  "phase": 4,
  "isBlocking": true,
  "estimatedEffort": "4-5 days",
  "category": "host-tooling",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
