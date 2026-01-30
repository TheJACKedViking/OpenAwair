# PRD-019: Host Wi-Fi Provisioning Client

## Overview

### The Problem
Users need a way to send Wi-Fi credentials to their device from the host app. The device's BLE provisioning service exists (PRD-008) but there's no client implementation to communicate with it.

### Why It Matters
- **User Impact**: Users need to configure Wi-Fi from their phone or computer
- **Business Impact**: Provisioning is essential for device setup experience
- **Technical Impact**: Completes the provisioning flow end-to-end

### Context
The provisioning client uses the same BLE transport as DFU but communicates with the provisioning GATT service instead of the DFU service. It needs to send SSID and password and receive connection status.

## Out of Scope

The following are explicitly NOT part of this issue:
- Device-side provisioning service (PRD-008)
- SSID scanning from device (future enhancement)
- Enterprise Wi-Fi (802.1X)
- Captive portal client

## Solution

### Approach
1. Implement `WifiProvisioner` interface using BLE transport
2. Connect to device's provisioning GATT service
3. Send SSID and password via characteristics
4. Receive connection status via notifications
5. Add timeout and error handling
6. Implement status feedback for UI

### User Stories
- **US-1**: As a user, I want to enter my Wi-Fi credentials in the app
- **US-2**: As a user, I want to know if my credentials are correct

### Key Implementation Notes
- Reuse BLE transport from DFU implementation
- Provisioning service UUID different from DFU (device-specific)
- Credentials sent in clear text (BLE proximity is sufficient security)
- Status notifications: connecting, success, failure (with reason)

## Technical Requirements

### Constraints
- **Must implement**: `WifiProvisioner` interface
- **Must support**: SSID up to 32 characters
- **Must support**: Password up to 64 characters
- **Must implement**: Status feedback (connecting, success, failure)

### Dependencies
- **Blocked by**: Host BLE transport (PRD-018), Device provisioning (PRD-008)
- **Blocks**: CLI provisioning command, Setup UI
- **Related**: Device Wi-Fi driver (PRD-007)

### Code References
- Files to modify: `host/src/loader/wifi/provisioning.ts`
- Files to create: `host/src/loader/wifi/bleProvisioner.ts`
- Interface: `WifiProvisioner` in existing code

## Acceptance Criteria

### Connection
- [ ] Discovers device in provisioning mode
- [ ] Connects to provisioning GATT service
- [ ] Handles connection failures gracefully

### Credential Submission
- [ ] Validates SSID not empty
- [ ] Validates password length (8+ chars for WPA2)
- [ ] Sends SSID to appropriate characteristic
- [ ] Sends password to appropriate characteristic
- [ ] Triggers connection attempt on device

### Status Feedback
- [ ] Receives "connecting" notification
- [ ] Receives "success" notification with IP address
- [ ] Receives "failure" notification with error code
- [ ] Maps error codes to user-friendly messages
- [ ] Timeout after 30 seconds of no response

### Error Handling
- [ ] Invalid credentials: clear error message
- [ ] Network not found: clear error message
- [ ] Connection timeout: clear error message
- [ ] BLE disconnect during provisioning: handled gracefully

### UI Integration
- [ ] Progress callbacks for UI updates
- [ ] Final status returned to caller
- [ ] Can retry without reconnecting

## Open Questions

- **Q1**: Should we support SSID list from device?
  - Status: To determine
  - Decision: Not for MVP; user types SSID manually

- **Q2**: Should we remember last used credentials?
  - Status: To determine
  - Decision: Nice to have; store locally with user consent

---

## AI Metadata

```json
{
  "taskId": "PRD-019",
  "complexity": "moderate",
  "phase": 4,
  "isBlocking": false,
  "estimatedEffort": "2-3 days",
  "category": "host-tooling",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
