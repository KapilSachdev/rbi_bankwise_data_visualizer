
import { chalk } from './chalk';
import { darker } from './darker';
import { essos } from './essos';
import { infographic } from './infographic';
import { inspired } from './inspired';
import { purplePassion } from './purple_passion';
import { v5 } from './v5';
import { azul } from './azul';


export const ECHARTS_THEMES = [
  { mode: 'dark', name: 'dark' },
  { mode: 'dark', name: 'darker', themeOptions: darker },
  { mode: 'dark', name: 'chalk', themeOptions: chalk },
  { mode: 'dark', name: 'purplePassion', themeOptions: purplePassion },
  { mode: 'light', name: 'default' },
  { mode: 'light', name: 'essos', themeOptions: essos },
  { mode: 'light', name: 'infographic', themeOptions: infographic },
  { mode: 'light', name: 'inspired', themeOptions: inspired },
  { mode: 'light', name: 'v5', themeOptions: v5 },
  { mode: 'light', name: 'azul', themeOptions: azul },
];
