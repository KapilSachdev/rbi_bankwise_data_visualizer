
import { createElement, FC } from "react";
import type { LayoutProps } from "./types";

const AccordionLayout: FC<LayoutProps> = ({ charts }) => (
  <div className="flex flex-col gap-4 py-8">
    {charts.map((chart, index) => {
      const chartTitle = (chart.props && typeof chart.props.title === 'string')
        ? chart.props.title
        : chart.component.name?.replace('Chart', '') || `Chart ${index + 1}`;
      return (
        <div key={index} className="collapse collapse-arrow bg-base-200 focus-within:ring-2 focus-within:ring-primary">
          <input type="checkbox" tabIndex={-1} aria-hidden="true" />
          <div className="collapse-title text-xl font-medium">
            <span className="card-title text-lg font-semibold" title={chartTitle}>{chartTitle}</span>
          </div>
          <div className="collapse-content">
            <div className="card shadow-sm border border-base-300">
              <div className="card-body">
                {createElement(chart.component, chart.props ?? {})}
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export default AccordionLayout;
