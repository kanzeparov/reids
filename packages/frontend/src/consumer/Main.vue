<template>
  <v-app v-if="appIsReady">
    <notifications position="top right" classes="vue-notification success" group="success"/>
    <notifications position="top right" classes="vue-notification error" group="error"/>
    <the-connection-lost :is-visible="!online" />
    <the-sidebar />
    <the-navbar v-if="!navbarDisabled" />
    <v-content>
      <transition name="fade" mode="out-in" appear>
        <router-view></router-view>
      </transition>
    </v-content>
  </v-app>
</template>

<style src="vuetify/dist/vuetify.min.css"></style>
<style src="material-design-icons-iconfont/dist/material-design-icons.css"></style>
<style src="../common/assets/scss/notification.scss"></style>

<style lang="scss" scoped>
  .theme--light .menu-list {
    background-color: transparent;
  }

  /* Transitions */
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s
  }

  .fade-enter, .fade-leave-active {
    opacity: 0
  }
</style>
