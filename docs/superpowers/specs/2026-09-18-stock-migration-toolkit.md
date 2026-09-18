# Stock migration discovery toolkit

## Approved direction

Implement the stock-to-custom feasibility milestone approved on 2026-09-18. Target
Glow C first, track Element and V1 independently, require no additional end-user
hardware, and preserve an eventual browser/native macOS/iOS installation path.

## Deliverable and boundaries

A local-first discovery toolkit, not a working stock flasher. It collects evidence
needed to identify an externally accessible installation path. No firmware write,
BLE characteristic write, notification subscription, factory reset, pairing reset,
DNS alteration, vendor impersonation, or trial image is included. Developer bench
recovery and real-device qualification remain prerequisites for a migration release.

## Architecture

- Pure TypeScript analysis modules build independently of the older host simulator.
  Native Node ES-module entrypoints need no production dependencies.
- A static browser workbench performs Bluetooth service/characteristic enumeration
  and local firmware-file analysis. Permission-limited browser discovery is never
  reported as a complete GATT inventory or absence of a DFU service.
- An optional Python/Bleak collector enumerates the OS-exposed services on one
  explicitly selected device. It does not read characteristic values or subscribe.
- An offline TShark-JSON analyzer scopes packets to an explicitly supplied device
  IP and retains only known vendor hostnames, protocol counts, and TLS alert codes.
  It never equates TLS observation with server-authentication behavior.
- An offline firmware analyzer hashes files and reports known marker offsets and
  candidate ARM vectors. It never concludes that firmware is unsigned or flashable.
- Every report labels the model as user-supplied and stock migration as unverified.
  There is no supported profile and no switch that enables flashing.

## Data boundaries

No telemetry or automatic upload. Reports omit device addresses/names, serials,
Wi-Fi credentials, manufacturer payloads, characteristic values, HTTP request
paths/headers/bodies, raw firmware, and raw captured packets. Only a fixed list of
known Awair hostnames is retained; unknown hostnames are counted, not exported.
Reports still need review before sharing. Raw captures and firmware stay private.

## Compatibility and safety

Node 22+ and TypeScript 5.6+ for the workbench. Python 3.10+ with optional pinned
Bleak for native BLE discovery. Safari/iOS can use local-file analysis when the
static workbench is served securely, but are not promised Web Bluetooth support.
The local development server binds only to 127.0.0.1, rejects other Host/Origin
headers, serves an explicit asset allowlist, and exposes no device/network API.

## Acceptance

1. Tests demonstrate firmware/capture validation, input bounds, scoped analysis,
   data minimization, and unverified results even with update/security markers.
2. Browser and native collector tests fail on any attempted characteristic read,
   write, notification subscription, or automatic selection of a device.
3. CLI smoke tests exercise real files, invalid commands, bounded reads, no-target
   captures, and a loopback server including cross-origin/path/method rejection.
4. Documentation cites primary evidence, separates inference from observations,
   corrects earlier unsupported claims, and supplies a closed-device runbook.
5. Changes are published on a review branch/PR. No hardware-test result is claimed
   from software mocks, and no stock firmware or private capture is committed.
