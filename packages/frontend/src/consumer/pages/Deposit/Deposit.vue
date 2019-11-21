<template lang="pug">
  .page-container
    .deposit-page
      .deposit-page__current-balance
        | Current balance: {{ balance }}
      .deposit-page__input
        v-text-field(
          v-model='amount',
          @input='onAmountChange',
          suffix='DER',
          label='Amount',
          required,
          :error-messages='errorMessages',
        )
      .deposit-page__submit
        o-btn.deposit-page__submit-btn(upcase, @click='submitDeposit') Deposit
</template>

<style lang="scss">
  @import "~@assets/scss/base/variables";
  @import "~@assets/scss/base/placeholders/typography";

  .deposit-page {
    & > div:not(:last-child) {
      margin-bottom: $offset-m;
    }
  }

  .deposit-page__current-balance {
    @extend %text-monospace-large;
    padding: $offset-m $offset-s;
  }

  .deposit-page__submit-btn {
    background-color: $color-accent !important;
    width: 100%;
    padding: 18px 0 !important;
  }

  /* Rewrite Vuetify styles */
  .deposit-page__input {
    .v-messages.theme--light {
      min-height: 14px;
    }

    .v-text-field__suffix {
      color: rgba($color-black, .4);
      @extend %text-regular-large;
    }

    input {
      @extend %text-regular-large;
    }
  }
</style>
