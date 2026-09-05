import { test } from 'node:test';
import assert from 'node:assert';
import { currentStreak, longestStreak, weekCompletion } from '../js/stats.js';

function habitWith(checks) {
  return { id: 'h1', name: 'Lesen', archived: false, checks };
}

test('currentStreak zählt rückwärts ab heute', () => {
  const habit = habitWith({
    '2026-09-03': true,
    '2026-09-04': true,
    '2026-09-05': true,
  });
  assert.strictEqual(currentStreak(habit, '2026-09-05'), 3);
});

test('currentStreak startet gestern, wenn heute nicht erledigt ist', () => {
  const habit = habitWith({
    '2026-09-02': true,
    '2026-09-03': true,
    '2026-09-04': true,
  });
  assert.strictEqual(currentStreak(habit, '2026-09-05'), 3);
});

test('currentStreak ist 0, wenn weder heute noch gestern erledigt sind', () => {
  const habit = habitWith({
    '2026-09-02': true,
    '2026-09-03': true,
  });
  assert.strictEqual(currentStreak(habit, '2026-09-05'), 0);
});

test('currentStreak ist 0 bei leerem oder fehlendem checks', () => {
  assert.strictEqual(currentStreak(habitWith({}), '2026-09-05'), 0);
  assert.strictEqual(currentStreak({ id: 'h1', name: 'X', archived: false }, '2026-09-05'), 0);
});

test('longestStreak findet die längste Serie über alle Daten', () => {
  const habit = habitWith({
    '2026-08-01': true,
    '2026-08-02': true,
    '2026-08-03': true,
    '2026-08-10': true,
    '2026-08-11': true,
  });
  assert.strictEqual(longestStreak(habit), 3);
});

test('longestStreak ignoriert false-Einträge', () => {
  const habit = habitWith({
    '2026-08-01': true,
    '2026-08-02': false,
    '2026-08-03': true,
  });
  assert.strictEqual(longestStreak(habit), 1);
});

test('longestStreak ist 0 ohne erledigte Tage', () => {
  assert.strictEqual(longestStreak(habitWith({})), 0);
});

test('weekCompletion rechnet nur bisher vergangene Wochentage', () => {
  const habit = habitWith({
    '2026-08-31': true, // Montag
    '2026-09-01': true, // Dienstag
    '2026-09-02': false, // Mittwoch
  });
  assert.strictEqual(weekCompletion(habit, '2026-09-02'), 67);
});

test('weekCompletion am Montag mit erledigtem Montag ergibt 100', () => {
  const habit = habitWith({ '2026-08-31': true });
  assert.strictEqual(weekCompletion(habit, '2026-08-31'), 100);
});

test('weekCompletion am Montag ohne Häkchen ergibt 0', () => {
  const habit = habitWith({});
  assert.strictEqual(weekCompletion(habit, '2026-08-31'), 0);
});

test('weekCompletion rundet kaufmännisch', () => {
  const habit = habitWith({
    '2026-08-31': true,
    '2026-09-01': true,
    '2026-09-02': false,
  });
  assert.strictEqual(weekCompletion(habit, '2026-09-02'), 67);
});
