// ECharts 6+ theme format for purple passion
export const purplePassion = {
  color: [
    '#9b8bba',
    '#e098c7',
    '#8fd3e8',
    '#71669e',
    '#cc70af',
    '#7cb4cc',
  ],
  backgroundColor: 'rgba(91,92,110,1)',
  textStyle: {
    color: '#eee', // Lighter text for dark mode
  },
  title: {
    textStyle: {
      color: '#fff',
    },
    subtextStyle: {
      color: '#eee',
    },
  },
  legend: {
    textStyle: {
      color: '#eee',
    },
  },
  visualMap: {
    inRange: {
      color: ['#8a7ca8', '#e098c7', '#cceffa'],
    },
  },
  toolbox: {
    iconStyle: {
      borderColor: '#999',
    },
    emphasis: {
      iconStyle: {
        borderColor: '#666',
      },
    },
  },
  tooltip: {
    axisPointer: {
      lineStyle: {
        color: '#ccc',
        width: 1,
      },
    },
  },
  grid: {
    borderColor: '#ccc',
  },
  dataZoom: {
    backgroundColor: 'rgba(0,0,0,0)',
    dataBackground: {
      areaStyle: {
        color: 'rgba(255,255,255,0.3)',
      },
      lineStyle: {
        color: '#a7b7cc',
      },
    },
    fillerColor: 'rgba(167,183,204,0.4)',
    handleColor: '#a7b7cc',
    textStyle: {
      color: '#eee',
    },
  },
  axisPointer: {
    lineStyle: {
      color: '#ccc',
    },
    crossStyle: {
      color: '#ccc',
    },
    shadowStyle: {
      color: 'rgba(200,200,200,0.02)',
    },
  },
  categoryAxis: {
    axisLine: {
      lineStyle: {
        color: '#eee',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#eee',
      },
    },
    axisLabel: {
      color: '#eee',
    },
    splitLine: {
      show: false,
      lineStyle: {
        color: ['#555'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.05)'],
      },
    },
  },
  valueAxis: {
    axisLine: {
      lineStyle: {
        color: '#eee',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#eee',
      },
    },
    axisLabel: {
      color: '#eee',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#555'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.05)'],
      },
    },
  },
  logAxis: {
    axisLine: {
      lineStyle: {
        color: '#eee',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#eee',
      },
    },
    axisLabel: {
      color: '#eee',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#555'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.05)'],
      },
    },
  },
  timeAxis: {
    axisLine: {
      lineStyle: {
        color: '#eee',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#eee',
      },
    },
    axisLabel: {
      color: '#eee',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#555'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.05)'],
      },
    },
  },
  line: {
    symbol: 'circle',
    symbolSize: 7,
    lineStyle: {
      width: 3,
      smooth: true,
    },
    itemStyle: {
      borderWidth: 2,
    },
    emphasis: {
      focus: 'series',
    },
  },
  graph: {
    lineStyle: {
      color: '#aaa',
      width: 1,
    },
  },
  map: {
    label: {
      color: '#000',
      emphasis: {
        color: '#ffffff',
      },
    },
    itemStyle: {
      areaColor: '#eee',
      borderColor: '#444',
      borderWidth: 0.5,
      emphasis: {
        areaColor: '#e098c7',
        borderColor: '#444',
        borderWidth: 1,
      },
    },
  },
  candlestick: {
    itemStyle: {
      color: '#e098c7',
      color0: 'transparent',
      borderColor: '#e098c7',
      borderColor0: '#8fd3e8',
      borderWidth: 2,
    },
  },
  timeline: {
    lineStyle: {
      color: '#8fd3e8',
      width: 1,
    },
    itemStyle: {
      color: '#8fd3e8',
      borderWidth: 1,
    },
    controlStyle: {
      color: '#8fd3e8',
      borderColor: '#8fd3e8',
      borderWidth: 0.5,
    },
    label: {
      color: '#8fd3e8',
    },
    checkpointStyle: {
      color: '#8fd3e8',
      borderColor: 'rgba(138,124,168,0.37)',
    },
  },

  // Bar chart
  bar: {
    itemStyle: {
      borderRadius: 2,
      color: '#9b8bba',
    },
    barWidth: '60%',
    barMinHeight: 0,
  },

  // Pie chart
  pie: {
    itemStyle: {
      borderColor: '#222',
      borderWidth: 1,
    },
    label: {
      color: '#eee',
    },
    labelLine: {
      lineStyle: {
        color: '#eee',
      },
    },
  },

  // Scatter chart
  scatter: {
    itemStyle: {
      color: '#e098c7',
    },
    symbolSize: 10,
  },

  // Radar chart
  radar: {
    axisLine: {
      lineStyle: {
        color: '#eee',
      },
    },
    splitLine: {
      lineStyle: {
        color: ['#8fd3e8', '#71669e'],
      },
    },
    splitArea: {
      areaStyle: {
        color: ['rgba(155,139,186,0.1)', 'rgba(140,211,232,0.1)'],
      },
    },
    name: {
      color: '#eee',
    },
  },

  // Gauge chart
  gauge: {
    axisLine: {
      lineStyle: {
        color: [[1, '#e098c7']],
        width: 8,
      },
    },
    pointer: {
      itemStyle: {
        color: '#e098c7',
      },
    },
    title: {
      color: '#eee',
    },
    detail: {
      color: '#eee',
    },
  },

  // Funnel chart
  funnel: {
    itemStyle: {
      borderColor: '#e098c7',
      borderWidth: 1,
    },
    label: {
      color: '#eee',
    },
    labelLine: {
      lineStyle: {
        color: '#eee',
      },
    },
  },

  // Parallel coordinates
  parallelAxis: {
    axisLine: {
      lineStyle: {
        color: '#eee',
      },
    },
    axisLabel: {
      color: '#eee',
    },
    splitLine: {
      lineStyle: {
        color: ['#555'],
      },
    },
  },
  parallel: {
    lineStyle: {
      color: '#e098c7',
    },
  },

  // Calendar
  calendar: {
    itemStyle: {
      color: '#71669e',
    },
    splitLine: {
      lineStyle: {
        color: '#eee',
      },
    },
    dayLabel: {
      color: '#eee',
    },
    monthLabel: {
      color: '#eee',
    },
    yearLabel: {
      color: '#eee',
    },
  },

  // Polar
  polar: {},
  radiusAxis: {
    axisLine: {
      lineStyle: {
        color: '#eee',
      },
    },
    axisLabel: {
      color: '#eee',
    },
  },
  angleAxis: {
    axisLine: {
      lineStyle: {
        color: '#eee',
      },
    },
    axisLabel: {
      color: '#eee',
    },
  },

  // MarkPoint/MarkLine/MarkArea
  markPoint: {
    label: {
      color: '#eee',
    },
  },
  markLine: {
    lineStyle: {
      color: '#e098c7',
    },
    label: {
      color: '#eee',
    },
  },
  markArea: {
    label: {
      color: '#eee',
    },
  },

  // Accessibility
  aria: {
    enabled: true,
    decal: { show: true },
  },

  // Animation
  animation: true,
  animationDuration: 800,
  animationEasing: 'cubicOut',

  // Responsive (media queries)
  media: [],

  // Dataset
  dataset: {},
}
