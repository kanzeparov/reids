<template lang="pug">
  .sidebar(:class="{'sidebar--open': isSidebarOpen}")
    nav.sidebar__drawer
      v-btn.sidebar__close-btn(icon, @click.prevent='toggleSidebar(false)')
        v-icon(medium) close

      .sidebar__header
        .sidebar__avatar(v-html='avatar')
        .sidebar__account {{ shortAccount }}

      .sidebar__menu-list
        .sidebar__menu-list-item(
          v-for='item in menuItems',
          :key='item.name',
          @click='goToPage(item)',
        )
          .sidebar__menu-list-item--name
            o-text-block(:bold='isActiveItem(item)') {{ item.name }}
          .sidebar__menu-list-item--icon
            v-icon chevron_right
    .sidebar__mask
</template>

<style scoped lang="scss">
  @import "~@assets/scss/base/media-queries";
  @import "~@assets/scss/base/variables";
  @import "~@assets/scss/base/placeholders/typography";

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10000;
    pointer-events: none;
  }
  .sidebar--open {
    pointer-events: all;
  }

  .sidebar__close-btn {
    margin: 0;
    position: absolute;
    right: 4px;
    top: 4px;
    color: $color-interactive !important;
  }

  .sidebar__mask {
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 999;
    background-color: rgba($color-black, .5);
    transition: opacity 0.3s ease-in-out;
    will-change: opacity;
  }
  .sidebar--open .sidebar__mask {
    opacity: 1;
  }

  .sidebar__drawer {
    position: absolute;
    top: 0;
    left: -90vw;
    background-color: $color-white;
    height: 100%;
    width: 90%;
    z-index: 1000;
    transition: left .3s ease-in-out;
    will-change: left;
  }
  .sidebar--open .sidebar__drawer {
    left: 0;
  }

  .sidebar__header {
    display: grid;
    grid-template-areas: 'avatar account';
    grid-template-columns: auto 1fr;
    padding: 75px 0 $offset-l $offset-m;
  }
  .sidebar__avatar {
    grid-area: avatar;
    background-color: $color-white;
    width: 40px;
    height: 40px;
    padding: 10px;
  }
  .sidebar__account {
    @extend %text-monospace;
    grid-area: account;
    font-size: 32px;
    line-height: 36px;
    font-weight: 600;
  }

  .sidebar__menu-list {
    padding: 0;
  }
  .sidebar__menu-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 $offset-l 0 $offset-m;
    border-bottom: 1px solid rgba($color-black, .1);
  }
  .sidebar__menu-list-item--icon {
    .v-icon {
      color: $color-black !important;
    }
  }

  @include media-mobile-landscape {
    .sidebar__drawer {
      left: -50vw;
      width: 50%;
    }

    .sidebar__header {
      padding: 20px 0 $offset-l $offset-l;
      grid-template-areas:
        'avatar'
        'account';
    }
    .sidebar__avatar {
      grid-area: avatar;
      background-color: $color-white;
      width: 80px;
      height: 80px;
      padding: 10px;
    }
  }
</style>
