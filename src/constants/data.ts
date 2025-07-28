// Centralized data folder path for all data visualizations
// Usage: import { DATA_FOLDER } from '../constants/data';

export const DATA_FOLDER: { [key: string]: string } = {
  pos: '/rbi_bankwise_data_visualizer/assets/data/pos',
  neft: '/rbi_bankwise_data_visualizer/assets/data/neft',
}

export const BANK_TYPES = [
  'Public Sector Banks',
  'Private Sector Banks',
  'Foreign Banks',
  'Small Finance Banks',
  'Payment Banks',
  'Cooperative Banks',
  'Local Area Banks',
  'Regional Rural Banks',
  'Development Banks'
];
