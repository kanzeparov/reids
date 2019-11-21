<template>
  <v-layout row justify-center>
    <v-flex sm6 xs12 md4 class="elevation-8 pa-4 box-card">
      <ul>
        <li v-for="onder in onders" :key="onder" class="text item">
          <a :href="`http://${onder}`">{{onder}}</a>
        </li>
      </ul>
    </v-flex>
  </v-layout>
</template>

<style lang="scss">
  .box-card li a {
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }
</style>
