
import { createElement, FC } from "react";
import type { ChartItem, LayoutProps } from "./types";

const CardLayout: FC<LayoutProps> = ({ charts }) => (
  <article className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
    {charts.map((chart, index) => {
      const chartTitle = (chart.props && typeof chart.props.title === 'string')
        ? chart.props.title
        : chart.component.name?.replace('Chart', '') || `Chart ${index + 1}`;
      return (
        <div
          key={index}
          className="card bg-base-200/30 p-4 shadow-sm hover:border hover:border-base-300 hover:shadow-lg hover:scale-[1.005] focus:ring-2 focus:ring-primary"
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

export default CardLayout;
