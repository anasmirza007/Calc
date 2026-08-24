import {
  STORAGE_KEYS,
  DEFAULT_CONFIG,
  DEFAULT_SUPPLIERS,
  DEFAULT_PRODUCTS,
} from "@/lib/defaults";

// Thin, safe wrappers around localStorage with JSON (de)serialization.

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`storage: failed to read ${key}`, e);
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`storage: failed to write ${key}`, e);
    return false;
  }
}

// Deep-merge plain objects (arrays are replaced wholesale). Keeps default
// nested keys (e.g. a route's shipping rates) when an import omits them.
function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}
export function deepMerge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) return override === undefined ? base : override;
  const out = { ...base };
  for (const k of Object.keys(override)) {
    out[k] = isPlainObject(base[k]) && isPlainObject(override[k]) ? deepMerge(base[k], override[k]) : override[k];
  }
  return out;
}

// Merge over defaults so newly added keys are always present.
export function normaliseConfig(raw) {
  if (!raw || typeof raw !== "object") return structuredClone(DEFAULT_CONFIG);
  return deepMerge(structuredClone(DEFAULT_CONFIG), raw);
}

export function loadConfig() {
  const stored = read(STORAGE_KEYS.config, null);
  if (!stored || stored.version !== DEFAULT_CONFIG.version) {
    return structuredClone(DEFAULT_CONFIG);
  }
  return normaliseConfig(stored);
}

export function saveConfig(config) {
  return write(STORAGE_KEYS.config, config);
}

export function resetConfig() {
  const fresh = structuredClone(DEFAULT_CONFIG);
  write(STORAGE_KEYS.config, fresh);
  return fresh;
}

export function loadHistory() {
  const list = read(STORAGE_KEYS.history, []);
  return Array.isArray(list) ? list : [];
}
export function saveHistory(history) {
  return write(STORAGE_KEYS.history, history);
}

export function loadSuppliers() {
  const list = read(STORAGE_KEYS.suppliers, null);
  return Array.isArray(list) ? list : structuredClone(DEFAULT_SUPPLIERS);
}
export function saveSuppliers(list) {
  return write(STORAGE_KEYS.suppliers, list);
}

export function loadProducts() {
  const list = read(STORAGE_KEYS.products, null);
  return Array.isArray(list) ? list : structuredClone(DEFAULT_PRODUCTS);
}
export function saveProducts(list) {
  return write(STORAGE_KEYS.products, list);
}
