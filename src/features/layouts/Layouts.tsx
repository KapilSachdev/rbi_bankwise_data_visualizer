
import React from 'react';

type ChartItem = {
  component: React.ComponentType<any>;
  props?: Record<string, any>;
};

interface LayoutProps {
  charts: ChartItem[];
}

const GridLayout: React.FC<LayoutProps> = ({ charts }) => (
  <article className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
    {charts.map((chart, index) => {
      const chartTitle = chart.props?.title || chart.component.name?.replace('Chart', '') || `Chart ${index + 1}`;
      return (
        <div
          key={index}
          className="card shadow-sm border border-base-300 transition-transform hover:scale-[1.025] focus-within:scale-[1.025] outline-none focus:ring-2 focus:ring-primary"
          tabIndex={0}
          aria-label={chartTitle}
        >
          <div className="card-body pb-2">
            <h2 className="card-title text-lg font-semibold" title={chartTitle}>{chartTitle}</h2>
          </div>
          <div className="card-body pt-0">
            {React.createElement(chart.component, chart.props)}
          </div>
          {/* Optional card-actions for future extensibility */}
          {/* <div className="card-actions justify-end px-6 pb-4"></div> */}
        </div>
      );
    })}
  </article>
);

const AccordionLayout: React.FC<LayoutProps> = ({ charts }) => (
  <div className="flex flex-col gap-4 py-8">
    {charts.map((chart, index) => {
      const chartTitle = chart.props?.title || chart.component.name?.replace('Chart', '') || `Chart ${index + 1}`;
      return (
        <div key={index} className="collapse collapse-arrow bg-base-200 focus-within:ring-2 focus-within:ring-primary">
          <input type="checkbox" tabIndex={-1} aria-hidden="true" />
          <div className="collapse-title text-xl font-medium">
            <span className="card-title text-lg font-semibold" title={chartTitle}>{chartTitle}</span>
          </div>
          <div className="collapse-content">
            <div className="card shadow-sm border border-base-300">
              <div className="card-body">
                {React.createElement(chart.component, chart.props)}
              </div>
              {/* Optional card-actions for future extensibility */}
              {/* <div className="card-actions justify-end px-6 pb-4"></div> */}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export { GridLayout, AccordionLayout };
