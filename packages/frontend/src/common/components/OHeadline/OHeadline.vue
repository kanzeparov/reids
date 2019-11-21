<template lang="pug">
  .o-headline(:class='classesFromProps')
    slot
</template>

<script lang="ts" src="./OHeadline.ts"></script>
<style lang="scss" scoped>
  @import "~@assets/scss/base/placeholders/typography";

  .o-headline {
    @extend %headline;
  }

  .inline {
    display: inline-block;
  }
</style>
