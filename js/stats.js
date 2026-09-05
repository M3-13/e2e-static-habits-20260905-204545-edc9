function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseKey(key) {
  const parts = key.split('-').map((n) => Number(n));
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function dayOrdinal(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
}

function asDate(value) {
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  if (typeof value === 'string') return parseKey(value);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getChecks(habit) {
  return habit && habit.checks && typeof habit.checks === 'object' ? habit.checks : {};
}

export function currentStreak(habit, today) {
  const checks = getChecks(habit);
  let day = asDate(today);
  if (!checks[toDateKey(day)]) {
    day.setDate(day.getDate() - 1);
  }
  let streak = 0;
  while (checks[toDateKey(day)]) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

export function longestStreak(habit) {
  const checks = getChecks(habit);
  const ordinals = Object.keys(checks)
    .filter((key) => checks[key] === true)
    .map((key) => dayOrdinal(parseKey(key)))
    .sort((a, b) => a - b);
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const ordinal of ordinals) {
    if (prev !== null && ordinal - prev === 1) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prev = ordinal;
  }
  return longest;
}

export function weekCompletion(habit, today) {
  const checks = getChecks(habit);
  const t = asDate(today);
  const dayOfWeek = (t.getDay() + 6) % 7;
  const elapsed = dayOfWeek + 1;
  let done = 0;
  for (let i = 0; i < elapsed; i += 1) {
    const d = new Date(t);
    d.setDate(d.getDate() - i);
    if (checks[toDateKey(d)]) done += 1;
  }
  return Math.round((done / elapsed) * 100);
}
