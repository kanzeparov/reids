import * as moment from 'moment';

export default {
  chart: {
    className: 'dashboard-chart-container',
    margin: 0,
  },
  title: { text: '' },
  colors: [],

  credits: { enabled: false },
  legend: { enabled: false },
  exporting: { enabled: false },

  xAxis: {
    type: 'datetime',
    lineColor: '#f2f2f2',

    crosshair: true,

    minPadding: 0,
    maxPadding: 0,

    minTickInterval: moment.duration(3, 'hours').asMilliseconds(),

    tickWidth: 0,
    gridLineWidth: 0,
    gridLineColor: '#00000025',

    title: { text: '' },
    labels: { enabled: false },
  },

  yAxis: {
    gridLineWidth: 0,
    // minPadding: 0.5,

    // minPadding: 0,
    // maxPadding: 0,

    startOnTick: true,
    endOnTick: true,

    title: { text: '' },
    labels: { enabled: false },
  },

  tooltip: {
    backgroundColor: '#fffe',
    borderWidth: 0,
    shadow: false,
    useHTML: true,
    style: {
      padding: 0
    },
  },
};
