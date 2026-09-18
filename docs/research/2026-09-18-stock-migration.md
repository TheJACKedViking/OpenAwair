# Stock migration research — 2026-09-18

## Scope and result

The accepted objective is a no-disassembly/no-new-hardware end-user conversion,
starting with an owned Glow C. This iteration provides usable local discovery
software and a testable evidence pipeline. **It does not prove a stock device
accepts custom firmware.** No physical Awair, stock binary, or device traffic
capture was available to execute that experiment in this environment.

Baseline reviewed: OpenAwair commit `8341d019a83751c1e936743649f25817708c2af0`.
Rewair reference: commit `09cf1a47d3b7399ef77dc56d422d527b7bf93bb9` and its current
release installer. GitHub reports no detected license for Rewair; no upstream
source or stock images are imported by this change. Licensing/redistribution
must be resolved before a port, rather than assuming public means licensed.

## Evidence ledger

| Question | Evidence | Scope and conclusion |
|---|---|---|
| Which models were sunset? | Manufacturer legacy notice [1] | V1, Glow, Glow C; do not apply the notice to Element. It warns against resets. |
| Does Glow C have BLE? | Manufacturer connectivity page [2] | BLE is used for setup; ports 8883 and 443 are required. It does not establish BLE DFU or the updater's identity checks. |
| Does Element use TLS for OTA? | Manufacturer network page [3] | HTTPS/TLS on 443, hourly OTA checks and `ota.awair.is` are documented for Element. |
| Is router DNS substitution sufficient? | Element DNS fallback details [3] | Multiple DNS sources and static-IP fallback must be considered. Authentication/package acceptance still require separate evidence. |
| Does Rewair bootstrap wirelessly? | Actual install script [4] | Initial release installation uses probe-rs/OpenOCD over SWD and requires internal/external backups. This is not a stock wireless install. |
| Are V1 offsets portable? | Installer targets STM32F411CE and distinct boot/app/resource locations [4] | No evidence of compatibility with Glow C or Element. Never use those addresses as a target profile here. |
| Is OpenAwair device firmware implemented? | Existing C entrypoint [5] | It is an empty-loop bring-up stub. Host models do not execute on the device. |
| Can a web page enumerate every BLE service? | Browser vendor API documentation [6] | Services must be granted through filters/optionalServices. An empty browser inventory is inconclusive. |
| Can a native collector inventory OS-exposed GATT? | Bleak scanner/client API [7][8] | It supports discovery and service metadata; this establishes host API capability, not Awair compatibility. |
| Can captures be analyzed without writing a packet parser? | Official TShark manual [9] | `-r` and `-T json` provide offline dissection/reassembly. The toolkit performs a bounded metadata projection. |

## What the new tools can establish

The browser workbench and optional native collector list service/characteristic
UUIDs and property flags without characteristic reads, writes or notification
subscriptions. Device selection is explicit. Native scan output is private and
contains nearby identifiers for selection; the resulting inventory omits them.

The firmware analyzer hashes one immutable snapshot, reports fixed marker offsets
without extracted strings, and identifies broad STM32-style vector candidates in
the first 4096 bytes. These are **search leads**, not a bootloader/package parser.
Encryption, compression, alternate encodings and optimized code can hide markers.
Finding a certificate or a private-key marker does not identify its purpose; do
not publish associated bytes or assume they authorize replacement firmware.

The capture analyzer requires an explicit target IP, accepts TShark JSON, and
exports known vendor hosts, protocol counts and numeric TLS alert codes. It omits
IPs, HTTP paths/headers/bodies and unknown hostnames. Unknown hosts are counted,
so relevant endpoints outside the allowlist must be inspected privately in the
original capture. This is intentional minimization, not comprehensive discovery.

Every report carries `stockMigration: unverified` and three unknown verification
fields. There is no flag, imported manifest, inferred score or URL that changes
that to an authorized flash. A hash or writable GATT property cannot enable a
write transport because none exists in the toolkit.

## Prioritized next experiments and acceptance gates

### G1 — Identity and observation, enclosure closed

Record model label, stock version if already visible, power/connectivity state
and any board revision available without opening the case. Do not reset to obtain
BLE advertising. Collect metadata and traffic from a capture point that really
sees the device. A laptop on the same switched WLAN is not assumed to see its
unicast traffic. Existing router/AP capture facilities are preferable where
available; do not require users to buy a new capture device.

**Pass:** a reproducible, privately retained baseline associated with the exact
unit and a minimized report. An empty inventory or zero matching packets is not
a negative finding about the updater.

### G2 — Stock update mechanism and authentication

Inspect legitimately obtained stock update packages, an owner-provided image, or
a recoverable development unit. Establish the triggering event, network endpoint,
TLS identity-validation behavior, manifest/image signature checks, package layout,
processor being updated and boot-time verification. These are separate questions.
A service string alone does not answer them. Plaintext HTTP alone does not mean
unsigned firmware, and observing TLS alone does not prove correct validation.

**Pass:** documented control flow and a reproducible acceptance/rejection matrix
for the exact stock version, without disclosing credentials or proprietary images.
If mandatory vendor authentication blocks a replacement, seek a manufacturer-
authorized transition; do not advertise DNS redirection as an implementation.

### G3 — Accepted transition image and recovery

Design a minimal transition image only after the actual updater/boot layout and
hardware are known. Preserve stock boot/recovery mechanisms and device-specific
radio/sensor configuration where possible. Do not blindly replace a bootloader,
DCT, calibration, factory slot or the sensor processor. Rewair's communications-
only replacement is an architectural lead, not evidence of the same separation
on Glow C or Element.

**Pass:** a recoverable development unit accepts the image using the proposed
external path and boots a controlled diagnostic application. Prove interrupted
upload, interrupted activation, failed-health-check and rollback behavior. A
later custom OTA rollback implementation does not qualify the first transition.
Developers may need bench recovery; the final end-user method must remain closed.

### G4 — End-user release qualification

Implement the browser/native installation transport around the proven G2/G3
protocol, not a guessed one. Require model/revision/stock-version matching,
release authentication, explicit owner authorization and bounded recovery. For
Glow C, verify relay-safe defaults and behavior during failure/reboot/rollback.
Add actual local sensor data, MQTT/REST and Home Assistant end-to-end testing.

**Pass:** repeatable enclosure-closed installation, data retention and recovery on
each supported combination using only allowed consumer equipment. Unsupported
models/versions remain blocked. Do not call any release unbrickable.

## Collaboration questions (drafts; not sent)

For Awair: Can you document each legacy model's update package, signing and boot
requirements, and the specific reason updates stopped? Would you review and sign
a minimal transition/recovery image or document an owner-authorized unlock path?
No private signing key or customer credential is requested.

For Rewair: Was stock OTA/BLE conversion investigated, and which exact stock
versions and bootloader checks were observed? Are anonymized protocol notes
available? What license applies to the source, and which SDK/radio resources can
be redistributed? Its existing SWD installer does not answer these questions.

## Verification record

The implementation uses synthetic inputs and mock BLE adapters for automated
collector tests. Node CLI tests exercise real local files and the loopback HTTP
server. Local execution used Node 22.16.0, TypeScript 5.8.3 and Python 3.13.5.
The added workflow repeats software tests on Linux/macOS and Node 22/24, and runs
a Chromium UI smoke test. Workflow configuration is not itself a passing run.

Local browser automation could launch the installed Chromium but navigation to
the loopback server was blocked by administrator policy. This was not bypassed.
Record an authorized CI result before calling the full browser smoke test passed.
No Bluetooth hardware, native macOS/iOS execution or Awair boot/recovery result
is claimed from these tests.

## Primary references

1. [Awair legacy notice](https://support.getawair.com/hc/en-us/articles/9344877988631-Legacy-Device-Support).
2. [Glow C connectivity](https://support.getawair.com/hc/en-us/articles/360030519474-Connectivity-Specifications).
3. [Element advanced networking](https://support.getawair.com/hc/en-us/articles/360039239213-Connecting-Awair-Element-to-Advanced-Network-Configurations).
4. [Rewair install script, pinned](https://github.com/naorunaoru/rewair/blob/09cf1a47d3b7399ef77dc56d422d527b7bf93bb9/scripts/install_release.zsh).
5. [OpenAwair C entrypoint, baseline](https://github.com/TheJACKedViking/OpenAwair/blob/8341d019a83751c1e936743649f25817708c2af0/firmware/src/main.c).
6. [Chrome Web Bluetooth documentation](https://developer.chrome.com/docs/capabilities/bluetooth).
7. [Bleak scanner API](https://bleak.readthedocs.io/en/latest/api/scanner.html).
8. [Bleak client API](https://bleak.readthedocs.io/en/latest/api/client.html).
9. [TShark manual](https://www.wireshark.org/docs/man-pages/tshark.html).

Sources reviewed on 2026-09-18. Manufacturer pages are documentation, not live
observations of a particular unit. Legacy hardware descriptions remain unverified
unless explicitly associated with model-specific evidence.
