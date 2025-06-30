import { chalk } from './chalk';
import { purplePassion } from './purple_passion'
import { essos } from './essos'

export const ECHARTS_THEMES = [
  { name: 'dark', mode: 'dark' },
  { name: 'chalk', mode: 'dark', themeOptions: chalk },
  { name: 'purplePassion', mode: 'dark', themeOptions: purplePassion },
  { name: 'default', mode: 'light' },
  { name: 'essos', mode: 'light', themeOptions: essos },
];

