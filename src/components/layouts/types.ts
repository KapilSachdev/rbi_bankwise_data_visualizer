
import { ComponentType } from 'react';

export interface ChartItem<P = Record<string, unknown>> {
  component: ComponentType<P>;
  props?: P;
}

export interface LayoutProps<P = Record<string, unknown>> {
  charts: ChartItem<P>[];
}
