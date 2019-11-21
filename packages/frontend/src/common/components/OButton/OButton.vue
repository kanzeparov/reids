<template lang="pug">
  button.o-btn(
    @click='$emit("click")',
    :class='classesFromProps',
  )
    slot
</template>

<script lang="ts" src="./OButton.ts"></script>
<style lang="scss" scoped>
  @import "~@assets/scss/base/variables";
  @import "~@assets/scss/base/placeholders/typography";
  @import "~@assets/scss/base/placeholders/effects";

  .o-btn {
    @extend %text-regular;
    @extend %ripple-effect;

    padding: $offset-m $offset-l;
    border-radius: $border-radius-m;
    background-color: $color-white;
    outline: none;

    //@include ripple-effect($color-gray-light);
  }

  .outline {
    border: 1px solid;
  }
</style>
