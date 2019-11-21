<template lang="pug">
  .settings-page
    .settings-page__block
      v-form.settings-page__form
        v-text-field(v-model='name', label='Name', required)
        v-text-field(v-model='email', label='Email', type='email', required)
        v-text-field(v-model='phoneNumber', label='Phone', mask='+# (###) ### ##-##', required)
        v-text-field(v-model='streetAddress', label='Address', required)
        v-select(v-model='timezone', :items='timeZoneList', label='Time zone')
        v-select(v-model='language', :items='languageList', label='Language')
        v-checkbox(label='Send usage statistics to monitoring system', v-model='sendMonitoring')

    template(v-if='!isSeller')
      .settings-page__block--title
        | Customer settings
      .settings-page__block
        .settings-page__form
          v-text-field.settings-page__upstream-input(
            v-model='upstream',
            label='Upstream ID',
            required,
          )

    template(v-if='isSeller')
      .settings-page__block--title
        | Producer settings
      .settings-page__block
        .settings-page__form
          v-text-field(v-model='sellPrice', label='Energy sell price', required)
          v-checkbox(label='Let others to borrow energy', v-model='borrowEnergy')

    .settings-page__block--title
      | Device info
    .settings-page__block
      o-headed-text.settings-page__device-label(
        head-bold,
        head='ID',
        :text='device.id'
      )
      o-headed-text.settings-page__device-label--public-key(
        head-bold,
        head='Public key',
        :text='account'
      )
      o-headed-text.settings-page__device-label(
        head-bold,
        head='Precision',
        :text='device.precision'
      )
      o-headed-text.settings-page__device-label(
        head-bold,
        head='Model',
        :text='device.model'
      )
      o-headed-text.settings-page__device-label(
        head-bold,
        head='Manufacturer',
        :text='device.manufacturer'
      )
      .settings-page__device-label
        v-icon(color='black') call
        .settings-page__device-unmount-desc
          .settings-page__device-unmount-text
            | To unmount device call the administrator
          a.settings-page__device-unmount-phone-number(
            :href='`tel:${adminPhoneNumber}`'
          ) {{ adminPhoneNumber | formatPhoneNumber }}
</template>

<style lang="scss">
  @import "~@assets/scss/base/variables";
  @import "~@assets/scss/base/placeholders/typography";

  .settings-page {
    padding-bottom: $offset-l;
  }

  .settings-page__block,
  .settings-page__block--title {
    padding: $offset-l;
  }
  .settings-page__block--title {
    @extend %text-regular;
    background-color: rgba($color-black, .04);
    padding-top: $offset-s;
    padding-bottom: $offset-s;
  }

  .settings-page__device-label {
    padding: $offset-m 0;
    display: flex;

    div.o-headed-text__head {
      @extend %text-regular;
    }

    div.o-headed-text__text {
      @extend %text-regular;
    }

    &:first-child {
      padding-top: 0;
    }
  }

  .settings-page__device-label--public-key {
    padding: $offset-m 0;

    div.o-headed-text__head {
      @extend %text-regular;
    }
  }

  .settings-page__device-unmount-desc {
    padding-left: $offset-m;
  }

  .settings-page__device-unmount-phone-number {
    @extend %text-bold;
    color: $color-interactive;
  }

  /* Overwrite Vuetify */

  .v-input--checkbox {
    margin-top: 0;

    .v-input__slot {
      margin-bottom: 0;
    }

    .v-input--selection-controls__ripple,
    .v-icon {
      color: $color-interactive !important;
      caret-color: $color-interactive !important;;
    }

    .v-messages {
      display: none;
    }
  }

  .settings-page__upstream-input {
    input {
      @extend %text-monospace-large;
    }
  }

  .v-text-field input {
    @extend %text-regular-large;
  }

  .v-menu__content,
  .menuable__content__active {
    left: initial !important;
    right: $offset-l !important;
    min-width: 120px !important;

    .v-list__tile--active {
      .v-list__tile__title {
        color: $color-black;
      }
    }

    .v-list__tile__title {
      color: $color-interactive;
    }
  }
</style>
