import { test } from 'node:test';
import assert from 'node:assert';
import {
  drawChart,
  computeWeekFractions,
  buildWeekRanges,
  mondayOf,
  toDateKey,
} from '../js/chart.js';
import { weekCompletion } from '../js/stats.js';

test('mondayOf liefert den Montag der Woche', () => {
  // Saturday 2026-09-05 -> Monday 2026-08-31
  const monday = mondayOf(new Date(2026, 8, 5));
  assert.strictEqual(toDateKey(monday), '2026-08-31');

  // Sunday 2026-09-06 -> Monday 2026-08-31
  const sunday = mondayOf(new Date(2026, 8, 6));
  assert.strictEqual(toDateKey(sunday), '2026-08-31');
});

test('buildWeekRanges liefert acht aufeinanderfolgende Montag–Sonntag-Wochen, älteste zuerst', () => {
  const ranges = buildWeekRanges(8, new Date(2026, 8, 5));
  assert.strictEqual(ranges.length, 8);
  assert.strictEqual(toDateKey(ranges[0].start), '2026-07-13');
  assert.strictEqual(toDateKey(ranges[0].end), '2026-07-19');
  assert.strictEqual(toDateKey(ranges[7].start), '2026-08-31');
  assert.strictEqual(toDateKey(ranges[7].end), '2026-09-06');
});

test('computeWeekFractions berechnet vergangene Wochen aus den Checks', () => {
  const now = new Date(2026, 8, 5); // Sat 2026-09-05, current week Mon 08-31
  const habit = {
    checks: {
      '2026-08-24': true,
      '2026-08-25': true,
      '2026-08-26': true,
      // 08-27..08-30 absent (false)
    },
  };
  const fractions = computeWeekFractions(habit, now);
  assert.strictEqual(fractions.length, 8);
  // index 6 = week of 08-24..08-30: 3 of 7 days checked
  assert.ok(Math.abs(fractions[6] - 3 / 7) < 1e-9);
});

test('computeWeekFractions delegiert die aktuelle Woche an weekCompletion', () => {
  const habit = { checks: {} };
  const fractions = computeWeekFractions(habit, new Date(2026, 8, 5));
  assert.strictEqual(fractions[7], weekCompletion(habit) / 100);
});

function makeCanvas() {
  const state = {
    fillStyle: '',
    strokeStyle: '',
    font: '',
  };
  const calls = { fills: [], fillTexts: [], strokes: [] };
  const ctx = {
    get fillStyle() {
      return state.fillStyle;
    },
    set fillStyle(v) {
      state.fillStyle = v;
    },
    get strokeStyle() {
      return state.strokeStyle;
    },
    set strokeStyle(v) {
      state.strokeStyle = v;
    },
    get font() {
      return state.font;
    },
    set font(v) {
      state.font = v;
    },
    set textAlign(v) {},
    set textBaseline(v) {},
    setTransform() {},
    clearRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    arcTo() {},
    closePath() {},
    fill() {
      calls.fills.push(state.fillStyle);
    },
    stroke() {
      calls.strokes.push(state.strokeStyle);
    },
    setLineDash() {},
    fillText(text, x, y) {
      calls.fillTexts.push({ text, x, y });
    },
    measureText(t) {
      return { width: String(t).length * 7 };
    },
  };
  const canvas = {
    width: 0,
    height: 0,
    clientWidth: 400,
    style: {},
    getContext() {
      return ctx;
    },
  };
  return { canvas, calls };
}

test('drawChart zeichnet acht Balken und acht Wochenlabels', () => {
  const previous = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => ({
    getPropertyValue: () => '',
  });
  try {
    const { canvas, calls } = makeCanvas();
    drawChart(canvas, { checks: {} });

    assert.strictEqual(canvas.width, 400);
    assert.strictEqual(canvas.height, 120);
    assert.strictEqual(canvas.style.width, '100%');
    assert.strictEqual(canvas.style.height, '120px');

    // Eight bars filled with the accent fallback color.
    assert.strictEqual(calls.fills.length, 8);
    assert.ok(calls.fills.every((c) => c === '#10B981'));

    // Eight week labels rendered.
    assert.strictEqual(calls.fillTexts.length, 8);
  } finally {
    if (previous === undefined) {
      delete globalThis.getComputedStyle;
    } else {
      globalThis.getComputedStyle = previous;
    }
  }
});
