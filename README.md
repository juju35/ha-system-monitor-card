# ha-system-monitor-card

[![HACS](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HACS Validation](https://github.com/juju35/ha-system-monitor-card/actions/workflows/hacs.yml/badge.svg)](https://github.com/juju35/ha-system-monitor-card/actions/workflows/hacs.yml)
[![Validate](https://github.com/juju35/ha-system-monitor-card/actions/workflows/validate.yml/badge.svg)](https://github.com/juju35/ha-system-monitor-card/actions/workflows/validate.yml)
[![Release](https://img.shields.io/github/v/release/juju35/ha-system-monitor-card)](https://github.com/juju35/ha-system-monitor-card/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center"><img src="images/home-assistant.svg" alt="Home Assistant" width="140"></p>

Lovelace cards for Home Assistant to monitor the machine running Home Assistant itself: CPU, RAM, disk, temperature, network, storage and processes at a glance.

The cards are built on top of the core [System Monitor integration](https://www.home-assistant.io/integrations/systemmonitor/): entities are **discovered automatically**, you don't have to pick them one by one, and it works whatever the language of your installation.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-system-monitor-card&category=plugin)

| System Monitor Card | System Monitor Mini Card |
|---|---|
| ![system-monitor-card](https://raw.githubusercontent.com/juju35/ha-system-monitor-card/main/screenshots/card.png) | ![system-monitor-mini-card](https://raw.githubusercontent.com/juju35/ha-system-monitor-card/main/screenshots/mini-card.png) |

## Features

- Two cards: a full **System Monitor Card** and a compact **System Monitor Mini Card**
- Automatic discovery of the System Monitor entities through the entity registry (any language)
- CPU, RAM, disk and CPU temperature gauges, uptime, load average and IP address
- Home Assistant Core and OS versions, with an orange badge when an update is available
- Network download / upload rates and totals, per interface (virtual interfaces such as `docker0` or `hassio` are hidden)
- Storage: every monitored mount point and the swap, with used space
- Monitored processes, green when running and red when stopped
- **HACS extensions**: a collapsible list of every repository downloaded with HACS, with its logo, version, update status and a GitHub button, plus a **Check for updates** button that runs on the server through [HACS Refresh](https://github.com/juju35/ha-hacs-refresh); the overall HACS status sits under the Home Assistant one
- Colors turn orange / red when a threshold is crossed (CPU, RAM, disk, temperature)
- Click any value to open its Home Assistant history (more-info dialog)
- Visual editor in the dashboard UI for both cards (no YAML needed)
- Light and dark mode, English and French
- Single file, no external dependency, the Home Assistant logo is embedded

## Prerequisites

The [System Monitor integration](https://www.home-assistant.io/integrations/systemmonitor/) must be added (**Settings → Devices & services → Add integration → System Monitor**).

Most of its sensors are disabled by default: open the **System Monitor** device and enable the ones you want to see on the card, for example:

| Card section | Sensors to enable |
|---|---|
| System | Processor use, Memory usage (or Memory use + Memory free), Disk usage / Disk use + Disk free, Processor temperature, Last boot (called Uptime in recent versions), Load (1m/5m/15m), IPv4 address |
| Network | Network throughput in / out, Network in / out (totals) |
| Storage | Disk use + Disk free for each mount point, Swap use + Swap free |
| Processes | Process binary sensors (configured in the integration options) |
| HACS | Nothing for the list: the update entities HACS creates for downloaded repositories are used as is. The **Check for updates** button needs the [HACS Refresh](https://github.com/juju35/ha-hacs-refresh) integration |

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
show_image: true
show_system: true
show_network: true
show_storage: true
show_processes: true
show_hacs: true
interface: eth0
language: fr
```

```yaml
type: custom:system-monitor-mini-card
title: My Home Assistant
show_image: true
show_storage: true
show_network: true
interface: eth0
language: fr
```

### Options reference

| Option | Card | Default | Description |
|---|---|---|---|
| `title` | both | `Home Assistant` | Card title |
| `show_image` | both | `true` | Show the Home Assistant logo |
| `show_system` | full | `true` | CPU, RAM, disk and temperature gauges, uptime, load, IP address |
| `show_network` | both | `true` | Network download / upload |
| `show_storage` | both | `true` | Full card: mount points and swap. Mini card: disk bar |
| `show_processes` | full | `true` | Monitored processes |
| `show_hacs` | full | `true` | HACS extensions list and HACS status under the Home Assistant one |
| `interface` | both | All physical interfaces | Network interface to display (e.g. `eth0`, `enp0s3`) |
| `language` | both | Auto | Force language: `fr` or `en` (auto-detects from HA settings) |

## Screenshots

| Light | Dark (French, update available) |
|---|---|
| ![card](screenshots/card.png) | ![card dark](screenshots/card-dark.png) |
| ![mini card](screenshots/mini-card.png) | ![mini card dark](screenshots/mini-card-dark.png) |
| ![HACS extensions](screenshots/card-hacs.png) | |

## How it works

The cards read the entity registry of Home Assistant and keep the entities of the `systemmonitor` platform. Each sensor is recognized by its translation key (`processor_use`, `memory_use_percent`, `disk_free`, `throughput_network_in`…), so entity ids translated in another language (for example `sensor.system_monitor_utilisation_du_processeur`) and renamed entities are supported. Mount points, interfaces and process names are read from the end of the sensor name. When the registry is not available, English entity ids (`sensor.system_monitor_processor_use`…) are used as a fallback.

The Core and OS versions come from the `update.home_assistant_core_*` and `update.home_assistant_operating_system_*` entities when they exist, otherwise from the running Home Assistant version.

### HACS extensions

HACS creates an update entity for every repository it downloaded. The card lists them with their name and category (from the HACS device), installed and latest version, and the GitHub repository (from the release URL). The list is folded by default: click the **HACS** section, or the HACS status in the header, to unfold it. Click a line to open its update dialog (release notes, install), or the GitHub button to open the repository.

Logos are loaded dynamically, best source first:

1. For integrations, Home Assistant's brands proxy (`/api/brands`, Home Assistant 2026.3 and later), which serves the `brand/icon.png` shipped by a custom integration before the brands CDN
2. The brands CDN (`brands.home-assistant.io`)
3. The avatar of the GitHub owner of the repository
4. An icon for the HACS category (integration, dashboard, theme…)

**Check for updates** presses the button of the [HACS Refresh](https://github.com/juju35/ha-hacs-refresh) integration: Home Assistant asks HACS to fetch every downloaded repository again from GitHub, in the background, and the card shows the progress and the time of the last check from HACS Refresh's sensors. The check goes on if you leave the page, and HACS Refresh can also check at an interval set in its options. Without HACS Refresh, the button is replaced by a link to install it.

Thresholds:

| Value | Orange | Red |
|---|---|---|
| CPU usage | 70 % | 90 % |
| RAM usage | 80 % | 95 % |
| Disk usage | 80 % | 90 % |
| CPU temperature | 75 °C | 90 °C |
| Swap usage | 50 % | 80 % |

## Development

```bash
npm install
npm run build        # bundles src/system-monitor-card.js + images/home-assistant.svg into dist/system-monitor-card.js
npm run check        # builds and checks the card (run in CI)
npm run screenshots  # renders the cards with mock data (scripts/mock-states.mjs) into screenshots/
```

`dist/` is not committed: `npm run build` creates it locally, CI builds it on every push, and the release workflow attaches the built file to the release, which is where HACS downloads it from.

### Releasing

1. Bump `version` in `package.json`
2. Add a `## <version>` section at the top of [CHANGELOG.md](CHANGELOG.md)
3. Push to `main`: the **Release** workflow builds the card, creates the tag and the GitHub release with the changelog section as notes, and attaches `system-monitor-card.js`

## Translations

The cards auto-detect the language from your Home Assistant settings. Currently supported:

| Language | Code |
|---|---|
| English | `en` |
| Français | `fr` |

Contributions for additional languages are welcome!

## License

[MIT](LICENSE)

The Home Assistant logo is a trademark of the Open Home Foundation and is used here to identify Home Assistant.
