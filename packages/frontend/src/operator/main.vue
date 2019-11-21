<template>
  <el-container id="app">
    <el-header height="100px">
      <img src="../common/assets/logo.png" class="logo">
    </el-header>
    <el-main>
      <router-view/>
    </el-main>
  </el-container>
</template>
<style src="element-ui/lib/theme-chalk/index.css"></style>
<style lang="scss">
@import "../common/assets/scss/reset.scss";
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.logo {
  margin-top: 15px;
  max-height: calc(100% - 15px);
}
</style>
