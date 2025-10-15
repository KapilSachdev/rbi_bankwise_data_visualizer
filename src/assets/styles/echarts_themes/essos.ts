// ECharts 6+ theme format for essos
export const essos = {
  color: [
    '#893448',
    '#d95850',
    '#eb8146',
    '#ffb248',
    '#f2d643',
    '#ebdba4',
  ],
  backgroundColor: 'rgba(242,234,191,0.15)',
  textStyle: {
    color: '#333',
  },
  title: {
    textStyle: {
      color: '#893448',
    },
    subtextStyle: {
      color: '#d95850',
    },
  },
  legend: {
    textStyle: {
      color: '#999999',
    },
  },
  visualMap: {
    inRange: {
      color: [
        '#893448',
        '#d95850',
        '#eb8146',
        '#ffb248',
        '#f2d643',
        'rgb(247,238,173)',
      ],
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
    backgroundColor: 'rgba(255,255,255,0)',
    dataBackground: {
      areaStyle: {
        color: 'rgba(255,178,72,0.5)',
      },
      lineStyle: {
        color: '#ffb248',
      },
    },
    fillerColor: 'rgba(255,178,72,0.15)',
    handleColor: '#ffb248',
    textStyle: {
      color: '#333',
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
        color: '#333',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#333',
      },
    },
    axisLabel: {
      color: '#333',
    },
    splitLine: {
      show: false,
      lineStyle: {
        color: ['#ccc'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)'],
      },
    },
  },
  valueAxis: {
    axisLine: {
      lineStyle: {
        color: '#333',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#333',
      },
    },
    axisLabel: {
      color: '#333',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#ccc'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)'],
      },
    },
  },
  logAxis: {
    axisLine: {
      lineStyle: {
        color: '#333',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#333',
      },
    },
    axisLabel: {
      color: '#333',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#ccc'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)'],
      },
    },
  },
  timeAxis: {
    axisLine: {
      lineStyle: {
        color: '#333',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#333',
      },
    },
    axisLabel: {
      color: '#333',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#ccc'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)'],
      },
    },
  },
  line: {
    symbol: 'emptyCircle',
    symbolSize: 6,
    lineStyle: {
      width: 2,
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
      color: '#893448',
      emphasis: {
        color: '#893448',
      },
    },
    itemStyle: {
      areaColor: '#f3f3f3',
      borderColor: '#999999',
      borderWidth: 0.5,
      emphasis: {
        areaColor: '#ffb248',
        borderColor: '#eb8146',
        borderWidth: 1,
      },
    },
  },
  candlestick: {
    itemStyle: {
      color: '#eb8146',
      color0: 'transparent',
      borderColor: '#d95850',
      borderColor0: '#58c470',
      borderWidth: 2,
    },
  },
  timeline: {
    lineStyle: {
      color: '#893448',
      width: 1,
    },
    itemStyle: {
      color: '#893448',
      borderWidth: 1,
    },
    controlStyle: {
      color: '#893448',
      borderColor: '#893448',
      borderWidth: 0.5,
    },
    label: {
      color: '#893448',
    },
    checkpointStyle: {
      color: '#eb8146',
      borderColor: 'rgba(255,178,72,0.41)',
    },
  },
}
