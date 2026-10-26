// Mock Home Assistant states and entity registry shaped like the System Monitor integration,
// used to render screenshots.
const boot = new Date(Date.now() - (3 * 86400 + 7 * 3600 + 12 * 60) * 1000).toISOString();

// [object id, translation key, state, attributes]
const raw = [
  ["processor_use", "processor_use", "23", { unit_of_measurement: "%" }],
  ["processor_temperature", "processor_temperature", "54.2", { unit_of_measurement: "°C", device_class: "temperature" }],
  ["memory_usage", "memory_use_percent", "38.6", { unit_of_measurement: "%" }],
  ["memory_use", "memory_use", "3091.2", { unit_of_measurement: "MiB", device_class: "data_size" }],
  ["memory_free", "memory_free", "4910.5", { unit_of_measurement: "MiB", device_class: "data_size" }],
  ["swap_use", "swap_use", "112.4", { unit_of_measurement: "MiB", device_class: "data_size" }],
  ["swap_free", "swap_free", "2335.6", { unit_of_measurement: "MiB", device_class: "data_size" }],
  ["load_1m", "load_1m", "0.42", {}],
  ["load_5m", "load_5m", "0.37", {}],
  ["load_15m", "load_15m", "0.31", {}],
  ["last_boot", null, boot, { device_class: "uptime" }],
  ["disk_use", "disk_use", "37.1", { unit_of_measurement: "GiB", device_class: "data_size" }, "/"],
  ["disk_free", "disk_free", "72.6", { unit_of_measurement: "GiB", device_class: "data_size" }, "/"],
  ["disk_use_media", "disk_use", "512.3", { unit_of_measurement: "GiB", device_class: "data_size" }, "/media"],
  ["disk_free_media", "disk_free", "1351.4", { unit_of_measurement: "GiB", device_class: "data_size" }, "/media"],
  ["ipv4_address_enp0s3", "ipv4_address", "192.168.1.162", {}, "enp0s3"],
  ["ipv4_address_hassio", "ipv4_address", "172.30.32.1", {}, "hassio"],
  ["network_in_enp0s3", "network_in", "67911.4", { unit_of_measurement: "MiB", device_class: "data_size" }, "enp0s3"],
  ["network_out_enp0s3", "network_out", "90474.5", { unit_of_measurement: "MiB", device_class: "data_size" }, "enp0s3"],
  ["network_throughput_in_enp0s3", "throughput_network_in", "1.284", { unit_of_measurement: "MB/s", device_class: "data_rate" }, "enp0s3"],
  ["network_throughput_out_enp0s3", "throughput_network_out", "0.236", { unit_of_measurement: "MB/s", device_class: "data_rate" }, "enp0s3"],
  ["network_throughput_in_hassio", "throughput_network_in", "0.012", { unit_of_measurement: "MB/s", device_class: "data_rate" }, "hassio"],
  ["network_throughput_out_hassio", "throughput_network_out", "0.009", { unit_of_measurement: "MB/s", device_class: "data_rate" }, "hassio"],
  ["process_python3", "process", "on", {}, "python3"],
  ["process_mosquitto", "process", "on", {}, "mosquitto"],
  ["process_zigbee2mqtt", "process", "off", {}, "zigbee2mqtt"],
];

const NAMES = {
  processor_use: "Processor use", processor_temperature: "Processor temperature", memory_use_percent: "Memory usage",
  memory_use: "Memory use", memory_free: "Memory free", swap_use: "Swap use", swap_free: "Swap free",
  load_1m: "Load (1m)", load_5m: "Load (5m)", load_15m: "Load (15m)", uptime: "Uptime",
  disk_use: "Disk use", disk_free: "Disk free", ipv4_address: "IPv4 address", network_in: "Network in",
  network_out: "Network out", throughput_network_in: "Network throughput in", throughput_network_out: "Network throughput out",
  process: "Process",
};

export const states = {};
export const entities = {};
export const devices = {};
for (const [obj, key, state, attributes, arg] of raw) {
  const id = `${key === "process" ? "binary_sensor" : "sensor"}.system_monitor_${obj}`;
  const friendly_name = `System Monitor ${NAMES[key || "uptime"]}${arg ? ` ${arg}` : ""}`;
  states[id] = { entity_id: id, state, attributes: { ...attributes, friendly_name } };
  // Like Home Assistant, the "Last boot" sensor has no translation key.
  entities[id] = { entity_id: id, platform: "systemmonitor", ...(key ? { translation_key: key } : {}) };
}
for (const [id, installed] of [
  ["update.home_assistant_core_update", "2026.10.2"],
  ["update.home_assistant_operating_system_update", "16.2"],
]) {
  states[id] = { entity_id: id, state: "off", attributes: { installed_version: installed, latest_version: installed } };
}
export const updateAvailable = {
  "update.home_assistant_core_update": {
    entity_id: "update.home_assistant_core_update",
    state: "on",
    attributes: { installed_version: "2026.10.2", latest_version: "2026.10.3" },
  },
};

// Repositories downloaded with HACS: one update entity each, on a device named after the repository
// whose model is the HACS category; the release URL carries the GitHub "owner/repo".
const HACS = [
  ["hacs", "HACS", "integration", "hacs/integration", "2.0.5", "2.0.5", "hacs"],
  ["parcel", "Parcel", "integration", "juju35/ha-parcel", "0.1.7", "0.2.0", "parcel"],
  ["webrtc", "WebRTC Camera", "integration", "AlexxIT/WebRTC", "v3.6.1", "v3.6.1", "webrtc"],
  ["mushroom", "Mushroom", "plugin", "piitaya/lovelace-mushroom", "v4.5.0", "v4.5.0"],
  ["system_monitor_card", "System Monitor Card", "plugin", "juju35/ha-system-monitor-card", "1.1.0", "1.2.0"],
  ["catppuccin", "Catppuccin Theme", "theme", "catppuccin/home-assistant", "v2.1.2", "v2.1.2"],
];
export const hacsUpdates = {};
for (const [slug, name, category, repo, installed, latest, domain] of HACS) {
  const id = `update.${slug}_update`;
  const attributes = {
    friendly_name: `${name} update`,
    installed_version: installed,
    latest_version: installed,
    release_url: `https://github.com/${repo}/releases/${installed}`,
    ...(domain ? { entity_picture: `https://brands.home-assistant.io/_/${domain}/icon.png` } : {}),
  };
  states[id] = { entity_id: id, state: "off", attributes };
  entities[id] = { entity_id: id, platform: "hacs", device_id: `hacs_${slug}` };
  devices[`hacs_${slug}`] = { id: `hacs_${slug}`, name, model: category };
  if (latest !== installed)
    hacsUpdates[id] = { entity_id: id, state: "on", attributes: { ...attributes, latest_version: latest, release_url: `https://github.com/${repo}/releases/${latest}` } };
}

// HACS Refresh integration: checks every HACS repository for updates on the server.
for (const [id, state, attributes] of [
  ["button.hacs_refresh_check_for_updates", "unknown", {}],
  ["sensor.hacs_refresh_status", "idle", { device_class: "enum", done: 6, total: 6, updates: 2, failed: [], error: null }],
  ["sensor.hacs_refresh_last_check", new Date(Date.now() - 2 * 3600 * 1000).toISOString(), { device_class: "timestamp" }],
]) {
  states[id] = { entity_id: id, state, attributes };
  entities[id] = { entity_id: id, platform: "hacs_refresh", device_id: "hacs_refresh" };
}

// File Size integration watching the Home Assistant database.
devices.filesize_db = { id: "filesize_db", name: "home-assistant_v2.db" };
for (const [id, key, state, attributes] of [
  ["sensor.home_assistant_v2_db_size", "size", "2056.34", { unit_of_measurement: "MB", device_class: "data_size" }],
  ["sensor.home_assistant_v2_db_last_updated", "last_updated", new Date().toISOString(), { device_class: "timestamp" }],
]) {
  states[id] = { entity_id: id, state, attributes };
  entities[id] = { entity_id: id, platform: "filesize", device_id: "filesize_db", translation_key: key };
}

// Integration Watchdog: integrations whose entities are all unavailable.
const ago = (min) => new Date(Date.now() - min * 60 * 1000).toISOString();
for (const [id, key, state, attributes] of [
  ["button.integration_watchdog_check_now", null, "unknown", {}],
  ["sensor.integration_watchdog_unavailable_integrations", "unavailable", "2", {
    state_class: "measurement",
    integrations: [
      { domain: "roborock", title: "Roborock", entry_id: "e1", since: ago(22), reloads: 1, gave_up: false },
      { domain: "tuya", title: "Tuya", entry_id: "e2", since: ago(95), reloads: 3, gave_up: true },
    ],
    ignored: ["zha"],
  }],
  ["sensor.integration_watchdog_last_reload", "last_reload", ago(7), {
    device_class: "timestamp", domain: "roborock", title: "Roborock", entry_id: "e1", success: true, reloads: 4,
  }],
  ["sensor.integration_watchdog_last_check", "last_check", ago(2), { device_class: "timestamp" }],
]) {
  states[id] = { entity_id: id, state, attributes };
  entities[id] = { entity_id: id, platform: "integration_watchdog", device_id: "integration_watchdog", ...(key ? { translation_key: key } : {}) };
}

// Every monitored process running: the processes section stays folded.
const z2m = "binary_sensor.system_monitor_process_zigbee2mqtt";
export const procsRunning = { [z2m]: { ...states[z2m], state: "on" } };
