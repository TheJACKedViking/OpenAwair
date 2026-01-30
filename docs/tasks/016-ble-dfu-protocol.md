# PRD-016: BLE DFU Protocol (Device Side)

## Overview

### The Problem
The bootloader needs a protocol to receive firmware over BLE. Without a defined DFU protocol, there's no standard way for the host app to communicate with the device during firmware updates.

### Why It Matters
- **User Impact**: Enables wireless firmware updates from mobile app
- **Business Impact**: Standard protocol allows third-party tooling
- **Technical Impact**: Protocol design affects reliability and update speed

### Context
The Nordic Secure DFU protocol is a well-documented standard used by many BLE devices. Using a compatible protocol allows leveraging existing mobile libraries (nRF Connect, etc.) for testing and potentially for production use.

## Out of Scope

The following are explicitly NOT part of this issue:
- Host-side DFU client (separate PRD)
- Bootloader main logic (PRD-015)
- Wi-Fi-based OTA
- Firmware signing (future enhancement)

## Solution

### Approach
1. Implement BLE DFU GATT service with Nordic-compatible UUIDs
2. Implement control point characteristic for commands
3. Implement packet characteristic for firmware data
4. Handle "start DFU" command with firmware size/CRC
5. Handle chunked firmware reception (~512 byte chunks)
6. Write chunks to flash application region
7. Implement CRC32 verification after complete transfer
8. Handle "validate & reboot" command
9. Add timeout and abort handling
10. Implement retry mechanism for failed chunks

### User Stories
- **US-1**: As a user, I want firmware updates to complete reliably
- **US-2**: As a user, I want to see update progress on my phone

### Key Implementation Notes
- Service UUID: `0xFE59` (Nordic Secure DFU standard)
- Control Point: commands and status notifications
- Packet: firmware data chunks
- Chunk size: ~512 bytes (or negotiated via MTU)
- Progress reported via notifications
- Timeout: 30 seconds without data triggers abort

## Technical Requirements

### Constraints
- **Must use**: Nordic Secure DFU compatible service UUID `0xFE59`
- **Must implement**: CRC32 verification of complete firmware
- **Must implement**: Progress notifications
- **Must support**: Chunk retransmission on failure
- **Must handle**: Transfer abort and timeout

### Dependencies
- **Blocked by**: Bootloader (PRD-015), BLE stack (PRD-009)
- **Blocks**: Host DFU client development
- **Related**: Firmware validation (PRD-017)

### Code References
- Files to create: `firmware/bootloader/src/dfu_protocol.c`
- Files to create: `firmware/bootloader/include/dfu_protocol.h`
- Reference: [Nordic DFU specification](https://infocenter.nordicsemi.com/topic/com.nordic.infocenter.sdk5.v17.1.0/lib_dfu_transport_ble.html)
- TypeScript reference: `host/src/firmware/bootloader/dfu.ts`

## Acceptance Criteria

### GATT Service
- [ ] DFU service registered with UUID `0xFE59`
- [ ] Control Point characteristic supports write and notify
- [ ] Packet characteristic supports write-without-response
- [ ] Service advertised when in DFU mode

### Protocol Commands
- [ ] "Start DFU" command accepted with firmware size and expected CRC
- [ ] "Get Status" command returns current state
- [ ] "Abort" command cancels transfer and clears partial data
- [ ] "Validate & Reboot" command triggers CRC check and boot

### Data Transfer
- [ ] Firmware chunks received via Packet characteristic
- [ ] Chunks written to flash in order
- [ ] Out-of-order chunks detected and NAK'd
- [ ] Missing chunks requested via notification
- [ ] Progress reported (bytes received / total)

### Verification
- [ ] CRC32 calculated over complete firmware
- [ ] CRC compared to expected value from Start command
- [ ] Mismatch triggers error notification and stays in DFU
- [ ] Match triggers success notification

### Error Handling
- [ ] Timeout after 30 seconds of no data
- [ ] Timeout triggers abort and notification
- [ ] Flash write errors reported via notification
- [ ] Device remains in DFU mode after any error

### General
- [ ] Protocol compatible with Nordic nRF Connect app (for testing)
- [ ] Transfer speed: >10KB/s achievable
- [ ] Protocol documented in `docs/technical/dfu-protocol.md`

## Open Questions

- **Q1**: Should we support resume after disconnect?
  - Status: To determine
  - Decision: Not for MVP; clean restart on reconnect is acceptable

- **Q2**: Maximum firmware size supported?
  - Status: Based on flash layout
  - Decision: Application region size minus header (typically ~400KB)

---

## AI Metadata

```json
{
  "taskId": "PRD-016",
  "complexity": "complex",
  "phase": 4,
  "isBlocking": true,
  "estimatedEffort": "4-5 days",
  "category": "bootloader",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
