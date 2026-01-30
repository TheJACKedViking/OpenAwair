# PRD-006: Real-time Scheduler

## Overview

### The Problem
Sensors require precise timing for accurate readings (SGP30 needs exactly 1-second intervals), and multiple tasks (sensor sampling, telemetry aggregation, network communication) must run concurrently without blocking each other.

### Why It Matters
- **User Impact**: Inaccurate sensor timing leads to poor readings and unreliable data
- **Business Impact**: System stability affects user trust in the device
- **Technical Impact**: SGP30's dynamic baseline compensation algorithm requires strict 1-second timing

### Context
The firmware needs an RTOS-based scheduler to manage concurrent tasks. FreeRTOS is the recommended choice for open-source compatibility. Tasks include sensor sampling (multiple intervals), telemetry aggregation, network publishing, and device control.

## Out of Scope

The following are explicitly NOT part of this issue:
- Network stack task management (handled by WICED/lwIP)
- Bootloader scheduling
- Power management / sleep modes
- Interrupt-driven sensor reading (use polling tasks)

## Solution

### Approach
1. Configure FreeRTOS with appropriate tick rate (1ms recommended)
2. Create sensor sampling tasks with priority-based scheduling
3. Implement staggered sensor polling to prevent I²C bus contention
4. Create telemetry aggregation task that collects readings
5. Add watchdog timer task for crash recovery
6. Implement inter-task communication using queues/semaphores

### User Stories
- **US-1**: As a user, I want consistent sensor readings without timing jitter
- **US-2**: As a user, I want the device to recover automatically from crashes

### Key Implementation Notes
- SGP30 task: highest priority, strict 1-second interval
- Temperature/humidity task: medium priority, ~1-second interval
- PM2.5/CO₂ task: medium priority, 2-second interval
- Telemetry aggregation: lower priority, collects latest readings on demand
- Watchdog: independent task, resets hardware watchdog timer
- Use mutexes for shared I²C bus access

## Technical Requirements

### Constraints
- **Must use**: FreeRTOS (or compatible RTOS)
- **Must achieve**: ±10ms timing accuracy for sensor sampling
- **Must implement**: I²C bus mutex to prevent collisions
- **Must implement**: Hardware watchdog for crash recovery

### Dependencies
- **Blocked by**: STM32 peripheral initialization (PRD-003)
- **Blocks**: Network tasks, device feature tasks
- **Related**: Sensor drivers (PRD-004)

### Code References
- Files to create: `firmware/src/scheduler/tasks.c`, `firmware/src/scheduler/scheduler.c`
- Files to create: `firmware/include/scheduler/tasks.h`
- FreeRTOS config: `firmware/include/FreeRTOSConfig.h`

## Acceptance Criteria

- [ ] FreeRTOS configured with 1ms tick rate
- [ ] SGP30 sampling task runs at 1-second intervals (verify with scope/logic analyzer)
- [ ] Timing jitter < ±10ms for all sensor tasks
- [ ] Temperature/humidity sampling at ~1-second intervals
- [ ] PM2.5/CO₂ sampling at ~2-second intervals
- [ ] I²C bus mutex prevents simultaneous sensor access
- [ ] Telemetry aggregation task collects latest readings
- [ ] Watchdog task prevents system lockup (test by inducing infinite loop)
- [ ] Task priorities documented
- [ ] Stack sizes tuned and documented (no stack overflows)
- [ ] CPU utilization < 50% in normal operation

## Open Questions

- **Q1**: Should sensor tasks be event-driven or time-driven?
  - Status: Determined
  - Decision: Time-driven with strict intervals for SGP30 compatibility

- **Q2**: What is the appropriate watchdog timeout?
  - Status: To determine
  - Decision: Suggest 5-10 seconds to allow for slow operations

---

## AI Metadata

```json
{
  "taskId": "PRD-006",
  "complexity": "moderate",
  "phase": 1,
  "isBlocking": true,
  "estimatedEffort": "2-3 days",
  "category": "firmware-bringup",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
