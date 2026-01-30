# OpenAwair Task Management

This directory contains Product Requirement Documents (PRDs) for all OpenAwair development tasks. Each PRD follows a standardized format to ensure consistency and AI-parseability.

## Directory Structure

```
docs/tasks/
├── README.md           # This file
├── *.md                # Pending tasks (not yet started)
├── working/            # Tasks currently in progress
├── in-review/          # Tasks needing code review or manual validation
└── done/               # Completed tasks
```

## Task Lifecycle

```
[pending] → [working/] → [in-review/] → [done/]
                ↑              │
                └──────────────┘
              (if changes needed)
```

1. **Pending**: Task is defined but not started. File in `docs/tasks/`
2. **Working**: Task is actively being implemented. File in `docs/tasks/working/`
3. **In Review**: Implementation complete, awaiting code review or validation. File in `docs/tasks/in-review/`
4. **Done**: Task fully completed and verified. File in `docs/tasks/done/`

## PRD Format

Each task follows the PRD template with these sections:

| Section | Purpose |
|---------|---------|
| Overview | Problem, impact, context |
| Out of Scope | What's explicitly NOT included |
| Solution | Approach, user stories, implementation notes |
| Technical Requirements | Constraints, dependencies, code references |
| Acceptance Criteria | Checkbox success criteria |
| Open Questions | Unknowns to investigate |
| AI Metadata | Machine-readable task properties |

## Task Index

### Phase 1: Firmware Foundation (Blocking)
- [PRD-001](001-hardware-validation.md): Hardware Validation ⚠️
- [PRD-002](002-dev-environment-setup.md): Development Environment Setup ⚠️
- [PRD-003](003-stm32-peripheral-init.md): STM32 Peripheral Initialization ⚠️
- [PRD-004](004-sensor-drivers.md): Sensor Driver Implementation ⚠️
- [PRD-005](005-storage-configuration.md): Storage and Configuration ⚠️
- [PRD-006](006-realtime-scheduler.md): Real-time Scheduler ⚠️

### Phase 2: Networking
- [PRD-007](007-wifi-driver.md): CYW4343W Wi-Fi Driver ⚠️
- [PRD-008](008-wifi-provisioning.md): Wi-Fi Provisioning ⚠️
- [PRD-009](009-ble-stack.md): BLE Stack Integration ⚠️
- [PRD-010](010-mqtt-client.md): MQTT Client ⚠️
- [PRD-011](011-rest-server.md): REST/HTTP Server

### Phase 3: Device Features
- [PRD-012](012-glow-c-features.md): Glow C Features (LED, Relay, Motion)
- [PRD-013](013-element-features.md): Element Features (Display, Light Sensor)
- [PRD-014](014-shared-features.md): Shared Features (AQI, Alerts)

### Phase 4: Bootloader & OTA
- [PRD-015](015-bootloader.md): Bootloader Implementation ⚠️
- [PRD-016](016-ble-dfu-protocol.md): BLE DFU Protocol ⚠️
- [PRD-017](017-firmware-validation.md): Firmware Validation
- [PRD-018](018-host-ble-transport.md): Host BLE Transport ⚠️
- [PRD-019](019-host-provisioning.md): Host Wi-Fi Provisioning Client
- [PRD-020](020-cli-application.md): CLI Application

### Phase 5: Polish & Release
- [PRD-021](021-testing.md): Comprehensive Testing
- [PRD-022](022-documentation.md): Documentation

**Legend**: ⚠️ = Blocking dependency for other tasks

## Working with Tasks

### Starting a Task
1. Read the PRD thoroughly
2. Move the file to `working/`
3. Update the AI Metadata status to `"in_progress"`
4. Begin implementation following acceptance criteria

### Completing a Task
1. Verify all acceptance criteria are checked
2. Move the file to `in-review/`
3. Update the AI Metadata status to `"in_review"`
4. Request code review if applicable

### Finalizing a Task
1. After review approval, move to `done/`
2. Update the AI Metadata status to `"completed"`
3. Add completion date to metadata

## AI Metadata Schema

```json
{
  "taskId": "PRD-XXX",
  "complexity": "simple|moderate|complex",
  "phase": 1-5,
  "isBlocking": true|false,
  "estimatedEffort": "X-Y days",
  "category": "firmware-bringup|networking|device-features|bootloader|host-tooling|testing|documentation",
  "status": "pending|in_progress|in_review|completed",
  "createdBy": "Claude Code",
  "createdAt": "ISO timestamp",
  "completedAt": "ISO timestamp (when done)",
  "prdVersion": "2.0"
}
```
