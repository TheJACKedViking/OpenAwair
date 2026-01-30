# PRD-020: CLI Application

## Overview

### The Problem
Users have no command-line tool to interact with their devices. A CLI provides power users and developers a scriptable interface for flashing, provisioning, and querying devices.

### Why It Matters
- **User Impact**: Power users prefer CLI tools for automation
- **Business Impact**: CLI enables scripting and CI/CD integration
- **Technical Impact**: CLI is simpler to develop than GUI, provides foundation for testing

### Context
The CLI should support the core workflows: firmware flashing via BLE, Wi-Fi provisioning, device status queries, and configuration management. It builds on the BLE transport and provisioning client.

## Out of Scope

The following are explicitly NOT part of this issue:
- Desktop GUI application
- Mobile application
- Web-based interface
- Batch operations on multiple devices

## Solution

### Approach
1. Create CLI entry point using a framework like Commander.js or yargs
2. Implement `flash` command for BLE DFU firmware upload
3. Implement `provision` command for Wi-Fi setup
4. Implement `status` command to query device via REST
5. Implement `config` command for device settings
6. Add progress bars and user-friendly output
7. Package as standalone executable

### User Stories
- **US-1**: As a developer, I want to flash firmware from terminal
- **US-2**: As a user, I want to check device status via command line

### Key Implementation Notes
- Use Commander.js for argument parsing
- Use ora for spinners, chalk for colors
- Progress bar for firmware upload
- JSON output option for scripting
- Configurable verbosity levels

## Technical Requirements

### Constraints
- **Must support**: macOS (primary)
- **Should support**: Linux, Windows
- **Must implement**: Progress feedback for long operations
- **Must support**: JSON output for scripting

### Dependencies
- **Blocked by**: BLE transport (PRD-018), Provisioning client (PRD-019)
- **Blocks**: End-user firmware distribution
- **Related**: Desktop UI (PRD-021)

### Code References
- Files to create: `host/src/cli/index.ts`, `host/src/cli/commands/*.ts`
- Files to create: `host/src/cli/output.ts` (formatting utilities)
- Package.json: Add bin entry for `openawair` command

## Acceptance Criteria

### General
- [ ] CLI invoked as `openawair <command> [options]`
- [ ] Help text: `openawair --help` shows all commands
- [ ] Version: `openawair --version` shows version
- [ ] Verbose mode: `-v` for debug output
- [ ] JSON mode: `--json` for machine-readable output

### Flash Command
- [ ] `openawair flash <firmware.bin>` flashes firmware via BLE
- [ ] Discovers device in DFU mode
- [ ] Shows progress bar during upload
- [ ] Reports success/failure clearly
- [ ] `--device <id>` to specify device if multiple found

### Provision Command
- [ ] `openawair provision --ssid <ssid> --password <pwd>` configures Wi-Fi
- [ ] Discovers device in provisioning mode
- [ ] Shows connection progress
- [ ] Reports success with IP address or failure with reason
- [ ] `--device <id>` to specify device

### Status Command
- [ ] `openawair status [--host <ip>]` queries device
- [ ] Discovers device via mDNS or uses provided IP
- [ ] Shows firmware version, uptime, Wi-Fi signal
- [ ] Shows current sensor readings
- [ ] JSON output includes all fields

### Config Command
- [ ] `openawair config get <key>` reads configuration
- [ ] `openawair config set <key> <value>` writes configuration
- [ ] Supported keys: device_name, mqtt_broker, publish_interval
- [ ] Uses REST API for communication

### Packaging
- [ ] Compiled to standalone executable (pkg or similar)
- [ ] macOS binary works without Node.js installed
- [ ] Binary size reasonable (< 50MB)
- [ ] Included in GitHub releases

## Open Questions

- **Q1**: Should we support interactive mode for provisioning?
  - Status: To determine
  - Decision: Nice to have; prompts for SSID/password if not provided

- **Q2**: What packaging tool to use?
  - Status: To determine
  - Decision: pkg or esbuild + single-file bundle

---

## AI Metadata

```json
{
  "taskId": "PRD-020",
  "complexity": "moderate",
  "phase": 4,
  "isBlocking": false,
  "estimatedEffort": "3-4 days",
  "category": "host-tooling",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
