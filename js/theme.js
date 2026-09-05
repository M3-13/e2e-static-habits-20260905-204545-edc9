import { save } from './store.js';

const THEMES = ['light', 'dark'];

export function initTheme(state) {
  applyTheme(state.settings.theme);

  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = state.settings.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    state.settings.theme = next;
    applyTheme(next);
    save();
  });
}

function applyTheme(theme) {
  if (!THEMES.includes(theme)) return;
  document.documentElement.setAttribute('data-theme', theme);
}
