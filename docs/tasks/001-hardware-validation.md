# PRD-001: Hardware Validation

## Overview

### The Problem
The Awair Glow C and Element devices require physical hardware access validation before any custom firmware development can begin. Without confirming SWD debug access and understanding the PCB layout, firmware development is blocked.

### Why It Matters
- **User Impact**: Users cannot restore functionality to their devices until firmware exists
- **Business Impact**: This is the foundation task - all other development depends on it
- **Technical Impact**: SWD access determines if custom firmware is even possible; readout protection status affects the development approach

### Context
The devices use an STM32F412 MCU with CYW4343W Wi-Fi/BLE module (Laird Sterling-EWB). FCC filings and community teardowns suggest SWD test pads exist on the PCB. This task validates physical access and documents findings for the community.

## Out of Scope

The following are explicitly NOT part of this issue:
- Writing any firmware code
- Setting up the development environment
- Sensor testing or validation
- Software debugging

## Solution

### Approach
1. Safely disassemble an Awair Glow C device
2. Locate and photograph the PCB, identifying key components
3. Use multimeter and STM32F412 pinout to identify SWD test pads
4. Connect ST-Link or J-Link programmer and verify communication
5. Check MCU readout protection status
6. Document all findings with photos and pinout diagrams

### Key Implementation Notes
- **Safety**: Device must be unplugged from mains power during all work
- **Tools needed**: ST-Link V2 or J-Link, multimeter, fine-tip soldering equipment
- Power the board via 3.3V from programmer, not mains power
- If readout-protected, document the mass erase procedure

## Technical Requirements

### Constraints
- **Must use**: ST-Link or J-Link compatible SWD programmer
- **Must preserve**: Physical device integrity for reassembly
- **Cannot**: Work with device connected to mains power

### Dependencies
- **Blocks**: All firmware development tasks
- **Related**: Development environment setup (PRD-002)

### Code References
- Files to modify: None (documentation only)
- Output: `docs/hardware/glow-c-teardown.md`, `docs/hardware/element-teardown.md`

## Acceptance Criteria

- [ ] Glow C device successfully disassembled without permanent damage
- [ ] SWD test pad locations identified and photographed
- [ ] ST-Link or J-Link successfully connects to STM32F412
- [ ] MCU readout protection status documented
- [ ] Pinout diagram created showing SWD connections (SWDIO, SWDCLK, NRST, GND, 3.3V)
- [ ] 3.3V power rail access point identified for bench testing
- [ ] Reassembly procedure documented
- [ ] All findings committed to `docs/hardware/` directory

## Open Questions

- **Q1**: Is the Element PCB layout identical to Glow C for SWD access?
  - Status: To investigate (requires Element device)
  - Decision: TBD

- **Q2**: Are there any unpopulated headers that could simplify connections?
  - Status: To investigate during teardown
  - Decision: TBD

---

## AI Metadata

```json
{
  "taskId": "PRD-001",
  "complexity": "moderate",
  "phase": 1,
  "isBlocking": true,
  "estimatedEffort": "1-2 days",
  "category": "firmware-bringup",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
