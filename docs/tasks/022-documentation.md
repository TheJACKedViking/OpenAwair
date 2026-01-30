# PRD-022: Documentation

## Overview

### The Problem
Documentation is minimal. Users need guides for hardware teardown, flashing, setup, and troubleshooting. Contributors need technical documentation for the codebase, protocols, and APIs.

### Why It Matters
- **User Impact**: Good docs enable self-service and reduce frustration
- **Business Impact**: Documentation reduces support burden
- **Technical Impact**: Technical docs enable community contributions

### Context
Documentation needs span multiple audiences:
- End users: Setup guides, troubleshooting
- Developers: API docs, protocol specs
- Contributors: Code architecture, build instructions
- Community: Announcements, FAQ

## Out of Scope

The following are explicitly NOT part of this issue:
- Video tutorials
- Translated documentation
- Interactive API documentation (Swagger)
- Automated doc generation from code

## Solution

### Approach
1. Create hardware teardown guide with photos
2. Document flashing and setup procedures
3. Write Home Assistant integration guide
4. Create troubleshooting guide with LED codes
5. Document technical specifications (protocols, APIs)
6. Prepare community announcement posts

### User Stories
- **US-1**: As a user, I want clear setup instructions
- **US-2**: As a developer, I want API documentation

### Key Implementation Notes
- Use Markdown for all documentation
- Include photos for hardware guides
- Provide copy-paste examples for configuration
- Keep troubleshooting guide updated with common issues

## Technical Requirements

### Constraints
- **Must use**: Markdown format
- **Must include**: Photos for hardware guides
- **Must provide**: Working configuration examples

### Dependencies
- **Blocked by**: Implementation of documented features
- **Blocks**: Public release
- **Related**: All implementation PRDs

### Code References
- Location: `docs/` directory
- User docs: `docs/user/`
- Technical docs: `docs/technical/`
- Community: `docs/community/`

## Acceptance Criteria

### Technical Documentation
- [ ] `docs/technical/flash-memory-map.md`: Partition layout diagram
- [ ] `docs/technical/ble-services.md`: All GATT service/characteristic UUIDs
- [ ] `docs/technical/mqtt-topics.md`: Topic structure and payload formats
- [ ] `docs/technical/rest-api.md`: All endpoints with request/response examples
- [ ] `docs/technical/dfu-protocol.md`: BLE DFU protocol specification
- [ ] `firmware/README.md`: Build instructions for contributors

### User Documentation
- [ ] `docs/user/teardown-glow-c.md`: Disassembly with photos
- [ ] `docs/user/teardown-element.md`: Disassembly with photos (when available)
- [ ] `docs/user/flashing.md`: SWD flashing procedure with photos
- [ ] `docs/user/setup.md`: First-time setup (flash, provision, configure)
- [ ] `docs/user/home-assistant.md`: HA integration with MQTT/REST examples
- [ ] `docs/user/troubleshooting.md`: Common issues and LED codes
- [ ] `docs/user/faq.md`: Frequently asked questions

### Community Documentation
- [ ] `docs/community/release-notes.md`: Changelog template
- [ ] Draft: Home Assistant Community forum announcement
- [ ] Draft: r/Awair subreddit announcement
- [ ] `.github/ISSUE_TEMPLATE/bug_report.md`: Bug report template
- [ ] `.github/ISSUE_TEMPLATE/feature_request.md`: Feature request template
- [ ] `.github/CONTRIBUTING.md`: Contribution guidelines

### Quality
- [ ] All docs reviewed for accuracy
- [ ] All code examples tested
- [ ] Photos are clear and relevant
- [ ] Links validated

## Open Questions

- **Q1**: Should we set up a documentation website (GitHub Pages, Docusaurus)?
  - Status: To determine
  - Decision: Not for MVP; GitHub repo docs are sufficient

- **Q2**: Should we create video tutorials?
  - Status: To determine
  - Decision: Not for MVP; community can contribute later

---

## AI Metadata

```json
{
  "taskId": "PRD-022",
  "complexity": "moderate",
  "phase": 5,
  "isBlocking": false,
  "estimatedEffort": "4-5 days",
  "category": "documentation",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
