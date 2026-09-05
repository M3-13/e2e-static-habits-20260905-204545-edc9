const STORAGE_KEY = 'habit-tracker.state.v1';

const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

export function emptyState() {
  return {
    habits: {},
    settings: { theme: 'light' },
  };
}

export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function isValidHabit(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  if (typeof value.id !== 'string') return false;
  if (typeof value.name !== 'string') return false;
  if (typeof value.archived !== 'boolean') return false;
  if (value.checks === null || typeof value.checks !== 'object' || Array.isArray(value.checks)) {
    return false;
  }
  for (const key of Object.keys(value.checks)) {
    if (DANGEROUS_KEYS.includes(key)) return false;
    if (typeof value.checks[key] !== 'boolean') return false;
  }
  return true;
}

function isValidState(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  if (value.habits === null || typeof value.habits !== 'object' || Array.isArray(value.habits)) {
    return false;
  }
  for (const key of Object.keys(value.habits)) {
    if (DANGEROUS_KEYS.includes(key)) return false;
    if (!isValidHabit(value.habits[key])) return false;
  }
  if (value.settings === null || typeof value.settings !== 'object' || Array.isArray(value.settings)) {
    return false;
  }
  if (value.settings.theme !== 'light' && value.settings.theme !== 'dark') return false;
  return true;
}

export function loadState(raw) {
  if (typeof raw !== 'string') return emptyState();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return emptyState();
  }
  if (!isValidState(parsed)) return emptyState();
  return parsed;
}

export function saveState(state) {
  return JSON.stringify(state);
}

let state = emptyState();

export function init() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    raw = null;
  }
  state = loadState(raw);
}

export function getState() {
  return state;
}

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, saveState(state));
  } catch (err) {
    // Storage unavailable (private mode / quota). The in-memory state stays valid.
  }
}
