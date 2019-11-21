<template lang="pug">
  .dashboard-chart
    .dashboard-chart__toggle-container
      v-btn-toggle.dashboard-chart__toggle(v-model='activeChart', mandatory)
        v-btn(flat, disabled)
          | All Time
        v-btn(flat, disabled)
          | M
        v-btn(flat, disabled)
          | W
        v-btn(flat, disabled)
          | D
        v-btn(flat, disabled)
          | H
        v-btn(flat)
          | 10 min

    .dashboard-chart__charts
      .dashboard-chart__power-flow
        .dashboard-chart__chart-label
          template(v-if='isSeller')
            span.c-accent-dark
              span.bold Producing&nbsp;
              span {{ totalPower }} kW
            span.c-caution(v-if='hasWastedPower')
              span ,&nbsp;wasting {{ totalWastedPower }} kW
            span.c-accent-dark &nbsp;in average
          template(v-else)
            span.c-interactive Consuming&nbsp;
            span {{ totalPower }} kW in average

        .dashboard-chart__power-flow-chart
          chart(
            :chart-options='charts.powerChart.chartOptions',
            :series-options='charts.powerChart.seriesOptions',
            :series-stream='paymentsStream',
            :series-size='seriesSize',
          )

      .dashboard-chart__money-flow
        .dashboard-chart__chart-label
          template(v-if='isSeller')
            span.c-black Earning {{ totalPrice }} DER/h in average
          template(v-else)
            span.c-black Spending {{ totalPrice }} DER/h in average

        .dashboard-chart__money-flow-chart
          chart(
            :chart-options='charts.priceChart.chartOptions',
            :series-options='charts.priceChart.seriesOptions',
            :series-stream='paymentsStream',
            :series-size='seriesSize',
          )

      .dashboard-chart__sell-price
        .dashboard-chart__chart-label
          template(v-if='isSeller')
            span.c-accent-dark Sell price {{ totalSellPrice }} DER/kW·h in average
          template(v-else)
            span.c-interactive Buy price {{ totalSellPrice }} DER/kW·h in average

        .dashboard-chart__sell-price-chart
          chart(
            :chart-options='charts.sellPriceChart.chartOptions',
            :series-options='charts.sellPriceChart.seriesOptions',
            :series-stream='paymentsStream',
            :series-size='seriesSize',
          )
        .dashboard-chart__ticks
          .dashboard-chart__tick(v-for='(tick, index) in datetimeTicks', :key='index')
            | {{ tick }}
</template>

<style lang="scss" scoped>
  @import "~@assets/scss/base/variables";
  @import "~@assets/scss/base/placeholders/typography";
  @import "~@assets/scss/base/media-queries";

  .dashboard-chart {
    margin-top: $offset-m;
  }

  .dashboard-chart__toggle-container,
  .dashboard-chart__toggle-container--sticky {
    margin-left: -$offset-l;
    margin-right: -$offset-l;
    padding: $offset-m $offset-l;
    background-color: $color-white;
    z-index: 100;
  }

  .dashboard-chart__toggle-container--sticky {
    position: fixed;
    top: $navbar-height;
    width: 100%;

    &.hidden {
      display: none;
    }
  }

  .dashboard-chart__charts {
    & > div {
      margin-top: $offset-l;
    }

    .c-accent-dark {
      color: darken($color-accent, 15%);
    }
  }

  .dashboard-chart__chart-label {
    @extend %text-regular;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .dashboard-chart__money-flow-chart,
  .dashboard-chart__power-flow-chart,
  .dashboard-chart__sell-price-chart {
    position: relative;
  }

  .dashboard-chart__chart-value {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 100;
    padding: $offset-s;
    background: rgba($color-white, $opacity-s);
  }

  .dashboard-chart__ticks {
    display: flex;
    justify-content: space-between;
    margin-top: $offset-s;
  }

  .dashboard-chart__tick {
    @extend %text-regular;
    color: rgba($color-black, .5);
  }

  /* Override Vuetify styles */

  .v-btn-toggle.v-btn-toggle--selected.theme--light {
    display: flex;
    box-shadow: none;
    border: 1px solid $color-interactive;
  }

  .theme--light.v-btn-toggle .v-btn {
    @extend %text-bold;
    @extend %text-upcase;

    flex-grow: 1;
    padding: $offset-m;
    color: $color-interactive;
    box-shadow: $shadow-inner-m;

    &:not(:last-child) {
      border-right: 1px solid $color-interactive;
    }
  }

  .theme--light.v-btn.v-btn--disabled {
    color: rgba($color-interactive, $opacity-xs) !important;
  }

  @include media-mobile-landscape {
    .dashboard-chart__toggle-container--sticky {
      top: 0;
    }
  }
</style>
