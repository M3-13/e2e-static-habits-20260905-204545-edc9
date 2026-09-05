import * as store from './store.js';
import { initHabits } from './habits.js';
import { initTheme } from './theme.js';
import { initIO } from './io.js';

store.init();
const state = store.getState();
initHabits(state);
initTheme(state);
initIO(state);
