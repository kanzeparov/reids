<template lang="pug">
  .dashboard-info
    .dashboard-info__money
      .text.upcase.bold Money Balance
      .dashboard-info__balance
        h1.dashboard-info__balance--value {{ balance }}
        .text.dashboard-info__balance--unit DER
    .dashboard-info__energy
      .text.upcase.bold Energy Balance
      .dashboard-info__balance
        h1.dashboard-info__balance--value {{ energyBalance }}
        .text.dashboard-info__balance--unit kW·h
    .dashboard-info__actions
      div
        o-btn(
          outline, upcase,
          color='interactive', @click='goToDeposit',
        ) Deposit
        o-btn.dashboard-info__withdraw--landscape(
          outline, upcase,
          color='interactive', @click='goToDeposit',
        ) Withdraw
        v-menu.dashboard-info__actions-menu--portrait(offset-y)
          v-btn(icon, slot='activator')
            v-icon more_vert
          v-list
            v-list-tile(@click.prevent='goToWithdraw')
              v-list-tile-title.c-interactive Withdraw
</template>

<style lang="scss" scoped>
  @import "~@assets/scss/base/media-queries";
  @import "~@assets/scss/base/variables";
  @import "~@assets/scss/base/placeholders/typography";

  .dashboard-info {
    display: grid;
    grid-template-areas:
      'money actions'
      'energy blank';
    grid-gap: $offset-m;
  }

  .dashboard-info__balance {
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;

    &--value {
      display: inline !important;
      max-width: 30vw;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &--unit {
      margin-left: 16px;
      margin-bottom: 2px;
    }
  }

  .dashboard-info__money {
    grid-area: money;
  }

  .dashboard-info__energy {
    grid-area: energy;
  }

  .dashboard-info__actions {
    grid-area: actions;

    display: flex;
    align-items: flex-end;
    text-align: right;
  }

  .dashboard-info__withdraw--landscape {
    margin-left: $offset-m;
  }

  .dashboard-info__actions-menu--portrait {
    button {
      margin: 0;
      height: 24px;
      width: 24px;
    }

    padding-left: $offset-m;
  }

  @include media-mobile {
    .dashboard-info__withdraw--landscape {
      display: none;
    }
  }

  @include media-mobile-landscape {
    .dashboard-info {
      grid-template-areas:
        'energy money actions actions';
    }

    .dashboard-info__actions {
      text-align: left;
      display: flex;
      align-items: flex-end;
    }

    .dashboard-info__actions-menu--portrait {
      display: none;
    }
  }

  /* Vuetify styles override */

  .v-btn .v-btn__content .v-icon {
    color: $color-interactive;
  }
</style>
