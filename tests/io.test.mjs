import { test } from 'node:test';
import assert from 'node:assert';
import { validateImport, sanitizeImport } from '../js/io.js';

function validState() {
  return {
    habits: {
      abc: {
        id: 'abc',
        name: 'Lesen',
        archived: false,
        checks: { '2026-01-01': true, '2026-01-02': false },
      },
    },
    settings: { theme: 'dark' },
  };
}

test('gültige Daten werden akzeptiert', () => {
  assert.strictEqual(validateImport(validState()), null);
});

test('leerer Zustand ohne Gewohnheiten ist gültig', () => {
  assert.strictEqual(validateImport({ habits: {}, settings: { theme: 'light' } }), null);
});

test('fehlende Felder werden abgelehnt', () => {
  assert.notStrictEqual(validateImport(null), null);
  assert.notStrictEqual(validateImport(undefined), null);
  assert.notStrictEqual(validateImport('text'), null);
  assert.notStrictEqual(validateImport([1, 2, 3]), null);
  assert.notStrictEqual(validateImport({ settings: { theme: 'light' } }), null);
  assert.notStrictEqual(validateImport({ habits: {} }), null);
});

test('ungültige Typen werden abgelehnt', () => {
  const bad = validState();
  bad.habits.abc.name = 42;
  assert.notStrictEqual(validateImport(bad), null);

  const bad2 = validState();
  bad2.habits.abc.archived = 'ja';
  assert.notStrictEqual(validateImport(bad2), null);

  const bad3 = validState();
  bad3.habits.abc.checks = ['2026-01-01'];
  assert.notStrictEqual(validateImport(bad3), null);

  const bad4 = validState();
  bad4.habits.abc.checks['2026-01-01'] = 'true';
  assert.notStrictEqual(validateImport(bad4), null);

  const bad5 = validState();
  bad5.habits = [];
  assert.notStrictEqual(validateImport(bad5), null);

  const bad6 = validState();
  bad6.settings.theme = 'blau';
  assert.notStrictEqual(validateImport(bad6), null);
});

test('ungültige Datums-Keys werden abgelehnt', () => {
  const bad = validState();
  bad.habits.abc.checks = { heute: true };
  assert.notStrictEqual(validateImport(bad), null);

  const bad2 = validState();
  bad2.habits.abc.checks = { '2026-13-01': true };
  assert.notStrictEqual(validateImport(bad2), null);

  const bad3 = validState();
  bad3.habits.abc.checks = { '2026-02-31': true };
  assert.notStrictEqual(validateImport(bad3), null);

  const bad4 = validState();
  bad4.habits.abc.checks = { '2026-02-29': true };
  assert.notStrictEqual(validateImport(bad4), null);

  const bad5 = validState();
  bad5.habits.abc.checks = { '2024-04-31': true };
  assert.notStrictEqual(validateImport(bad5), null);
});

test('gültige Kalendertage inklusive Schaltjahr werden akzeptiert', () => {
  const leap = validState();
  leap.habits.abc.checks = { '2024-02-29': true };
  assert.strictEqual(validateImport(leap), null);

  const monthEnd = validState();
  monthEnd.habits.abc.checks = { '2026-01-31': true, '2026-04-30': true, '2026-12-31': true };
  assert.strictEqual(validateImport(monthEnd), null);
});

test('gefährliche Schlüssel werden beim Import entfernt statt abgelehnt', () => {
  const input = JSON.parse(
    '{"habits":{"abc":{"id":"a","name":"x","archived":false,"checks":{"2026-01-01":true,"__proto__":{"polluted":true}}},"__proto__":{"polluted":true}},"settings":{"theme":"light","constructor":{"polluted":true}},"prototype":{"polluted":true}}'
  );
  const cleaned = sanitizeImport(input);
  assert.strictEqual(validateImport(cleaned), null);
  assert.deepStrictEqual(Object.keys(cleaned).sort(), ['habits', 'settings']);
  assert.deepStrictEqual(Object.keys(cleaned.habits).sort(), ['abc']);
  assert.deepStrictEqual(Object.keys(cleaned.habits.abc).sort(), ['archived', 'checks', 'id', 'name']);
  assert.deepStrictEqual(Object.keys(cleaned.habits.abc.checks).sort(), ['2026-01-01']);
  assert.deepStrictEqual(Object.keys(cleaned.settings).sort(), ['theme']);
});

test('sanitizeImport lässt gültige Daten unverändert', () => {
  const state = validState();
  assert.deepStrictEqual(sanitizeImport(state), state);
  assert.strictEqual(validateImport(sanitizeImport(state)), null);
});

test('Entfernen gefährlicher Schlüssel polluiert Object.prototype nicht', () => {
  const input = JSON.parse('{"habits":{},"settings":{"theme":"light"},"__proto__":{"polluted":true}}');
  sanitizeImport(input);
  assert.strictEqual({}.polluted, undefined);
  assert.strictEqual(Object.prototype.polluted, undefined);
});
