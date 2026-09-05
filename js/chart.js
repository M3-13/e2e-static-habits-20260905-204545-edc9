import { weekCompletion } from './stats.js';

const WEEK_COUNT = 8;
const DAYS_PER_WEEK = 7;
const CHART_HEIGHT = 120;
const LABEL_HEIGHT = 16;
const PADDING_TOP = 8;
const BAR_GAP = 4;
const BAR_MIN_WIDTH = 8;
const BAR_RADIUS = 3;

const DEFAULT_ACCENT = '#10B981';
const DEFAULT_MUTED = '#667085';

export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function mondayOf(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = d.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + offset);
  return d;
}

export function buildWeekRanges(count, now) {
  const monday = mondayOf(now);
  const ranges = [];
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(monday);
    start.setDate(start.getDate() - i * DAYS_PER_WEEK);
    const end = new Date(start);
    end.setDate(end.getDate() + (DAYS_PER_WEEK - 1));
    ranges.push({ start, end });
  }
  return ranges;
}

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function fractionForWeek(habit, start) {
  const checks = (habit && habit.checks) || {};
  let checked = 0;
  for (let i = 0; i < DAYS_PER_WEEK; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    if (checks[toDateKey(day)] === true) checked++;
  }
  return checked / DAYS_PER_WEEK;
}

export function computeWeekFractions(habit, now = new Date()) {
  const ranges = buildWeekRanges(WEEK_COUNT, now);
  return ranges.map((range, index) => {
    if (index === WEEK_COUNT - 1) {
      return clamp01(weekCompletion(habit) / 100);
    }
    return fractionForWeek(habit, range.start);
  });
}

function readCssVar(el, name, fallback) {
  if (typeof getComputedStyle === 'function') {
    try {
      const value = getComputedStyle(el).getPropertyValue(name).trim();
      if (value) return value;
    } catch (err) {
      // Element not attached to a document — fall back to the token default.
    }
  }
  return fallback;
}

function withAlpha(hex, alpha) {
  if (typeof hex === 'string' && /^#[0-9a-fA-F]{6}$/.test(hex)) {
    const a = Math.round(clamp01(alpha) * 255)
      .toString(16)
      .padStart(2, '0');
    return hex + a;
  }
  return hex;
}

function formatWeekLabel(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}.${m}.`;
}

function drawGridLine(ctx, x1, y1, x2, y2, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawDashedLine(ctx, x1, y1, x2, y2, color) {
  ctx.strokeStyle = color;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function roundTopRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h);
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}

function resolveCssWidth(canvas) {
  if (canvas.clientWidth && canvas.clientWidth > 0) return canvas.clientWidth;
  if (canvas.parentElement && canvas.parentElement.clientWidth > 0) {
    return canvas.parentElement.clientWidth;
  }
  return 300;
}

export function drawChart(canvas, habit) {
  if (!canvas || typeof canvas.getContext !== 'function') return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.style.width = '100%';
  canvas.style.height = `${CHART_HEIGHT}px`;

  const cssWidth = resolveCssWidth(canvas);
  const cssHeight = CHART_HEIGHT;

  const dpr =
    (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

  canvas.width = Math.max(1, Math.round(cssWidth * dpr));
  canvas.height = Math.max(1, Math.round(cssHeight * dpr));

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const accent = readCssVar(canvas, '--color-accent', DEFAULT_ACCENT);
  const muted = readCssVar(canvas, '--color-muted', DEFAULT_MUTED);
  const fontFamily = readCssVar(canvas, '--font-family', 'sans-serif');

  const now = new Date();
  const fractions = computeWeekFractions(habit, now);
  const ranges = buildWeekRanges(WEEK_COUNT, now);

  const plotTop = PADDING_TOP;
  const plotBottom = cssHeight - LABEL_HEIGHT;
  const plotHeight = plotBottom - plotTop;

  const totalGap = BAR_GAP * (WEEK_COUNT - 1);
  let barWidth = (cssWidth - totalGap) / WEEK_COUNT;
  if (barWidth < BAR_MIN_WIDTH) barWidth = BAR_MIN_WIDTH;

  const yForFraction = (f) => plotBottom - f * plotHeight;

  // Background grid: baseline and mid-point guides at 15% muted.
  drawGridLine(ctx, 0, plotBottom, cssWidth, plotBottom, withAlpha(muted, 0.15));
  drawGridLine(
    ctx,
    0,
    yForFraction(0.5),
    cssWidth,
    yForFraction(0.5),
    withAlpha(muted, 0.15)
  );
  // 100% target line as a subtle dashed guide.
  drawDashedLine(ctx, 0, yForFraction(1), cssWidth, yForFraction(1), withAlpha(muted, 0.5));

  ctx.font = `11px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (let i = 0; i < WEEK_COUNT; i++) {
    const x = i * (barWidth + BAR_GAP);
    const fraction = fractions[i];
    const barHeight = Math.max(0, fraction * plotHeight);
    const y = plotBottom - barHeight;

    ctx.fillStyle = accent;
    roundTopRect(ctx, x, y, barWidth, barHeight, BAR_RADIUS);

    ctx.fillStyle = muted;
    ctx.fillText(formatWeekLabel(ranges[i].start), x + barWidth / 2, plotBottom + 4);
  }
}
