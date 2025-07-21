
import { createElement, FC } from "react";
import type { ChartItem, LayoutProps } from "./types";

const GridLayout: FC<LayoutProps> = ({ charts }) => (
  <article className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
    {charts.map((chart, index) => {
      const chartTitle = (chart.props && typeof chart.props.title === 'string')
        ? chart.props.title
        : chart.component.name?.replace('Chart', '') || `Chart ${index + 1}`;
      return (
        <div
          key={index}
          className="card p-4 shadow-md border border-base-100 transition-transform hover:scale-[1.025] focus-within:scale-[1.025] outline-none focus:ring-2 focus:ring-primary"
          tabIndex={0}
          aria-label={chartTitle}
        >
          <div className="card-body pt-0">
            {createElement(chart.component, chart.props ?? {})}
          </div>
        </div>
      );
    })}
  </article>
);

export default GridLayout;
