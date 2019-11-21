import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import * as Highcharts from 'highcharts'

import { IPaymentDistribution } from '@/consumer/store/modules/payment/types'

import { deepMerge } from '@/common/utils/deep-merge'
import defaultChartOptions from './default-chart-options'

export interface ISeriesOptions {
  id: string
  name: string
  color: string
}

@Component({})
export default class Chart extends Vue {
  @Prop(Object) chartOptions?: Highcharts.Options
  @Prop(Array) seriesOptions!: ISeriesOptions[]
  @Prop(Number) seriesSize!: number
  @Prop(Promise) seriesStream!: Promise<any>

  $refs: any

  $seriesStreamSub!: any
  options: Highcharts.Options = this.buildInitialOptions()
  chart!: any

  destroyed () {
    this.$seriesStreamSub.unsubscribe()
  }

  get seriesIds (): string[] {
    return this.seriesOptions.map((so: ISeriesOptions) => so.id)
  }

  handleSeriesStream (rawSeriesData: IPaymentDistribution) {
    this.filterBySeriesId(rawSeriesData).forEach(this.updateSeries)
  }

  updateSeries ([id, data]: [string, number[]]) {
    const series = this.chart.get(id)
    const seriesAreBlank = series.data.length === 0

    if (seriesAreBlank) {
      return series.setData(data)
    }

    data.forEach((point: number) => {
      const seriesAreFull = series.data.length >= this.seriesSize
      series.addPoint(point, true, seriesAreFull)
    })
  }

  filterBySeriesId (rawData: IPaymentDistribution) {
    return Object.entries(rawData)
      .filter(([id]: any) => this.seriesIds.includes(id))
  }

  buildInitialOptions (): Highcharts.Options {
    return deepMerge(
      { ...defaultChartOptions },
      { ...this.chartOptions },
      { series: this.buildInitialSeries() },
    )
  }

  buildInitialSeries (): object[] {
    return this.seriesOptions.map((seriesOption: ISeriesOptions) => {
      return { ...seriesOption, data: [] }
    })
  }

  mounted () {
    this.chart = Highcharts.chart(this.$refs.chart, { ...this.options })
    this.seriesStream.then(($seriesStream: any) => {
      this.$seriesStreamSub = $seriesStream.subscribe(this.handleSeriesStream)
    }).catch(() => {
      // Do Nothing
    })
  }

  beforeDestroy () {
    this.chart.destroy()
  }
}
