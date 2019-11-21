<template lang="pug">
  .o-text-block(:class='classesFromProps')
    slot
</template>

<script lang="ts" src="./OTextBlock.ts"></script>
<style lang="scss" scoped>
  @import "~@assets/scss/base/variables";
  @import "~@assets/scss/base/placeholders/typography";

  .o-text-block {
    padding: $offset-m;
  }

  .o-text-block.mono {
    @extend %text-monospace;
  }

  .o-text-block.mono-large {
    @extend %text-monospace-large;
  }
</style>
