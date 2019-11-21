<template lang="pug">
  .connection-lost(:class='visibilityClass')
    .connection-lost__content
      .connection-lost__text
        | Connection to internet lost. Try to reconnect and then reload this page.
      .connection-lost__actions
        o-btn.connection-lost__action-btn(
          upcase,
          @click='reloadPage'
        ) Reload page
    .connection-lost__mask
</template>

<script lang="ts">
  import Vue from 'vue'
  import { Component, Prop } from 'vue-property-decorator'

  @Component({})
  export default class TheConnectionLost extends Vue {
    @Prop(Boolean) isVisible: boolean = false

    get visibilityClass (): string {
      return this.isVisible ? 'connection-lost--open' : ''
    }

    reloadPage () {
      window.location.reload()
    }
  }
</script>

<style scoped lang="scss">
  @import "~@assets/scss/base/variables";
  @import "~@assets/scss/base/placeholders/typography";

  .connection-lost {
    display: flex;
    justify-content: center;
    align-items: center;

    position: fixed;
    top: 0;
    left: 0;

    width: 100vw;
    height: 100vh;

    z-index: 10000;
    pointer-events: none;
    visibility: hidden;
  }
  .connection-lost--open {
    visibility: visible;
    pointer-events: all;
  }

  .connection-lost__content {
    margin: 0 $offset-m;
    padding: $offset-l;

    background-color: $color-white;

    border-radius: $border-radius-l;
    z-index: 999;
  }

  .connection-lost__text {
    @extend %text-regular-large;
    margin-bottom: $offset-l;
  }

  .connection-lost__action-btn {
    background-color: $color-accent !important;
    width: 100%;
    padding: 18px 0 !important;
  }

  .connection-lost__mask {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    background-color: rgba($color-black, .5);

    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    will-change: opacity;
    z-index: 998;
  }
  .connection-lost--open .connection-lost__mask {
    opacity: 1;
  }
</style>


