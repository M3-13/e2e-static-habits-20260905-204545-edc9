import { save } from './store.js';

const DAY_COUNT = 30;

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLabel(date, checked) {
  const text = date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `${text}${checked ? ', erledigt' : ', nicht erledigt'}`;
}

export function renderGrid(container, habit) {
  if (!container) return;

  container.textContent = '';

  const grid = document.createElement('div');
  grid.className = 'day-grid';
  grid.setAttribute('role', 'group');
  grid.setAttribute('aria-label', 'Letzte 30 Tage');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = DAY_COUNT - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = toDateKey(date);
    const checked = habit.checks[key] === true;

    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'day-cell';
    cell.dataset.date = key;
    cell.setAttribute('aria-label', formatLabel(date, checked));
    cell.setAttribute('aria-pressed', String(checked));
    cell.textContent = String(date.getDate());

    if (checked) cell.classList.add('day-cell--checked');
    if (i === 0) cell.classList.add('day-cell--today');

    cell.addEventListener('click', () => {
      if (habit.checks[key] === true) {
        delete habit.checks[key];
      } else {
        habit.checks[key] = true;
      }
      const next = habit.checks[key] === true;
      cell.classList.toggle('day-cell--checked', next);
      cell.setAttribute('aria-pressed', String(next));
      cell.setAttribute('aria-label', formatLabel(date, next));
      save();
    });

    grid.appendChild(cell);
  }

  container.appendChild(grid);
}
