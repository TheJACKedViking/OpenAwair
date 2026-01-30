# PRD-005: Storage and Configuration

## Overview

### The Problem
No persistent storage system exists for the firmware. Critical data like SGP30 calibration baselines, Wi-Fi credentials, and MQTT broker configuration will be lost on every power cycle without flash storage implementation.

### Why It Matters
- **User Impact**: Users would need to reconfigure Wi-Fi and wait 12+ hours for VOC calibration after every power outage
- **Business Impact**: Poor user experience due to configuration loss would drive users away
- **Technical Impact**: SGP30 accuracy depends on persisted baseline; without it, VOC readings are unreliable for hours

### Context
The STM32F412 has internal flash that can be used for configuration storage. A key-value storage abstraction with wear leveling is needed to prevent flash wear-out from frequent baseline saves (every 12 hours for SGP30).

## Out of Scope

The following are explicitly NOT part of this issue:
- External EEPROM or SD card storage
- Cloud backup of configuration
- Configuration UI or API
- Firmware update storage (handled by bootloader)

## Solution

### Approach
1. Implement flash storage driver for STM32F412 internal flash
2. Create key-value storage abstraction with string keys and binary values
3. Implement simple wear leveling using circular buffer approach
4. Add flash corruption detection via CRC checksums
5. Implement recovery mechanism for corrupted storage
6. Create typed accessors for common configuration items

### User Stories
- **US-1**: As a user, I want my Wi-Fi credentials saved so I don't reconfigure after power loss
- **US-2**: As a user, I want accurate VOC readings immediately after power-on

### Key Implementation Notes
- Reserve dedicated flash sector(s) for configuration storage
- Use STM32 HAL flash programming functions
- Implement write buffering to minimize flash writes
- SGP30 baseline is 4 bytes; save approximately every hour after initial 12-hour calibration
- Wi-Fi credentials should be stored with basic obfuscation (not security, just not plaintext)

## Technical Requirements

### Constraints
- **Must use**: STM32F412 internal flash (no external storage)
- **Must implement**: Wear leveling to prevent flash sector wear-out
- **Must implement**: CRC32 validation on stored data
- **Must preserve**: Configuration across firmware updates (separate from app flash region)

### Dependencies
- **Blocked by**: Development environment setup (PRD-002)
- **Blocks**: Wi-Fi provisioning, SGP30 baseline persistence
- **Related**: Sensor drivers (PRD-004), Wi-Fi provisioning (PRD-008)

### Code References
- Files to create: `firmware/src/storage/flash.c`, `firmware/src/storage/kvstore.c`
- Files to create: `firmware/include/storage/flash.h`, `firmware/include/storage/kvstore.h`
- Linker modification: Reserve flash sector for configuration

## Acceptance Criteria

- [ ] Flash driver can erase, write, and read flash sectors
- [ ] Key-value store supports string keys up to 32 characters
- [ ] Key-value store supports binary values up to 256 bytes
- [ ] Wear leveling distributes writes across flash sector
- [ ] CRC32 validation detects corrupted entries
- [ ] Corrupted storage recovers to empty state without crash
- [ ] SGP30 baseline persistence working (save/restore cycle tested)
- [ ] Wi-Fi credentials persistence working
- [ ] MQTT broker configuration persistence working
- [ ] Device metadata (name, location) persistence working
- [ ] Configuration survives 1000+ write cycles without corruption
- [ ] Flash usage documented in memory map

## Open Questions

- **Q1**: How much flash should be reserved for configuration storage?
  - Status: To determine based on STM32F412 flash layout
  - Decision: Suggest 8-16KB (one or two sectors)

- **Q2**: Should we use a proven library like LittleFS or custom implementation?
  - Status: To investigate
  - Decision: Custom simple implementation may be lighter weight for limited needs

---

## AI Metadata

```json
{
  "taskId": "PRD-005",
  "complexity": "moderate",
  "phase": 1,
  "isBlocking": true,
  "estimatedEffort": "3-4 days",
  "category": "firmware-bringup",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
