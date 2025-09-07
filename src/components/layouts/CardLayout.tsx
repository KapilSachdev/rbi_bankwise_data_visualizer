
import { createElement, FC } from "react";
import type { LayoutProps } from "./types";

const CardLayout: FC<LayoutProps> = ({ charts }) => (
  <article className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
    {charts.map((chart, index) => {
      const chartTitle = (chart.props && typeof chart.props.title === 'string')
        ? chart.props.title
        : chart.component.name?.replace('Chart', '') || `Chart ${index + 1}`;
      return (
        <div
          key={index}
          className="card bg-base-200/50 p-4 shadow-sm border border-base-100 hover:border hover:border-base-300 hover:shadow-lg focus:ring-1 focus:ring-primary/50"
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
