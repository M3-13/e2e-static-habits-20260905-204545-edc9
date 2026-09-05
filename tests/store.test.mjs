import { test } from 'node:test';
import assert from 'node:assert';
import { loadState, emptyState, saveState, createId } from '../js/store.js';

test('kaputtes JSON ergibt den Standardzustand', () => {
  const state = loadState('{ kaputt ');
  assert.deepStrictEqual(state, emptyState());
});

test('fehlender oder nicht-string Eingabe ergibt den Standardzustand', () => {
  assert.deepStrictEqual(loadState(null), emptyState());
  assert.deepStrictEqual(loadState(undefined), emptyState());
  assert.deepStrictEqual(loadState('null'), emptyState());
  assert.deepStrictEqual(loadState('[1,2,3]'), emptyState());
});

test('unvollständige Struktur ergibt den Standardzustand', () => {
  const raw = JSON.stringify({ settings: { theme: 'light' } });
  assert.deepStrictEqual(loadState(raw), emptyState());
});

test('gültige Daten werden übernommen', () => {
  const raw = JSON.stringify({
    habits: {
      abc: { id: 'abc', name: 'Lesen', archived: false, checks: { '2026-01-01': true } },
    },
    settings: { theme: 'dark' },
  });
  const state = loadState(raw);
  assert.deepStrictEqual(state, {
    habits: {
      abc: { id: 'abc', name: 'Lesen', archived: false, checks: { '2026-01-01': true } },
    },
    settings: { theme: 'dark' },
  });
});

test('saveState erzeugt gültiges JSON', () => {
  const state = emptyState();
  state.habits.x = { id: 'x', name: 'Sport', archived: false, checks: {} };
  const raw = saveState(state);
  assert.deepStrictEqual(JSON.parse(raw), state);
});

test('createId liefert einen nicht-leeren String', () => {
  const id = createId();
  assert.strictEqual(typeof id, 'string');
  assert.ok(id.length > 0);
});
