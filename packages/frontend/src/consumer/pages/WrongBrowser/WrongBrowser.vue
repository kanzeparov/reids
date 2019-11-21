<template lang="pug">
  .wrong-browser-page
    .wrong-browser-page__full-logo
      img(src='/static/full-logo.svg')
    .wrong-browser-page__content
      .wrong-browser-page__title
        | Your browser doesn't support Web API.
        br
        | Please, open this page in one of following browsers:
      .wrong-browser-page__browsers
        .wrong-browser-page__browser(
          v-for="browser in allowedBrowsers",
          :key="browser.name",
        )
          .wrong-browser-page__browser--logo
            img(:src='browser.logo')
          .wrong-browser-page__browser--link
            a(:href='browser.url') {{ browser.name }}
      .wrong-browser-page__description
        | You're trying to access the meter connected to ONDER network.
        | &nbsp;
        a(href='#') Learn about ONDER
</template>

<script lang="ts" src="./WrongBrowser.ts"></script>
<style lang="scss" scoped>
  @import "~@assets/scss/base/placeholders/typography";
  @import "~@assets/scss/base/variables";

  .wrong-browser-page {
    padding: $offset-l $offset-m $offset-xl;
  }

  .wrong-browser-page__full-logo {
    padding-bottom: $offset-l;
  }

  .wrong-browser-page__content {
    padding: 0 $offset-m;
  }

  .wrong-browser-page__title {
    @extend %text-regular-large;
    color: $color-black;
  }

  .wrong-browser-page__browsers {
    display: flex;
    padding: $offset-l 0;

    .wrong-browser-page__browser:not(:first-child) {
      margin-left: $offset-xl;
      text-align: center;
    }
  }

  .wrong-browser-page__description {
    color: rgba($color-black, .4);
    padding-top: $offset-l;
  }
</style>
