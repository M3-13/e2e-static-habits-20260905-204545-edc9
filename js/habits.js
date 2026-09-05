import { createId, save } from './store.js';
import { renderGrid } from './grid.js';
import { drawChart } from './chart.js';
import { currentStreak, longestStreak, weekCompletion } from './stats.js';

let activeFilter = 'active';

function updateFilterPills() {
  const activeBtn = document.getElementById('filter-active');
  const archivedBtn = document.getElementById('filter-archived');
  if (activeBtn) {
    activeBtn.classList.toggle('filter-pill--active', activeFilter === 'active');
  }
  if (archivedBtn) {
    archivedBtn.classList.toggle('filter-pill--active', activeFilter === 'archived');
  }
}

function filteredHabits(state) {
  return Object.values(state.habits).filter((habit) =>
    activeFilter === 'archived' ? habit.archived : !habit.archived
  );
}

function createStatChip(label, valueRole, valueText) {
  const chip = document.createElement('span');
  chip.className = 'stat-chip';
  chip.setAttribute('role', 'listitem');
  chip.appendChild(document.createTextNode(`${label} `));
  const value = document.createElement('span');
  value.setAttribute('data-role', valueRole);
  value.textContent = valueText;
  chip.appendChild(value);
  return chip;
}

function createWeekQuoteChip(habit) {
  const chip = document.createElement('span');
  chip.className = 'stat-chip';
  chip.setAttribute('role', 'listitem');
  chip.appendChild(document.createTextNode('Wochenquote '));
  const value = document.createElement('span');
  value.setAttribute('data-role', 'week-quote');
  value.textContent = String(weekCompletion(habit));
  chip.appendChild(value);
  chip.appendChild(document.createTextNode(' %'));
  return chip;
}

function renameHabit(state, habit) {
  const newName = window.prompt('Neuer Name für die Gewohnheit', habit.name);
  if (newName === null) return;
  const trimmed = newName.trim();
  if (!trimmed) return;
  habit.name = trimmed;
  save();
  renderHabits(state);
}

function toggleArchive(state, habit) {
  habit.archived = !habit.archived;
  save();
  renderHabits(state);
}

function deleteHabit(state, habit) {
  const confirmed = window.confirm(`Gewohnheit "${habit.name}" wirklich löschen?`);
  if (!confirmed) return;
  delete state.habits[habit.id];
  save();
  renderHabits(state);
}

function renderHabitCard(state, habit) {
  const card = document.createElement('article');
  card.className = 'habit-card';
  card.dataset.id = habit.id;
  if (habit.archived) card.classList.add('habit-card--archived');

  const header = document.createElement('div');
  header.className = 'habit-card__header';

  const name = document.createElement('h2');
  name.className = 'habit-card__name';
  name.textContent = habit.name;

  const actions = document.createElement('div');
  actions.className = 'habit-card__actions';

  const renameBtn = document.createElement('button');
  renameBtn.type = 'button';
  renameBtn.className = 'habit-card__action';
  renameBtn.dataset.action = 'rename';
  renameBtn.textContent = 'Umbenennen';
  renameBtn.addEventListener('click', () => renameHabit(state, habit));

  const archiveBtn = document.createElement('button');
  archiveBtn.type = 'button';
  archiveBtn.className = 'habit-card__action';
  archiveBtn.dataset.action = habit.archived ? 'restore' : 'archive';
  archiveBtn.textContent = habit.archived ? 'Wiederherstellen' : 'Archivieren';
  archiveBtn.addEventListener('click', () => toggleArchive(state, habit));

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'habit-card__action habit-card__action--danger';
  deleteBtn.dataset.action = 'delete';
  deleteBtn.textContent = 'Löschen';
  deleteBtn.addEventListener('click', () => deleteHabit(state, habit));

  actions.append(renameBtn, archiveBtn, deleteBtn);
  header.append(name, actions);

  const stats = document.createElement('div');
  stats.className = 'habit-card__stats';
  stats.setAttribute('role', 'list');
  stats.appendChild(createStatChip('Aktuelle Serie', 'streak-current', String(currentStreak(habit))));
  stats.appendChild(createStatChip('Längste Serie', 'streak-longest', String(longestStreak(habit))));
  stats.appendChild(createWeekQuoteChip(habit));

  const grid = document.createElement('div');
  grid.className = 'habit-card__grid';
  grid.dataset.role = 'grid';

  const chart = document.createElement('canvas');
  chart.className = 'habit-card__chart';
  chart.dataset.role = 'chart';

  card.append(header, stats, grid, chart);

  renderGrid(grid, habit);
  drawChart(chart, habit);

  return card;
}

function renderEmptyState(state) {
  const hasAnyHabits = Object.keys(state.habits).length > 0;

  const empty = document.createElement('div');
  empty.className = 'habit-empty';

  const icon = document.createElement('div');
  icon.className = 'habit-empty__icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '\u2713';

  const title = document.createElement('h2');
  title.className = 'habit-empty__title';

  const text = document.createElement('p');
  text.className = 'habit-empty__text';

  if (activeFilter === 'archived') {
    title.textContent = 'Keine archivierten Gewohnheiten';
    text.textContent = 'Archivierte Gewohnheiten erscheinen hier.';
  } else if (hasAnyHabits) {
    title.textContent = 'Keine aktiven Gewohnheiten';
    text.textContent = 'Alle Gewohnheiten sind archiviert.';
  } else {
    title.textContent = 'Noch keine Gewohnheiten';
    text.textContent = 'Lege deine erste Gewohnheit an, um zu beginnen.';
  }

  empty.append(icon, title, text);

  if (!hasAnyHabits && activeFilter === 'active') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button button--primary';
    button.textContent = 'Erste Gewohnheit anlegen';
    button.addEventListener('click', () => {
      const input = document.getElementById('habit-name');
      if (input) input.focus();
    });
    empty.appendChild(button);
  }

  return empty;
}

export function renderHabits(state) {
  const list = document.getElementById('habit-list');
  if (!list) return;
  list.replaceChildren();

  const habits = filteredHabits(state);
  if (habits.length === 0) {
    list.appendChild(renderEmptyState(state));
    return;
  }

  for (const habit of habits) {
    list.appendChild(renderHabitCard(state, habit));
  }
}

function ensureStylesheet() {
  if (!document.querySelector('link[href="css/habits.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/habits.css';
    document.head.appendChild(link);
  }
}

export function initHabits(state) {
  ensureStylesheet();

  const form = document.getElementById('habit-form');
  const input = document.getElementById('habit-name');
  const filterActiveBtn = document.getElementById('filter-active');
  const filterArchivedBtn = document.getElementById('filter-archived');

  if (form && input) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = input.value.trim();
      if (!name) return;
      const habit = {
        id: createId(),
        name,
        archived: false,
        checks: {},
      };
      state.habits[habit.id] = habit;
      save();
      input.value = '';
      renderHabits(state);
    });
  }

  if (filterActiveBtn) {
    filterActiveBtn.addEventListener('click', () => {
      activeFilter = 'active';
      updateFilterPills();
      renderHabits(state);
    });
  }

  if (filterArchivedBtn) {
    filterArchivedBtn.addEventListener('click', () => {
      activeFilter = 'archived';
      updateFilterPills();
      renderHabits(state);
    });
  }

  updateFilterPills();
  renderHabits(state);
}
