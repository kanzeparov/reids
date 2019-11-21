<template lang="pug">
  .error-log-page
    v-menu.error-log-page__actions-menu(offset-y)
      v-btn(icon, slot='activator')
        v-icon settings
      v-list
        v-list-tile(@click.prevent='deleteAllErrors')
          v-list-tile-title.c-interactive Clear all
    .error-log-page__table
      table(cellspacing='0')
        thead
          tr
            th.error-log-page__start-time
              o-headed-text(head='Time', text='Start')
            th.v-bottom.error-log-page__end-time
              o-headed-text(text='End')
            th.v-top.error-log-page__text
              o-headed-text(head-bold, head='Error')
            th.error-log-page__actions
        tbody
          tr
            td.error-log-page__td-not-fixed(colspan='4') Not fixed

          tr(v-for='(error, index) in notFixedErrors', :key='`not_fixed_${index}`')
            td.error-log-page__start-time
              o-headed-text(:head='error.date', :text='error.time')
            td.error-log-page__end-time
              o-headed-text(head='Not fixed', :text='error.time')
            td.error-log-page__text
              o-headed-text(:head='error.text', :text='`#${error.id}`')
            td.v-top.error-log-page__actions
              v-btn.error-log-page_delete-btn(fab, small, @click='deleteError(error)')
                v-icon delete

          tr
            td.error-log-page__td-fixed(colspan='4') Fixed

          tr(v-for='(error, index) in fixedErrors', :key='`fixed_${index}`')
            td.error-log-page__start-time
              o-headed-text(:head='error.date', :text='error.time')
            td.error-log-page__end-time
              o-headed-text(:head='error.date', :text='error.time')
            td.error-log-page__text
              o-headed-text(:head='error.text', :text='`#${error.id}`')
            td.v-top.error-log-page__actions
              v-btn.error-log-page_delete-btn(fab, small, @click='deleteError(error)')
                v-icon delete
</template>

<style lang="scss">
  @import "~@assets/scss/base/variables";

  td .o-headed-text__text {
    color: $color-gray-dark;
  }
</style>
<style scoped lang="scss">
  @import "~@assets/scss/base/variables";
  @import "~@assets/scss/base/placeholders/typography";

  .error-log-page {
    position: relative;
    margin-bottom: $offset-xl;
  }

  .error-log-page__actions-menu {
    position: absolute;
    top: -$navbar-height;
    right: 0;
    z-index: 101;

    .v-btn .v-btn__content .v-icon {
      color: $color-white;
    }
  }

  .error-log-page__table {
    overflow-x: scroll;
  }

  .error-log-page__td-fixed,
  .error-log-page__td-not-fixed {
    @extend %text-monospace;
    background-color: rgba($color-black, .04);
    padding-top: $offset-xs;
    padding-bottom: $offset-xs;

    td {
      color: rgba($color-black, .6);
    }
  }

  .error-log-page__start-time {
    min-width: 120px;
    max-width: 135px;
  }
  .error-log-page__end-time {
    min-width: 120px;
    max-width: 135px;
  }
  .error-log-page__text {
    min-width: 245px;
    max-width: 260px;
  }
  .error-log-page__actions {
    min-width: 60px;
    max-width: 70px;
    padding-top: 6px;
  }

  .error-log-page_delete-btn {
    margin: 0;
    color: $color-interactive !important;
    background-color: transparent !important;
    box-shadow: none !important;
    height: 24px;
    width: 24px;
    padding: 0 8px;
  }

  table {
    padding: $offset-m 0;
  }

  tr {
    box-shadow: 0px 0px 0px 0px rgba($color-black, .1);
  }

  td, th {
    padding: $offset-m;
    text-align: left;

    &:first-child {
      padding-left: $offset-l;
    }

    &:last-child {
      padding-right: $offset-l;
    }

    &.v-top {
      vertical-align: top;
    }
    &.v-bottom {
      vertical-align: bottom;
    }
  }
</style>
