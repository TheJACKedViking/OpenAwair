# PRD-015: Bootloader Implementation

## Overview

### The Problem
No bootloader exists for the device. Without a bootloader, firmware updates require physical SWD access. Users need a way to update firmware wirelessly (OTA) via BLE.

### Why It Matters
- **User Impact**: Users can update firmware without opening the device
- **Business Impact**: Bug fixes and features can be deployed without hardware recalls
- **Technical Impact**: Bootloader is foundation for all OTA update capability

### Context
The bootloader is a small program that runs on device reset, decides whether to enter DFU mode or launch the main application, and handles firmware reception via BLE. It must be robust to prevent bricking.

## Out of Scope

The following are explicitly NOT part of this issue:
- Host-side DFU client (separate PRD)
- Wi-Fi-based OTA (BLE only for bootloader)
- Firmware encryption (future enhancement)
- Dual-bank A/B updates (single bank for simplicity)

## Solution

### Approach
1. Create bootloader project with separate flash region (64-128KB)
2. Implement boot decision logic (check DFU flag, button hold)
3. Implement jump-to-application code
4. Add firmware validity check (CRC) before boot
5. Implement fail-safe recovery (stay in DFU if app invalid)
6. Integrate with BLE DFU protocol (PRD-016)

### User Stories
- **US-1**: As a user, I want to update firmware from my phone
- **US-2**: As a user, I want my device to recover if an update fails

### Key Implementation Notes
- Bootloader must fit in 64-128KB (keep minimal)
- DFU flag stored in flash at known address
- Button hold detection for forced DFU mode
- CRC32 of application region for validity check
- On invalid app, stay in DFU mode indefinitely until valid firmware flashed

## Technical Requirements

### Constraints
- **Must fit**: Within 64-128KB flash region
- **Must implement**: Fail-safe recovery (never brick)
- **Must implement**: CRC32 firmware validation
- **Must support**: Button-triggered DFU mode

### Dependencies
- **Blocked by**: Development environment (PRD-002), BLE stack (PRD-009)
- **Blocks**: OTA updates, BLE DFU protocol
- **Related**: BLE DFU protocol (PRD-016), Firmware validation (PRD-017)

### Code References
- Files to create: `firmware/bootloader/src/main.c`, `firmware/bootloader/src/boot.c`
- Files to create: `firmware/bootloader/src/dfu.c`
- Files to create: `firmware/bootloader/include/*.h`
- Linker script: `firmware/bootloader/linker/bootloader.ld`

## Acceptance Criteria

### Boot Decision
- [ ] Bootloader executes immediately on reset
- [ ] Checks DFU flag in flash
- [ ] Checks button state for forced DFU entry
- [ ] Jumps to application if valid and no DFU requested
- [ ] Enters DFU mode if flag set or button held

### Application Validation
- [ ] CRC32 calculated over application region
- [ ] CRC compared to stored value in app header
- [ ] Invalid CRC triggers DFU mode entry
- [ ] Valid CRC allows application boot

### Fail-Safe Recovery
- [ ] Bootloader never overwrites itself
- [ ] Corrupted application triggers automatic DFU mode
- [ ] Bootloader remains functional even if app region corrupted
- [ ] Power loss during DFU leaves device in recoverable state

### Jump to Application
- [ ] Stack pointer set correctly from app vector table
- [ ] Reset vector called correctly
- [ ] Peripherals left in known state
- [ ] Bootloader memory freed (if possible)

### General
- [ ] Bootloader size < 64KB (target < 32KB)
- [ ] Boot time < 500ms when no DFU needed
- [ ] Bootloader version embedded and queryable

## Open Questions

- **Q1**: Should we implement dual-bank (A/B) updates for safer OTA?
  - Status: To determine based on flash size
  - Decision: Single bank for MVP; dual-bank as enhancement

- **Q2**: How should user trigger forced DFU mode?
  - Status: To determine based on hardware
  - Decision: Suggest power-on while holding any available button

---

## AI Metadata

```json
{
  "taskId": "PRD-015",
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
