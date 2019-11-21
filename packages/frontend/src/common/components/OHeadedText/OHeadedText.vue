<template lang="pug">
  .o-headed-text
    .o-headed-text__head(:class='classesFromProps') {{ head }}
    .o-headed-text__text {{ text }}
</template>

<script lang="ts" src="./OHeadedText.ts"></script>
<style lang="scss" scoped>
  @import "~@assets/scss/base/variables";
  @import "~@assets/scss/base/placeholders/typography";

  .o-headed-text {
    display: flex;
    flex-direction: column;
  }

  .o-headed-text__head {
    @extend %text-monospace;
    justify-self: flex-start;
  }

  .o-headed-text__text {
    @extend %text-monospace;
    font-weight: 400;
    justify-self: flex-end;
  }
</style>
