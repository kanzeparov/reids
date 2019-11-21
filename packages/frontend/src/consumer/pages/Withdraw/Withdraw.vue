<template lang="pug">
  .withdraw-page
    .withdraw-page__balances
      table.withdraw-page__table(cellspacing='0')
        tbody
          tr.withdraw-page__tr-total-balance
            td.withdraw-page__td-label
              o-text-block(bold, mono-large) Total balance
            td.withdraw-page__td-balance
              o-text-block.withdraw-page__balance-value(bold, mono-large)
                | {{ balance }} DER
            td.withdraw-page__td-actions
          tr
            td.withdraw-page__td-label
              o-text-block(bold, mono-large) Available
            td.withdraw-page__td-balance
              o-text-block.withdraw-page__balance-value(bold, mono-large)
                | {{ balanceEth }} DER
            td.withdraw-page__td-actions
          tr
            td.withdraw-page__td-label
              o-text-block(bold, mono-large) Lifted
            td.withdraw-page__td-balance
              o-text-block.withdraw-page__balance-value(bold, mono-large)
                | {{ balanceChannel }} DER
            td.withdraw-page__td-actions
              v-btn.withdraw-page__show-channels(fab, small, @click='toggleChannels()')
                v-icon(v-if='channelsHidden') lock_open
                v-icon(v-else) expand_more
    .withdraw-page__channels-desc(v-if='channelsHidden')
      o-text-block.withdraw-page__channels-desc--text
        | Part of money is locked on channels.
        | To withdraw it you need to close channels manually.
        | This can take few minutes, hours or even days.
    .withdraw-page__channels(v-else)
      table.withdraw-page__table(cellspacing='0')
        tbody
          tr(v-for='(channel, index) in channels', :key='index')
            td.withdraw-page__td-label
              .withdraw-page__account
                .withdraw-page__account-avatar(v-html='channel.avatar')
                o-text-block(mono)
                  | {{ channel.shortAccount }}
                  .withdraw-page__account-status(v-if='channel.isUnlocking')
                    | Waiting for unlock
            td.withdraw-page__td-balance
              o-text-block.withdraw-page__balance-value(mono)
                | {{ channel.balance }} DER
            td.withdraw-page__td-actions
              v-btn.withdraw-page__account-unlock(fab, small, @click='unlockChannel(channel)')
                v-progress-circular(
                  v-if='channel.isUnlocking',
                  indeterminate,
                  :width='2',
                  :size='15'
                ) lock_open
                v-icon(v-else) lock_open
    .withdraw-page__actions
      .withdraw-page__input
        v-text-field(
          v-model='amount',
          @input='onAmountChange',
          suffix='DER',
          label='Amount',
          required,
          :error-messages='errorMessages',
        )
      .withdraw-page__submit
        o-btn.withdraw-page__submit-btn(upcase, @click='submitWithdraw') Withdraw
</template>

<style lang="scss">
  @import "~@assets/scss/base/variables";
  @import "~@assets/scss/base/placeholders/typography";
  @import "~@assets/scss/base/placeholders/background";
  @import "~@assets/scss/base/media-queries";

  .withdraw-page {
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100%;
  }

  .withdraw-page__balances {
    box-shadow: $shadow-outer-m;
    background-color: $color-white;
    position: sticky;
    top: $navbar-height;
    z-index: 98;
  }

  /* Top balance */

  .withdraw-page__table {
    width: 100%;

    tr td:first-child {
      padding-left: $offset-m;
    }

    tr td:last-child {
      padding-right: $offset-m;
    }
  }

  .withdraw-page__tr-total-balance {
    @extend %background-total;
  }

  .withdraw-page__td-balance {
    text-align: right;
  }

  .withdraw-page__balance-value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .withdraw-page__td-actions {
    width: 40px;
  }

  /* Center channels */

  .withdraw-page__channels-desc {
    padding: 0 $offset-m;
    height: 100%;
  }

  .withdraw-page__channels-desc--text {
    @extend %text-regular-large;
  }

  .withdraw-page__account {
    display: flex;
  }

  .withdraw-page__account-avatar {
    background-color: $color-white;
    width: 22px;
    height: 22px;
    padding: 10px 4px;
    border-radius: 50%;
  }

  .withdraw-page__account-status {
    @extend %text-monospace;
    color: $color-gray;
  }

  .withdraw-page__show-channels,
  .withdraw-page__account-unlock {
    margin: 0;
    color: $color-interactive !important;
    background-color: transparent !important;
    box-shadow: none !important;
  }

  /* Bottom actions */

  .withdraw-page__actions {
    display: grid;
    grid-template-areas:
      'amount'
      'withdraw';
    padding: $offset-m $offset-l  $offset-l  $offset-l;
    box-shadow: $shadow-outer-up-m;
    background-color: $color-white;
    position: sticky;
    bottom: 0;
    z-index: 1000;
  }

  .withdraw-page__submit-btn {
    grid-area: withdraw;

    background-color: $color-accent !important;
    width: 100%;
    padding: 18px 0 !important;
  }

  .withdraw-page__input {
    grid-area: amount;
    margin-bottom: $offset-s;

    /* Rewrite Vuetify styles */

    .v-input {
      margin-top: 0;

      input {
        @extend %text-regular-large;
      }

      .v-text-field__suffix {
        @extend %text-regular-large;
        color: rgba($color-black, .4);
      }

      .v-messages.theme--light {
        min-height: 14px;
      }
    }
  }

  @include media-mobile-landscape {
    .withdraw-page__balances {
      position: static;
    }

    .withdraw-page__input {
      padding-top: $offset-s;
      margin-bottom: 0;

      .v-text-field {
        padding-top: 0;
      }
    }

    .withdraw-page__actions {
      grid-template-areas: 'amount withdraw';
      grid-column-gap: $offset-l;
      padding-top: $offset-l;
    }
  }
</style>
