import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import { Options } from 'highcharts'
import { Observable } from 'rxjs'

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
  @Prop(Object) chartOptions?: Options
  @Prop(Array) seriesOptions!: ISeriesOptions[]
  @Prop(Number) seriesSize!: number
  @Prop(Promise) seriesStream!: Promise<any>

  $refs: any

  $seriesStreamSub!: any
  options: Options = this.buildInitialOptions()
  ddd: any[] = []

  async created () {
    const $stream: Observable<any> = await this.seriesStream
    this.$seriesStreamSub = $stream.subscribe(this.handleSeriesStream)
  }

  destroyed () {
    this.$seriesStreamSub.unsubscribe()
  }

  get seriesIds (): string[] {
    return this.seriesOptions.map((so: ISeriesOptions) => so.id)
  }

  get chart (): any {
    return this.$refs.chart.chart
  }

  handleSeriesStream (rawSeriesData: IPaymentDistribution) {
    this.filterBySeriesId(rawSeriesData).forEach(this.updateSeries)
  }

  updateSeries ([id, data]: [string, number[]]) {
    const d = new Date()
    const fd = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
    console.log(fd, id, data)

    // const series = this.chart.get(id)
    // const seriesAreBlank = series.data.length === 0

    const seriesAreBlank = this.ddd.length === 0

    if (seriesAreBlank) {
      this.ddd = data
      return
    }

    data.forEach((point: number) => {
      if (this.ddd.length > 100) {
        this.ddd = this.ddd.slice(1, this.ddd.length)
      }
      this.ddd = [ ...this.ddd, point ]
      return
    })

    // if (seriesAreBlank) {
    //   return series.setData(data)
    // }
    //
    // data.forEach((point: number) => {
    //   const seriesAreFull = series.data.length >= this.seriesSize
    //   series.addPoint(point + Math.random() * 10, true, seriesAreFull)
    // })
  }

  filterBySeriesId (rawData: IPaymentDistribution) {
    return Object.entries(rawData)
      .filter(([id]: any) => this.seriesIds.includes(id))
  }

  buildInitialOptions (): Options {
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
}
