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
  hacs: "M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L10.11,5.22L16,8.61L17.96,7.5L12,4.15M6.04,7.5L12,10.85L13.96,9.75L8.08,6.35L6.04,7.5M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z",
  github: "M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z",
  close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
  search: "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",
  refresh: "M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z",
  download: "M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z",
  watchdog: "M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z",
  chevron: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  // Fallbacks per HACS category when no logo can be loaded.
  integration: "M22,13.5C22,15.26 20.7,16.72 19,16.96V20A2,2 0 0,1 17,22H13.2V21.7A2.7,2.7 0 0,0 10.5,19C9,19 7.8,20.21 7.8,21.7V22H4A2,2 0 0,1 2,20V16.2H2.3C3.79,16.2 5,15 5,13.5C5,12 3.79,10.8 2.3,10.8H2V7A2,2 0 0,1 4,5H7.04C7.28,3.3 8.74,2 10.5,2C12.26,2 13.72,3.3 13.96,5H17A2,2 0 0,1 19,7V10.04C20.7,10.28 22,11.74 22,13.5M17,15H18.5A1.5,1.5 0 0,0 20,13.5A1.5,1.5 0 0,0 18.5,12H17V7H12V5.5A1.5,1.5 0 0,0 10.5,4A1.5,1.5 0 0,0 9,5.5V7H4V9.12C5.76,9.8 7,11.5 7,13.5C7,15.5 5.75,17.2 4,17.88V20H6.12C6.8,18.25 8.5,17 10.5,17C12.5,17 14.2,18.25 14.88,20H17V15Z",
  plugin: "M19,5V7H15V5H19M9,5V11H5V5H9M19,13V19H15V13H19M9,17V19H5V17H9M21,3H13V9H21V3M11,3H3V13H11V3M21,11H13V21H21V11M11,15H3V21H11V15Z",
  theme: "M12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2C17.5,2 22,6 22,11A6,6 0 0,1 16,17H14.2C13.9,17 13.7,17.2 13.7,17.5C13.7,17.6 13.8,17.7 13.8,17.8C14.2,18.3 14.4,18.9 14.4,19.5C14.5,20.9 13.4,22 12,22M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C12.3,20 12.5,19.8 12.5,19.5C12.5,19.3 12.4,19.2 12.4,19.1C12,18.6 11.8,18.1 11.8,17.5C11.8,16.1 12.9,15 14.3,15H16A4,4 0 0,0 20,11C20,7.1 16.4,4 12,4M6.5,10C7.3,10 8,10.7 8,11.5C8,12.3 7.3,13 6.5,13C5.7,13 5,12.3 5,11.5C5,10.7 5.7,10 6.5,10M9.5,6C10.3,6 11,6.7 11,7.5C11,8.3 10.3,9 9.5,9C8.7,9 8,8.3 8,7.5C8,6.7 8.7,6 9.5,6M14.5,6C15.3,6 16,6.7 16,7.5C16,8.3 15.3,9 14.5,9C13.7,9 13,8.3 13,7.5C13,6.7 13.7,6 14.5,6M17.5,10C18.3,10 19,10.7 19,11.5C19,12.3 18.3,13 17.5,13C16.7,13 16,12.3 16,11.5C16,10.7 16.7,10 17.5,10Z",
  python_script: "M19.14,7.5A2.86,2.86 0 0,1 22,10.36V14.14A2.86,2.86 0 0,1 19.14,17H12C12,17.39 12.32,17.96 12.71,17.96H17V19.64A2.86,2.86 0 0,1 14.14,22.5H9.86A2.86,2.86 0 0,1 7,19.64V15.89C7,14.31 8.28,13.04 9.86,13.04H15.11C16.69,13.04 17.96,11.76 17.96,10.18V7.5H19.14M14.86,19.29C14.46,19.29 14.14,19.59 14.14,20.18C14.14,20.77 14.46,20.89 14.86,20.89A0.71,0.71 0 0,0 15.57,20.18C15.57,19.59 15.25,19.29 14.86,19.29M4.86,17.5C3.28,17.5 2,16.22 2,14.64V10.86C2,9.28 3.28,8 4.86,8H12C12,7.61 11.68,7.04 11.29,7.04H7V5.36C7,3.78 8.28,2.5 9.86,2.5H14.14C15.72,2.5 17,3.78 17,5.36V9.11C17,10.69 15.72,11.96 14.14,11.96H8.89C7.31,11.96 6.04,13.24 6.04,14.82V17.5H4.86M9.14,5.71C9.54,5.71 9.86,5.41 9.86,4.82C9.86,4.23 9.54,4.11 9.14,4.11C8.75,4.11 8.43,4.23 8.43,4.82C8.43,5.41 8.75,5.71 9.14,5.71Z",
  template: "M14 2H6C4.89 2 4 2.9 4 4V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8L14 2M18 20H6V4H13V9H18V20M9.54 15.65L11.63 17.74L10.35 19L7 15.65L10.35 12.3L11.63 13.56L9.54 15.65M17 15.65L13.65 19L12.38 17.74L14.47 15.65L12.38 13.56L13.65 12.3L17 15.65Z",
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
    uptime: "Uptime:",
    load: "Load:",
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
    hacs: "HACS",
    hacs_ok: "HACS up to date",
    hacs_updates_one: "1 HACS update",
    hacs_updates: "{n} HACS updates",
    check_updates: "Check for updates",
    checking: "Checking {i}/{n}…",
    check_failed: "Check failed: {e}",
    last_check: "Last check {t}",
    needs_refresh: "Install HACS Refresh to check every extension for updates from Home Assistant.",
    github: "Open on GitHub",
    check_ext: "Check this extension for updates",
    search_ext: "Search extensions",
    clear_search: "Clear the search",
    no_match: "No matching extension",
    install_all: "Install all updates ({n})",
    install_all_confirm: "Install {n} HACS updates?",
    install_title: "Install the updates",
    install_btn: "Install",
    cancel: "Cancel",
    installing: "Installing {i}/{n}…",
    install_failed: "Install failed: {e}",
    btn_install: "Install ({n})",
    btn_check: "Check",
    procs_ok: "Processes running",
    procs_one: "1 process stopped",
    procs_many: "{n} processes stopped",
    integrations: "Integrations",
    st_up_to_date: "Up to date",
    st_update_one: "1 update",
    st_updates: "{n} updates",
    st_running: "Running",
    st_stopped_one: "1 stopped",
    st_stopped: "{n} stopped",
    st_available: "Available",
    st_unavailable_one: "1 unavailable",
    st_unavailable: "{n} unavailable",
    wd_ok: "Integrations available",
    wd_one: "1 integration unavailable",
    wd_many: "{n} integrations unavailable",
    wd_check: "Check the integrations now",
    wd_none: "Every integration is available.",
    wd_since: "Unavailable {t}",
    wd_reloads_one: "1 reload",
    wd_reloads: "{n} reloads",
    wd_unavailable: "Unavailable",
    wd_gave_up: "Given up",
    wd_last_reload: "Last reload: {name} {t}",
    wd_last_reload_failed: "Last reload failed: {name} {t}",
    wd_last_check: "Checked {t}",
    wd_open: "Open the integration",
    // Editor
    title: "Title (optional, defaults to Home Assistant)",
    show_image: "Show Home Assistant logo",
    show_system: "Show system (CPU, RAM, disk, temperature)",
    show_network: "Show network",
    show_storage: "Show storage",
    show_processes: "Show processes",
    show_hacs: "Show HACS extensions",
    show_watchdog: "Show unavailable integrations (Integration Watchdog)",
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
    load: "Charge :",
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
    hacs: "HACS",
    hacs_ok: "HACS à jour",
    hacs_updates_one: "1 mise à jour HACS",
    hacs_updates: "{n} mises à jour HACS",
    check_updates: "Rechercher les mises à jour",
    checking: "Recherche {i}/{n}…",
    check_failed: "Échec de la recherche : {e}",
    last_check: "Dernière recherche {t}",
    needs_refresh: "Installez HACS Refresh pour rechercher les mises à jour de toutes les extensions depuis Home Assistant.",
    github: "Ouvrir sur GitHub",
    check_ext: "Rechercher les mises à jour de cette extension",
    search_ext: "Rechercher une extension",
    clear_search: "Effacer la recherche",
    no_match: "Aucune extension trouvée",
    install_all: "Installer toutes les mises à jour ({n})",
    install_all_confirm: "Installer {n} mises à jour HACS ?",
    install_title: "Installer les mises à jour",
    install_btn: "Installer",
    cancel: "Annuler",
    installing: "Installation {i}/{n}…",
    install_failed: "Échec de l'installation : {e}",
    btn_install: "Installer ({n})",
    btn_check: "Vérifier",
    procs_ok: "Processus en marche",
    procs_one: "1 processus arrêté",
    procs_many: "{n} processus arrêtés",
    integrations: "Intégrations",
    st_up_to_date: "À jour",
    st_update_one: "1 mise à jour",
    st_updates: "{n} mises à jour",
    st_running: "En marche",
    st_stopped_one: "1 arrêté",
    st_stopped: "{n} arrêtés",
    st_available: "Disponibles",
    st_unavailable_one: "1 indisponible",
    st_unavailable: "{n} indisponibles",
    wd_ok: "Intégrations disponibles",
    wd_one: "1 intégration indisponible",
    wd_many: "{n} intégrations indisponibles",
    wd_check: "Vérifier les intégrations maintenant",
    wd_none: "Toutes les intégrations sont disponibles.",
    wd_since: "Indisponible {t}",
    wd_reloads_one: "1 rechargement",
    wd_reloads: "{n} rechargements",
    wd_unavailable: "Indisponible",
    wd_gave_up: "Abandonnée",
    wd_last_reload: "Dernier rechargement : {name} {t}",
    wd_last_reload_failed: "Échec du dernier rechargement : {name} {t}",
    wd_last_check: "Vérifié {t}",
    wd_open: "Ouvrir l'intégration",
    title: "Titre (facultatif, Home Assistant par défaut)",
    show_image: "Afficher le logo Home Assistant",
    show_system: "Afficher le système (CPU, RAM, disque, température)",
    show_network: "Afficher le réseau",
    show_storage: "Afficher le stockage",
    show_processes: "Afficher les processus",
    show_hacs: "Afficher les extensions HACS",
    show_watchdog: "Afficher les intégrations indisponibles (Integration Watchdog)",
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

/** Lower case without accents, for searching. */
const fold = (v) => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const lang = (hass, config) => {
  const l = (config?.language) || (hass && (hass.locale?.language || hass.language)) || "en";
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
    if (s?.state && !["unknown", "unavailable"].includes(s.state)) return s;
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

// ---------------------------------------------------------------------------
// HACS extensions
// ---------------------------------------------------------------------------

/**
 * Repositories downloaded with HACS, read from their update entities (platform "hacs"):
 * HACS names the device after the repository and stores its category in the device model,
 * and the release URL carries the GitHub "owner/repo".
 */
const discoverHacs = (hass) => {
  const out = [];
  for (const e of Object.values(hass.entities || {})) {
    if (e.platform !== "hacs" || !e.entity_id.startsWith("update.") || e.hidden) continue;
    const s = hass.states[e.entity_id];
    if (!s) continue;
    const a = s.attributes;
    const dev = hass.devices?.[e.device_id];
    const repo = /github\.com\/([^/]+\/[^/]+)/.exec(a.release_url || "")?.[1] || null;
    out.push({
      id: e.entity_id,
      name: dev?.name_by_user || dev?.name || String(a.friendly_name || e.entity_id).replace(/ update$/i, ""),
      category: dev?.model || (a.entity_picture ? "integration" : null),
      repo,
      domain: /\/_\/([^/]+)\/icon\.png/.exec(a.entity_picture || "")?.[1] || null,
      installed: a.installed_version,
      latest: a.latest_version,
      update: s.state === "on",
      busy: !!a.in_progress,
    });
  }
  return out.sort((x, y) => y.update - x.update || x.name.localeCompare(y.name));
};

/** Entities of the HACS Refresh integration, which checks every HACS repository for updates on the server. */
const discoverRefresh = (hass) => {
  const out = {};
  for (const e of Object.values(hass.entities || {})) {
    if (e.platform !== "hacs_refresh" || !hass.states[e.entity_id]) continue;
    if (e.entity_id.startsWith("button.")) out.button = e.entity_id;
    else if (e.entity_id.startsWith("sensor.")) {
      const s = hass.states[e.entity_id];
      if (e.translation_key === "last_check" || s.attributes.device_class === "timestamp") out.lastCheck = e.entity_id;
      else out.status = e.entity_id;
    }
  }
  return out;
};

// ---------------------------------------------------------------------------
// Integration Watchdog
// ---------------------------------------------------------------------------

/** Entities of the Integration Watchdog integration, which reloads the integrations whose entities are all unavailable. */
const discoverWatchdog = (hass) => {
  const out = {};
  const keys = { unavailable: "unavailable", unavailable_integrations: "unavailable", last_reload: "lastReload", last_check: "lastCheck" };
  for (const e of Object.values(hass.entities || {})) {
    if (e.platform !== "integration_watchdog" || !hass.states[e.entity_id]) continue;
    if (e.entity_id.startsWith("button.")) out.button = e.entity_id;
    else if (e.entity_id.startsWith("sensor.")) {
      // Translation key, else the end of the English entity id.
      const key = keys[e.translation_key] || Object.entries(keys).find(([k]) => e.entity_id.endsWith(`_${k}`))?.[1];
      if (key) out[key] ??= e.entity_id;
    }
  }
  return out;
};

const relTime = (iso, locale) => {
  const sec = (Date.parse(iso) - Date.now()) / 1000;
  if (!Number.isFinite(sec)) return "";
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, size] of [["day", 86400], ["hour", 3600], ["minute", 60]])
    if (Math.abs(sec) >= size) return rtf.format(Math.round(sec / size), unit);
  return rtf.format(Math.round(sec), "second");
};

const fireMoreInfo = (node, entityId) => {
  if (!entityId) return;
  node.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
};

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

// In-card confirmation popup, as in ha-iptv-card: a backdrop over the card with a small dialog.
const DIALOG_STYLE = `
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center;
              z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 10px; }
  .modal h3 { margin: 0; font-size: 16px; font-weight: 600; }
  .modal .hint { font-size: 13px; color: var(--secondary-text-color); }
  .modal-list { display: flex; flex-direction: column; gap: 4px; overflow: auto; min-height: 0; }
  .modal-item { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; }
  .modal-item span:first-child { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .modal-item span:last-child { flex: none; color: var(--secondary-text-color); font-variant-numeric: tabular-nums; }
  .modal-item b { font-weight: 500; color: var(--sm-warn); }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 2px; }
  .modal button.act { border: 0; border-radius: 8px; padding: 8px 14px; font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; }
  .modal button.cancel { background: var(--secondary-background-color, rgba(127,127,127,.12)); color: var(--primary-text-color); }
  .modal button.primary { background: var(--primary-color, #03a9f4); color: #fff; }
`;

const BASE_STYLE = `
  :host { --sm-blue: #18bcf2; --sm-ok: var(--success-color, #43a047); --sm-warn: var(--warning-color, #ffa600); --sm-crit: var(--error-color, #db4437); }
  ha-card { overflow: hidden; position: relative; }
  ha-card.dialog-open { min-height: 220px; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  .ok { --c: var(--sm-blue); } .warn { --c: var(--sm-warn); } .crit { --c: var(--sm-crit); } .good { --c: var(--sm-ok); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--sm-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
          background: color-mix(in srgb, var(--c, var(--sm-ok)) 15%, transparent); color: var(--c, var(--sm-ok)); }
  .bar { height: 4px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); overflow: hidden; }
  .bar > div { height: 100%; border-radius: 3px; background: var(--c, var(--sm-blue)); transition: width .6s ease; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 4px; }
  .titles { flex: 1; min-width: 0; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .logo { flex: none; object-fit: contain; filter: drop-shadow(0 3px 5px rgba(0,0,0,.2)); }
  .warning { padding: 16px; color: var(--sm-warn); }
`;

class SystemMonitorBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this._hacsOpen = false;
    this._hacsQuery = "";
    this._wdOpen = false;
    this._procsOpen = false;
    this._imgFailed = new Set();
    this.shadowRoot.addEventListener("click", (ev) => {
      const path = ev.composedPath();
      // Links (GitHub) open on their own, without the more-info dialog.
      if (path.some((n) => n.tagName === "A")) return;
      const action = path.find((n) => n.dataset?.action);
      // Inside the popup, only its buttons and the backdrop itself act.
      if (this._dialog && action?.dataset.action !== "dialog-ok" && action?.dataset.action !== "dialog-cancel") {
        if (path[0] === action) this._closeDialog();
        return;
      }
      if (action?.dataset.action === "dialog-cancel") return this._closeDialog();
      if (action?.dataset.action === "dialog-ok") {
        const run = this._dialog.onOk;
        this._closeDialog();
        run();
        return;
      }
      if (action) {
        if (action.dataset.action === "hacs") {
          this._hacsOpen = !this._hacsOpen;
          // Folding the list clears the search.
          if (!this._hacsOpen) this._hacsQuery = "";
        }
        if (action.dataset.action === "wd") this._wdOpen = !this._wdOpen;
        if (action.dataset.action === "hacs-clear") {
          this._hacsQuery = "";
          this._update();
          this.shadowRoot.querySelector('[data-search="hacs"]')?.focus();
          return;
        }
        // With a process stopped, the list stays unfolded.
        if (action.dataset.action === "procs" && !this._procsKo()) this._procsOpen = !this._procsOpen;
        const enabled = action.getAttribute("aria-disabled") !== "true";
        if (action.dataset.action === "hacs-check" && enabled) this._checkHacs();
        if (action.dataset.action === "hacs-check-ext" && enabled) this._checkExt(action.dataset.target);
        if (action.dataset.action === "hacs-install-all" && enabled) this._installAll();
        if (action.dataset.action === "wd-check" && enabled) this._checkWatchdog();
        if (action.dataset.action === "nav") this._navigate(action.dataset.path);
        this._update();
        return;
      }
      const el = path.find((n) => n.dataset?.entity);
      if (el) fireMoreInfo(this, el.dataset.entity);
    });
    // Keyboard: Enter / Space on an element with role="button" (the check button is a span inside the folding header).
    this.shadowRoot.addEventListener("keydown", (ev) => {
      if ((ev.key === "Enter" || ev.key === " ") && ev.target?.getAttribute?.("role") === "button") {
        ev.preventDefault();
        ev.target.click();
      }
    });
    // Escape closes the popup.
    this.shadowRoot.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && this._dialog) {
        ev.stopPropagation();
        this._closeDialog();
      }
    });
    // HACS search field: filters the list as you type; Escape clears it.
    this.shadowRoot.addEventListener("input", (ev) => {
      if (ev.target?.dataset?.search !== "hacs") return;
      this._hacsQuery = ev.target.value;
      this._update();
    });
    this.shadowRoot.addEventListener("keydown", (ev) => {
      if (ev.key !== "Escape" || ev.target?.dataset?.search !== "hacs" || !this._hacsQuery) return;
      ev.stopPropagation();
      this._hacsQuery = "";
      this._update();
    });
    // Logos load dynamically: on error, try the next source, then fall back to the category icon.
    this.shadowRoot.addEventListener(
      "error",
      (ev) => {
        const img = ev.target;
        if (img.tagName !== "IMG" || img.dataset.fb === undefined) return;
        this._imgFailed.add(img.getAttribute("src"));
        const next = img.dataset.fb.split(" ").filter((u) => u && !this._imgFailed.has(u));
        if (next.length) {
          img.dataset.fb = next.slice(1).join(" ");
          img.src = next[0];
        } else img.replaceWith(Object.assign(document.createElement("span"), { innerHTML: svgIcon(ICONS[img.dataset.cat] || ICONS.hacs) }).firstChild);
      },
      true
    );
  }

  connectedCallback() {
    // The brands access token rotates: refresh it before it expires.
    this._tokenTimer = setInterval(() => this._fetchBrandsToken(true), 20 * 60 * 1000);
    // A click elsewhere on the page folds the HACS and integrations lists (as in ha-carburants-france).
    // A click, not a pointerdown: folding on press would shift the layout under the pointer before the click.
    // The processes list folds too, unless a process is stopped.
    this._onOutside ??= (ev) => {
      if ((!this._hacsOpen && !this._wdOpen && !this._procsOpen && !this._dialog) || ev.composedPath().includes(this)) return;
      this._dialog = null;
      this._hacsOpen = false;
      this._hacsQuery = "";
      this._wdOpen = false;
      this._procsOpen = false;
      this._update();
    };
    document.addEventListener("click", this._onOutside, true);
  }

  disconnectedCallback() {
    clearInterval(this._tokenTimer);
    document.removeEventListener("click", this._onOutside, true);
  }

  /** Token for /api/brands (Home Assistant 2026.3+), which serves local custom integration brands before the CDN. */
  async _fetchBrandsToken(force = false) {
    if (!this._hass || (this._brandsToken !== undefined && !force) || this._tokenPending) return;
    this._tokenPending = true;
    try {
      const res = await this._hass.callWS({ type: "brands/access_token" });
      this._brandsToken = res?.token || null;
    } catch (_e) {
      this._brandsToken = null; // older Home Assistant: CDN only
    }
    this._tokenPending = false;
    this._html = "";
    this._update();
  }

  /** Logo sources of an extension, best first: local/proxied brand, brands CDN, GitHub owner avatar. */
  _logoSources(x) {
    const out = [];
    if (x.domain) {
      if (this._brandsToken)
        out.push(`/api/brands/integration/${encodeURIComponent(x.domain)}/icon.png?placeholder=no&token=${encodeURIComponent(this._brandsToken)}`);
      out.push(`https://brands.home-assistant.io/_/${encodeURIComponent(x.domain)}/icon.png`);
    }
    if (x.repo) out.push(`https://github.com/${x.repo.split("/")[0]}.png?size=64`);
    return out.filter((u) => !this._imgFailed.has(u));
  }

  _logo(x) {
    const src = this._logoSources(x);
    const cat = ICONS[x.category] ? x.category : "hacs";
    if (!src.length) return `<span class="ext-logo fallback">${svgIcon(ICONS[cat])}</span>`;
    return `<span class="ext-logo"><img src="${esc(src[0])}" data-fb="${esc(src.slice(1).join(" "))}" data-cat="${cat}" alt="" loading="lazy" referrerpolicy="no-referrer"></span>`;
  }

  /** Checks one extension through HACS Refresh's check_repository action, which ends with the result. */
  async _checkExt(entityId) {
    this._extChecking ??= new Set();
    if (this._extChecking.has(entityId)) return;
    this._extChecking.add(entityId);
    this._checkError = null;
    this._update();
    try {
      await this._hass.callService("hacs_refresh", "check_repository", { entity_id: entityId });
    } catch (e) {
      this._checkError = e?.message || String(e);
    }
    this._extChecking.delete(entityId);
    this._update();
  }

  /**
   * Installs every pending HACS update, one after the other (HACS downloads one repository at a
   * time), after a confirmation. Integrations then need a Home Assistant restart, which HA raises
   * as a repair; dashboard cards need a browser reload.
   */
  async _installAll() {
    if (this._installing) return;
    const pending = discoverHacs(this._hass).filter((x) => x.update && !x.busy);
    if (!pending.length) return;
    const items = pending
      .map((x) => `<div class="modal-item"><span>${esc(x.name)}</span><span>${esc(x.installed || "?")} → <b>${esc(x.latest || "?")}</b></span></div>`)
      .join("");
    this._openDialog({
      body: `<h3>${esc(this._t("install_title"))}</h3>
        <div class="hint">${esc(this._t("install_all_confirm").replace("{n}", pending.length))}</div>
        <div class="modal-list">${items}</div>`,
      ok: this._t("install_btn"),
      onOk: () => this._runInstall(pending.map((x) => x.id)),
    });
  }

  /** Opens the in-card popup: body HTML, label of the main button, and what it does. */
  _openDialog(dialog) {
    this._dialog = dialog;
    this._update();
    this.shadowRoot.querySelector(".modal .primary")?.focus();
  }

  _closeDialog() {
    this._dialog = null;
    this._update();
  }

  _dialogHtml() {
    const d = this._dialog;
    if (!d) return "";
    return `<style>${DIALOG_STYLE}</style><div class="backdrop" data-action="dialog-backdrop">
      <div class="modal" role="dialog" aria-modal="true">
        ${d.body}
        <div class="modal-actions">
          <button class="act cancel" data-action="dialog-cancel">${esc(this._t("cancel"))}</button>
          <button class="act primary" data-action="dialog-ok">${esc(d.ok)}</button>
        </div>
      </div>
    </div>`;
  }

  async _runInstall(ids) {
    if (this._installing) return;
    this._installing = { done: 0, total: ids.length };
    this._installError = null;
    this._update();
    for (const id of ids) {
      try {
        await this._hass.callService("update", "install", { entity_id: id });
      } catch (e) {
        this._installError = `${this._hass.states[id]?.attributes?.friendly_name || id}: ${e?.message || e}`;
      }
      this._installing.done++;
      this._update();
    }
    this._installing = null;
    this._update();
  }

  /** Presses the HACS Refresh button: the check runs on the server, its progress comes back through the status sensor. */
  async _checkHacs() {
    const rf = discoverRefresh(this._hass);
    if (!rf.button) return;
    this._checkError = null;
    try {
      await this._hass.callService("button", "press", { entity_id: rf.button });
    } catch (e) {
      this._checkError = e?.message || String(e);
    }
    this._update();
  }

  /** Presses the Integration Watchdog button: it checks the integrations now and reloads those that are due. */
  async _checkWatchdog() {
    const wd = discoverWatchdog(this._hass);
    if (!wd.button) return;
    this._wdError = null;
    try {
      await this._hass.callService("button", "press", { entity_id: wd.button });
    } catch (e) {
      this._wdError = e?.message || String(e);
    }
    this._update();
  }

  /** Opens a Home Assistant page, as a link inside the frontend does. */
  _navigate(path) {
    if (!path) return;
    history.pushState(null, "", path);
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
  }

  set hass(hass) {
    this._hass = hass;
    this._fetchBrandsToken();
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
    let html = this._render();
    if (this._dialog) html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${this._dialogHtml()}</ha-card>`);
    if (html !== this._html) {
      // Re-rendering replaces the search field: keep its focus and caret.
      const active = this.shadowRoot.activeElement;
      const search = active?.dataset?.search;
      const caret = search ? [active.selectionStart, active.selectionEnd] : null;
      this._html = html;
      this.shadowRoot.innerHTML = html;
      if (search) {
        const field = this.shadowRoot.querySelector(`[data-search="${search}"]`);
        if (field) {
          field.focus();
          field.setSelectionRange(...caret);
        }
      }
    }
  }

  _header(sm, aside = "") {
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
          <div class="chips">${chip}</div>
        </div>${aside}
      </div>`;
  }

  /** HACS status tile: all extensions up to date, or how many have an update. */
  _hacsStat() {
    if (this._config.show_hacs === false) return "";
    const ext = discoverHacs(this._hass);
    if (!ext.length) return "";
    const n = ext.filter((x) => x.update).length;
    const text = n === 0 ? this._t("hacs_ok") : n === 1 ? this._t("hacs_updates_one") : this._t("hacs_updates").replace("{n}", n);
    const value = n === 0 ? this._t("st_up_to_date") : this._t(n === 1 ? "st_update_one" : "st_updates").replace("{n}", n);
    return this._stat("hacs", ICONS.hacs, this._t("hacs"), value, n ? "warn" : "good", text);
  }

  /** Monitored processes that are stopped (process binary sensors off). */
  _stopped(sm) {
    return Object.values(sm.procs).filter((id) => this._s(id)?.state !== "on");
  }

  _procsKo() {
    return this._stopped(discover(this._hass)).length > 0;
  }

  /**
   * The processes section is always unfolded while a process is stopped. Otherwise it is folded
   * by default, and like the HACS and integrations lists, unfolds on a click and folds again on a
   * click elsewhere.
   */
  _procsUnfolded() {
    return this._procsKo() || !!this._procsOpen;
  }

  /** Processes status tile: all running, or how many are stopped. */
  _procsStat(sm) {
    if (this._config.show_processes === false || !Object.keys(sm.procs).length) return "";
    const n = this._stopped(sm).length;
    const text = n === 0 ? this._t("procs_ok") : n === 1 ? this._t("procs_one") : this._t("procs_many").replace("{n}", n);
    const value = n === 0 ? this._t("st_running") : this._t(n === 1 ? "st_stopped_one" : "st_stopped").replace("{n}", n);
    return this._stat("procs", ICONS.process, this._t("processes"), value, n ? "crit" : "good", text);
  }

  /** Integration Watchdog status tile: all integrations available, or how many are not. */
  _wdStat() {
    if (this._config.show_watchdog === false) return "";
    const wd = discoverWatchdog(this._hass);
    const st = this._s(wd.unavailable);
    if (!st) return "";
    const n = (st.attributes.integrations || []).length;
    const text = n === 0 ? this._t("wd_ok") : n === 1 ? this._t("wd_one") : this._t("wd_many").replace("{n}", n);
    const value = n === 0 ? this._t("st_available") : this._t(n === 1 ? "st_unavailable_one" : "st_unavailable").replace("{n}", n);
    return this._stat("wd", ICONS.watchdog, this._t("integrations"), value, n ? "crit" : "good", text);
  }

  /** A status tile of the row under the header: section icon and name, status in its color; a click folds or unfolds that section. */
  _stat(action, icon, label, value, cls, title) {
    return `<div class="stat clickable ${cls}" ${this._statTarget(action)} role="button" tabindex="0" title="${esc(title)}" aria-label="${esc(title)}">
        <div class="k">${svgIcon(icon)}<span>${esc(label)}</span></div><div class="v">${esc(value)}</div>
      </div>`;
  }

  /** What a click on a status tile does: here, fold or unfold its section. */
  _statTarget(action) {
    return `data-action="${action}"`;
  }

  /** Overall statuses (HACS, processes, integrations), side by side under the header. */
  _statusRow(sm) {
    const stats = [this._hacsStat(), this._procsStat(sm), this._wdStat()].filter(Boolean);
    return stats.length ? `<div class="stats" style="--n:${stats.length}">${stats.join("")}</div>` : "";
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

/** Status tiles and buttons, shared by the full and the status cards. */
const TILES_STYLE = `
  .stats { display: grid; grid-template-columns: repeat(var(--n, 3), minmax(0, 1fr)); gap: 6px; padding: 0 12px 10px; }
  .stat { display: flex; flex-direction: column; gap: 0; padding: 6px 8px; border-radius: 10px; min-width: 0;
          background: color-mix(in srgb, var(--c, var(--sm-ok)) 12%, var(--secondary-background-color, transparent)); }
  .stat .k { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .stat .k span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stat .k .icon { width: 16px; height: 16px; color: var(--c, var(--sm-ok)); }
  .stat .v { font-size: 13px; font-weight: 500; color: var(--c, var(--sm-ok)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .btn { display: inline-flex; align-items: center; gap: 6px; font: inherit; font-size: 13px; font-weight: 500; padding: 6px 12px;
         border: none; border-radius: 10px; cursor: pointer; color: var(--primary-color, #03a9f4);
         background: color-mix(in srgb, var(--primary-color, #03a9f4) 15%, transparent); }
  .btn:disabled, .btn[aria-disabled="true"] { cursor: default; opacity: .8; }
  .btn .icon { width: 16px; height: 16px; }
  .spin { animation: sm-spin 1s linear infinite; }
  @keyframes sm-spin { to { transform: rotate(360deg); } }
  .err { font-size: 12px; color: var(--sm-crit); }
`;

const FULL_STYLE = `
  .logo { height: 44px; width: 44px; }
  .titles .chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
  .section-title.toggle { cursor: pointer; margin-bottom: 0; user-select: none; }
  .section-title .count { margin-left: auto; text-transform: none; letter-spacing: 0; font-weight: 400; }
  .section-title .chevron { transition: transform .2s ease; }
  .section-title.closed .chevron { transform: rotate(-90deg); }
  .section-title .chip { text-transform: none; letter-spacing: 0; padding: 0 8px; }
  .section-title .btn-install { cursor: pointer; padding: 2px 8px; }
  .section-title .btn-install[aria-disabled="true"] { cursor: default; }
  .section-title .btn-install .icon { width: 14px; height: 14px; }
  .hacs .toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin: 8px 0 4px; }
  .section-title .btn-check { text-transform: none; letter-spacing: 0; padding: 4px 8px; margin-left: 6px; margin-right: 16px; font-size: 12px; gap: 4px; }
  .toolbar .last { font-size: 12px; }
  .toolbar .hint { font-size: 12px; color: var(--secondary-text-color); text-decoration: none; }
  .toolbar .hint:hover { text-decoration: underline; }
  .exts { margin-top: 4px; }
  .hacs .search { display: flex; align-items: center; gap: 6px; margin: 8px 0 4px; padding: 0 10px; height: 34px; border-radius: 10px;
                  background: var(--secondary-background-color, rgba(127,127,127,.08)); color: var(--secondary-text-color); cursor: text; }
  .hacs .search:focus-within { outline: 2px solid var(--sm-blue); outline-offset: -2px; }
  .hacs .search .icon { width: 16px; height: 16px; }
  .hacs .search input { flex: 1; min-width: 0; border: 0; outline: 0; background: none; font: inherit; font-size: 13px; color: var(--primary-text-color); }
  .hacs .search input::placeholder { color: var(--secondary-text-color); }
  .hacs .search input::-webkit-search-cancel-button { display: none; }
  .hacs .search .clear { flex: none; width: 24px; height: 24px; margin-right: -4px; display: flex; align-items: center; justify-content: center;
                         border-radius: 50%; cursor: pointer; color: var(--secondary-text-color); }
  .hacs .search .clear.empty { opacity: .35; pointer-events: none; }
  .hacs .search .clear:hover { background: var(--divider-color, rgba(127,127,127,.25)); color: var(--primary-text-color); }
  .exts .empty { padding: 8px 0; font-size: 13px; }
  .ext { display: flex; align-items: center; gap: 10px; padding: 4px 0; font-size: 13px; }
  .ext + .ext { border-top: 1px solid var(--divider-color, rgba(127,127,127,.25)); }
  .ext .grow { flex: 1; min-width: 0; }
  .ext-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ext-ver { font-size: 12px; color: var(--secondary-text-color); font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ext-ver b { font-weight: 500; color: var(--sm-warn); }
  .ext-logo { width: 28px; height: 28px; flex: none; display: flex; align-items: center; justify-content: center; border-radius: 8px; overflow: hidden; }
  .ext-logo img { width: 100%; height: 100%; object-fit: contain; }
  .ext-logo.fallback, .ext-logo:has(> svg) { background: var(--secondary-background-color, rgba(127,127,127,.12)); color: var(--secondary-text-color); }
  .ext .chip { flex: none; }
  .gh { flex: none; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%;
        color: var(--secondary-text-color); }
  .gh[role="button"] { cursor: pointer; }
  .gh[aria-disabled="true"] { cursor: default; }
  .gh:hover { background: var(--secondary-background-color, rgba(127,127,127,.12)); color: var(--primary-text-color); }
  .gh.placeholder { visibility: hidden; }
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title .icon { width: 16px; height: 16px; }
  .gauges { display: grid; grid-template-columns: repeat(var(--n, 3), 1fr); gap: 6px; }
  .gauge { display: flex; flex-direction: column; align-items: center; min-width: 0; }
  .dial { position: relative; width: 100%; max-width: 60px; aspect-ratio: 1; }
  .ring { width: 100%; height: 100%; transform: rotate(-90deg); display: block; }
  .ring circle { fill: none; stroke-width: 6; }
  .ring .track { stroke: var(--divider-color, rgba(127,127,127,.25)); }
  .ring .value { stroke: var(--c, var(--sm-blue)); stroke-linecap: round; transition: stroke-dasharray .6s ease; }
  .dial .val { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .dial .val b { font-size: 14px; font-weight: 500; }
  .dial .val .icon { width: 12px; height: 12px; color: var(--secondary-text-color); }
  .gauge .lbl { font-size: 12px; color: var(--secondary-text-color); margin-top: 0; text-align: center; }
  .gauge .lbl2 { font-size: 11px; color: var(--secondary-text-color); opacity: .8; text-align: center; white-space: nowrap; }
  .section-title .arg { text-transform: none; letter-spacing: 0; }
  .facts { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 12px; margin-top: 6px; }
  .facts > span { display: inline-flex; align-items: center; gap: 4px; }
  .facts .icon { width: 14px; height: 14px; color: var(--secondary-text-color); }
  .net { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
  .net + .net { margin-top: 6px; }
  .tile { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 10px; min-width: 0;
          background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .tile .icon { color: var(--c, var(--sm-blue)); }
  .tile .k { font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tile .v { font-size: 14px; font-weight: 500; }
  .tile .t { font-size: 11px; color: var(--secondary-text-color); }
  .tile.up { --c: var(--info-color, #039be5); }
  .tile.down { --c: var(--sm-ok); }
  .vol { margin-bottom: 8px; display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 8px; align-items: center; }
  .vol .row { grid-column: 1; grid-row: 1; }
  .vol:last-child { margin-bottom: 0; }
  .row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
  .row .icon { color: var(--secondary-text-color); }
  .row .grow { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row .tag { font-size: 11px; padding: 1px 6px; border-radius: 6px; background: var(--secondary-background-color, rgba(127,127,127,.12));
              color: var(--secondary-text-color); }
  .vol .bar { margin: 4px 0 0; grid-column: 1 / -1; grid-row: 2; }
  .vol .detail { font-size: 11px; color: var(--secondary-text-color); display: flex; justify-content: flex-end; grid-column: 2; grid-row: 1; gap: 8px; }
  .procs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
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
    if (c.show_hacs !== false) parts.push(this._hacs());
    if (c.show_watchdog !== false) parts.push(this._watchdog());
    return `<style>${BASE_STYLE}${TILES_STYLE}${FULL_STYLE}</style>
      <ha-card>
        ${this._header(sm)}
        ${this._statusRow(sm)}
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
        `<span class="clickable" data-entity="${sc.last_boot}">${svgIcon(ICONS.timer)}${this._t("uptime")} ${fmtUptime(up, this._hass, this._config)}</span>`
      );
    const loads = ["load_1m", "load_5m", "load_15m"].filter((k) => sc[k]);
    if (loads.length)
      facts.push(
        `<span class="clickable" data-entity="${sc[loads[0]]}">${svgIcon(ICONS.load)}${this._t("load")} ${loads
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

  _hacs() {
    const ext = discoverHacs(this._hass);
    if (!ext.length) return "";
    const open = this._hacsOpen;
    const n = ext.filter((x) => x.update).length;
    const rf = discoverRefresh(this._hass);
    const admin = !this._hass.user || this._hass.user.is_admin;
    // Check button in the header, so it stays visible while the section is folded.
    let check = "";
    let info = "";
    if (rf.button) {
      const st = this._s(rf.status);
      const running = st?.state === "running";
      const busy = running || this._s(rf.button)?.state === "unavailable";
      const progress = running ? `${st.attributes.done ?? 0}/${st.attributes.total || "…"}` : "";
      const title = running
        ? this._t("checking").replace("{i}", st.attributes.done ?? 0).replace("{n}", st.attributes.total || "…")
        : this._t("check_updates");
      check = `<span class="btn btn-check" role="button" tabindex="0" data-action="hacs-check" title="${esc(title)}" aria-label="${esc(title)}" aria-disabled="${busy}">
          ${svgIcon(ICONS.refresh, running ? "spin" : "")}${progress ? `<span>${esc(progress)}</span>` : ""}
        </span>`;
      const error = this._checkError || (st?.state === "error" ? st.attributes.error : null);
      const last = this._s(rf.lastCheck)?.state;
      const lastText = !running && last && !["unknown", "unavailable"].includes(last)
        ? this._t("last_check").replace("{t}", relTime(last, lang(this._hass, this._config)))
        : "";
      if (lastText || error)
        info = `<div class="toolbar">
          ${lastText ? `<span class="muted last clickable" data-entity="${rf.lastCheck}">${esc(lastText)}</span>` : ""}
          ${error ? `<span class="err">${esc(this._t("check_failed").replace("{e}", error))}</span>` : ""}
        </div>`;
    } else if (admin) {
      info = `<div class="toolbar"><a class="hint" href="https://github.com/juju35/ha-hacs-refresh" target="_blank" rel="noopener noreferrer">${esc(this._t("needs_refresh"))}</a></div>`;
    }
    if (this._installError)
      info += `<div class="toolbar"><span class="err">${esc(this._t("install_failed").replace("{e}", this._installError))}</span></div>`;
    const head = `<div class="section-title toggle ${open ? "" : "closed"}" data-action="hacs" role="button" aria-expanded="${open}">
        ${svgIcon(ICONS.hacs)}${this._t("hacs")}
        ${this._installChip(n, admin)}${check}
        <span class="count">${ext.length}</span>${svgIcon(ICONS.chevron, "chevron")}
      </div>`;
    if (!open) return `<div class="hacs">${head}</div>`;
    // Per-extension check, with HACS Refresh 0.2.0 or later.
    const canCheckExt = !!this._hass.services?.hacs_refresh?.check_repository;
    const st = rf.status ? this._s(rf.status) : null;
    const fullRunning = st?.state === "running";
    const serverChecking = new Set(st?.attributes?.checking || []);
    // Without a GitHub link, keep its slot so the buttons stay aligned with the other rows.
    const hasRepo = ext.some((x) => x.repo);
    const query = fold(this._hacsQuery.trim());
    const shown = query ? ext.filter((x) => fold(`${x.name} ${x.repo || ""}`).includes(query)) : ext;
    const search = `<label class="search">${svgIcon(ICONS.search)}<input type="search" data-search="hacs" value="${esc(
      this._hacsQuery
    )}" placeholder="${esc(this._t("search_ext"))}" aria-label="${esc(this._t("search_ext"))}" autocomplete="off" spellcheck="false">${
      this._hacsQuery
        ? `<span class="clear" role="button" tabindex="0" data-action="hacs-clear" title="${esc(this._t("clear_search"))}" aria-label="${esc(this._t("clear_search"))}">${svgIcon(ICONS.close)}</span>`
        : `<span class="clear empty" aria-hidden="true">${svgIcon(ICONS.close)}</span>`
    }</label>`;
    const rows = shown.map((x) => {
      const ver = x.update ? `${esc(x.installed || "?")} → <b>${esc(x.latest || "?")}</b>` : esc(x.installed || "—");
      const status = x.update
        ? `<span class="chip warn"><span class="dot"></span>${esc(this._t("update"))}</span>`
        : `<span class="chip good"><span class="dot"></span>${esc(this._t("up_to_date"))}</span>`;
      const gh = x.repo
        ? `<a class="gh" href="https://github.com/${esc(x.repo)}" target="_blank" rel="noopener noreferrer" title="${esc(this._t("github"))}" aria-label="${esc(this._t("github"))}">${svgIcon(ICONS.github)}</a>`
        : hasRepo
          ? `<span class="gh placeholder" aria-hidden="true"></span>`
          : "";
      const checking = fullRunning || serverChecking.has(x.id) || !!this._extChecking?.has(x.id);
      const check = canCheckExt
        ? `<span class="gh" role="button" tabindex="0" data-action="hacs-check-ext" data-target="${x.id}" title="${esc(this._t("check_ext"))}" aria-label="${esc(this._t("check_ext"))}" aria-disabled="${checking}">${svgIcon(ICONS.refresh, checking ? "spin" : "")}</span>`
        : "";
      return `<div class="ext clickable" data-entity="${x.id}">
          ${this._logo(x)}
          <div class="grow"><div class="ext-name">${esc(x.name)}</div><div class="ext-ver">${ver}</div></div>
          ${status}${check}${gh}
        </div>`;
    });
    const list = rows.length ? rows.join("") : `<div class="muted empty">${esc(this._t("no_match"))}</div>`;
    return `<div class="hacs">${head}${info}${search}<div class="exts">${list}</div></div>`;
  }

  /**
   * Number of pending HACS updates, next to the section title. For admins it is a button that
   * installs them all, with its progress while it runs.
   */
  _installChip(n, admin) {
    const run = this._installing;
    if (!n && !run) return "";
    if (!admin) return `<span class="chip warn"><span class="dot"></span>${n}</span>`;
    const title = run
      ? this._t("installing").replace("{i}", run.done).replace("{n}", run.total)
      : this._t("install_all").replace("{n}", n);
    const label = run ? `${run.done}/${run.total}` : n;
    return `<span class="chip warn btn-install" role="button" tabindex="0" data-action="hacs-install-all" title="${esc(title)}" aria-label="${esc(title)}" aria-disabled="${!!run}">
        ${run ? svgIcon(ICONS.refresh, "spin") : svgIcon(ICONS.download)}<span>${esc(label)}</span>
      </span>`;
  }

  /** Integrations whose entities are all unavailable, from Integration Watchdog. */
  _watchdog() {
    const wd = discoverWatchdog(this._hass);
    const st = this._s(wd.unavailable);
    if (!st) return "";
    const items = st.attributes.integrations || [];
    // Hidden while every integration is available, unless shown from the status tile (unfolded,
    // until a click elsewhere).
    if (!items.length && !this._wdOpen) return "";
    const open = this._wdOpen;
    const locale = lang(this._hass, this._config);
    let check = "";
    if (wd.button) {
      const busy = this._s(wd.button)?.state === "unavailable";
      const title = this._t("wd_check");
      check = `<span class="btn btn-check" role="button" tabindex="0" data-action="wd-check" title="${esc(title)}" aria-label="${esc(title)}" aria-disabled="${busy}">
          ${svgIcon(ICONS.refresh, busy ? "spin" : "")}
        </span>`;
    }
    const head = `<div class="section-title toggle ${open ? "" : "closed"}" data-action="wd" role="button" aria-expanded="${open}">
        ${svgIcon(ICONS.watchdog)}${this._t("integrations")}
        ${items.length ? `<span class="chip crit"><span class="dot"></span>${items.length}</span>` : ""}${check}
        <span class="count"></span>${svgIcon(ICONS.chevron, "chevron")}
      </div>`;
    if (!open) return `<div class="hacs wd">${head}</div>`;
    const info = [];
    const reload = this._s(wd.lastReload);
    if (reload && !["unknown", "unavailable"].includes(reload.state)) {
      const key = reload.attributes.success === false ? "wd_last_reload_failed" : "wd_last_reload";
      const text = this._t(key).replace("{name}", reload.attributes.title || reload.attributes.domain || "").replace("{t}", relTime(reload.state, locale));
      info.push(`<span class="muted last clickable ${reload.attributes.success === false ? "err" : ""}" data-entity="${reload.entity_id}">${esc(text)}</span>`);
    }
    const last = this._s(wd.lastCheck);
    if (last && !["unknown", "unavailable"].includes(last.state))
      info.push(`<span class="muted last clickable" data-entity="${last.entity_id}">${esc(this._t("wd_last_check").replace("{t}", relTime(last.state, locale)))}</span>`);
    if (this._wdError) info.push(`<span class="err">${esc(this._t("check_failed").replace("{e}", this._wdError))}</span>`);
    const rows = items.map((x) => {
      const reloads = x.reloads ? (x.reloads === 1 ? this._t("wd_reloads_one") : this._t("wd_reloads").replace("{n}", x.reloads)) : "";
      // The domain only when the title doesn't already say it.
      const domain = String(x.title || "").toLowerCase().replace(/[^a-z0-9]/g, "") === String(x.domain).replace(/_/g, "") ? "" : x.domain;
      const sub = [domain, x.since ? this._t("wd_since").replace("{t}", relTime(x.since, locale)) : "", reloads].filter(Boolean).join(" · ");
      const status = x.gave_up
        ? `<span class="chip crit"><span class="dot"></span>${esc(this._t("wd_gave_up"))}</span>`
        : `<span class="chip warn"><span class="dot"></span>${esc(this._t("wd_unavailable"))}</span>`;
      const path = `/config/integrations/integration/${encodeURIComponent(x.domain)}`;
      return `<div class="ext clickable" data-action="nav" data-path="${esc(path)}" title="${esc(this._t("wd_open"))}">
          ${this._logo({ domain: x.domain, category: "integration" })}
          <div class="grow"><div class="ext-name">${esc(x.title || x.domain)}</div><div class="ext-ver">${esc(sub)}</div></div>
          ${status}
        </div>`;
    });
    const body = rows.length ? `<div class="exts">${rows.join("")}</div>` : `<div class="toolbar"><span class="muted last">${esc(this._t("wd_none"))}</span></div>`;
    return `<div class="hacs wd">${head}${info.length ? `<div class="toolbar">${info.join("")}</div>` : ""}${body}</div>`;
  }

  _processes(sm) {
    const entries = Object.entries(sm.procs);
    if (!entries.length) return "";
    const n = this._stopped(sm).length;
    const open = this._procsUnfolded();
    const head = `<div class="section-title toggle ${open ? "" : "closed"}" data-action="procs" role="button" aria-expanded="${open}">
        ${svgIcon(ICONS.process)}${this._t("processes")}
        ${n ? `<span class="chip crit"><span class="dot"></span>${n}</span>` : ""}
        <span class="count">${entries.length}</span>${svgIcon(ICONS.chevron, "chevron")}
      </div>`;
    // Hidden while every process runs, unless unfolded from the status tile; shown as soon as one stops.
    if (!open) return "";
    const chips = entries.map(([name, id]) => {
      const on = this._s(id)?.state === "on";
      return `<span class="chip clickable ${on ? "good" : "crit"}" data-entity="${id}"><span class="dot"></span>${esc(name)}</span>`;
    });
    return `<div>${head}<div class="procs">${chips.join("")}</div></div>`;
  }
}

// ---------------------------------------------------------------------------
// Mini card
// ---------------------------------------------------------------------------

const MINI_STYLE = `
  .header { padding: 12px 12px 4px; }
  .logo { height: 40px; width: 40px; }
  .titles .chips { display: none; }
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
// Status card
// ---------------------------------------------------------------------------

const STATUS_STYLE = `
  .header { padding: 12px 12px 8px; }
  .logo { height: 40px; width: 40px; }
  .titles .chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
  .header .btn { flex: none; padding: 6px 10px; font-size: 12px; gap: 4px; white-space: nowrap; }
  .header .btn.warn { color: var(--sm-warn); background: color-mix(in srgb, var(--sm-warn) 15%, transparent); }
  .stats { padding-bottom: 12px; }
  .err { padding: 0 12px 12px; }
`;

/**
 * Minimal card: header (Core / OS versions and update), the overall status tiles and a single
 * button that checks HACS for updates, or installs them when some are pending.
 */
class SystemMonitorStatusCard extends SystemMonitorBase {
  static getConfigElement() {
    return document.createElement("system-monitor-status-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 2;
  }

  getGridOptions() {
    return { columns: 6, min_columns: 6 };
  }

  /** No sections to unfold here: tiles open the HACS or integrations page, or the first stopped process. */
  _statTarget(action) {
    if (action === "hacs") return `data-action="nav" data-path="/hacs/dashboard"`;
    if (action === "wd") return `data-action="nav" data-path="/config/integrations/dashboard"`;
    const sm = discover(this._hass);
    return `data-entity="${this._stopped(sm)[0] || Object.values(sm.procs)[0] || ""}"`;
  }

  /** The status row shows up only while one of the statuses is not good. */
  _statusRow(sm) {
    const stats = [this._hacsStat(), this._procsStat(sm), this._wdStat()].filter(Boolean);
    if (!stats.some((x) => x.startsWith('<div class="stat clickable warn"') || x.startsWith('<div class="stat clickable crit"'))) return "";
    return super._statusRow(sm);
  }

  /** Install the pending HACS updates, else check for updates through HACS Refresh. Admins only. */
  _button() {
    if (this._config.show_hacs === false || (this._hass.user && !this._hass.user.is_admin)) return "";
    const ext = discoverHacs(this._hass);
    if (!ext.length) return "";
    const n = ext.filter((x) => x.update).length;
    const btn = (action, cls, icon, spin, label, title, busy) =>
      `<span class="btn ${cls}" role="button" tabindex="0" data-action="${action}" title="${esc(title)}" aria-label="${esc(title)}" aria-disabled="${busy}">
          ${svgIcon(icon, spin ? "spin" : "")}<span>${esc(label)}</span>
        </span>`;
    const run = this._installing;
    if (run) {
      const title = this._t("installing").replace("{i}", run.done).replace("{n}", run.total);
      return btn("hacs-install-all", "warn", ICONS.refresh, true, `${run.done}/${run.total}`, title, true);
    }
    if (n) return btn("hacs-install-all", "warn", ICONS.download, false, this._t("btn_install").replace("{n}", n), this._t("install_all").replace("{n}", n), false);
    const rf = discoverRefresh(this._hass);
    if (!rf.button) return "";
    const st = this._s(rf.status);
    const running = st?.state === "running";
    const busy = running || this._s(rf.button)?.state === "unavailable";
    const last = this._s(rf.lastCheck)?.state;
    const title = running
      ? this._t("checking").replace("{i}", st.attributes.done ?? 0).replace("{n}", st.attributes.total || "…")
      : last && !["unknown", "unavailable"].includes(last)
        ? `${this._t("check_updates")} · ${this._t("last_check").replace("{t}", relTime(last, lang(this._hass, this._config)))}`
        : this._t("check_updates");
    const label = running ? `${st.attributes.done ?? 0}/${st.attributes.total || "…"}` : this._t("btn_check");
    return btn("hacs-check", "", ICONS.refresh, running, label, title, busy);
  }

  _render() {
    const sm = discover(this._hass);
    if (!sm.found) return this._noSm();
    const rf = discoverRefresh(this._hass);
    const st = this._s(rf.status);
    const error = this._installError
      ? this._t("install_failed").replace("{e}", this._installError)
      : this._checkError || st?.state === "error"
        ? this._t("check_failed").replace("{e}", this._checkError || st.attributes.error)
        : "";
    return `<style>${BASE_STYLE}${TILES_STYLE}${STATUS_STYLE}</style>
      <ha-card>
        ${this._header(sm, this._button())}
        ${this._statusRow(sm)}
        ${error ? `<div class="err">${esc(error)}</div>` : ""}
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

  /** Whether the card shows network figures, hence the interface choice. */
  static get withInterface() {
    return true;
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
      ...(this.constructor.withInterface
        ? [
            {
              name: "interface",
              selector: { select: { mode: "dropdown", custom_value: true, options: [{ value: "", label: tr("lang_auto") }, ...ifOptions] } },
            },
          ]
        : []),
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
    return ["show_system", "show_network", "show_storage", "show_processes", "show_hacs", "show_watchdog"];
  }
}

class SystemMonitorMiniCardEditor extends SystemMonitorEditorBase {
  static get toggles() {
    return ["show_storage", "show_network"];
  }
}

class SystemMonitorStatusCardEditor extends SystemMonitorEditorBase {
  static get toggles() {
    return ["show_hacs", "show_processes", "show_watchdog"];
  }

  static get withInterface() {
    return false;
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
define("system-monitor-status-card", SystemMonitorStatusCard);
define("system-monitor-status-card-editor", SystemMonitorStatusCardEditor);

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
  {
    type: "system-monitor-status-card",
    name: "System Monitor Status Card",
    description: "Minimal Home Assistant status: versions, HACS, processes and integrations statuses, and a button to check for or install HACS updates.",
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
