import { STORAGE_KEYS, DEFAULT_CONFIG } from "@/lib/defaults";

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

export function loadConfig() {
  const stored = read(STORAGE_KEYS.config, null);
  if (!stored) return structuredClone(DEFAULT_CONFIG);
  // Shallow-merge so newly added default keys don't break old saved configs.
  return { ...structuredClone(DEFAULT_CONFIG), ...stored };
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
