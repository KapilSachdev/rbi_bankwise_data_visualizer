
import { ComponentType } from 'react';

export interface ChartItem<P = Record<string, unknown>> {
  component: ComponentType<P>;
  props?: P;
}

export interface LayoutProps<P = Record<string, unknown>> {
  charts: ChartItem<P>[];
}

export interface DashboardChartItem {
  id: string;
  title: string;
  // What to render inside the main grid card
  renderPreview: () => React.ReactNode;
  // Data for the modal component when expanded
  modalComponent: React.ComponentType<any>;
  getModalProps: () => Record<string, any>;
  canMaximize?: boolean;
}
