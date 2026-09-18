# OpenAwair

Local-first firmware research for Awair Glow C and Element, with separate
compatibility tracks for V1 and Glow. The goal is owner-controlled MQTT/REST
access and a stock-to-custom installation that does not require end users to
open their devices or buy a programmer.

**There is no verified stock-to-custom wireless installer or usable Glow C /
Element firmware release in this repository yet.** The embedded firmware is a
stub; the existing host code models intended behavior. The migration toolkit
below is working research software, not evidence that a stock Awair accepts our
firmware. Do not factory-reset a legacy Awair to make it discoverable.

## Start the local research workbench

Requires Node 22+ and the repository's TypeScript development dependency:

```sh
npm install
npm run migration:serve
```

Open the loopback URL printed by the command. The workbench provides
metadata-only Web Bluetooth discovery on supported browsers, local firmware
hash/marker analysis, and device-scoped TShark JSON summaries. It has no flash,
reset, update-server, DNS modification or remote-upload command.

For a broader OS-exposed Bluetooth inventory on a Mac, use the optional native
collector described in the [closed-device runbook](docs/research/closed-device-runbook.md).
An empty browser inventory is not proof that a DFU service is absent: Web
Bluetooth exposes only services for which the page has permission.

## CLI and tests

```sh
npm run migration:build
node tools/migration/cli.mjs status --model glow-c
node tools/migration/cli.mjs --help
npm run migration:test
python3 -m unittest discover -s tools/migration/test -p 'test_*.py'
```

For machine-readable output, invoke `node` directly after the build; npm's script
headings are not part of the JSON report. All generated evidence remains local.
Review minimized reports before sharing; never commit raw firmware or captures.

Existing host checks remain separate:

```sh
npm run typecheck
npm run lint
npm test
# Both JavaScript/TypeScript suites:
npm run test:all
```

## Project status and research

- [Verified sources, unknowns, and next research gates](docs/research/2026-09-18-stock-migration.md)
- [Closed-device collection runbook](docs/research/closed-device-runbook.md)
- [Toolkit design](docs/superpowers/specs/2026-09-18-stock-migration-toolkit.md)
- [Implementation plan](docs/superpowers/plans/2026-09-18-stock-migration-toolkit.md)
- [Legacy firmware implementation tasks](docs/tasks/README.md)

Rewair demonstrates a V1 replacement communications firmware and subsequent OTA
updates, but its initial installer uses SWD. Its installation method and hardware
layout are not assumed to apply to Glow C or Element. New toolkit code is written
independently; no Rewair source or stock device images are bundled here.

Awair's 2022 sunset announcement names V1, Glow and Glow C, **not Element**.
Element must not inherit legacy support or hardware assumptions. Primary sources
and their scope are recorded in the research document.

## Structure

- `firmware/`: C/C++ bring-up stub, not a flashable product.
- `host/`: existing TypeScript firmware/loader behavior models.
- `tools/migration/`: independent TypeScript analysis modules, local browser/CLI,
  optional native BLE metadata collector, and synthetic tests.
- `docs/`: research evidence, designs, and implementation tasks.
