// ECharts 6+ theme format for darker
export const darker = {
  color: [
    '#dd6b66',
    '#759aa0',
    '#e69d87',
    '#8dc1a9',
    '#ea7e53',
    '#eedd78',
    '#73a373',
    '#73b9bc',
    '#7289ab',
    '#91ca8c',
    '#f49f42',
  ],
  backgroundColor: 'rgba(51,51,51,1)',
  textStyle: {
    color: '#eee',
  },
  label: {
    color: '#eee',
  },
  title: {
    textStyle: {
      color: '#eeeeee',
    },
    subtextStyle: {
      color: '#aaa',
    },
  },
  legend: {
    textStyle: {
      color: '#eee',
    },
  },
  pie: {
    label: {
      color: '#fff',
      textBorderColor: 'transparent',
      textBorderWidth: 0,
      fontWeight: 'bold',
    },
    labelLine: {
      lineStyle: {
        color: '#fff',
      },
    },
  },
  sankey: {
    label: {
      color: '#eee',
    },
    itemStyle: {
      borderWidth: 1,
      borderColor: '#aaa',
    },
    emphasis: {
      focus: 'adjacency'
    },
  },
  visualMap: {
    inRange: {
      color: ['#bf444c', '#d88273', '#f6efa6'],
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
        color: '#eeeeee',
        width: 1,
      },
    },
  },
  grid: {
    borderColor: '#ccc',
  },
  dataZoom: {
    backgroundColor: 'rgba(47,69,84,0)',
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
      color: '#eeeeee',
    },
  },
  axisPointer: {
    lineStyle: {
      color: '#eeeeee',
    },
    crossStyle: {
      color: '#eeeeee',
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
        color: ['#444'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(60,60,60,0.3)', 'rgba(40,40,40,0.3)'],
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
        color: ['#444'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(60,60,60,0.3)', 'rgba(40,40,40,0.3)'],
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
        color: ['#444'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(60,60,60,0.3)', 'rgba(40,40,40,0.3)'],
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
        color: ['#444'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(60,60,60,0.3)', 'rgba(40,40,40,0.3)'],
      },
    },
  },
  line: {
    symbol: 'circle',
    symbolSize: 4,
    lineStyle: {
      width: 2,
      smooth: false,
    },
    itemStyle: {
      borderWidth: 1,
    },
    emphasis: { focus: 'series' },
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
        color: 'rgb(100,0,0)',
      },
    },
    itemStyle: {
      areaColor: '#eee',
      borderColor: '#444',
      borderWidth: 0.5,
      emphasis: {
        areaColor: 'rgba(255,215,0,0.8)',
        borderColor: '#444',
        borderWidth: 1,
      },
    },
  },
  candlestick: {
    itemStyle: {
      color: '#fd1050',
      color0: '#0cf49b',
      borderColor: '#fd1050',
      borderColor0: '#0cf49b',
      borderWidth: 1,
    },
  },
  timeline: {
    lineStyle: {
      color: '#eeeeee',
      width: 1,
    },
    itemStyle: {
      color: '#dd6b66',
      borderWidth: 1,
    },
    controlStyle: {
      color: '#eeeeee',
      borderColor: '#eeeeee',
      borderWidth: 0.5,
    },
    label: {
      color: '#eeeeee',
    },
    checkpointStyle: {
      color: '#e43c59',
      borderColor: 'rgba(194,53,49, 0.5)',
    },
  },
}
