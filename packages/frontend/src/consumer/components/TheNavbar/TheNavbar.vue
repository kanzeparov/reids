<template lang="pug">
  .navbar
    .navbar__content
      .navbar__actions
        v-btn.navbar__action(v-if='isHomePage', icon, @click.prevent='toggleSidebar()')
          v-icon menu
        v-btn.navbar__action(v-else, icon, @click.prevent='goToHomePage')
          v-icon arrow_back
      .navbar__title.c-white {{ routeName }}
    .navbar__bottom-line
</template>

<style lang="scss">
  @import "~@assets/scss/base/variables";
  @import "~@assets/scss/base/placeholders/typography";
  @import "~@assets/scss/base/media-queries";

  .navbar {
    position: sticky;
    top: 0;
    z-index: 99;
  }

  .navbar__content {
    display: flex;
    align-items: center;
    height: 46px;
    background-color: lighten($color-black, 50%) !important;

    .v-toolbar__title {
      font-weight: bold;
      margin-left: 0 !important;
    }
  }

  .navbar__action.v-btn {
    color: $color-white;
  }

  .navbar__title {
    @extend %headline;
    text-transform: none;
  }

  .navbar__bottom-line {
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #FC121B 0%, #F85D1F 7.73%, #F4C52E 48.07%, #8AB65A 90.06%, #1AA5B8 100%);
  }

  @include media-mobile-landscape {
    .navbar {
      position: static;
    }
  }
</style>
