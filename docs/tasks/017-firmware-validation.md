# PRD-017: Firmware Validation

## Overview

### The Problem
There's no mechanism to verify firmware integrity or compatibility before flashing. Users could accidentally flash wrong firmware versions or corrupted files, potentially bricking their device.

### Why It Matters
- **User Impact**: Protects users from accidental bad flashes
- **Business Impact**: Reduces support burden from failed updates
- **Technical Impact**: Enables safe rollback and version management

### Context
Firmware validation ensures only compatible, intact firmware is flashed. This includes version headers, CRC checks, and potentially cryptographic signatures for authenticity.

## Out of Scope

The following are explicitly NOT part of this issue:
- Full cryptographic signing (future enhancement)
- Dual-bank A/B partition management
- Cloud-based firmware distribution
- Automatic update checking

## Solution

### Approach
1. Define firmware header format with magic number, version, size, CRC
2. Implement version parsing and display
3. Implement compatibility check (hardware model, minimum bootloader version)
4. Consider optional firmware signature verification
5. Implement rollback support (keep backup of previous firmware)
6. Store last known good firmware metadata

### User Stories
- **US-1**: As a user, I want the device to reject incompatible firmware
- **US-2**: As a user, I want to roll back if a new firmware has problems

### Key Implementation Notes
- Header at fixed offset in firmware binary (e.g., first 256 bytes)
- Magic number: unique identifier like `OAIR` (0x4F414952)
- Version: semantic versioning (major.minor.patch)
- Hardware compatibility: Glow C vs Element identifier
- CRC32 over firmware body (excluding header CRC field)

## Technical Requirements

### Constraints
- **Must implement**: Firmware header with version and CRC
- **Must implement**: Hardware model compatibility check
- **Must implement**: Magic number validation
- **Should implement**: Rollback capability

### Dependencies
- **Blocked by**: Bootloader (PRD-015), Storage (PRD-005)
- **Blocks**: Safe firmware distribution
- **Related**: BLE DFU protocol (PRD-016)

### Code References
- Files to create: `firmware/include/firmware_header.h`
- Files to create: `firmware/src/common/version.c`
- Build script: Generate header at compile time
- Host tool: `host/src/firmware/validation.ts`

## Acceptance Criteria

### Firmware Header
- [ ] Header format documented
- [ ] Magic number: 4 bytes identifying OpenAwair firmware
- [ ] Version: 3 bytes (major.minor.patch)
- [ ] Hardware model: 1 byte (0x01 = Glow C, 0x02 = Element)
- [ ] Firmware size: 4 bytes
- [ ] CRC32: 4 bytes over firmware body
- [ ] Reserved: padding to 256 bytes for future expansion

### Build Integration
- [ ] Header automatically generated at compile time
- [ ] Version read from `VERSION` file or git tag
- [ ] CRC calculated and inserted by build script
- [ ] Binary includes header at offset 0

### Bootloader Validation
- [ ] Magic number checked before any flash operations
- [ ] Hardware model compared to device identity
- [ ] Version compared to minimum required (if defined)
- [ ] CRC verified before marking firmware valid

### Version Management
- [ ] Current version queryable via REST API
- [ ] Current version included in MQTT telemetry
- [ ] Bootloader version also queryable
- [ ] Version displayed on Element display (if applicable)

### Rollback (if implemented)
- [ ] Previous firmware metadata stored in flash
- [ ] User can trigger rollback via long button press
- [ ] Rollback only available if previous firmware was valid

## Open Questions

- **Q1**: Should we implement cryptographic signatures?
  - Status: To determine
  - Decision: Not for MVP; CRC provides integrity, not authenticity

- **Q2**: How to handle rollback with limited flash space?
  - Status: To determine based on flash size
  - Decision: Store only metadata; full backup requires dual-bank

---

## AI Metadata

```json
{
  "taskId": "PRD-017",
  "complexity": "moderate",
  "phase": 4,
  "isBlocking": false,
  "estimatedEffort": "2-3 days",
  "category": "bootloader",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
