/*
 * System Monitor Card for Home Assistant
 * https://github.com/juju35/ha-system-monitor-card
 *
 * Lovelace cards for the System Monitor integration
 * (https://www.home-assistant.io/integrations/systemmonitor/), showing the health of the
 * machine running Home Assistant. Entities are discovered automatically through the entity
 * registry (platform "systemmonitor" and translation key), whatever the language.
 */

const VERSION = "__VERSION__";
const IMG_LOGO = "__IMG_LOGO__";

const ICONS = {
  cpu: "M6,4H18V5H21V7H18V9H21V11H18V13H21V15H18V17H21V19H18V20H6V19H3V17H6V15H3V13H6V11H3V9H6V7H3V5H6V4M11,15V18H12V15H11M13,15V18H14V15H13M15,15V18H16V15H15Z",
  ram: "M17,17H7V7H17M21,11V9H19V7C19,5.89 18.1,5 17,5H15V3H13V5H11V3H9V5H7C5.89,5 5,5.89 5,7V9H3V11H5V13H3V15H5V17A2,2 0 0,0 7,19H9V21H11V19H13V21H15V19H17A2,2 0 0,0 19,17V15H21V13H19V11M13,13H11V11H13M15,9H9V15H15V9Z",
  temp: "M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V8H11V5A1 1 0 0 1 12 4Z",
  down: "M9,4H15V12H19.84L12,19.84L4.16,12H9V4Z",
  up: "M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z",
  disk: "M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M12,4A6,6 0 0,0 6,10C6,13.31 8.69,16 12.1,16L11.22,13.77C10.95,13.29 11.11,12.68 11.59,12.4L12.45,11.9C12.93,11.63 13.54,11.79 13.82,12.27L15.74,14.69C17.12,13.59 18,11.9 18,10A6,6 0 0,0 12,4M12,9A1,1 0 0,1 13,10A1,1 0 0,1 12,11A1,1 0 0,1 11,10A1,1 0 0,1 12,9M7,18A1,1 0 0,0 6,19A1,1 0 0,0 7,20A1,1 0 0,0 8,19A1,1 0 0,0 7,18M12.09,13.27L14.58,19.58L17.17,18.08L12.95,12.77L12.09,13.27Z",
  database: "M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z",
  timer: "M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z",
  network: "M13,19H14A1,1 0 0,1 15,20H22V22H15A1,1 0 0,1 14,23H10A1,1 0 0,1 9,22H2V20H9A1,1 0 0,1 10,19H11V17H4A1,1 0 0,1 3,16V12A1,1 0 0,1 4,11H20A1,1 0 0,1 21,12V16A1,1 0 0,1 20,17H13V19M4,3H20A1,1 0 0,1 21,4V8A1,1 0 0,1 20,9H4A1,1 0 0,1 3,8V4A1,1 0 0,1 4,3M9,7H10V5H9V7M9,15H10V13H9V15M5,5V7H7V5H5M5,13V15H7V13H5Z",
  load: "M3,14L3.5,14.07L8.07,9.5C7.89,8.85 8.06,8.11 8.59,7.59C9.37,6.8 10.63,6.8 11.41,7.59C11.94,8.11 12.11,8.85 11.93,9.5L14.5,12.07L15,12C15.18,12 15.35,12 15.5,12.07L19.07,8.5C19,8.35 19,8.18 19,8A2,2 0 0,1 21,6A2,2 0 0,1 23,8A2,2 0 0,1 21,10C20.82,10 20.65,10 20.5,9.93L16.93,13.5C17,13.65 17,13.82 17,14A2,2 0 0,1 15,16A2,2 0 0,1 13,14L13.07,13.5L10.5,10.93C10.18,11 9.82,11 9.5,10.93L4.93,15.5L5,16A2,2 0 0,1 3,18A2,2 0 0,1 1,16A2,2 0 0,1 3,14Z",
  ip: "M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3M12,7A2,2 0 0,1 14,9A2,2 0 0,1 12,11A2,2 0 0,1 10,9A2,2 0 0,1 12,7Z",
  process: "M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z",
  swap: "M21,9L17,5V8H10V10H17V13M7,11L3,15L7,19V16H14V14H7V11Z",
};

const STRINGS = {
  en: {
    cpu: "CPU",
    ram: "RAM",
    disk: "Disk",
    temperature: "Temp.",
    swap: "Swap",
    network: "Network",
    storage: "Storage",
    processes: "Processes",
    uptime: "Uptime",
    load: "Load",
    download: "Download",
    upload: "Upload",
    total: "Total",
    used: "used",
    of: "of",
    hours: "h",
    days: "d",
    minutes: "min",
    running: "Running",
    up_to_date: "Up to date",
    update: "Update",
    no_sm: "No System Monitor entities found. Is the System Monitor integration installed and are its sensors enabled?",
    // Editor
    title: "Title (optional, defaults to Home Assistant)",
    show_image: "Show Home Assistant logo",
    show_system: "Show system (CPU, RAM, disk, temperature)",
    show_network: "Show network",
    show_storage: "Show storage",
    show_processes: "Show processes",
    interface: "Network interface (optional, all by default)",
    language: "Language",
    lang_auto: "Automatic",
  },
  fr: {
    cpu: "CPU",
    ram: "RAM",
    disk: "Disque",
    temperature: "Temp.",
    swap: "Swap",
    network: "Réseau",
    storage: "Stockage",
    processes: "Processus",
    uptime: "Allumé depuis",
    load: "Charge",
    download: "Réception",
    upload: "Envoi",
    total: "Total",
    used: "utilisés",
    of: "sur",
    hours: "h",
    days: "j",
    minutes: "min",
    running: "En marche",
    up_to_date: "À jour",
    update: "Mise à jour",
    no_sm: "Aucune entité System Monitor trouvée. L'intégration System Monitor est-elle installée et ses capteurs activés ?",
    title: "Titre (facultatif, Home Assistant par défaut)",
    show_image: "Afficher le logo Home Assistant",
    show_system: "Afficher le système (CPU, RAM, disque, température)",
    show_network: "Afficher le réseau",
    show_storage: "Afficher le stockage",
    show_processes: "Afficher les processus",
    interface: "Interface réseau (facultatif, toutes par défaut)",
    language: "Langue",
    lang_auto: "Automatique",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = (config && config.language) || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

const t = (hass, config, key) => STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key;

const num = (s) => {
  if (!s) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};

// Data sizes: SI prefixes are powers of 1000, binary prefixes (KiB, MiB…) powers of 1024.
const SIZE_FACTORS = {
  bit: 1 / 8, kbit: 125, Mbit: 125e3, Gbit: 125e6,
  B: 1, kB: 1e3, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, PB: 1e15,
  KiB: 1024, MiB: 1024 ** 2, GiB: 1024 ** 3, TiB: 1024 ** 4, PiB: 1024 ** 5,
};

const toBytes = (s) => {
  const v = num(s);
  if (v === null) return null;
  return v * (SIZE_FACTORS[s.attributes.unit_of_measurement || "B"] ?? 1);
};

/** Data rate sensor in bytes per second (System Monitor reports MB/s by default). */
const toBps = (s) => {
  const v = num(s);
  if (v === null) return null;
  const unit = String(s.attributes.unit_of_measurement || "B/s").replace(/\/s$/, "");
  return v * (SIZE_FACTORS[unit] ?? 1);
};

const fmtBytes = (b) => {
  if (b === null || b === undefined) return "—";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let i = 0;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i++;
  }
  const v = b >= 100 || i === 0 ? b.toFixed(0) : b.toFixed(b >= 10 ? 1 : 2);
  return `${v.includes(".") ? v.replace(/\.?0+$/, "") : v} ${units[i]}`;
};

const fmtRate = (bps) => {
  if (bps === null || bps === undefined) return "—";
  const units = ["B/s", "kB/s", "MB/s", "GB/s"];
  let i = 0;
  while (bps >= 1000 && i < units.length - 1) {
    bps /= 1000;
    i++;
  }
  return `${bps >= 100 || i === 0 ? bps.toFixed(0) : bps.toFixed(1)} ${units[i]}`;
};

const fmtUptime = (sec, hass, config) => {
  if (sec === null) return "—";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d} ${t(hass, config, "days")} ${h} ${t(hass, config, "hours")}`;
  if (h > 0) return `${h} ${t(hass, config, "hours")} ${m} ${t(hass, config, "minutes")}`;
  return `${m} ${t(hass, config, "minutes")}`;
};

/** Seconds since the "Last boot" / "Uptime" sensor (a boot timestamp, or a duration). */
const DURATION_FACTORS = { s: 1, min: 60, h: 3600, d: 86400 };
const uptimeSec = (s) => {
  if (!s) return null;
  if (/^\d+(\.\d+)?$/.test(s.state)) return parseFloat(s.state) * (DURATION_FACTORS[s.attributes.unit_of_measurement] ?? 1);
  const boot = Date.parse(s.state);
  return Number.isFinite(boot) ? Math.max(0, (Date.now() - boot) / 1000) : null;
};

const level = (v, warn, crit) => (v === null ? "" : v >= crit ? "crit" : v >= warn ? "warn" : "ok");

const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24"><path d="${path}"/></svg>`;

const pct = (used, free) => (used !== null && free !== null && used + free > 0 ? (used / (used + free)) * 100 : null);

// ---------------------------------------------------------------------------
// Entity discovery
// ---------------------------------------------------------------------------

// Translation keys of the System Monitor sensors that carry an argument (mount point,
// interface or process name), shown at the end of their name.
const ARG_KEYS = {
  disk_free: "disk",
  disk_use: "disk",
  disk_use_percent: "disk",
  network_in: "net",
  network_out: "net",
  throughput_network_in: "net",
  throughput_network_out: "net",
  packets_in: "net",
  packets_out: "net",
  ipv4_address: "net",
  ipv6_address: "net",
  process: "proc",
};
const SCALAR_KEYS = [
  "processor_use",
  "processor_temperature",
  "memory_use_percent",
  "memory_use",
  "memory_free",
  "swap_use_percent",
  "swap_use",
  "swap_free",
  "load_1m",
  "load_5m",
  "load_15m",
  "last_boot",
];
// Alternative translation keys of the same sensors.
const ALIASES = { uptime: "last_boot" };

// Fallback when the entity registry is not available: English entity ids
// (sensor.system_monitor_<name>), as created on an English install.
const FALLBACK = [
  ["throughput_network_in", /^network_throughput_in_(.+)$/],
  ["throughput_network_out", /^network_throughput_out_(.+)$/],
  ["network_in", /^network_in_(.+)$/],
  ["network_out", /^network_out_(.+)$/],
  ["packets_in", /^packets_in_(.+)$/],
  ["packets_out", /^packets_out_(.+)$/],
  ["ipv4_address", /^ipv4_address_(.+)$/],
  ["ipv6_address", /^ipv6_address_(.+)$/],
  ["disk_use_percent", /^disk_usage(?:_(.+))?$/],
  ["disk_use", /^disk_use(?:_(.+))?$/],
  ["disk_free", /^disk_free(?:_(.+))?$/],
  ["processor_use", /^processor_use$/],
  ["processor_temperature", /^processor_temperature$/],
  ["memory_use_percent", /^memory_usage$/],
  ["memory_use", /^memory_use$/],
  ["memory_free", /^memory_free$/],
  ["swap_use_percent", /^swap_usage$/],
  ["swap_use", /^swap_use$/],
  ["swap_free", /^swap_free$/],
  ["load_1m", /^load_1m$/],
  ["load_5m", /^load_5m$/],
  ["load_15m", /^load_15m$/],
  ["last_boot", /^(?:last_boot|uptime)$/],
  ["process", /^process_(.+)$/],
];

// Virtual interfaces hidden by default from the network section.
const VIRTUAL_IF = /^(lo|docker\d*|hassio|veth.*|br-.*|virbr\d*|tun\d*|wg\d*)$/;

const _cache = new WeakMap();

/** Map the System Monitor entities to a structured object of entity ids. */
const discover = (hass) => {
  const hit = _cache.get(hass.states);
  if (hit) return hit;

  const sm = { scalars: {}, disks: {}, nets: {}, procs: {}, found: false };
  const add = (key, arg, id) => {
    sm.found = true;
    const group = ARG_KEYS[key];
    if (!group) {
      sm.scalars[key] ??= id;
      return;
    }
    // The argument ends the friendly name ("Disk free /", "Réseau entrant via eth0").
    const name = hass.states[id]?.attributes?.friendly_name || "";
    const a = name.split(" ").pop() || arg || "";
    if (group === "proc") sm.procs[a] ??= id;
    else ((group === "disk" ? sm.disks : sm.nets)[a] ??= {})[key] ??= id;
  };

  const registry = hass.entities ? Object.values(hass.entities).filter((e) => e.platform === "systemmonitor") : [];
  if (registry.length) {
    for (const e of registry.sort((a, b) => a.entity_id.localeCompare(b.entity_id))) {
      if (e.hidden || !hass.states[e.entity_id]) continue;
      const key = ALIASES[e.translation_key] || e.translation_key;
      if (ARG_KEYS[key] || SCALAR_KEYS.includes(key)) add(key, null, e.entity_id);
      // The "Last boot" sensor has no translation key (it is named after its "uptime" device class).
      else if (!e.translation_key && hass.states[e.entity_id].attributes.device_class === "uptime") add("last_boot", null, e.entity_id);
    }
  } else {
    for (const id of Object.keys(hass.states).sort()) {
      const m = id.match(/^(?:sensor|binary_sensor)\.system_monitor_(.+)$/);
      if (!m) continue;
      for (const [key, re] of FALLBACK) {
        const f = m[1].match(re);
        if (f) {
          add(key, f[1] ?? "/", id);
          break;
        }
      }
    }
  }

  // Home Assistant update entities, for the header (Core / OS versions).
  for (const id of Object.keys(hass.states)) {
    if (/^update\.home_assistant_core(_|$)/.test(id)) sm.core_update ??= id;
    else if (/^update\.home_assistant_operating_system(_|$)/.test(id)) sm.os_update ??= id;
  }

  _cache.set(hass.states, sm);
  return sm;
};

/** Network interfaces to display: the configured one, else the physical ones with a throughput sensor. */
const interfaces = (sm, config) => {
  const all = Object.keys(sm.nets).filter((i) => sm.nets[i].throughput_network_in || sm.nets[i].throughput_network_out);
  if (config.interface) return all.includes(config.interface) ? [config.interface] : [];
  const physical = all.filter((i) => !VIRTUAL_IF.test(i));
  return physical.length ? physical : all;
};

/** Main IPv4 address: the one of the first displayed interface, else the first physical one. */
const mainIp = (hass, sm, config) => {
  const order = [...interfaces(sm, config), ...Object.keys(sm.nets).filter((i) => !VIRTUAL_IF.test(i))];
  for (const i of order) {
    const s = hass.states[sm.nets[i]?.ipv4_address];
    if (s && s.state && !["unknown", "unavailable"].includes(s.state)) return s;
  }
  return null;
};

/** Used/total bytes and percentage of a mount point. */
const diskUsage = (hass, d) => {
  const used = toBytes(hass.states[d.disk_use]);
  const free = toBytes(hass.states[d.disk_free]);
  const p = num(hass.states[d.disk_use_percent]) ?? pct(used, free);
  return { used, total: used !== null && free !== null ? used + free : null, pct: p };
};

const memUsage = (hass, sc, prefix) => {
  const used = toBytes(hass.states[sc[`${prefix}_use`]]);
  const free = toBytes(hass.states[sc[`${prefix}_free`]]);
  const p = num(hass.states[sc[`${prefix}_use_percent`]]) ?? pct(used, free);
  return { used, total: used !== null && free !== null ? used + free : null, pct: p };
};

const fireMoreInfo = (node, entityId) => {
  if (!entityId) return;
  node.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
};

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --sm-blue: #18bcf2; --sm-ok: var(--success-color, #43a047); --sm-warn: var(--warning-color, #ffa600); --sm-crit: var(--error-color, #db4437); }
  ha-card { overflow: hidden; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  .ok { --c: var(--sm-blue); } .warn { --c: var(--sm-warn); } .crit { --c: var(--sm-crit); } .good { --c: var(--sm-ok); }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--c, var(--sm-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;
          background: color-mix(in srgb, var(--c, var(--sm-ok)) 15%, transparent); color: var(--c, var(--sm-ok)); }
  .bar { height: 6px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); overflow: hidden; }
  .bar > div { height: 100%; border-radius: 3px; background: var(--c, var(--sm-blue)); transition: width .6s ease; }
  .header { display: flex; align-items: center; gap: 12px; padding: 16px 16px 8px; }
  .titles { flex: 1; min-width: 0; }
  .name { font-size: 18px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 13px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .logo { flex: none; object-fit: contain; filter: drop-shadow(0 3px 5px rgba(0,0,0,.2)); }
  .warning { padding: 16px; color: var(--sm-warn); }
`;

class SystemMonitorBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this.shadowRoot.addEventListener("click", (ev) => {
      const el = ev.composedPath().find((n) => n.dataset && n.dataset.entity);
      if (el) fireMoreInfo(this, el.dataset.entity);
    });
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this._html = "";
    this._update();
  }

  _t(key) {
    return t(this._hass, this._config, key);
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  _update() {
    if (!this._hass || !this._config) return;
    const html = this._render();
    if (html !== this._html) {
      this._html = html;
      this.shadowRoot.innerHTML = html;
    }
  }

  _header(sm) {
    const c = this._config;
    const core = this._s(sm.core_update);
    const os = this._s(sm.os_update);
    const coreVersion = core?.attributes.installed_version || this._hass.config?.version;
    const osVersion = os?.attributes.installed_version;
    const sub = [coreVersion ? `Core ${coreVersion}` : null, osVersion ? `OS ${osVersion}` : null].filter(Boolean).join(" · ");
    // Status chip: pending Core / OS update, else "up to date" (or "running" without update entities).
    const pending = [core, os].find((s) => s && s.state === "on");
    let chip;
    if (pending)
      chip = `<span class="chip clickable warn" data-entity="${pending.entity_id}"><span class="dot"></span>${esc(
        `${this._t("update")} ${pending.attributes.latest_version || ""}`.trim()
      )}</span>`;
    else
      chip = `<span class="chip good ${core ? "clickable" : ""}" data-entity="${core?.entity_id || ""}"><span class="dot"></span>${this._t(
        core ? "up_to_date" : "running"
      )}</span>`;
    return `
      <div class="header">
        ${c.show_image !== false ? `<img class="logo" src="${IMG_LOGO}" alt="Home Assistant">` : ""}
        <div class="titles">
          <div class="name">${esc(c.title || "Home Assistant")}</div>
          <div class="sub">${esc(sub)}</div>
          ${chip}
        </div>
      </div>`;
  }

  _noSm() {
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(this._t("no_sm"))}</div></ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Full card
// ---------------------------------------------------------------------------

const ring = (p) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  const v = p === null ? 0 : Math.max(0, Math.min(100, p));
  return `<svg class="ring" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="${r}" class="track"/>
    <circle cx="32" cy="32" r="${r}" class="value" stroke-dasharray="${((v / 100) * c).toFixed(1)} ${c.toFixed(1)}"/>
  </svg>`;
};

const FULL_STYLE = `
  .logo { height: 64px; width: 64px; }
  .titles .chip { margin-top: 6px; }
  .content { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 16px; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 8px; }
  .gauges { display: grid; grid-template-columns: repeat(var(--n, 3), 1fr); gap: 8px; }
  .gauge { display: flex; flex-direction: column; align-items: center; min-width: 0; }
  .dial { position: relative; width: 100%; max-width: 84px; aspect-ratio: 1; }
  .ring { width: 100%; height: 100%; transform: rotate(-90deg); display: block; }
  .ring circle { fill: none; stroke-width: 6; }
  .ring .track { stroke: var(--divider-color, rgba(127,127,127,.25)); }
  .ring .value { stroke: var(--c, var(--sm-blue)); stroke-linecap: round; transition: stroke-dasharray .6s ease; }
  .dial .val { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .dial .val b { font-size: 18px; font-weight: 500; }
  .dial .val .icon { width: 16px; height: 16px; color: var(--secondary-text-color); }
  .gauge .lbl { font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; text-align: center; }
  .gauge .lbl2 { font-size: 11px; color: var(--secondary-text-color); opacity: .8; text-align: center; white-space: nowrap; }
  .section-title .arg { text-transform: none; letter-spacing: 0; }
  .facts { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 13px; margin-top: 8px; }
  .facts > span { display: inline-flex; align-items: center; gap: 4px; }
  .facts .icon { width: 16px; height: 16px; color: var(--secondary-text-color); }
  .net { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .net + .net { margin-top: 8px; }
  .tile { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; min-width: 0;
          background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .tile .icon { color: var(--c, var(--sm-blue)); }
  .tile .k { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tile .v { font-size: 15px; font-weight: 500; }
  .tile .t { font-size: 11px; color: var(--secondary-text-color); }
  .tile.up { --c: var(--info-color, #039be5); }
  .tile.down { --c: var(--sm-ok); }
  .vol { margin-bottom: 10px; }
  .vol:last-child { margin-bottom: 0; }
  .row { display: flex; align-items: center; gap: 8px; font-size: 14px; }
  .row .icon { color: var(--secondary-text-color); }
  .row .grow { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row .tag { font-size: 11px; padding: 1px 6px; border-radius: 6px; background: var(--secondary-background-color, rgba(127,127,127,.12));
              color: var(--secondary-text-color); }
  .vol .bar { margin: 6px 0 3px; }
  .vol .detail { font-size: 12px; color: var(--secondary-text-color); display: flex; justify-content: space-between; }
  .procs { display: flex; flex-wrap: wrap; gap: 6px; }
  .procs .chip { font-weight: 400; }
`;

class SystemMonitorCard extends SystemMonitorBase {
  static getConfigElement() {
    return document.createElement("system-monitor-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 7;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  _render() {
    const sm = discover(this._hass);
    if (!sm.found) return this._noSm();
    const c = this._config;
    const parts = [];
    if (c.show_system !== false) parts.push(this._system(sm));
    if (c.show_network !== false) parts.push(this._network(sm));
    if (c.show_storage !== false) parts.push(this._storage(sm));
    if (c.show_processes !== false) parts.push(this._processes(sm));
    return `<style>${BASE_STYLE}${FULL_STYLE}</style>
      <ha-card>
        ${this._header(sm)}
        <div class="content">${parts.filter(Boolean).join("")}</div>
      </ha-card>`;
  }

  _gauge(id, label, icon, value, display, cls, detail = "") {
    return `<div class="gauge clickable ${cls}" data-entity="${id || ""}">
      <div class="dial">${ring(value)}<div class="val">${svgIcon(icon)}<b>${display}</b></div></div>
      <div class="lbl">${label}</div>
      ${detail ? `<div class="lbl2">${detail}</div>` : ""}
    </div>`;
  }

  _system(sm) {
    const sc = sm.scalars;
    const gauges = [];
    const cpu = num(this._s(sc.processor_use));
    if (sc.processor_use)
      gauges.push(this._gauge(sc.processor_use, this._t("cpu"), ICONS.cpu, cpu, cpu === null ? "—" : `${Math.round(cpu)}%`, level(cpu, 70, 90)));

    const mem = memUsage(this._hass, sc, "memory");
    if (sc.memory_use_percent || (sc.memory_use && sc.memory_free)) {
      const detail = mem.used !== null && mem.total !== null ? `${fmtBytes(mem.used).split(" ")[0]} / ${fmtBytes(mem.total)}` : "";
      gauges.push(
        this._gauge(sc.memory_use_percent || sc.memory_use, this._t("ram"), ICONS.ram, mem.pct, mem.pct === null ? "—" : `${Math.round(mem.pct)}%`, level(mem.pct, 80, 95), detail)
      );
    }

    // Root file system, else the first mount point.
    const mount = sm.disks["/"] ? "/" : Object.keys(sm.disks)[0];
    if (mount) {
      const d = sm.disks[mount];
      const u = diskUsage(this._hass, d);
      const detail = u.used !== null && u.total !== null ? `${fmtBytes(u.used).split(" ")[0]} / ${fmtBytes(u.total)}` : "";
      gauges.push(
        this._gauge(d.disk_use_percent || d.disk_use || d.disk_free, `${this._t("disk")} ${esc(mount)}`, ICONS.database, u.pct, u.pct === null ? "—" : `${Math.round(u.pct)}%`, level(u.pct, 80, 90), detail)
      );
    }

    const temp = num(this._s(sc.processor_temperature));
    if (sc.processor_temperature)
      gauges.push(
        this._gauge(sc.processor_temperature, `${this._t("temperature")} ${this._t("cpu")}`, ICONS.temp, temp, temp === null ? "—" : `${Math.round(temp)}°C`, level(temp, 75, 90))
      );

    const facts = [];
    const up = uptimeSec(this._s(sc.last_boot));
    if (up !== null)
      facts.push(
        `<span class="clickable" data-entity="${sc.last_boot}">${svgIcon(ICONS.timer)}${this._t("uptime")} : ${fmtUptime(up, this._hass, this._config)}</span>`
      );
    const loads = ["load_1m", "load_5m", "load_15m"].filter((k) => sc[k]);
    if (loads.length)
      facts.push(
        `<span class="clickable" data-entity="${sc[loads[0]]}">${svgIcon(ICONS.load)}${this._t("load")} : ${loads
          .map((k) => {
            const v = num(this._s(sc[k]));
            return v === null ? "—" : v.toFixed(2);
          })
          .join(" · ")}</span>`
      );
    const ip = mainIp(this._hass, sm, this._config);
    if (ip) facts.push(`<span class="clickable" data-entity="${ip.entity_id}">${svgIcon(ICONS.ip)}${esc(ip.state)}</span>`);

    if (!gauges.length && !facts.length) return "";
    return `<div>
      ${gauges.length ? `<div class="gauges" style="--n:${gauges.length}">${gauges.join("")}</div>` : ""}
      ${facts.length ? `<div class="facts">${facts.join("")}</div>` : ""}
    </div>`;
  }

  _network(sm) {
    const ifs = interfaces(sm, this._config);
    if (!ifs.length) return "";
    const multi = ifs.length > 1;
    const tile = (n, rateKey, totalKey, cls, icon, label) => {
      const id = n[rateKey];
      const total = toBytes(this._s(n[totalKey]));
      return `<div class="tile clickable ${cls}" data-entity="${id || ""}">${svgIcon(icon)}<div style="min-width:0">
        <div class="k">${esc(label)}</div>
        <div class="v">${fmtRate(toBps(this._s(id)))}</div>
        ${total !== null ? `<div class="t">${this._t("total")} ${fmtBytes(total)}</div>` : ""}
      </div></div>`;
    };
    const rows = ifs.map((i) => {
      const n = sm.nets[i];
      const sfx = multi ? ` · ${i}` : "";
      return `<div class="net">
        ${tile(n, "throughput_network_in", "network_in", "down", ICONS.down, this._t("download") + sfx)}
        ${tile(n, "throughput_network_out", "network_out", "up", ICONS.up, this._t("upload") + sfx)}
      </div>`;
    });
    return `<div>
      <div class="section-title">${svgIcon(ICONS.network)}${this._t("network")}${multi ? "" : `<span class="arg">· ${esc(ifs[0])}</span>`}</div>
      ${rows.join("")}
    </div>`;
  }

  _bar(id, icon, label, u, warn, crit) {
    const cls = level(u.pct, warn, crit);
    return `<div class="vol clickable ${cls}" data-entity="${id || ""}">
      <div class="row">${svgIcon(icon)}<span class="grow">${esc(label)}</span></div>
      <div class="bar"><div style="width:${u.pct === null ? 0 : Math.max(0, Math.min(100, u.pct))}%"></div></div>
      <div class="detail">
        <span>${u.used !== null ? `${fmtBytes(u.used)} ${this._t("used")}${u.total !== null ? ` ${this._t("of")} ${fmtBytes(u.total)}` : ""}` : ""}</span>
        <span>${u.pct === null ? "" : `${u.pct.toFixed(0)}%`}</span>
      </div>
    </div>`;
  }

  _storage(sm) {
    const rows = Object.entries(sm.disks).map(([mount, d]) =>
      this._bar(d.disk_use || d.disk_use_percent || d.disk_free, ICONS.disk, mount, diskUsage(this._hass, d), 80, 90)
    );
    const sc = sm.scalars;
    if (sc.swap_use_percent || (sc.swap_use && sc.swap_free)) {
      const u = memUsage(this._hass, sc, "swap");
      if (u.total !== 0) rows.push(this._bar(sc.swap_use_percent || sc.swap_use, ICONS.swap, this._t("swap"), u, 50, 80));
    }
    if (!rows.length) return "";
    return `<div><div class="section-title">${svgIcon(ICONS.database)}${this._t("storage")}</div>${rows.join("")}</div>`;
  }

  _processes(sm) {
    const chips = Object.entries(sm.procs).map(([name, id]) => {
      const on = this._s(id)?.state === "on";
      return `<span class="chip clickable ${on ? "good" : "crit"}" data-entity="${id}"><span class="dot"></span>${esc(name)}</span>`;
    });
    if (!chips.length) return "";
    return `<div><div class="section-title">${svgIcon(ICONS.process)}${this._t("processes")}</div><div class="procs">${chips.join("")}</div></div>`;
  }
}

// ---------------------------------------------------------------------------
// Mini card
// ---------------------------------------------------------------------------

const MINI_STYLE = `
  .header { padding: 12px 12px 4px; }
  .logo { height: 40px; width: 40px; }
  .titles .chip { display: none; }
  .name { font-size: 16px; }
  .content { padding: 4px 12px 12px; display: flex; flex-direction: column; gap: 8px; }
  .metric { display: grid; grid-template-columns: 18px 64px 1fr 56px; align-items: center; gap: 8px; font-size: 13px; }
  .metric .icon { color: var(--secondary-text-color); }
  .metric .v { text-align: right; font-weight: 500; }
  .foot { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 4px 8px; font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; }
  .foot span { display: inline-flex; align-items: center; gap: 2px; }
  .foot .icon { width: 14px; height: 14px; }
`;

class SystemMonitorMiniCard extends SystemMonitorBase {
  static getConfigElement() {
    return document.createElement("system-monitor-mini-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 3;
  }

  getGridOptions() {
    return { columns: 6, min_columns: 6 };
  }

  _metric(id, icon, label, p, display, cls) {
    return `<div class="metric clickable ${cls}" data-entity="${id || ""}">
      ${svgIcon(icon)}<span>${label}</span>
      <div class="bar"><div style="width:${p === null ? 0 : Math.max(0, Math.min(100, p))}%"></div></div>
      <span class="v">${display}</span>
    </div>`;
  }

  _render() {
    const sm = discover(this._hass);
    if (!sm.found) return this._noSm();
    const c = this._config;
    const sc = sm.scalars;
    const rows = [];
    const cpu = num(this._s(sc.processor_use));
    if (sc.processor_use)
      rows.push(this._metric(sc.processor_use, ICONS.cpu, this._t("cpu"), cpu, cpu === null ? "—" : `${Math.round(cpu)}%`, level(cpu, 70, 90)));
    const mem = memUsage(this._hass, sc, "memory");
    if (sc.memory_use_percent || (sc.memory_use && sc.memory_free))
      rows.push(
        this._metric(sc.memory_use_percent || sc.memory_use, ICONS.ram, this._t("ram"), mem.pct, mem.pct === null ? "—" : `${Math.round(mem.pct)}%`, level(mem.pct, 80, 95))
      );
    if (c.show_storage !== false) {
      const mount = sm.disks["/"] ? "/" : Object.keys(sm.disks)[0];
      if (mount) {
        const d = sm.disks[mount];
        const u = diskUsage(this._hass, d);
        rows.push(
          this._metric(d.disk_use_percent || d.disk_use || d.disk_free, ICONS.database, this._t("disk"), u.pct, u.pct === null ? "—" : `${Math.round(u.pct)}%`, level(u.pct, 80, 90))
        );
      }
    }
    const temp = num(this._s(sc.processor_temperature));
    if (sc.processor_temperature)
      rows.push(this._metric(sc.processor_temperature, ICONS.temp, this._t("temperature"), temp, temp === null ? "—" : `${Math.round(temp)}°C`, level(temp, 75, 90)));

    const foot = [];
    const core = this._s(sm.core_update);
    const os = this._s(sm.os_update);
    const pending = [core, os].find((s) => s && s.state === "on");
    foot.push(
      `<span class="clickable ${pending ? "warn" : "good"}" data-entity="${(pending || core)?.entity_id || ""}"><span class="dot"></span>&nbsp;${esc(
        pending ? `${this._t("update")} ${pending.attributes.latest_version || ""}`.trim() : this._t(core ? "up_to_date" : "running")
      )}</span>`
    );
    const ifs = interfaces(sm, c);
    if (c.show_network !== false && ifs.length) {
      const n = sm.nets[ifs[0]];
      foot.push(
        `<span class="clickable" data-entity="${n.throughput_network_in || ""}">${svgIcon(ICONS.down)}${fmtRate(
          toBps(this._s(n.throughput_network_in))
        )}&nbsp;&nbsp;${svgIcon(ICONS.up)}${fmtRate(toBps(this._s(n.throughput_network_out)))}</span>`
      );
    }
    const up = uptimeSec(this._s(sc.last_boot));
    if (up !== null)
      foot.push(`<span class="clickable" data-entity="${sc.last_boot}">${svgIcon(ICONS.timer)}${fmtUptime(up, this._hass, this._config)}</span>`);
    return `<style>${BASE_STYLE}${MINI_STYLE}</style>
      <ha-card>
        ${this._header(sm)}
        <div class="content">
          ${rows.join("")}
          ${foot.length ? `<div class="foot">${foot.join("")}</div>` : ""}
        </div>
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

class SystemMonitorEditorBase extends HTMLElement {
  static get toggles() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    const sm = this._hass ? discover(this._hass) : { nets: {} };
    const ifOptions = Object.keys(sm.nets)
      .filter((i) => sm.nets[i].throughput_network_in || sm.nets[i].throughput_network_out)
      .map((i) => ({ value: i, label: i }));
    return [
      { name: "title", selector: { text: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "show_image", selector: { boolean: {} } },
          ...this.constructor.toggles.map((name) => ({ name, selector: { boolean: {} } })),
        ],
      },
      {
        name: "interface",
        selector: { select: { mode: "dropdown", custom_value: true, options: [{ value: "", label: tr("lang_auto") }, ...ifOptions] } },
      },
      {
        name: "language",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "", label: tr("lang_auto") },
              { value: "en", label: "English" },
              { value: "fr", label: "Français" },
            ],
          },
        },
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, this._config, s.name);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        for (const [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: drop empty values and toggles left at their default (true).
          if (v === "" || v === undefined || v === null || (k.startsWith("show_") && v === true)) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { ...this._config };
    for (const name of ["show_image", ...this.constructor.toggles]) if (data[name] === undefined) data[name] = true;
    this._form.hass = this._hass;
    this._form.data = data;
    this._form.schema = this._schema();
  }
}

class SystemMonitorCardEditor extends SystemMonitorEditorBase {
  static get toggles() {
    return ["show_system", "show_network", "show_storage", "show_processes"];
  }
}

class SystemMonitorMiniCardEditor extends SystemMonitorEditorBase {
  static get toggles() {
    return ["show_storage", "show_network"];
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};
define("system-monitor-card", SystemMonitorCard);
define("system-monitor-mini-card", SystemMonitorMiniCard);
define("system-monitor-card-editor", SystemMonitorCardEditor);
define("system-monitor-mini-card-editor", SystemMonitorMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "system-monitor-card",
    name: "System Monitor Card",
    description: "Monitor the machine running Home Assistant: CPU, RAM, disk, temperature, network, storage and processes.",
  },
  {
    type: "system-monitor-mini-card",
    name: "System Monitor Mini Card",
    description: "Compact Home Assistant host overview: CPU, RAM, disk, temperature, network and uptime.",
  },
]) {
  if (!window.customCards.some((c) => c.type === card.type))
    window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-system-monitor-card" });
}

console.info(
  `%c SYSTEM-MONITOR-CARD %c v${VERSION} `,
  "color: white; background: #18bcf2; font-weight: 700;",
  "color: #18bcf2; background: white; font-weight: 700;"
);
