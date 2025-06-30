// ECharts 6+ theme format for chalk
export const chalk = {
  color: [
    '#fc97af',
    '#87f7cf',
    '#f7f494',
    '#72ccff',
    '#f7c5a0',
    '#d4a4eb',
    '#d2f5a6',
    '#76f2f2',
  ],
  backgroundColor: 'rgba(41,52,65,1)',
  textStyle: {
    color: '#eee',
  },
  title: {
    textStyle: {
      color: '#ffffff',
    },
    subtextStyle: {
      color: '#dddddd',
    },
  },
  legend: {
    textStyle: {
      color: '#eee',
    },
  },
  visualMap: {
    inRange: {
      color: ['#fc97af', '#87f7cf'],
    },
  },
  toolbox: {
    iconStyle: {
      borderColor: '#999999',
    },
    emphasis: {
      iconStyle: {
        borderColor: '#666666',
      },
    },
  },
  tooltip: {
    axisPointer: {
      lineStyle: {
        color: '#cccccc',
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
        color: 'rgba(114,204,255,1)',
      },
      lineStyle: {
        color: '#72ccff',
      },
    },
    fillerColor: 'rgba(114,204,255,0.2)',
    handleColor: '#72ccff',
    textStyle: {
      color: '#eee',
    },
  },
  axisPointer: {
    lineStyle: {
      color: '#cccccc',
    },
    crossStyle: {
      color: '#cccccc',
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
    symbolSize: 0,
    lineStyle: {
      width: 3,
      smooth: true,
    },
    itemStyle: {
      borderWidth: 4,
    },
  },
  graph: {
    lineStyle: {
      color: '#ffffff',
      width: 1,
    },
  },
  map: {
    label: {
      color: '#893448',
      emphasis: {
        color: 'rgb(137,52,72)',
      },
    },
    itemStyle: {
      areaColor: '#f3f3f3',
      borderColor: '#999999',
      borderWidth: 0.5,
      emphasis: {
        areaColor: 'rgba(255,178,72,1)',
        borderColor: '#eb8146',
        borderWidth: 1,
      },
    },
  },
  candlestick: {
    itemStyle: {
      color: '#fc97af',
      color0: 'transparent',
      borderColor: '#fc97af',
      borderColor0: '#87f7cf',
      borderWidth: 2,
    },
  },
  timeline: {
    lineStyle: {
      color: '#87f7cf',
      width: 1,
    },
    itemStyle: {
      color: '#87f7cf',
      borderWidth: 1,
    },
    controlStyle: {
      color: '#87f7cf',
      borderColor: '#87f7cf',
      borderWidth: 0.5,
    },
    label: {
      color: '#87f7cf',
    },
    checkpointStyle: {
      color: '#fc97af',
      borderColor: 'rgba(252,151,175,0.3)',
    },
  },
}
