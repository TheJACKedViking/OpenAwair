# PRD-021: Comprehensive Testing

## Overview

### The Problem
Test coverage is minimal. Only 5 basic unit tests exist covering CRC, DFU session, MQTT, and REST router. Critical paths like sensor drivers, error scenarios, and integration flows have no tests.

### Why It Matters
- **User Impact**: Bugs in untested code lead to poor user experience
- **Business Impact**: Testing reduces support burden and increases reliability
- **Technical Impact**: Tests enable confident refactoring and catch regressions

### Context
Testing spans multiple layers:
- TypeScript unit tests for host tooling
- C unit tests for firmware drivers
- Integration tests for protocol flows
- Hardware validation for real-world operation

## Out of Scope

The following are explicitly NOT part of this issue:
- Performance/load testing
- Security penetration testing
- Automated CI/CD pipeline setup
- Test coverage metrics enforcement

## Solution

### Approach
1. Expand TypeScript unit tests for error scenarios
2. Add integration tests with mocked transports
3. Set up Unity framework for C firmware tests
4. Create hardware validation test procedures
5. Document test execution instructions

### User Stories
- **US-1**: As a developer, I want tests to catch bugs before release
- **US-2**: As a contributor, I want clear test instructions

### Key Implementation Notes
- TypeScript: Node.js native test module (existing)
- C: Unity test framework (lightweight, embedded-friendly)
- Mocks: Create mock BLE transport for protocol testing
- Hardware: Manual test procedures with checklist

## Technical Requirements

### Constraints
- **Must maintain**: Existing test patterns and frameworks
- **Must cover**: All critical paths (DFU, provisioning, sensors)
- **Must document**: Test execution and expected results

### Dependencies
- **Blocked by**: Implementation of features being tested
- **Blocks**: Confident release
- **Related**: All implementation PRDs

### Code References
- TypeScript tests: `host/test/*.test.ts`
- C tests: `firmware/test/*.c` (to create)
- Test utilities: `host/test/mocks/*.ts` (to create)

## Acceptance Criteria

### TypeScript Unit Tests
- [ ] DFU session: CRC mismatch error handling
- [ ] DFU session: Incomplete transfer handling
- [ ] DFU session: Out-of-order chunks
- [ ] MQTT: Availability message format
- [ ] MQTT: Discovery payload for all sensor types
- [ ] REST router: 404 handling
- [ ] REST router: Invalid method handling
- [ ] REST router: Request body parsing errors
- [ ] Bootloader: DFU flag detection logic
- [ ] Provisioning: Credential validation

### TypeScript Integration Tests
- [ ] DfuClient: Complete upload flow with mock transport
- [ ] DfuClient: Retry on transport error
- [ ] DfuClient: Timeout handling
- [ ] Provisioning: Complete flow with mock transport
- [ ] MQTT client: Connection and publish (with test broker)

### Firmware Unit Tests (C)
- [ ] Unity test framework integrated
- [ ] SHTC3/SHT30 driver: I²C command sequences (mocked)
- [ ] SGP30 driver: Baseline read/write
- [ ] Flash storage: Read/write/erase operations
- [ ] CRC32: Known value verification
- [ ] Bootloader: Firmware validation logic

### Hardware Validation Tests
- [ ] Sensor accuracy: Compare with reference sensors
- [ ] Temperature: ±0.5°C from reference
- [ ] Humidity: ±3% RH from reference
- [ ] VOC: Responds to known VOC source
- [ ] Stability: 72-hour continuous operation
- [ ] Wi-Fi: Reconnection after router restart
- [ ] MQTT: Reconnection after broker restart
- [ ] DFU: Recovery after interrupted transfer
- [ ] Relay: Toggle 100 times without failure
- [ ] LED: All colors and brightness levels

### Test Documentation
- [ ] `docs/testing/unit-tests.md`: How to run unit tests
- [ ] `docs/testing/hardware-validation.md`: Manual test procedures
- [ ] Test results template for hardware validation

## Open Questions

- **Q1**: Should we enforce minimum test coverage percentage?
  - Status: To determine
  - Decision: Not initially; focus on critical paths first

- **Q2**: Should we use a test broker for MQTT integration tests?
  - Status: To determine
  - Decision: Yes, use Mosquitto in Docker for CI

---

## AI Metadata

```json
{
  "taskId": "PRD-021",
  "complexity": "complex",
  "phase": 5,
  "isBlocking": false,
  "estimatedEffort": "5-7 days",
  "category": "testing",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
