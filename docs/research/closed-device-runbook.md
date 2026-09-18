# Closed-device discovery runbook

This procedure gathers evidence; **it does not flash firmware**. Do not factory-
reset an Awair V1, Glow or Glow C to make these tools work. Preserve an already
configured unit's state. Stock firmware, device-specific captures and scan output
stay private. Nothing is automatically uploaded.

## 1. Build the software and create a private workspace

Run from this repository on a machine with Node 22+:

```sh
npm install
npm run migration:build
umask 077
mkdir -p tools/migration/private
chmod 700 tools/migration/private
```

Use new output filenames. Shell redirection can overwrite an existing file;
`set -o noclobber` in Bash/zsh protects against that. Do not redirect output onto
an input image or capture. The `private/` directory is ignored by Git, but is not
encrypted. Store raw evidence securely and review any file before sharing it.

## 2. Use the local browser workbench

```sh
npm run migration:serve
```

Open the printed `http://127.0.0.1:8765` address on that same computer. The server
is intentionally not reachable from a phone or other LAN device. It serves only
static assets; there is no device-proxy, firmware-upload or update-server API.

Select the exact model yourself; the selector is not hardware detection. The
workbench can analyze local firmware and TShark JSON files without sending them
to the server. The Web Bluetooth button is enabled only when the browser exposes
the API and you acknowledge ownership. Select only your own Awair in the chooser.

Only Device Information (`180a`) and any explicitly supplied optional service
UUIDs are visible. An empty result is inconclusive. Supply additional UUIDs only
from an actual native inventory or documented target interface, not as a guessed
DFU contract. No characteristic values are read, and no notifications subscribed.

Native discovery is the alternative where Web Bluetooth is unavailable, including
browsers/platforms that do not implement it. This milestone does not deliver an
iOS installer or publicly hosted production site. Future secure static hosting
can expose file-analysis UI, but cannot manufacture a stock-device DFU service.

## 3. Collect OS-exposed Bluetooth metadata on your Mac

This optional collector needs Python 3.10+ and a Bluetooth-capable OS/adapter.
It uses the Mac's existing Bluetooth hardware; no programmer is required.

```sh
python3 -m venv tools/migration/.venv
. tools/migration/.venv/bin/activate
python -m pip install -r tools/migration/requirements-ble.txt
python tools/migration/ble_inventory.py --list
```

The list is private: it contains nearby names and OS identifiers solely so you
can select your own device. On macOS the identifier is normally an OS UUID rather
than a MAC address. Do not share this list. Copy only your device's exact identifier
into the next command and use a new output filename:

```sh
python tools/migration/ble_inventory.py \
  --address 'IDENTIFIER_FROM_PRIVATE_SCAN' --model glow-c \
  > tools/migration/private/glow-c-ble-report.json
```

The resulting report contains only service/characteristic UUIDs, property flags
and collection metadata. It omits names, addresses, advertisement payloads and
characteristic values. OS-exposed discovery is not a guarantee of every firmware
interface. No pairing operation is requested, but operating-system authorization
prompts may still appear. Deny an unexpected pairing request and investigate.

If the unit is not advertising, another app occupies its connection, or access
is denied, record that fact. Check the computer's Bluetooth permission/state and
close an existing connection where appropriate. **Do not reset the device** to
obtain a report. The collector never picks the nearest/strongest device for you.

## 4. Collect and summarize update-network observations

Capture from a point that actually sees this device's traffic, such as an existing
router/AP capture facility. A laptop on the same switched Wi-Fi network is not
assumed to see another client's unicast packets. Do not install a TLS interception
certificate, change device DNS, serve replacement updates or alter the router as
part of this read-only baseline. Capture only your own authorized device/network.

Privately record the target's IP at capture time. With an existing capture and
TShark installed, export the selected packets (replace the example address):

```sh
tshark -r tools/migration/private/glow-c.pcapng \
  -Y 'ip.addr == 192.168.1.50' -T json \
  > tools/migration/private/glow-c-tshark.json

node tools/migration/cli.mjs capture tools/migration/private/glow-c-tshark.json \
  --model glow-c --device-ip 192.168.1.50 \
  > tools/migration/private/glow-c-network-report.json
```

For IPv6, use an `ipv6.addr` display filter and pass the same literal address to
`--device-ip` without brackets or an interface-zone suffix. The analyzer itself
also filters packets. Input limits are 32 MiB and 25,000 packets; split larger
captures before JSON export. TShark export, unlike the minimized report, may contain
sensitive data and stays private. The toolkit does not accept raw pcap/pcapng files.

Exit code 3 means no matching target packets, not that no updater exists. Check
capture position, filters and IP assignment. TLS packet/alert counts do not prove
certificate validation or image signing. Only `ota.awair.is`, `messaging.awair.is`
and `timeserver.awair.is` hostnames are exported; other hostnames are counted and
must be reviewed privately when investigating an alternate legacy endpoint.

## 5. Inspect a legitimately obtained stock image

An image is not required for the earlier steps. Do not erase a device to obtain
one. Do not download or distribute another owner's keys or device-specific dump.

```sh
node tools/migration/cli.mjs firmware tools/migration/private/owned-stock.bin \
  --model glow-c > tools/migration/private/glow-c-firmware-report.json
```

The analyzer accepts up to 16 MiB and reports the SHA-256, selected marker offsets
and vector candidates. It does not parse a signed package, validate hardware,
identify a signing key, decrypt an image or establish safe flash offsets. No
strings/URLs, key bytes or firmware payload are exported. A private-key marker
requires care with the original file; it is not permission to use or publish it.

## 6. Decide what evidence is still missing

The research milestone needs one exact model/stock-version baseline, reachable
update-interface evidence, separate transport/image/boot verification findings,
and a recoverable accepted-image boot test. Only after those gates pass should
an installation transport be implemented. Sending a firmware URL, discovering a
writable service or observing an update request is not that test.

Review minimized reports before attaching them to an issue. Never attach raw
captures, the `--list` output, serial numbers, device tokens or stock images.
A missing report is a recorded limitation, not a reason to reset the device.

## Development verification

```sh
npm run migration:test
python3 -m unittest discover -s tools/migration/test -p 'test_*.py'
```

The Python tests inject fake clients and need no Bleak installation. For the
optional real-browser UI smoke test, install Playwright and its Chromium build
in a development environment, then run:

```sh
python -m pip install playwright
python -m playwright install chromium
python tools/migration/test/browser_smoke.py
```

`CHROMIUM_EXECUTABLE=/path/to/chromium` can select an existing authorized test
browser. Tests use synthetic files and do not qualify actual Bluetooth, iOS,
Awair flash or recovery behavior. Do not bypass browser/network admin policy.
