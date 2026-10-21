# Changelog

## 1.3.1

### Development
- The built card is no longer committed in `dist/`: CI builds it on every push, and the release workflow builds it and attaches it to the release, which is where HACS downloads it from. Nothing changes for users.

## 1.3.0

### Changes
- **Check for updates** now runs on the server, through the new [HACS Refresh](https://github.com/juju35/ha-hacs-refresh) integration: the card presses its button, then shows the progress and the time of the last check from its sensors. The check goes on when the page is closed, and is no longer limited to administrators. Without HACS Refresh, a link to install it replaces the button.

## 1.2.1

### 💄 Style
- HACS section header laid out like the ha-dockhand-card sections: the number of extensions is aligned on the right, before a chevron that rotates when the section folds.

## 1.2.0

### What's new
- HACS extensions: a collapsible section lists every repository downloaded with HACS, updates first, with its logo, installed and latest version, update status and a GitHub button. Click a line to open its update dialog.
- **Check for updates** button at the top of the list: HACS fetches every downloaded repository again from GitHub, with the progress on the button (administrators only).
- HACS status under the Home Assistant one in the header: "HACS up to date" or the number of updates; click it to unfold the list.
- Logos are loaded dynamically: Home Assistant's brands proxy (custom integration `brand/icon.png`), then the brands CDN, then the GitHub owner's avatar, then an icon for the HACS category.
- New option `show_hacs` (also in the visual editor).

## 1.1.0

### Changes
- The warning color falls back to Home Assistant's default `#ffa600` (was `#ffa000`), like the other ha-* cards. The upload tile uses `--info-color` instead of a fixed blue.

### Development
- Releases are published when `version` in `package.json` has no tag yet: bump the version, add its CHANGELOG section and push, like the other ha-* repositories (the manual Release workflow run is no longer needed).
- Issue templates, stale workflow and a "Update release notes" workflow, shared with the other repositories.

## 1.0.3

### 💄 Style

- The Home Assistant logo is now on the left of the header, before the title, versions and status, on both cards.

## 1.0.2

### 🐛 Fixes

- Uptime is now displayed: the System Monitor "Last boot" sensor has no translation key (it is named after its `uptime` device class, e.g. "Temps de fonctionnement" in French), so it was skipped by the entity discovery.

## 1.0.1

### 🐛 Fixes

- Recognize an `uptime` translation key for the System Monitor "Last boot" sensor.

## 1.0.0

First release of the System Monitor cards for Home Assistant, built for the core [System Monitor integration](https://www.home-assistant.io/integrations/systemmonitor/).

| System Monitor Card | System Monitor Mini Card |
|---|---|
| ![system-monitor-card](https://raw.githubusercontent.com/juju35/ha-system-monitor-card/main/screenshots/card.png) | ![system-monitor-mini-card](https://raw.githubusercontent.com/juju35/ha-system-monitor-card/main/screenshots/mini-card.png) |

### ✨ Features

- **System Monitor Card** (`custom:system-monitor-card`): CPU, RAM, disk and CPU temperature gauges, uptime, load average, IP address, network download / upload, storage (mount points and swap) and monitored processes.
- **System Monitor Mini Card** (`custom:system-monitor-mini-card`): compact overview with CPU, RAM, disk, temperature, update status, network and uptime.
- **Automatic discovery** of the System Monitor entities through the entity registry: no entity to pick, works whatever the language of the installation.
- Home Assistant Core and OS versions in the header, with an orange badge when an update is available.
- **Visual editor** for both cards: title, sections to display, network interface and language.
- Orange / red colors when CPU, RAM, disk or temperature cross a threshold.
- Click any value to open its history (more-info dialog).
- Light and dark mode, English and French.
- Single file with no external dependency, the Home Assistant logo is embedded.

### 📦 Installation

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-system-monitor-card&category=plugin)

Open the link above (or add `https://github.com/juju35/ha-system-monitor-card` as a **Dashboard** custom repository in HACS), click **Download**, then reload your browser. Manual install: copy `system-monitor-card.js` from the assets below to `/config/www/` and add `/local/system-monitor-card.js` as a JavaScript Module resource.

### 🚀 Quick start

```yaml
type: custom:system-monitor-card
```

```yaml
type: custom:system-monitor-mini-card
```

All options are described in the [README](https://github.com/juju35/ha-system-monitor-card#configuration).
