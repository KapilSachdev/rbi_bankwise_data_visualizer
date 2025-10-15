export const inspired = {
  color: [
    '#cc0000', '#002266', '#ff9900', '#006600',
    '#8a150f', '#076278', '#808080', '#f07b75',
  ],
  title: {
    textStyle: {
      fontWeight: 'normal',
      color: '#cc0000',
    },
  },
  visualMap: {
    color: ['#cc0000', '#002266'],
  },
  toolbox: {
    color: ['#cc0000', '#cc0000', '#cc0000', '#cc0000'],
  },
  tooltip: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    axisPointer: {
      type: 'line',
      lineStyle: { color: '#cc0000', type: 'dashed' },
      crossStyle: { color: '#cc0000' },
      shadowStyle: { color: 'rgba(200,200,200,0.3)' },
    },
  },
  dataZoom: {
    dataBackgroundColor: '#eee',
    fillerColor: 'rgba(200,200,200,0.2)',
    handleColor: '#cc0000',
  },
  timeline: {
    lineStyle: { color: '#cc0000' },
    controlStyle: { color: '#cc0000', borderColor: '#cc0000' },
  },
  candlestick: {
    itemStyle: { color: '#002266', color0: '#ff9900' },
    lineStyle: { width: 1, color: '#8a150f', color0: '#006600' },
    areaStyle: { color: '#cc0000', color0: '#ff9900' },
  },
  map: {
    itemStyle: { color: '#ff9900' },
    areaStyle: { color: '#ddd' },
    label: { color: '#c12e34' },
  },
  graph: {
    itemStyle: { color: '#ff9900' },
    linkStyle: { color: '#cc0000' },
  },
  line: {
    emphasis: { focus: 'series' },
  },
  gauge: {
    axisLine: {
      lineStyle: {
        color: [
          [0.2, '#002266'],
          [0.8, '#cc0000'],
          [1, '8a150f'],
        ],
        width: 8,
      },
    },
  },
};
