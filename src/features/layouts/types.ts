import { ComponentType } from 'react';

export interface ChartItem {
  component: ComponentType<any>;
  props?: any;
}

export interface LayoutProps {
  charts: ChartItem[];
}
