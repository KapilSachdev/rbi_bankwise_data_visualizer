import { chalk } from './chalk';
import { darker } from './darker';
import { essos } from './essos'
import { infographic } from './infographic'
import { inspired } from './inspired'
import { purplePassion } from './purple_passion'

export const ECHARTS_THEMES = [
  { name: 'dark', mode: 'dark' },
  { name: 'darker', mode: 'dark', themeOptions: darker },
  { name: 'chalk', mode: 'dark', themeOptions: chalk },
  { name: 'purplePassion', mode: 'dark', themeOptions: purplePassion },
  { name: 'default', mode: 'light' },
  { name: 'essos', mode: 'light', themeOptions: essos },
  { name: 'infographic', mode: 'light', themeOptions: infographic },
  { name: 'inspired', mode: 'light', themeOptions: inspired },
];
