import { test } from 'node:test';
import assert from 'node:assert';
import { validateImport } from '../js/io.js';

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
});

test('Prototype-Pollution-Schlüssel werden rekursiv abgelehnt', () => {
  const protoKey = JSON.parse('{"habits":{},"settings":{"theme":"light"},"__proto__":{"polluted":true}}');
  assert.notStrictEqual(validateImport(protoKey), null);

  const ctorKey = JSON.parse('{"habits":{},"settings":{"theme":"light"},"constructor":{"polluted":true}}');
  assert.notStrictEqual(validateImport(ctorKey), null);

  const protoInHabit = JSON.parse('{"habits":{"abc":{"id":"a","name":"x","archived":false,"checks":{},"__proto__":{"polluted":true}}},"settings":{"theme":"light"}}');
  assert.notStrictEqual(validateImport(protoInHabit), null);

  const protoInChecks = JSON.parse('{"habits":{"abc":{"id":"a","name":"x","archived":false,"checks":{"__proto__":{"polluted":true}}}},"settings":{"theme":"light"}}');
  assert.notStrictEqual(validateImport(protoInChecks), null);

  const protoInHabitsMap = JSON.parse('{"habits":{"__proto__":{"polluted":true}},"settings":{"theme":"light"}}');
  assert.notStrictEqual(validateImport(protoInHabitsMap), null);
});

test('ValidateImport lässt keine Pollution auf Object.prototype zu', () => {
  const before = {}.polluted;
  const protoInChecks = JSON.parse('{"habits":{"abc":{"id":"a","name":"x","archived":false,"checks":{"__proto__":{"polluted":true}}}},"settings":{"theme":"light"}}');
  validateImport(protoInChecks);
  assert.strictEqual({}.polluted, before);
});
