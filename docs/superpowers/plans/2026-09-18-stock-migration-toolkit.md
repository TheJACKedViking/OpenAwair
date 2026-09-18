# Stock Migration Toolkit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Execute inline with tests before implementations.

**Goal:** Produce usable evidence-gathering tools without attempting an unverified firmware migration.

**Architecture:** Pure TypeScript analyzers shared by a Node CLI and a static browser workbench. A separately tested optional Python/Bleak collector inventories OS-exposed GATT metadata. No firmware-write transport exists in this milestone.

**Tech Stack:** Node 22+, TypeScript 5.6+, native node:test, Python 3.10+, unittest, optional Bleak 3.0.2.

**Spec:** `docs/superpowers/specs/2026-09-18-stock-migration-toolkit.md`

## Global constraints

No device writes, notification subscriptions, reset, DNS changes, image delivery,
automatic uploads, or claim of stock flashing support. Preserve the old host
simulator. Node runtime code uses standard-library imports only. Unknown remains
unknown; user-supplied model names and marker strings are not compatibility proof.

## Task 1: Shared evidence and offline analysis

Create `tools/migration/src/{evidence,firmware,capture}.ts`, independent tsconfig,
and `tools/migration/test/analysis.test.mjs`.

- [x] Add failing assertions for invalid models, bounded inputs, marker presence
  without authentication conclusions, no input mutation, and credential omission.
- [x] Add synthetic TShark fixtures in tests with outbound DNS, TLS SNI, HTTP,
  incoming alerts, unrelated devices, malformed packets, and IPv6 spelling changes.
- [x] Implement `parseModel`, `report`, `analyzeFirmware(bytes, model)`, and
  `summarizeCapture(input, deviceIp, model)` with explicit unknown verification fields.
- [x] Run `tsc -p tools/migration/tsconfig.json` and
  `node --test tools/migration/test/analysis.test.mjs`.

## Task 2: Metadata-only Bluetooth collectors

Create `tools/migration/src/ble.ts`, `tools/migration/ble_inventory.py`,
`tools/migration/requirements-ble.txt`, and collector tests.

- [x] Test invalid/duplicate service UUIDs and explicit selection requirements.
- [x] Use fakes that throw on characteristic reads, writes, subscriptions, and
  attempted value I/O. Assert clean disconnection on success and failure; the
  native adapter requests `pair=False` and needs real-platform validation.
- [x] Implement `inventoryBluetooth(api, model, optionalServices, timeoutMs)` and
  a bounded native collector that returns only UUID/property metadata.
- [x] Test late browser connection completion after timeout and lazy native imports
  without requiring Bluetooth hardware. Optional dependency imports are configured
  in CI; a CI result is not claimed by local mock tests.

## Task 3: Runnable local workbench and CLI

Create `tools/migration/{cli,server}.mjs`, static web assets and CLI/server tests.
Update root npm scripts without replacing the existing host tests.

- [x] Test strict command options, unknown commands, missing files, symlinks,
  over-limit files and a capture with no matching target packets.
- [x] Implement `status`, `firmware`, `capture`, and `serve` commands. Output JSON
  to stdout only; diagnostic errors go to stderr; never overwrite evidence files.
- [x] Test fixed asset routing, loopback binding, Host/Origin validation,
  cross-origin/method rejection and security headers.
- [x] Wire browser controls to local analyzers and metadata-only BLE inventory;
  expose no flash button, remote upload, external script or CDN.

## Task 4: Research, documentation, CI and publication

Create research/runbook docs and a migration CI workflow. Correct README and
repository guidance so planned hardware/DFU behavior is not called verified.

- [x] Record exact repository baseline/references and primary-source findings.
- [x] Define physical-device gates for accepted image, boot, data preservation,
  loss-of-power recovery and a repeated enclosure-closed installation.
- [x] Run all available local tests, inspect the diff, and document unavailable
  hardware/macOS/iOS testing rather than marking it passed.
- [ ] Publish the changes to `research/stock-migration-toolkit`, open a PR and
  explicit follow-up issues for physical evidence and migration qualification.
