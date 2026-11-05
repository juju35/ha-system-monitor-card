# ha-system-monitor-card

[![HACS](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HACS Validation](https://github.com/juju35/ha-system-monitor-card/actions/workflows/hacs.yml/badge.svg)](https://github.com/juju35/ha-system-monitor-card/actions/workflows/hacs.yml)
[![Validate](https://github.com/juju35/ha-system-monitor-card/actions/workflows/validate.yml/badge.svg)](https://github.com/juju35/ha-system-monitor-card/actions/workflows/validate.yml)
[![Lint](https://github.com/juju35/ha-system-monitor-card/actions/workflows/lint.yml/badge.svg)](https://github.com/juju35/ha-system-monitor-card/actions/workflows/lint.yml)
[![Release](https://img.shields.io/github/v/release/juju35/ha-system-monitor-card)](https://github.com/juju35/ha-system-monitor-card/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/juju35/ha-system-monitor-card/blob/main/LICENSE)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/julienstep9)

<p align="center"><img src="https://raw.githubusercontent.com/juju35/ha-system-monitor-card/main/images/home-assistant.svg" alt="Home Assistant" width="140"></p>

Lovelace cards for Home Assistant to monitor the machine running Home Assistant itself: CPU, RAM, disk, temperature, network, storage and processes at a glance.

The cards are built on top of the core [System Monitor integration](https://www.home-assistant.io/integrations/systemmonitor/): entities are **discovered automatically**, you don't have to pick them one by one, and it works whatever the language of your installation.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-system-monitor-card&category=plugin)

| System Monitor Card | System Monitor Mini Card |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-system-monitor-card/main/screenshots/card.png" alt="system-monitor-card" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-system-monitor-card/main/screenshots/mini-card.png" alt="system-monitor-mini-card" width="400"> |

## Features

- Two cards: a full **System Monitor Card** and a compact **System Monitor Mini Card**
- **Zoom** on the mini card: a button at the top right switches it to the full System Monitor card (same options) and back; a click anywhere outside the card brings it back too
- Automatic discovery of the System Monitor entities through the entity registry (any language)
- CPU, RAM, disk and CPU temperature gauges, uptime, load average and IP address
- Home Assistant Core and OS versions, with an orange badge when an update is available
- Network download / upload rates and totals, per interface (virtual interfaces such as `docker0` or `hassio` are hidden)
- Storage: every monitored mount point and the swap, with used space, and the size of the Home Assistant database
- Monitored processes, green when running and red when stopped: hidden while they all run (their status tile shows the list on a click), always shown while one is stopped, with their overall status in the status row
- Colors turn orange / red when a threshold is crossed (CPU, RAM, disk, temperature)
- Click any value to open its Home Assistant history (more-info dialog)
- Visual editor in the dashboard UI for every card (no YAML needed)
- Light and dark mode, English, French, German, Spanish, Serbian (Cyrillic and Latin), Italian, Dutch, European Portuguese, Polish, Romanian, Danish, Swedish, Bulgarian, Russian, Ukrainian, Hungarian, Slovak, Czech, Slovenian, Latvian and Greek
- Single file, no external dependency

## Supported integrations

| Integration | What the cards show |
|---|---|
| [System Monitor](https://www.home-assistant.io/integrations/systemmonitor/) (built in) | CPU, RAM, disk and temperature gauges, uptime, load, IP address, network, storage and swap, monitored processes |
| [File Size](https://www.home-assistant.io/integrations/filesize/) (built in, optional) | Size of the Home Assistant database |
| Home Assistant updates (built in, `update.home_assistant_*`) | Core and OS versions, with a badge when an update is available |

The Marketplace updates and the unavailable integrations have their own cards: [Marketplace Refresh](https://github.com/juju35/ha-marketplace-refresh) and [Integration Watchdog](https://github.com/juju35/ha-integration-watchdog).

## Prerequisites

Home Assistant 2024.8 or later, and:

The [System Monitor integration](https://www.home-assistant.io/integrations/systemmonitor/) must be added (**Settings → Devices & services → Add integration → System Monitor**).

Most of its sensors are disabled by default: open the **System Monitor** device and enable the ones you want to see on the card, for example:

| Card section | Sensors to enable |
|---|---|
| System | Processor use, Memory usage (or Memory use + Memory free), Disk usage / Disk use + Disk free, Processor temperature, Last boot (called Uptime in recent versions), Load (1m/5m/15m), IPv4 address |
| Network | Network throughput in / out, Network in / out (totals) |
| Storage | Disk use + Disk free for each mount point, Swap use + Swap free. For the database size, the [File Size](https://www.home-assistant.io/integrations/filesize/) integration on `/config/home-assistant_v2.db` (see below) |
| Processes | Process binary sensors (configured in the integration options) |

Sections and gauges without any enabled sensor are simply not displayed.

## Installation

### Via HACS (recommended)

Click the button below to add the repository directly:

[![Add to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-system-monitor-card&category=plugin)

Then click **Download**, and reload your browser when HACS asks you to.

Or manually:

1. Open HACS → **⋮** (top right) → **Custom repositories**
2. Add `https://github.com/juju35/ha-system-monitor-card` — Type: **Dashboard**
3. Search for **System Monitor Card** and click **Download**
4. Clear your browser cache and refresh

### Manual

1. Download `system-monitor-card.js` from the [latest release](https://github.com/juju35/ha-system-monitor-card/releases/latest)
2. Copy it to `/config/www/system-monitor-card.js`
3. Go to **Settings → Dashboards → ⋮ → Resources** → Add resource:
   - URL: `/local/system-monitor-card.js`
   - Type: **JavaScript Module**
4. Clear your browser cache and refresh

## Configuration

### Visual editor

Edit a dashboard, click **Add card** and search for **System Monitor Card** or **System Monitor Mini Card**. Set an optional title, choose the sections to display, the network interface and the language. The preview updates live, and options left at their default are kept out of the generated YAML.

### Minimal

```yaml
type: custom:system-monitor-card
```

```yaml
type: custom:system-monitor-mini-card
```

### Full options

```yaml
type: custom:system-monitor-card
title: My Home Assistant
show_system: true
show_network: true
show_storage: true
show_processes: true
interface: eth0
language: fr
```

```yaml
type: custom:system-monitor-mini-card
title: My Home Assistant
show_storage: true
show_network: true
zoom: true
interface: eth0
language: fr
```

### Options reference

| Option | Card | Default | Description |
|---|---|---|---|
| `title` | all | `Home Assistant` | Card title |
| `show_system` | full | `true` | CPU, RAM, disk and temperature gauges, uptime, load, IP address |
| `show_network` | full, mini | `true` | Network download / upload |
| `show_storage` | full, mini | `true` | Full card: mount points, swap and database size. Mini card: disk bar |
| `show_processes` | full | `true` | Monitored processes and their status tile |
| `zoom` | mini | `true` | Zoom button at the top right: shows the full card, and back to the compact view |
| `interface` | full, mini | All physical interfaces | Network interface to display (e.g. `eth0`, `enp0s3`) |
| `language` | all | Auto | Force language: `en`, `fr`, `de`, `es`, `sr`, `sr-Latn`, `it`, `nl`, `pt`, `pl`, `ro`, `da`, `sv`, `bg`, `ru`, `uk`, `hu`, `sk`, `cs`, `sl`, `lv` or `el` (auto-detects from HA settings) |

## Screenshots

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-system-monitor-card/main/screenshots/card.png" alt="card" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-system-monitor-card/main/screenshots/card-dark.png" alt="card dark" width="400"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-system-monitor-card/main/screenshots/mini-card.png" alt="mini card" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-system-monitor-card/main/screenshots/mini-card-dark.png" alt="mini card dark" width="400"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-system-monitor-card/main/screenshots/mini-card-zoom.png" alt="mini card zoomed in" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-system-monitor-card/main/screenshots/mini-card-zoom-dark.png" alt="mini card zoomed in dark" width="400"> |

## How it works

The cards read the entity registry of Home Assistant and keep the entities of the `systemmonitor` platform. Each sensor is recognized by its translation key (`processor_use`, `memory_use_percent`, `disk_free`, `throughput_network_in`…), so entity ids translated in another language (for example `sensor.system_monitor_utilisation_du_processeur`) and renamed entities are supported. Mount points, interfaces and process names are read from the end of the sensor name, after the device name and the label: a mount point starts at its first `/` (so names with spaces, `/mnt/My Passport`, are kept whole), an interface is the last word, a process name is what follows `Process` (or the label the other processes share). This works for a sensor alone of its kind too (`Disk usage /config`). A sensor renamed in its entity settings (`WAN up`, `Root free`) no longer says its argument: it is read from its entity id instead, which Home Assistant made from the original name (`sensor.system_monitor_network_throughput_out_eth0` → `eth0`, `sensor.system_monitor_disk_free` → `/`). When the registry is not available, English entity ids (`sensor.system_monitor_processor_use`…) are used as a fallback.

The Core and OS versions come from the `update.home_assistant_core_*` and `update.home_assistant_operating_system_*` entities when they exist, otherwise from the running Home Assistant version.

### Status row

Under the header, a tile gives the overall status of the **Processes** section (running or the number stopped), green when all is well, red otherwise. The Core / OS update badge turns grey "Unknown" when the update entity is unavailable. Click the tile to show the section unfolded; a click elsewhere folds or hides it again. The Home Assistant Core / OS update stays next to the logo. The tile is left out when the section is hidden or has no process.

### Mini card

The compact card shows CPU, RAM, disk and temperature bars, then the Core / OS status, the network rates and the uptime. At the far right of the header, a small round button (`mdi:arrow-expand`) shows the full card in its place, with the same options, exactly as the **System Monitor Card** shows it, and turns into `mdi:arrow-collapse` to bring the compact view back; a click anywhere outside the card does too, but not a click in a dialog opened from it (more-info). `zoom: false` removes the button.

### Processes

The processes section is hidden while every monitored process runs: the **Processes** tile of the status row says "Running", and a click on it shows the list, which hides again on a click on its title or elsewhere. As soon as a process is stopped, the section shows up by itself and stays, whatever you click, until every process runs again. Its title shows the number of processes, and the number stopped in red.

### Database size

The **Storage** section ends with the size of the Home Assistant database (the default SQLite one, `home-assistant_v2.db`), read from the [File Size](https://www.home-assistant.io/integrations/filesize/) integration. To get it:

1. Allow Home Assistant to read the file, in `configuration.yaml`, then restart:
   ```yaml
   homeassistant:
     allowlist_external_dirs:
       - /config
   ```
2. **Settings → Devices & services → Add integration → File Size**, with the path `/config/home-assistant_v2.db`.

The card finds its size sensor by itself (platform `filesize`, a file named `home-assistant_v2.db`); a click on the row opens its history. Without it, the row is not shown. An external database (MariaDB, PostgreSQL) is not a file and isn't supported.

### Thresholds

Gauges and bars turn orange, then red, when a value crosses these thresholds:

| Value | Orange | Red |
|---|---|---|
| CPU usage | 70 % | 90 % |
| RAM usage | 80 % | 95 % |
| Disk usage | 80 % | 90 % |
| CPU temperature | 75 °C (167 °F) | 90 °C (194 °F) |
| Swap usage | 50 % | 80 % |

The CPU temperature is shown in the unit of its sensor, which follows the unit system of Home Assistant (°C, or °F with US customary units) or the display unit chosen in the sensor's settings; the thresholds apply to the same temperature in any unit.

## Development

```bash
npm ci               # installs the locked dev dependencies (Playwright, for the screenshots)
npm run build        # bundles src/system-monitor-card.js + images/home-assistant.svg into dist/system-monitor-card.js
npm run check        # builds and checks the card (run in CI)
npm run screenshots  # renders the cards with mock data into screenshots/ (ffmpeg compares the pixels of the captures)
```

`dist/` is not committed: `npm run build` creates it locally, CI builds it on every push, and the release workflow attaches the built file to the release, which is where HACS downloads it from.

### Releasing

1. Bump `version` in `package.json`
2. Add a `## <version>` section at the top of [CHANGELOG.md](https://github.com/juju35/ha-system-monitor-card/blob/main/CHANGELOG.md)
3. Push to `main`: the **Release** workflow builds the card, creates the tag and the GitHub release with the changelog section as notes, and attaches `system-monitor-card.js`

## Translations

The cards auto-detect the language from your Home Assistant settings. Currently supported:

| Language | Code |
|---|---|
| English | `en` |
| Français | `fr` |
| Deutsch | `de` |
| Español | `es` |
| Српски | `sr` |
| Srpski (latinica) | `sr-Latn` |
| Italiano | `it` |
| Nederlands | `nl` |
| Português (Portugal) | `pt` |
| Polski | `pl` |
| Română | `ro` |
| Dansk | `da` |
| Svenska | `sv` |
| Български | `bg` |
| Русский | `ru` |
| Українська | `uk` |
| Magyar | `hu` |
| Slovenčina | `sk` |
| Čeština | `cs` |
| Slovenščina | `sl` |
| Latviešu | `lv` |
| Ελληνικά | `el` |

Regional variants fall back to the base language (`it-IT` → `it`, `nl-BE` → `nl`, `pl-PL` → `pl`); Brazilian Portuguese (`pt-BR`) uses the European Portuguese translation. In the languages whose plurals have more than two forms (Serbian, Polish, Romanian, Russian, Ukrainian, Slovak, Czech, Slovenian and Latvian), counts other than 1 read "label: {n}" (`Nedostupne: 2`).

Contributions for additional languages are welcome!

## License

[MIT](https://github.com/juju35/ha-system-monitor-card/blob/main/LICENSE)

## Support

If you find this project useful, you can support its development:

<a href="https://buymeacoffee.com/julienstep9"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="50"></a>
