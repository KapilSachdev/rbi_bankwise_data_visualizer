export const wonderland = {
  color: [
    '#4ea397',
    '#22c3aa',
    '#7bd9a5',
    '#d0648a',
    '#f58db2',
    '#f2b3c9',
  ],

  backgroundColor: 'rgba(255,255,255,0)',

  title: {
    textStyle: {
      fontWeight: 'normal',
      color: '#666666',
    },
    subtextStyle: {
      color: '#999999',
    },
  },

  textStyle: {
    color: '#333',
  },

  legend: {
    textStyle: {
      color: '#999999',
    },
  },

  visualMap: {
    color: ['#d0648a', '#22c3aa', '#adfff1'],
  },

  toolbox: {
    color: ['#999999', '#999999', '#999999', '#999999'],
  },

  tooltip: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    axisPointer: {
      type: 'line',
      lineStyle: {
        color: '#cccccc',
        type: 'dashed',
      },
      crossStyle: { color: '#cccccc' },
      shadowStyle: { color: 'rgba(200,200,200,0.3)' },
    },
  },

  dataZoom: {
    dataBackgroundColor: 'rgba(222,222,222,1)',
    fillerColor: 'rgba(114,230,212,0.25)',
    handleColor: '#cccccc',
  },

  timeline: {
    lineStyle: { color: '#4ea397' },
    itemStyle: { color: '#4ea397' },
    label: { color: '#4ea397' },
    controlStyle: {
      color: '#4ea397',
      borderColor: '#4ea397',
    },
  },

  candlestick: {
    itemStyle: { color: '#d0648a', color0: 'transparent' },
    lineStyle: { width: 1, color: '#d0648a', color0: '#22c3aa' },
    areaStyle: { color: '#eeeeee', color0: 'rgba(34,195,170,0.25)' },
  },

  graph: {
    itemStyle: { color: '#4ea397' },
    linkStyle: { color: '#cccccc' },
  },

  line: {
    emphasis: { focus: 'series' },
  },

  map: {
    itemStyle: { color: '#eeeeee' },
    areaStyle: { color: '#eeeeee' },
    label: { color: '#28544e' },
    borderColor: '#999999',
  },

  gauge: {
    axisLine: {
      lineStyle: {
        color: [
          [0.2, '#d0648a'],
          [0.8, '#4ea397'],
          [1, '#22c3aa'],
        ],
        width: 8,
      },
    },
  },
};
