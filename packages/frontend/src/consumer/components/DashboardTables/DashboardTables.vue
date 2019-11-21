<template lang="pug">
  .dashboard-tables
    .dashboard-tables__pivot
      .dashboard-tables__table-name Pivot table
      .dashboard-tables__table-container
        table.dashboard-tables__table(cellspacing='0')
          thead
            tr
              th.v-top.dashboard-tables__th-meter
                o-headed-text(head="Meter")
              th.v-top.dashboard-tables__th-last-update
                o-headed-text(head="Last update")
              th.v-top.dashboard-tables__th-power
                o-headed-text(:head="isSeller ? 'I sell' : 'I buy'", text="kW·h")
              th.v-bottom.dashboard-tables__th-price
                o-headed-text(text="Price")
              th.v-bottom.dashboard-tables__th-der
                o-headed-text(text="DER")
          tbody
            tr.dashboard-tables__table-summary
              td(colspan="2") Sum or weighted average
              td {{ totalPower }}
              td {{ totalPrice }}
              td {{ totalDer }}
            tr(v-for='(c, index) in counterparties', :key='`${c.account}_${index}`')
              td
                .dashboard-tables__account
                  .dashboard-tables__avatar(v-html='c.avatar')
                  a.dashboard-tables__account-id(
                    href='#',
                    @click.prevent='',
                  ) {{ c.shortAccount }}
              td {{ c.lastUpdate }}
              td {{ c.totalPower }}
              td {{ c.totalPrice }}
              td {{ c.der }}
    .dashboard-tables__transactions
      .dashboard-tables__table-name Transactions
      .dashboard-tables__table-container
        table.dashboard-tables__table(cellspacing='0')
          thead
            tr
              th.v-top.dashboard-tables__th-meter
                o-headed-text(head="Corresponding meter")
              th.v-top.dashboard-tables__th-time
                o-headed-text(head="Time")
              th.v-top.dashboard-tables__th-power
                o-headed-text(:head="isSeller ? 'I sell' : 'I buy'", text="kW·h")
              th.v-bottom.dashboard-tables__th-price
                o-headed-text(text="Price")
              th.v-bottom.dashboard-tables__th-der
                o-headed-text(text="DER")
          tbody
            tr(v-for='(p, index) in transactions', :key='`${p.account}_${index}`')
              td
                .dashboard-tables__account
                  .dashboard-tables__avatar(v-html='p.avatar')
                  a.dashboard-tables__account-id(
                  href='#',
                  @click.prevent='',
                  ) {{ p.shortAccount }}
              td {{ p.datetime }}
              td {{ p.power }}
              td {{ p.price }}
              td {{ p.der }}
</template>

<style scoped lang="scss">
  @import "~@assets/scss/base/variables";
  @import "~@assets/scss/base/placeholders/typography";
  @import "~@assets/scss/base/placeholders/background";

  .dashboard-tables {
    margin-top: $offset-xl;

    & > div {
      margin-top: $offset-l;
    }
  }

  .dashboard-tables__table-name {
    @extend %text-upcase;
    @extend %text-bold;

    padding-left: $offset-m;
  }

  .dashboard-tables__table-container {
    overflow-x: scroll;
    margin-left: -$offset-l;
    margin-right: -$offset-l;
  }

  .dashboard-tables__table {
    // TODO: Decide if we want to stretch table or not
    /*min-width: 100%;*/
    padding-left: $offset-l;
    padding-right: $offset-l;

    td, th {
      @extend %text-monospace;
      padding: $offset-m;
    }

    td {
      text-align: right;
    }

    th {
      text-align: left;

      &.v-top {
        vertical-align: top;
      }
      &.v-bottom {
        vertical-align: bottom;
      }
    }
  }

  .dashboard-tables__table-summary {
    @extend %background-total;

    td:first-child {
      text-align: left;
    }
  }

  .dashboard-tables__th-meter {
    min-width: 160px;
    max-width: 200px;
  }
  .dashboard-tables__th-last-update {
    min-width: 80px;
    max-width: 110px;
  }
  .dashboard-tables__th-time {
    min-width: 190px;
    max-width: 210px;
  }
  .dashboard-tables__th-power {
    min-width: 70px;
    max-width: 90px;
  }
  .dashboard-tables__th-price {
    min-width: 50px;
    max-width: 70px;
  }
  .dashboard-tables__th-der {
    min-width: 50px;
    max-width: 70px;
  }

  .dashboard-tables__account {
    display: flex;
    align-items: center;
  }
  .dashboard-tables__avatar {
    background-color: $color-white;
    width: 25px;
    height: 25px;
    padding: 5px;
    border-radius: 50%;
  }
  .dashboard-tables__account-id {
    @extend %text-monospace;
    color: $color-interactive;
    margin-left: $offset-s;
  }
</style>
