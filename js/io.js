import * as store from './store.js';
import { renderHabits } from './habits.js';

const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

const DATE_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year, month) {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

function isValidDateKey(key) {
  const m = DATE_KEY_RE.exec(key);
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > daysInMonth(year, month)) return false;
  return true;
}

function hasDangerousKey(obj) {
  for (const key of Object.keys(obj)) {
    if (DANGEROUS_KEYS.includes(key)) return true;
  }
  return false;
}

export function sanitizeImport(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeImport);
  }
  if (value !== null && typeof value === 'object') {
    const result = {};
    for (const key of Object.keys(value)) {
      if (DANGEROUS_KEYS.includes(key)) continue;
      result[key] = sanitizeImport(value[key]);
    }
    return result;
  }
  return value;
}

function isValidHabit(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  if (hasDangerousKey(value)) return false;
  if (typeof value.id !== 'string') return false;
  if (typeof value.name !== 'string') return false;
  if (typeof value.archived !== 'boolean') return false;
  if (value.checks === null || typeof value.checks !== 'object' || Array.isArray(value.checks)) {
    return false;
  }
  if (hasDangerousKey(value.checks)) return false;
  for (const key of Object.keys(value.checks)) {
    if (!isValidDateKey(key)) return false;
    if (typeof value.checks[key] !== 'boolean') return false;
  }
  return true;
}

export function validateImport(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return 'Die Datei enthält keine gültige Datenstruktur.';
  }
  if (hasDangerousKey(value)) {
    return 'Die Datei enthält unzulässige Schlüssel.';
  }
  if (value.habits === null || typeof value.habits !== 'object' || Array.isArray(value.habits)) {
    return 'Das Feld "habits" fehlt oder ist ungültig.';
  }
  for (const key of Object.keys(value.habits)) {
    if (DANGEROUS_KEYS.includes(key)) {
      return 'Die Datei enthält unzulässige Schlüssel.';
    }
    if (!isValidHabit(value.habits[key])) {
      return 'Ein Eintrag in "habits" ist ungültig.';
    }
  }
  if (value.settings === null || typeof value.settings !== 'object' || Array.isArray(value.settings)) {
    return 'Das Feld "settings" fehlt oder ist ungültig.';
  }
  if (hasDangerousKey(value.settings)) {
    return 'Die Datei enthält unzulässige Schlüssel.';
  }
  if (value.settings.theme !== 'light' && value.settings.theme !== 'dark') {
    return 'Das Feld "settings.theme" ist ungültig.';
  }
  return null;
}

function showMessage(text, isError) {
  let el = document.getElementById('import-message');
  if (!el) {
    el = document.createElement('p');
    el.id = 'import-message';
    el.setAttribute('role', 'alert');
    const panel = document.querySelector('.io-panel');
    if (panel) panel.appendChild(el);
    else document.body.appendChild(el);
  }
  el.textContent = text;
  el.style.padding = '12px 16px';
  el.style.borderRadius = 'var(--radius-md)';
  el.style.fontSize = '14px';
  if (isError) {
    el.style.border = '1px solid var(--color-danger)';
    el.style.backgroundColor = 'var(--color-danger_soft)';
    el.style.color = 'var(--color-danger)';
  } else {
    el.style.border = '1px solid var(--color-border)';
    el.style.backgroundColor = 'var(--color-surface)';
    el.style.color = 'var(--color-fg)';
  }
}

function applyState(target, incoming) {
  for (const key of Object.keys(target)) {
    delete target[key];
  }
  target.habits = incoming.habits;
  target.settings = incoming.settings;
}

function handleImport(raw, state) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    showMessage('Die Datei konnte nicht als JSON gelesen werden.', true);
    return;
  }
  const cleaned = sanitizeImport(parsed);
  const error = validateImport(cleaned);
  if (error !== null) {
    showMessage(error, true);
    return;
  }
  applyState(state, cleaned);
  store.save();
  renderHabits(state);
  showMessage('Daten erfolgreich importiert.', false);
}

export function initIO(state) {
  const exportButton = document.getElementById('export-button');
  const importButton = document.getElementById('import-button');
  const importInput = document.getElementById('import-input');

  exportButton.addEventListener('click', () => {
    const data = store.saveState(store.getState());
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'habit-tracker-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  importButton.addEventListener('click', () => {
    importInput.click();
  });

  importInput.addEventListener('change', () => {
    const file = importInput.files && importInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleImport(String(reader.result), state);
    };
    reader.onerror = () => {
      showMessage('Die Datei konnte nicht gelesen werden.', true);
    };
    reader.readAsText(file);
    importInput.value = '';
  });
}
