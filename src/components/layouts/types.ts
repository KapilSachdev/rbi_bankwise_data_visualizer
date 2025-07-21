
import { ComponentType } from 'react';

export interface ChartItem<P extends { title?: string } = { title?: string }> {
  component: ComponentType<P>;
  props?: P;
}

export interface LayoutProps<P extends { title?: string } = { title?: string }> {
  charts: ChartItem<P>[];
}
