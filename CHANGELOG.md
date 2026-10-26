# Changelog

## 1.18.0

### Changes
- Full card: the Storage section shows the size of the Home Assistant database (`home-assistant_v2.db`), from the [File Size](https://www.home-assistant.io/integrations/filesize/) integration, found by itself through the entity registry (#24). A click opens its history. Without a File Size sensor on that file, nothing changes.

### Maintenance
- Test for the database discovery; the mock states and the screenshots have the database row.

## 1.17.0

### Changes
- Mini card: a zoom button at the far right of the header, as on the status card, switches it to the full System Monitor card (same options) and back. A click anywhere outside the card brings the compact view back, except in a dialog opened from it or while the install confirmation is open. The `zoom` option (on by default, in the visual editor) removes the button.

### Maintenance
- The zoom of the mini and status cards is shared in one base class (`SystemMonitorZoomCard`); its tests run on both cards; screenshots of the zoomed-in mini card.

## 1.16.0
### Changes
- The Home Assistant logo in the header fits a 40 × 40 px box on the full card (was 44 px) and a 32 × 32 px box on the mini and status cards (was 40 px), like the header icon of the other cards. Zoomed in, the status card shows the full card's 40 px logo.
- The status pill ("Up to date", "Update 2026.10.3") sits in the header row, right of the title and before the buttons, instead of on its own line under the title (full card, zoomed-in status card and status card). On the compact status card it reads just "Update" (the new version is in its tooltip, and in full once zoomed in), and the header spacing is a little tighter, so the title and subtitle keep their room at 380 px.
- The Install button of the in-card confirmation is tinted with the primary color instead of filled, like the other card buttons.
- Header geometry: the body starts 8 px below the header on every card (was 4 px); the logo of the mini and status cards is top-aligned, 12 px from the card's top edge.
- The status pill is centred on the title's line (it sits in a row with the title, above the subtitle) instead of on the whole title block, on the full card and on both views of the status card. The logo and the header buttons keep their place.

### Maintenance
- Test for the status pill position.

## 1.15.0

### Changes
- Status card: a zoom button at the top right of the header switches it to the full System Monitor card (same options: gauges, network, storage, processes, HACS and integrations lists) and back. A click anywhere outside the card brings the status view back, except in a dialog opened from it or while the install confirmation is open. The new `zoom` option (on by default, in the visual editor) removes the button.

![Status card zoomed in](https://raw.githubusercontent.com/juju35/ha-system-monitor-card/v1.15.0/screenshots/status-card-zoom.png)

### Maintenance
- Tests for the zoom (in, out, outside click, dialogs, install confirmation, `zoom: false`); screenshots of the zoomed-in status card.

## 1.14.1

### Fixes
- Clicking a gauge, tile or row no longer scrolls the page back to the card on every update.
- HACS extensions: the keyboard focus goes to the extension name, and the check button and the GitHub link next to it are separate controls for the keyboard and screen readers instead of being nested in the row. Clicking anywhere on the row still opens the more-info dialog.

### Changes
- Keyboard focus is shown with a blue outline on gauges, tiles, rows and buttons. Nothing changes at rest or on a mouse click.

### Maintenance
- `package-lock.json` committed and installed with `npm ci` in CI; a fresh page per screenshot; duplication check skips the tests; regression tests for the focus restore.

## 1.14.0

### Changes
- Sizes are labelled `KiB`, `MiB`, `GiB`, `TiB` instead of `KB`, `MB`, `GB`, `TB`: the values were already computed in powers of 1024, only the labels change.
- The status card shows the HACS **Check** button to every user, like the full card (HACS Refresh lets every user run the check). **Install** stays admin-only.
- The card only re-renders when something it shows changes; uptime and relative times keep moving every minute.
- Keyboard access: gauges, network tiles, volumes, mini card metrics, HACS extensions and Integration Watchdog rows can be reached with Tab and opened with Enter or Space, and a focused button or row keeps its focus across updates.
- Integration logos are no longer downloaded again each time the brands token is refreshed.

### Maintenance
- CI hardened: actions pinned by commit SHA, read-only token permissions, Dependabot for action updates, duplication report annotated on pull requests.
- Unit tests (`npm test`, run in CI); discovery cached on the registries instead of being recomputed on every state change.

## 1.13.4

### Changes
- Popup titles in medium weight, like the rest of the card.

## 1.13.3

### Fixes
- The install confirmation popup sits at the top of the card instead of its vertical middle, so it stays in view without scrolling when the HACS list is long.

## 1.13.2

### Maintenance
- Tooling only, no functional change: Biome linting, pre-commit and a Lint CI (duplication checks). Card source modernized (optional chaining, template literals), identical behavior.

## 1.13.1

### Fixes
- HACS list: the ✕ button of the search field is always shown, dimmed while the field is empty, so it is visible before you type.

## 1.13.0

### Changes
- Install all HACS updates: the browser confirmation is replaced by a popup over the card, like in the IPTV card. It lists each extension with its current and new version, with **Cancel** and **Install** buttons; a click outside the popup or Escape closes it.

![Install confirmation](https://raw.githubusercontent.com/juju35/ha-system-monitor-card/v1.13.0/screenshots/card-install.png)

## 1.12.0

### Changes
- HACS list: a search field at the top of the list filters the extensions as you type (by name or GitHub repository, ignoring case and accents). A ✕ button in the field (or Escape) clears it, and folding the list clears it too.
- Screenshots updated: the HACS list with its search field, and a search in progress.

| HACS list | Search |
|---|---|
| ![HACS list with the search field](https://raw.githubusercontent.com/juju35/ha-system-monitor-card/v1.12.0/screenshots/card-hacs.png) | ![Search in the HACS list](https://raw.githubusercontent.com/juju35/ha-system-monitor-card/v1.12.0/screenshots/card-hacs-search.png) |

## 1.11.2

### Fixes
- HACS list: an extension without a GitHub repository keeps an empty slot in place of the GitHub button, so its status and check buttons line up with the other rows.

## 1.11.1

### Changes
- Status card: the status row shows up only while one of the statuses is not good (HACS update, stopped process, unavailable integration); when all is well, only the header is left.

## 1.11.0

### Changes
- New **System Monitor Status Card** (`custom:system-monitor-status-card`): a minimal card with the header (Core / OS versions and update), the status tiles (HACS, processes, integrations) and one button, **Install (n)** when HACS updates are pending, **Check** otherwise. No gauges, no lists. Tiles open HACS, the integrations page or the stopped process. Visual editor with the HACS, processes and integrations toggles.
- Screenshots of the status card, and of the HACS list with its install button.

## 1.10.0

### Changes
- The number of HACS updates next to the **HACS** section title is now a button: a click installs every pending update, one after the other, after a confirmation. It shows the progress while it runs, and an error in the unfolded section if an install fails. Admins only; other users still see the plain count.

## 1.9.0

### Changes
- More compact layout with the same information, like the other ha-* cards: 12 px card padding, 36 px header icon, 16 px name and 12 px subtitle, 11 px pills, tighter tiles and sections.
- Home Assistant logo 64 → 44 px, gauges 84 → 60 px; storage lines show the name and the usage on one line, with the bar underneath; tighter HACS list.
- The mini card picks up the smaller pills and subtitle.

## 1.8.5

### Changes
- HACS now asks for Home Assistant 2024.8 or later, the version that brought the sections view the card supports; the README says so under **Prerequisites**.

### Fixes
- "Uptime:" and "Load:" in English, without the French space before the colon.

### Maintenance
- CHANGELOG headings use the same plain English set as the other ha-* repositories.

## 1.8.4

### Changes
- A click on the **Integrations** tile shows its section unfolded even while every integration is available (last reload, last check, **Check now** button); a click elsewhere hides it again, like the processes one.

## 1.8.3

### Changes
- The **Processes** section is hidden while every process runs, like the integrations one. Its tile in the status row still shows "Running", and a click on it shows the list. It shows up by itself as soon as a process stops.

## 1.8.2

### Changes
- The **Integrations** section is hidden while every integration is available. Its tile in the status row still shows "Available".

## 1.8.1

### Fixes
- The processes list folds again on a click elsewhere, like the HACS and integrations lists, while every process runs.
- While a process is stopped, the processes list stays unfolded: neither its title nor a click elsewhere folds it.

## 1.8.0

### Changes
- The HACS, processes and integrations statuses leave the header for a row of tiles under it, side by side and the same width: section icon and name, then the status in green, orange or red. Click a tile to unfold its section. The Home Assistant Core / OS update stays next to the logo, and the header is no longer stretched by a column of badges.

## 1.7.1

### Changes
- The processes status in the header moves after the HACS one, just before the integrations one.

## 1.7.0

### What's new
- The processes section is folded while every process runs, and unfolds by itself as soon as one stops. Its title shows the number of processes and, in red, the number stopped.
- Processes status in the header, right after the Home Assistant one: "Processes running" or the number of processes stopped; click it to fold or unfold the list.

## 1.6.0

### What's new
- **Integrations** section with [Integration Watchdog](https://github.com/juju35/ha-integration-watchdog): the integrations whose entities are all unavailable, with their logo, since when, the number of reloads and **Given up** when the watchdog stopped reloading one; the last reload and the last check; a **Check now** button next to the title. Click a line to open the integration page. Folded by default, like the HACS list.
- Integrations status under the HACS one in the header: "Integrations available" or the number of unavailable integrations; click it to unfold the list.
- New option `show_watchdog` (also in the visual editor). The section is only shown when Integration Watchdog is set up.

## 1.5.1

### Maintenance
- Remove the `package-lock.json` committed by mistake in 1.5.0. Nothing changes for users.

## 1.5.0

### What's new
- A click anywhere else on the page folds the HACS extensions list again, as in ha-carburants-france.

## 1.4.0

### What's new
- Each line of the HACS list has a **Check for updates** button for that extension alone, between its status and the GitHub button. It spins until the check ends, then the line shows the result. Needs [HACS Refresh](https://github.com/juju35/ha-hacs-refresh) 0.2.0 or later (`hacs_refresh.check_repository` action); with an older version the button is not shown.

## 1.3.3

### Changes
- The **Check for updates** button sits right after the HACS title and update badge, away from the extension count and the fold chevron, so it is no longer pressed by mistake.

## 1.3.2

### Changes
- The **Check for updates** button moved to the HACS section header, next to the number of extensions: it stays visible while the list is folded (the default). It spins and shows the progress while a check runs; the time of the last check is shown under the header once the list is unfolded.

## 1.3.1

### Development
- The built card is no longer committed in `dist/`: CI builds it on every push, and the release workflow builds it and attaches it to the release, which is where HACS downloads it from. Nothing changes for users.

## 1.3.0

### Changes
- **Check for updates** now runs on the server, through the new [HACS Refresh](https://github.com/juju35/ha-hacs-refresh) integration: the card presses its button, then shows the progress and the time of the last check from its sensors. The check goes on when the page is closed, and is no longer limited to administrators. Without HACS Refresh, a link to install it replaces the button.

## 1.2.1

### Changes
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

### Changes
- The Home Assistant logo is now on the left of the header, before the title, versions and status, on both cards.

## 1.0.2

### Fixes
- Uptime is now displayed: the System Monitor "Last boot" sensor has no translation key (it is named after its `uptime` device class, e.g. "Temps de fonctionnement" in French), so it was skipped by the entity discovery.

## 1.0.1

### Fixes
- Recognize an `uptime` translation key for the System Monitor "Last boot" sensor.

## 1.0.0

First release of the System Monitor cards for Home Assistant, built for the core [System Monitor integration](https://www.home-assistant.io/integrations/systemmonitor/).

| System Monitor Card | System Monitor Mini Card |
|---|---|
| ![system-monitor-card](https://raw.githubusercontent.com/juju35/ha-system-monitor-card/main/screenshots/card.png) | ![system-monitor-mini-card](https://raw.githubusercontent.com/juju35/ha-system-monitor-card/main/screenshots/mini-card.png) |

### What's new
- **System Monitor Card** (`custom:system-monitor-card`): CPU, RAM, disk and CPU temperature gauges, uptime, load average, IP address, network download / upload, storage (mount points and swap) and monitored processes.
- **System Monitor Mini Card** (`custom:system-monitor-mini-card`): compact overview with CPU, RAM, disk, temperature, update status, network and uptime.
- **Automatic discovery** of the System Monitor entities through the entity registry: no entity to pick, works whatever the language of the installation.
- Home Assistant Core and OS versions in the header, with an orange badge when an update is available.
- **Visual editor** for both cards: title, sections to display, network interface and language.
- Orange / red colors when CPU, RAM, disk or temperature cross a threshold.
- Click any value to open its history (more-info dialog).
- Light and dark mode, English and French.
- Single file with no external dependency, the Home Assistant logo is embedded.

### Installation
[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-system-monitor-card&category=plugin)

Open the link above (or add `https://github.com/juju35/ha-system-monitor-card` as a **Dashboard** custom repository in HACS), click **Download**, then reload your browser. Manual install: copy `system-monitor-card.js` from the assets below to `/config/www/` and add `/local/system-monitor-card.js` as a JavaScript Module resource.

### Quick start
```yaml
type: custom:system-monitor-card
```

```yaml
type: custom:system-monitor-mini-card
```

All options are described in the [README](https://github.com/juju35/ha-system-monitor-card#configuration).
