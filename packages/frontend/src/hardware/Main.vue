<template>
  <v-app>
    <notifications position="top right" classes="vue-notification success" group="success"/>
    <notifications position="top right" classes="vue-notification error" group="error"/>
    <v-content>
      <v-container fluid>
        <logo />
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>
<style src="vuetify/dist/vuetify.min.css"></style>
<style src="material-design-icons-iconfont/dist/material-design-icons.css"></style>
<style src="../common/assets/scss/notification.scss"></style>
