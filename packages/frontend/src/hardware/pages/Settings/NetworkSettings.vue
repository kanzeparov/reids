<template>
  <v-layout row justify-center>
    <v-flex sm6 xs12 md4 class="elevation-8 pa-4">
      <v-form @submit.prevent>
        <v-text-field v-model="networkSettings.ssid" :label="'ssid' | format-message"
                      required />
        <v-text-field v-model="networkSettings.password" :label="'password' | format-message"
                      :append-icon="showPassword ? 'visibility_off' : 'visibility'"
                      :type="showPassword ? 'text' : 'password'"
                      @click:append="showPassword = !showPassword"/>
        <v-select
          :items="ecryptionList"
          item-value="value"
          item-text="label"
          v-model="networkSettings.encryption"
          :label="'securityMode' | format-message"></v-select>
        <v-btn color="success" block @click="sendSettings">{{'connect' | format-message}}</v-btn>
      </v-form>
      <!--<v-expansion-panel class="mt-4">-->
        <!--<v-expansion-panel-content>-->
          <!--<div slot="header">Item</div>-->
          <!--<v-form></v-form>-->
        <!--</v-expansion-panel-content>-->
      <!--</v-expansion-panel>-->
    </v-flex>
  </v-layout>
</template>
